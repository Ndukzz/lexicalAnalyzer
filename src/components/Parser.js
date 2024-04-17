// Turn on the writettable function
//  work on the MoreTerm function

import HashTable from "./HashTable";

class Parser {
  constructor(tokens) {
    this.tokens = tokens;
    this.currentTokenIndex = 0;
    this.currentToken = this.tokens[this.currentTokenIndex];
    this.depth = 0; // depth of nested expressions (parentheses)
    this.currentBlock = "";
    this.type = null;
    this.identifiers = [];
    this.hashTable = new HashTable();
    this.procInfo = {
      formalSize: 0,
      numOfParams: 0,
      paramInfo: [],
    };
    this.threeAddressCode = [];
  }

  insertIdentifiers({ identifiers, type, depth, extraInfo = {} }) {
    this.hashTable.insert(identifiers, type, depth, extraInfo);
    this.Identifiers = [];
  }

  parseProgram() {
    this.consume("moduleT"); // Consume "moduleT"
    this.consume("idT"); // Consume module name
    this.consume("semicolonT"); // Consume semicolon
    this.depth++;
    // //  console.log(this.depth);
    this.DeclarativePart();
    this.StatementPart();
    this.parseEndToken();
    this.consume("idT");
    this.hashTable.writeTable(this.depth);
    this.depth--;
  }

  parseEndToken() {
    if (this.currentToken.token === "endT") {
      this.advance();
      this.consume("idT");
    }
    if (this.currentToken.token === "eofT") {
      //  console.log("End of program...");
    }
  }

  GetSize(value) {
    let size = undefined;
    switch (value) {
      case "INTEGER":
        size = 2;
        break;
      case "CHAR":
        size = 2;
        break;
      case "REAL":
        size = 4;
        break;
      default:
        break;
    }
    return size;
  }
  DeclarativePart() {
    this.ConstPart();
    this.VarPart();
    this.ProcPart();
  }

  ConstPart() {
    if (this.currentToken.token === "constT") {
      this.consume("constT");
      this.ConstTail();
    } else {
      return;
    }
  }

