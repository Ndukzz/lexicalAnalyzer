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
    // console.log(this.depth);
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
      console.log("End of program...");
      
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
      this.depth++;
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
  }
  ProcHeading() {
    let procName = this.consume("procedureT");
    let identifiers = [procName];
    this.consume("idT");
    let procInfo = this.Args();
    this.hashTable.insert(identifiers, "Procedure", this.depth, procInfo);
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
    this.hashTable.writeTable(this.depth);
    this.depth--;
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
    if (this.currentToken.token === "idT") {
      this.AssignStat();
    } else {
      this.IOStat();
    }
  }
  AssignStat() { 
    this.consume( "idT" );
    this.consume("assignT");
    this.Expr();
  }
  IOStat() {
    return null;
  }
  Expr() {
    this.Relation();
  }
  Relation() {
    this.SimpleExpr();
  }
  SimpleExpr() {
    this.Term();
    this.MoreTerm();
  }
  MoreTerm() {
    if(this.currentToken.token === "addOp") {
      this.Addop();
      this.Term();
      this.MoreTerm();
    } else {
      return null;
    }
  }
  Term() {
    this.Factor();
    this.MoreFactor();
  }
  MoreFactor() {
    if (this.currentToken.token === "mulOp") { 
      this.Mulop();
      this.Factor();
      this.MoreFactor();
    } else {
      return null;
    }
  }
  Factor() {
    switch (this.currentToken.token) {
      case "idT":
        this.consume("idT")
        break;
      case "numT":
        this.consume("numT")
        break;
      case "LparenT":
        this.consume("LparenT");
        this.Expr();
        this.consume("RparenT");
        break;
      case "notT":
        this.consume("notT");
        this.Factor();
        break;
      case "SignOp":    //WORKON: It wasn't clear
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
        return this.currentToken.lexeme;
        break;
      case "orT":
        return this.currentToken.lexeme;
        break;
      default:
        break;
    }
  }
  Mulop(){
    switch (this.currentToken.token) {
      case "mulOp":
        return this.currentToken.lexeme;
        break;
      default:
        break;
    }
  }

  SignOp() {
    return null;  // wasnt clear on this too
  }

  consume(expectedType) {
    // console.log("Consume: ", this.currentTokenIndex + 1);
    if (
      this.currentTokenIndex + 1 === this.tokens.length &&
      this.currentToken.token === "eofT"
    ) {
      return;
    } else if (this.currentToken.token === expectedType) {
      this.advance();
      return this.currentToken.lexeme;
    } else {
      throw new SyntaxError(
        `Expected ${expectedType} but found ${this.currentToken.token} at ${
          this.currentTokenIndex + 1
        }`
      );
    }
  }

  advance() {
    // console.log("Advance: ", this.currentToken.lexeme);
    if (this.currentTokenIndex < this.tokens.length - 1) {
      const oldToken = this.currentToken;
      // console.log(this.currentToken.token);
      this.currentTokenIndex++;
      this.currentToken = this.tokens[this.currentTokenIndex];
      return oldToken.lexeme;
    } else {
      this.currentToken = { type: "EOF" };
    }
  }
  };
export default Parser;
