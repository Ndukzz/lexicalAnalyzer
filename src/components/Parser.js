import HashTable from "./HashTable";

class Parser {
  constructor(tokens) {
    this.tokens = tokens;
    this.currentTokenIndex = 0;
    this.currentToken = this.tokens[this.currentTokenIndex];
    this.depth = 0; // depth of nested expressions (parentheses)
    this.currentBlock = "";
    this.identifiers = [];
    this.hashTable = new HashTable();
  }

  parseProgram() {
    const declarations = [];

    while (
      this.currentTokenIndex + 1 != this.tokens.length &&
      this.currentToken.token !== "eoft"
    ) {
      declarations.push(this.parseDeclaration());
      if (this.currentToken.token === "semicolonT") {
        this.consume("semicolonT");
      }
    }
    return declarations;
  }
  
  parseEndToken() {
    if (this.currentToken.token === "endT") {
      this.advance();
      this.consume("idT");
    }
    if (this.currentToken.token === "eofT") {
      console.log("End of program...");
      // this.hashTable.writeTable(2);
      // this.hashTable.deleteDepth(2);
      this.hashTable.lookup("am");
      // console.log(this.hashTable.storage);
    }
  }

  parseDeclaration() {
    this.identifiers = [];
    if (this.currentToken.token === "moduleT") {
      // MODULE DECLARATION
      this.advance(); // Consume "moduleT"
      this.consume("idT"); // Consume module name
      this.consume("semicolonT"); // Consume semicolon
      this.depth++;
      // console.log(this.depth);
      while (this.currentToken.token !== "eofT") {
        this.parseDeclaration();
        this.consume("semicolonT");
        this.identifiers = [];
      }
      this.parseEndToken();
      this.consume("idT");

      return { declType: "ModuleDeclaration" };
    } else if (this.currentToken.token === "procedureT") {
      //PROCEDURE DECLARATION
      this.advance(); // Consume "procedureT"
      this.consume("idT"); // Consume procedure name
      const procedureName = this.currentToken.lexeme;
      let identifiers;
      if (this.currentToken.token === "LparenT") {
        // If there are paranteses
        this.advance();
        // parameterList = [];
        while (this.currentToken.token === "idT") {   // parse all identifiers
          identifiers = this.parseIdentifier();
        }
        this.consume("colonT");
        const type = this.parseType();
        this.consume("RparenT");
        this.consume("colonT");
        const returnType = this.parseType();
        // console.log(identifiers);

        //  calling the insert method on the symbol table
        this.hashTable.insert(identifiers, 'idT', this.depth)
      }
      this.consume("semicolonT");
      this.depth++;
      // console.log(this.depth);
      while (this.currentToken.token !== "eofT") {
        this.parseDeclaration();
        this.consume("semicolonT");
        this.identifiers = [];
      }
      this.parseEndToken();
      this.consume("idT");
    }
    //  parse The VAR statement
    else if (
      this.currentToken.token === "varT" ||
      this.currentToken.token === "constT"
    ) {
      // add const
      //  VAR DECLARATION
      const varConst = this.advance(); // Consume "varT"  or "constT" token
      let identifiers = [];
      while (this.currentToken.token === "idT") {
        identifiers = this.parseIdentifier();
        // console.log(identifiers);
      }
      this.consume("colonT");
      const type = this.parseType();
      // console.log(varConst);

      //  calling the insert method on the symbol table
      this.hashTable.insert(identifiers, 'idT', this.depth)

      // return { declType: "VariableDeclaration", varConst, identifiers, type };
    } else if (this.currentToken.token === "beginT") {
      //  BEGIN DECLARATION
      // console.log("Begin Block entered!!");
      this.advance(); // Consume "beginT"
      const statements = this.parseStatements();
      this.parseEndToken();
      // console.log("Begin block ended!!");
      this.depth--;
      // console.log(this.depth);
      return { declType: "BeginEndBlock", statements };
    } else {
      throw new SyntaxError("Unexpected token");
    }
  }

  parseStatements() {
    const statements = [];
    while (
      this.currentToken &&
      this.currentToken.token !== "eofT" &&
      this.currentToken.token !== "endT"
    ) {
      statements.push(this.parseStatement());
      if (this.currentToken.token === "semicolonT") {
        this.advance();
      }
    }
    return statements;
  }