  ConstTail() {
    if (this.currentToken.token === "idT") {
      let identifiers = [];
      identifiers.push(this.currentToken.lexeme);
      this.consume("idT");
      let depth = this.depth;
      this.consume("equalT");
      let value = this.Value();
      let type = "CONSTANT";
      // this.hashTable.insert()
      let extraInfo = {
        value,
      };

      this.insertIdentifiers({ identifiers, type, depth, extraInfo });
      this.consume("semicolonT");

      this.ConstTail();
    } else {
      return;
    }
  }
  VarPart() {
    if (this.currentToken.token === "varT") {
      this.consume("varT");
      this.VarTail();
    } else {
      return;
    }
  }
  VarTail() {
    if (this.currentToken.token === "idT") {
      let type, depth;
      this.identifiers = [];
      let identifiers = this.IdentifierList();
      this.consume("colonT");
      type = this.TypeMark();
      depth = this.depth;
      this.identifiers = [];
      let size = this.GetSize(type);
      let extraInfo = {
        size,
      };
      // insert into hashTable
      this.insertIdentifiers({ identifiers, type, depth, extraInfo });
      this.identifiers = [];
      this.consume("semicolonT");
      this.VarTail();
    } else {
      return;
    }
  }
  IdentifierList() {
    while (this.currentToken.token === "idT") {
      this.identifiers.push(this.currentToken.lexeme);
      this.consume("idT");
      if (this.currentToken.token === "commaT") {
        this.consume("commaT");
        this.IdentifierList();
      }
    }
    return this.identifiers;
  }
  TypeMark() {
    let type;
    const currTkn = this.currentToken;
    if (currTkn.token === "intT") {
      type = currTkn.lexeme;
      this.consume("intT");
    } else if (currTkn.token === "realT") {
      type = currTkn.lexeme;
      this.consume("realT");
    } else if (currTkn.token === "charT") {
      type = currTkn.lexeme;
      this.consume("charT");
    }
    return type;
  }
  Value() {
    let value = this.NumericalLiteral();
    return value;
  }
  ProcPart() {
    if (this.currentToken.token === "procedureT") {
      this.ProcedureDecl();
      this.ProcPart();
    } else {
      return;
    }
  }
  ProcedureDecl() {
    let type;
    this.ProcHeading();
    if (this.currentToken.token === "colonT") {
      this.consume("colonT");
      this.TypeMark();
    }
    this.consume("semicolonT");

    this.ProcBody();
    this.consume("idT");
    this.consume("semicolonT");
    this.hashTable.writeTable(this.depth);
    this.depth--;
  }
  ProcHeading() {
    this.consume("procedureT");
    let procName = this.consume("idT");
    let identifiers = [procName];
    // this.consume("idT");
    let currentDepth = this.depth++;
    let procInfo = this.Args();
    this.hashTable.insert(identifiers, "Procedure", currentDepth, procInfo);
    //RESET THE PROCINFO might move this up
    this.procInfo = {
      formalSize: 0,
      numOfParams: 0,
      paramInfo: {},
    };
  }
  ProcBody() {
    this.DeclarativePart();
    this.StatementPart();
    this.consume("endT");
  }
  Args() {
    if (this.currentToken.token === "LparenT") {
      this.consume("LparenT");
      let procInfo = this.ArgList();
      this.consume("RparenT");
      return procInfo;
    } else {
      return;
    }
  }
  ArgList() {
    let type, depth;
    let passingMode = this.Mode();
    this.identifiers = [];
    let identifiers = this.IdentifierList();
    this.consume("colonT");
    type = this.TypeMark();
    depth = this.depth;
    let size = this.GetSize(type);
    //  Setting the information of the procedure
    this.procInfo.formalSize += size * identifiers.length;
    this.procInfo.numOfParams += identifiers.length;
    identifiers.map((identifier) => {
      let info = {
        name: identifier,
        type,
        passingMode,
      };
      this.procInfo.paramInfo.push(info);
    });

    let extraInfo = {
      formalSize: this.procInfo.formalSize,
      numOfParams: this.procInfo.numOfParams,
      paramInfo: this.procInfo.paramInfo, // type and passing Mode
    };
    //  insert into the hashTable
    this.insertIdentifiers({ identifiers, type, depth });
    this.Identifiers = [];
    let moreArgs = this.MoreArgs();
    if (moreArgs === null) {
      return extraInfo;
    } else {
      // update the formalSize and numOfParams to be derived from the param Info
      extraInfo = {
        formalSize: (this.procInfo.formalSize + moreArgs.formalSize) / 2,
        numOfParams: (this.procInfo.numOfParams + moreArgs.numOfParams) / 2,
        paramInfo: { ...this.procInfo.paramInfo, ...moreArgs.paramInfo },
      };
    }
    return extraInfo;
  }
  MoreArgs() {
    if (this.currentToken.token === "semicolonT") {
      this.consume("semicolonT");
      let procInfo = this.ArgList();
      return procInfo;
    } else {
      return null;
    }
  }
  Mode() {
    if (this.currentToken.token === "varT") {
      this.consume("varT");
      return "value";
    } else {
      return "reference";
    }
  }
  StatementPart() {
    if (this.currentToken.token === "beginT") {
      this.consume("beginT");
      this.SeqOfStatements();
    } else {
      return;
    }
  }
  NumericalLiteral() {
    let adv = this.advance(); //WORKON
    return adv;
  }
  SeqOfStatements() {
    if (this.currentToken.token === "idT") {
      this.Statement();
      this.consume("semicolonT");
      this.StatTail();
    } else {
      return null;
    }
  }
  StatTail() {
    if (this.currentToken.token === "idT") {
      this.Statement();
      this.consume("semicolonT");
      this.StatTail();
    } else {
      return null;
    }
  }
  Statement() {
    console.log("In the beast!!");
    if (this.currentToken.token === "idT") {
      this.AssignStat();
    } else {
      this.IOStat();
    }
  }
  ///----------------///----------------///----------------///----------------///----------------
  AssignStat() {
    // adjust action depending on assignment or procCall
    let idt = this.consume("idT");
    if (this.currentToken.token === "LparenT") {
      let procCall = this.ProcCall(idt);
    } else if (this.currentToken.token === "assignT") {
      this.consume("assignT");
      let expr = this.Expr();
      this.hashTable.setValue(idt, expr);
    }
  }
  ProcCall(idt) {
    this.consume("LparenT");
    const lookup = this.hashTable.lookup(idt);
    let params = this.Params();
    if (lookup) {
      console.log(lookup);
      if (lookup.paramInfo.length !== params.length) {
        console.log("Procedure Call");
        console.log(this.threeAddressCode);
        // Find a way to implement the pushes and call to the function
      }
    }
    this.consume("RparenT");
    // Generate three address code for procedure call
    if (params.length === 0) {
      // No parameters
      this.threeAddressCode.push(`call ${idt}`);
    } else if (params.length === 1) {
      // One parameter
      this.threeAddressCode.push(`push ${params[0]}`);
      this.threeAddressCode.push(`call ${idt}`);
    } else {
      // Multiple parameters
      for (let i = params.length - 1; i >= 0; i--) {
        this.threeAddressCode.push(`push ${params[i]}`);
      }
      this.threeAddressCode.push(`call ${idt}`);
    }
  }
  Params() {
    let params = [];
    if (this.currentToken.token === "idT") {
      params.push(this.consume("idT"));
    }
    if (this.currentToken.token === "numT") {
      params.push(this.consume("numT"));
    }
    if (this.currentToken.token === "commaT") {
      let paramsTail = this.ParamsTail();
      console.log(paramsTail);
      params.push(...paramsTail);
    }

    return params;
  }
  ParamsTail() {
    let params = [];
    if (this.currentToken.token === "commaT") {
      this.consume("commaT");
      if (this.currentToken.token === "idT") {
        params.push(this.consume("idT"));
        params = params.concat(this.ParamsTail());
      } else if (this.currentToken.token === "numT") {
        params.push(this.consume("numT"));
        params = params.concat(this.ParamsTail());
      }
      return params;
    } else {
      return [];
    }
  }
  ///----------------///----------------///----------------///----------------///----------------
  IOStat() {
    return null;
  }
  Expr() {
    return this.Relation();
  }
  Relation() {
    return this.SimpleExpr();
  }

