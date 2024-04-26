// Turn on the writettable function
//  work on the MoreTerm function

import HashTable from "./HashTable";
import Stack from "./Stack";

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
    this.assignStatement = "";
    this.mainStack = new Stack();
    this.procStack = new Stack();
    this.proc = false;
    this.procInfo = {
      sizeParams: 0,
      sizeLocals: 0,
      numOfParams: 0,
      paramInfo: [],
    };
    this.threeAddressCode = "";
  }

  insertIdentifiers({ identifiers, type, depth, extraInfo = {} }) {
    this.hashTable.insert(identifiers, type, depth, extraInfo);
    this.Identifiers = [];
  }

  pushToStack(typeOfVar, list = []) {
    // list = list.reverse();
    // typeOfVar is either formal, local or temp
    let stack = this.proc ?  this.procStack.items : this.mainStack.items;
    let offset;
    let totalOffset = 0;
    switch (typeOfVar) {
      case "normal":
        let element = "";
        let currIndex = stack.length;
      
        for (let i = 0; i != list.length; i++) {
          element = list[i];
          const lookup = this.hashTable.lookup(element);
          let size = this.GetSize(lookup.type);
          if (stack.length == 0 ) {
            totalOffset = size;
          } else {
            totalOffset = Object.values(stack[stack.length -1])[0] + size;
          }
          // console.log(totalOffset + " " + list[i]);
          //create block
          let block = {
            [element]: totalOffset,
          };
          list.pop[i];
          // add block to the list
          this.proc ? this.procStack.push(block) : this.mainStack.push(block);
        }
        // console.log(this.mainStack.items);
        // console.log(this.procStack.items);
        break;
        case "address":
          totalOffset =0;
          let offsetList = [];
          let BPIndex = stack.length;
          //  pushing the return address and OLD BP into the stack
          if (BPIndex == 1) {
          } else {
            for (let index = BPIndex - 1; index >= 0; index--) {
              offset = Object.values(stack[index])[0];
              offsetList.push(offset)      
              offsetList = offsetList.reverse();
          }
          for (let index = BPIndex - 1; index >= 0; index--) {
            // console.log(offsetList);
            let key = Object.keys(stack[index])[0];
            // console.log(key, " " , offsetList[index]);
            totalOffset += offsetList[index];
            stack[index][key] = totalOffset;
          }
          console.log(stack);
        }
        this.procStack.push({ returnAddr: 2 });
        this.procStack.push({ oldBP: 0 });
        break;
      case "temp":
        break;

      default:
        break;
    }
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
    let list = this.hashTable.writeTable(this.depth);
    this.depth--;
    console.log(this.mainStack);
    console.log(this.threeAddressCode);
    return this.threeAddressCode;
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
    let size;
    switch (value) {
      case "INTEGER":
        size = 2;
        break;
      case "intT":
        size = 2;
        break;
      case "CHAR":
        size = 2;
        break;
      case "REAL":
        size = 4;
        break;
      case "realT":
        size = 4;
        break;
      default:
        break;
    }
    return size;
  }
  DeclarativePart() {
    let constList = this.ConstPart();
    let varList = this.VarPart();
    let result = constList.concat(varList);
    // console.log(result);
    // let list = constList.concat(varList)
    this.ProcPart();
    return result;
  }

  ConstPart() {
    if (this.currentToken.token === "constT") {
      this.consume("constT");
      let constTail = this.ConstTail();
      this.identifiers = [];
      return constTail;
    } else {
      return [];
    }
  }

  ConstTail() {
    if (this.currentToken.token === "idT") {
      let identifiers;
      identifiers = this.consume("idT"); // This takes the identifier and saves the lexeme
      let depth = this.depth;
      this.consume("equalT");
      let value = this.Value();
      let type = "CONSTANT";
      // this.hashTable.insert()
      let extraInfo = {
        value,
        constVar: type,
      };
      if (value % 1 ==0) {
        type = "intT";
        this.procInfo.sizeLocals += 2;
      } else {
        type = "realT";
        this.procInfo.sizeLocals += 4;
      }
      this.identifiers.push(identifiers);
      this.insertIdentifiers({ identifiers, type, depth, extraInfo });
      this.pushToStack("normal",[identifiers] );
      this.consume("semicolonT");
      // console.log(identifiers);
      this.ConstTail();
      return this.identifiers;
    } else {
      return [];
    }
  }
  VarPart() {
    if (this.currentToken.token === "varT") {
      this.consume("varT");
      let varTail = this.VarTail();
      this.identifiers = [];
      return varTail;
    } else {
      return [];
    }
  }
  VarTail() {
    if (this.currentToken.token === "idT") {
      let type, depth, identifiers;
      this.identifiers = [];
      identifiers = this.IdentifierList();
      this.consume("colonT");
      let token = this.currentToken.token;
      type = this.TypeMark();
      type = token;
      depth = this.depth;
      let size = this.GetSize(token);
      // console.log(token);
      let extraInfo = {
        size,
      };
      if (type == "intT") {
      this.procInfo.sizeLocals += 2 * identifiers.length;
      } else if (type == "realT") {
        
        this.procInfo.sizeLocals += 4 * identifiers.length;
      }
      // insert into hashTable
      this.identifiers = identifiers;
      this.consume("semicolonT");
      let result = this.identifiers;
      this.insertIdentifiers({ identifiers, type, depth, extraInfo });
      this.pushToStack("normal",identifiers);
      this.VarTail();
      return result;
    } else {
      return [];
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
    let identifiers = this.identifiers;
    return identifiers;
  }
  TypeMark() {
    let type;
    const currTkn = this.currentToken;
    if (currTkn.token === "intT") {
      type = currTkn.token;
      this.consume("intT");
    } else if (currTkn.token === "realT") {
      type = currTkn.token;
      this.consume("realT");
    } else if (currTkn.token === "charT") {
      type = currTkn.token;
      this.consume("charT");
    }
    return type;
  }
  Value() {
    let value = this.NumericalLiteral();
    return value;
  }
  // Work on the functions and how they are declared, stored and called
  ///----------------///----------------///----------------///----------------///----------------
  ProcPart() {
    if (this.currentToken.token === "procedureT") {
      this.ProcedureDecl();
      this.ProcPart();
    } else {
      this.proc = !this.proc;
      return;
    }
  }
  ProcedureDecl() {
    let type;
    let heading = this.ProcHeading();
    console.log(heading);
    if (this.currentToken.token === "colonT") {
      this.consume("colonT");
      this.TypeMark();
    }
    this.consume("semicolonT");
    
    let procBody = this.ProcBody();
    this.consume("idT");
    this.consume("semicolonT");
    // insert the localSize
    this.hashTable.insert({ ...heading });
    let list = this.hashTable.writeTable();
    console.log(list);
    // this.hashTable.lookup('summit')
    this.depth--;
    console.log(this.procStack);
    this.procInfo = {
      sizeParams: 0,
      sizeLocals: 0,
      numOfParams: 0,
      paramInfo: {},
    };
  }
  ProcHeading() {
    let type = this.consume("procedureT");
    let identifiers = [];
    let procName = this.consume("idT");
    procName = [procName];
    // this.consume("idT");
    let currentDepth = this.depth++;
    this.proc = !this.proc;   //  Switches from main stack to proc Stack
    let procInfo = this.Args("formal");
    this.proc = !this.proc;   //  Switches from procedure stack to mainStack
    // console.log(procInfo.identifiers);
    this.pushToStack("normal", procName);
    this.proc = !this.proc;   //  Switches from main stack to proc Stack
    this.hashTable.insert(procName, "Procedure", currentDepth, procInfo);
    this.pushToStack("address");
    //RESET THE PROCINFO might move this up
    this.procInfo = {
      sizeParams: 0,
      sizeLocals: 0,
      numOfParams: 0,
      paramInfo: {},
    };
    return { procName, type, currentDepth, procInfo };
  }
  ProcBody() {
    let declaredVarList = this.DeclarativePart();
    this.StatementPart();
    this.consume("endT");
    return declaredVarList;
  }
  ///----------------///----------------///----------------///----------------///----------------

  Args() {
    if (this.currentToken.token === "LparenT") {
      this.consume("LparenT");
      let procInfo = this.ArgList();
      this.identifiers = [];
      this.consume("RparenT");
      return procInfo;
    } else {
      return;
    }
  }
  ArgList() {
    let type, depth;
    let passingMode = this.Mode();
    let identifiers = this.IdentifierList();
    this.consume("colonT");
    type = this.TypeMark();
    depth = this.depth;
    let size = this.GetSize(type);
    //  Setting the information of the procedure
    this.procInfo.sizeParams += size * identifiers.length;
    // this.procInfo.sizeLocals += size * identifiers.length;
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
      sizeParams: this.procInfo.sizeParams,
      sizeLocals: this.procInfo.sizeLocals,
      numOfParams: this.procInfo.numOfParams,
      paramInfo: this.procInfo.paramInfo, // type and passing Mode
      identifiers,
    };
    //  insert into the hashTable
    // console.log(identifiers);

    this.insertIdentifiers({ identifiers, type, depth, size });
    this.pushToStack( "normal", identifiers);
    this.identifiers = [];
    let moreArgs = this.MoreArgs();
    if (moreArgs === null) {
      return extraInfo;
    } else {
      // update the sizeParams and numOfParams to be derived from the param Info
      extraInfo = {
        sizeParams: (this.procInfo.sizeParams + moreArgs.sizeParams) / 2,
        sizeLocals: (this.procInfo.sizeLocals + moreArgs.sizeLocals) / 2,
        numOfParams: (this.procInfo.numOfParams + moreArgs.numOfParams) / 2,
        paramInfo: { ...this.procInfo.paramInfo, ...moreArgs.paramInfo },
        identifiers,
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
    if (this.currentToken.token === "idT") {
      this.AssignStat();
    } else {
      this.IOStat();
    }
  }
  AssignStat() {
    this.assignStatement = "";
    let idt = this.consume("idT");
    if (this.currentToken.token === "LparenT") {
      console.log("IN The Procedure!!!!");
      let procCall = this.ProcCall(idt);
    }
    ///----------------///----------------///----------------///----------------///----------------
    else if (this.currentToken.token === "assignT") {
      this.consume("assignT");
      let expr = this.Expr();
      console.log(expr);
      this.hashTable.setValue("value", idt, expr);
      console.log(`${idt} : ${expr}`);
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
        // Find a way to implement the pushes and call to the function
      }
    }
    this.consume("RparenT");
    // Generate three address code for procedure call
    let output = this.threeAddressCode;
    if (params.length === 0) {
      // No parameters
      output = (`call ${idt}`);
    } else{
      // Multiple parameters
      for (let i = 0; i <= params.length -1; i++) {
        console.log(lookup.paramInfo[i]);     
        if (lookup.paramInfo[i].passingMode == "reference") {
          output += (`push @${params[i]} ${String.fromCharCode(13)}`);
        } else {
          output += (`push ${params[i]}  ${String.fromCharCode(13)}`);
        }
      }
      output += (`call ${idt}`);
      this.threeAddressCode = output;
      console.log(this.threeAddressCode);
      // this.threeAddressCode.push(`call ${idt}`);
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
    console.log(term);
    let result;
    let moreTerm = this.MoreTerm();
    // console.log(moreTerm);

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
      // console.log(factor);
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
    const currToken =  this.currentToken;
    console.log(currToken.token);
    // this.consume();
    switch (currToken.token) {
      case "idT":
        console.log("Inn");
        let token = this.consume("idT");
        const lookup = this.hashTable.lookup(token);
        console.log(lookup);
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
      //  console.log(this.currentToken);
      let currLex = this.currentToken.lexeme;
      this.advance();
      // console.log(this.currentToken.lexeme);
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
