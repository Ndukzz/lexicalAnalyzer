class Parser {
  constructor(tokens) {
    this.tokens = tokens;
    this.currentTokenIndex = 0;
    this.currentToken = this.tokens[this.currentTokenIndex];
  }

  parseProgram() {
    const declarations = [];
    while (this.currentTokenIndex +1 != this.tokens.length && this.currentToken.type !== "eoft") {
      declarations.push(this.parseDeclaration());
      if (this.currentToken.type === "semicolonT") {
        this.consume("semicolonT");
      }
      // else if(this.currentToken.type === "endT"){
      //   this.advance();
      //   this.consume('idT');
      //   console.log("In here !");
        // if (this.currentToken.type === 'eofT') {
        //   console.log("End of file!!");
        // }
      // }
    }
    return declarations;
  }

  parseEndToken(){
    if(this.currentToken.type === "endT"){
      this.advance();
      this.consume('idT');
      if (this.currentToken.type === 'eofT') {
        this.parseProgram()
      }
    }
  }

  parseDeclaration() {
    if (this.currentToken.type === "endT") {
      this.advance(); // Consume "endToken"
      this.consume("idT"); // Consume endToken name
      if (this.currentToken.type === "eofT") {
        console.log("End of file Reached!!");
        return;
      }
      // this.consume("semicolonT"); // Consume semicolon

      return { type: "EndDeclaration" };
    } 
    if (this.currentToken.type === "moduleT") {
      this.advance(); // Consume "moduleT"
      this.consume("idT"); // Consume module name
      // this.consume("semicolonT"); // Consume semicolon

      return { type: "ModuleDeclaration" };
    } 
    else if (this.currentToken.type === "procedureT") {
      this.advance(); // Consume "procedureT"
      const procedureName = this.currentToken.value;
      this.consume("idT"); // Consume procedure name
      if (this.currentToken.type === "LparenT") {
        this.advance();
        const parameters = [];
        this.parseDeclaration();
        while (this.currentToken.type !== "RparenT") {
          const identifier = this.parseIdentifier();
          this.consume("colonT");
          const type = this.parseType();
          parameters.push({ identifier, type });
          if (this.currentToken.type === "commaT") {
            this.advance();
          }
        }
        this.consume("RparenT");
        this.consume("semicolonT");
        if (this.currentToken.type === "idT") {
          this.parseStatements();
        }
        this.parseEndToken();
        return {
          type: "ProcedureDeclaration",
          name: procedureName,
          parameters,
        };
      }
      const identifier = this.parseIdentifier();
      this.consume("colonT");
      const type = this.parseType();
      return { type: "VariableDeclaration", identifier, type };
    }
    //  parse The VAR statement 
    else if (this.currentToken.type === "varT") {
      this.advance(); // Consume "varT"
      let identifiers = [];
      while (this.currentToken.type === "idT") {
        identifiers.push(this.parseIdentifier());
        if (this.currentToken.type === "commaT") {
          this.advance();
        }
      }
      if (identifiers.length > 1) {
        this.consume("colonT");
        const type = this.parseType();
        return { type: "VariableDeclaration", identifiers, type };
      } else {
        const identifier = identifiers[0];
        this.consume("colonT");
        const type = this.parseType();
        return { type: "VariableDeclaration", identifier, type };
      }
    } 
    else if (this.currentToken.type === "beginT") {
      this.advance(); // Consume "beginT"
      const statements = this.parseStatements();
      this.consume("endT");
      this.consume("beginT"); // Consume "begin"
      return { type: "BeginEndBlock", statements };
    } else {
      throw new SyntaxError("Unexpected token");
    }
  }


  parseStatements() {
    const statements = [];
    while (this.currentToken && this.currentToken.type !== "eofT" && this.currentToken.type !== "endT") {
      statements.push(this.parseStatement());
      if (this.currentToken.type === "semicolonT") {
        this.advance();
      }
    }
    if (this.currentToken.type === "endT") {
      this.advance();
    }
    return statements;
  }

  parseStatement() {
    if (this.currentToken.type === "idT") {
      const identifier = this.currentToken.value;
      this.advance(); // Consume identifier
      if (this.currentToken.type === "endT") {
        this.advance();
        console.log("In here!");
      } else {
        this.consume("assignT");
        const expression = this.parseExpression();
        return { type: "AssignmentStatement", identifier, expression };
      }
    } else if (this.currentToken.type === "whileT") {
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
      this.currentToken.type === "intT" ||
      this.currentToken.type === "charT" ||
      this.currentToken.type === "realT" ||
      this.currentToken.type === "boolT"
    ) {
      const type = this.currentToken.type;
      this.advance();
      return type;
    } else {
      throw new SyntaxError("Expected type");
    }
  }

  parseIdentifier() {
    const identifiers = [];
    if (this.currentToken.type === "idT") {
      const identifier = this.currentToken.value;
      identifiers.push(identifier);
      this.advance();
      if (this.currentToken.type === "commaT") {
        console.log("am i in?");
        this.advance();
        this.parseIdentifier();
      }
      if (this.currentToken.type === "semicolonT") {
        this.advance();
        if (this.currentToken.type === "idt") {
          this.parseIdentifier();
        }
      }
      // this.consume("colonT");
    }
    if (this.currentToken.type === "idT") {
      this.parseIdentifier();
    }
    if (identifiers.length === 0) {
      throw new SyntaxError("Expected identifier");
    }
    return identifiers;
  }

  parseExpression() {
    let term = this.parseTerm();
    while (
      this.currentToken &&
      (this.currentToken.type === "relOp" || this.currentToken.type === "addOp")
    ) {
      const operator = this.currentToken.value;
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
    while (this.currentToken && this.currentToken.type === "mulOp") {
      const operator = this.currentToken.value;
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
    if (this.currentToken.type === "numT") {
      const number = this.currentToken.value;
      this.advance();
      return { type: "NumberLiteral", value: number };
    } else if (this.currentToken.type === "idT") {
      const identifier = this.currentToken.value;
      this.advance();
      return { type: "Identifier", name: identifier };
    } else if (this.currentToken.type === "LparenT") {
      this.advance();
      const expression = this.parseExpression();
      this.consume("RparenT");
      return expression;
    } else {
      throw new SyntaxError("Unexpected token");
    }
  }

  consume(expectedType) {
    console.log("Consume: ", this.currentTokenIndex + 1);
    if (this.currentToken.type === expectedType) {
      this.advance();
    } else {
      throw new SyntaxError(
        `Expected ${expectedType} but found ${this.currentToken.type} at ${
          this.currentTokenIndex + 1
        }`
      );
    }
  }

  advance() {
    console.log("Advance: ", this.currentTokenIndex + 1);
    if (this.currentTokenIndex < this.tokens.length - 1) {
      console.log(this.currentToken, this.tokens[this.currentTokenIndex]);
      this.currentTokenIndex++;
      this.currentToken = this.tokens[this.currentTokenIndex];
    } else {
      this.currentToken = { type: "EOF" };
    }
  }
}

// const parser = new Parser(tokens);
// const ast = parser.parseProgram();
// console.log(ast);

export default Parser;