  parseStatement() {
    if (this.currentToken.token === "idT") {
      const identifier = this.currentToken.lexeme;
      this.advance(); // Consume identifier

      if (this.currentToken.token === "assignT") {
        this.advance();
        const expression = this.parseExpression();
        return { type: "AssignmentStatement", identifier, expression };
      }
    } else if (this.currentToken.token === "whileT") {
      this.advance(); // Consume "whileT"
      const condition = this.parseExpression();
      this.consume("doT");
      const body = this.parseStatements();
      return { type: "WhileLoop", condition, body };
    } else {
      throw new SyntaxError("Unexpected token");
    }
  }
  parseType() {
    if (
      this.currentToken.token === "intT" ||
      this.currentToken.token === "charT" ||
      this.currentToken.token === "realT" ||
      this.currentToken.token === "boolT"
    ) {
      const type = this.currentToken.token;
      this.advance();
      return type;
    } else {
      throw new SyntaxError("Expected type");
    }
  }

  parseIdentifier() {
    let identifier;
    if (this.currentToken.token === "idT") {
      identifier = this.currentToken.lexeme;
      // console.log("Identifier: ", identifier);
      this.identifiers.push(identifier);
      this.advance();
      if (this.currentToken.token === "commaT") {
        this.advance();
        this.parseIdentifier();
      }
      if (this.currentToken.token === "semicolonT") {
        this.advance();
      }
    }
    if (this.currentToken.token === "idT") {
      this.parseIdentifier();
    }
    if (this.identifiers.length === 0) {
      // if (!identifier) {
      throw new SyntaxError("Expected identifier");
    }
    return this.identifiers;
  }

  parseExpression() {
    let term = this.parseTerm();
    while (
      this.currentToken &&
      (this.currentToken.token === "relOp" ||
        this.currentToken.token === "addOp")
    ) {
      const operator = this.currentToken.lexeme;
      this.advance();
      const nextTerm = this.parseTerm();
      term = {
        type: "BinaryExpression",
        operator,
        left: term,
        right: nextTerm,
      };
    }
    return term;
  }

  parseTerm() {
    let factor = this.parseFactor();
    while (this.currentToken && this.currentToken.token === "mulOp") {
      const operator = this.currentToken.lexeme;
      this.advance();
      const nextFactor = this.parseFactor();
      factor = {
        type: "BinaryExpression",
        operator,
        left: factor,
        right: nextFactor,
      };
    }
    return factor;
  }

  parseFactor() {
    if (this.currentToken.token === "numT") {
      const number = this.currentToken.lexeme;
      this.advance();
      return { type: "NumberLiteral", value: number };
    } else if (this.currentToken.token === "idT") {
      const identifier = this.currentToken.lexeme;
      this.advance();
      return { type: "Identifier", name: identifier };
    } else if (this.currentToken.token === "LparenT") {
      this.advance();
      const expression = this.parseExpression();
      this.consume("RparenT");
      return expression;
    } else {
      throw new SyntaxError("Unexpected token");
    }
  }

  consume(expectedType) {
    // console.log("Consume: ", this.currentTokenIndex + 1);
    if (
      this.currentTokenIndex + 1 === this.tokens.length &&
      this.currentToken.token === "eofT"
    ) {
      return;
    } else if (this.currentToken.token === expectedType) {
      return this.advance();
    } else {
      throw new SyntaxError(
        `Expected ${expectedType} but found ${this.currentToken.token} at ${
          this.currentTokenIndex + 1
        }`
      );
    }
  }

  advance() {
    // console.log("Advance: ", this.currentTokenIndex + 1);
    if (this.currentTokenIndex < this.tokens.length - 1) {
      const oldToken = this.currentToken;
      // console.log(this.currentToken.token);
      this.currentTokenIndex++;
      this.currentToken = this.tokens[this.currentTokenIndex];
      return oldToken.token;
    } else {
      this.currentToken = { type: "EOF" };
    }
  }
}

// const parser = new Parser(tokens);
// const ast = parser.parseProgram();
// console.log(ast);

export default Parser;