  //////////////////////////////////////////////////
  SimpleExpr() {
    let term = this.Term();
    //  //  console.log(term);
    let result;
    let moreTerm = this.MoreTerm();
    //  //  console.log(moreTerm);

    // HANDLE THE RESULTS OF MORETERM
    if (moreTerm == null) {
      return term; // Work on this
    } else {
      term = HandleAddOp(term, moreTerm.value, moreTerm.operator);
    }
    return term;
  }
  MoreTerm() {
    let term;
    if (this.currentToken.token === "addOp") {
      const operator = this.Addop();
      // //  console.log(operator);
      term = this.Term();

      let moreTerm = this.MoreTerm();
      if (moreTerm) {
        term = HandleAddOp(term, moreTerm.value, moreTerm.operator);
      }
      return {
        operator,
        value: parseInt(term),
      };
    } else {
      return null;
    }
  }
  //////////////////////////////////////////////////
  Term() {
    let factor = this.Factor();
    if (factor == "varNotFoundError") {
      // Attempted handling the errors
      throw new Error("Variable not found");
      return;
    }
    let moreFactor = this.MoreFactor();
    // //  console.log(moreFactor);
    if (!isNaN(factor)) {
      // if the factor is a number
      factor = parseNumber(factor); // convert the string to number
    }
    if (moreFactor) {
      factor = HandleMulOp(factor, moreFactor.value, moreFactor.operator);
      // //  console.log(factor);
    }
    return factor; // UPDATE that eventually
  }
  MoreFactor() {
    let factor;
    if (this.currentToken.token === "mulOp") {
      // //  console.log("IN MULOP");
      let operator = this.Mulop();
      factor = this.Factor();
      if (!isNaN(factor)) {
        // if the factor is a number
        factor = parseNumber(factor); // convert the string to number
      }

      let moreFactor = this.MoreFactor();
      // //  console.log(moreFactor);
      if (moreFactor) {
        factor = HandleMulOp(factor, moreFactor.value, moreFactor.operator);
        // //  console.log(factor);
      }
      return {
        operator,
        value: factor,
      };
    } else {
      return null;
    }
  }
  Factor() {
    const currToken = this.currentToken;
    switch (currToken.token) {
      case "idT":
        let token = this.consume("idT");
        const lookup = this.hashTable.lookup(token);
        if (lookup.value) {
          return parseNumber(lookup.value); // convert the string to number
          // return parseInt(lookup.value);
        } else {
          //  console.error(`Error Message: Undefined variable ${token}`);
          return "varNotFoundError";
        }
        break;
      case "numT":
        const numT = this.consume("numT");
        return numT;
        break;
      case "LparenT":
        this.consume("LparenT");
        let expr = this.Expr(); //work on this
        this.consume("RparenT");
        //  console.log(expr);
        return expr;
        break;
      case "notT":
        this.consume("notT");
        let factor = this.Factor();
        return `!${factor}`;
        break;
      case "SignOp": //WORKON: It wasn't clear
        this.SignOp();
        this.Factor();
        break;
      default:
        break;
    }
  }
  Addop() {
    switch (this.currentToken.token) {
      case "addOp":
        return this.consume("addOp");
        break;
      case "orT":
        return this.consume("orT");
        break;
      default:
        break;
    }
  }
  Mulop() {
    switch (this.currentToken.token) {
      case "mulOp":
        return this.consume("mulOp");
        break;
      default:
        break;
    }
  }

  SignOp() {
    return null; // wasnt clear on this too
  }

  consume(expectedType) {
    //  console.log("Consume: ", this.currentToken.lexeme);
    if (
      this.currentTokenIndex + 1 === this.tokens.length &&
      this.currentToken.token === "eofT"
    ) {
      return;
    } else if (this.currentToken.token === expectedType) {
      // //  console.log(this.currentToken);
      let currLex = this.currentToken.lexeme;
      this.advance();
      console.log(this.currentToken.lexeme);
      return currLex;
    } else {
      throw new SyntaxError(
        `Expected ${expectedType} but found ${this.currentToken.token} at ${
          this.currentTokenIndex + 1
        }`
      );
    }
  }

  advance() {
    //  console.log("Advance: ", this.currentToken.lexeme);
    if (this.currentTokenIndex < this.tokens.length - 1) {
      const oldToken = this.currentToken;
      // //  console.log(this.currentToken.token);
      this.currentTokenIndex++;
      this.currentToken = this.tokens[this.currentTokenIndex];
      return oldToken.lexeme;
    } else {
      this.currentToken = { type: "EOF" };
    }
  }
}
export default Parser;

// Addition and multiplication handling functions

const HandleMulOp = (x, y, op) => {
  switch (op) {
    case "*":
      x *= y;
      break;
    case "/":
      x /= y;
      break;
    case "%":
      x %= y;
      break;
    case "&":
      x &&= y;
      break;
    default:
      break;
  }
  return x;
};
const HandleAddOp = (x, y, op) => {
  switch (op) {
    case "+":
      x += y;
      break;
    case "-":
      x -= y;
      break;
    case "|":
      x ||= y;
      break;
    default:
      break;
  }
  return x;
};

const parseNumber = (x) => {
  if (!Number.isInteger(x)) {
    return parseFloat(x);
  } else {
    return parseInt(x);
  }
};
