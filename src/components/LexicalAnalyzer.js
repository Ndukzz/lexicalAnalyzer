//  comments,
// import React, { useState } from "react";
// import Parser from './Parser';

const RESERVEDWORDSANDSYMBOLS = {
  INTEGER: "intT",
  REAL: "realT",
  CHAR: "charT",
  MODULE: "moduleT",
  PROCEDURE: "procedureT",
  BOOLEAN: "boolT",
  VAR: "varT",
  BEGIN: "beginT",
  END: "endT",
  IF: "ifT",
  THEN: "thenT",
  ELSE: "elseT",
  ELSIF: "elsifT",
  WHILE: "whileT",
  DO: "doT",
  ARRAY: "arrayT",
  RECORD: "recordT",
  CONST: "constT",
  TYPE: "typeT",
  "(*": "openCommentT",
  "*)": "closeCommentT",
  ":=": "assignT",
  "+": "addOp",
  "-": "addOp",
  "*": "mulOp",
  "/": "mulOp",
  "=": "relOp",
  "<": "relOp",
  ">": "relOp",
  "<=": "relOp",
  ">=": "relOp",
  "#": "relOp",
  "^": "caretT",
  "~": "notT",
  "&": "andT",
  ".": "eofT",
  ",": "commaT",
  ";": "semicolonT",
  "..": "doubledotT",
  "|": "orT",
  ":": "colonT",
  "(": "LparenT",
  ")": "RparenT",
  "[": "LbracketT",
  "]": "RbracketT",
  "{": "LcurlybraceT",
  "}": "RtcurlybraceT",
  // WORK ON THESE AFTER PROCEDURE 2
};

const LexicalAnalyzer = (input) => {
  let currPosition = 0;
  let ch = input[currPosition+1];
  let txtLength = input.length;
  let lineCount = 1;
  let commCount = 0;
  let output = {
    lexeme: input[currPosition],
    Token: "",
  };
  let  tokenList = [];

  //Rule for identifying whitespace
  const whiteSpace = /^\s+/;

  // GetNextCh function
  const GetNextCh = () => {
    if (currPosition < txtLength) {
      return input[currPosition];
    } else {
      return ""; // End of file
    }
  }; //  End of GetNextCh function

  //  GetNextToken function
  const GetNextToken = () => {
    while (currPosition < txtLength) {
      GetNextCh();

      while (!whiteSpace.test(ch)) {
        ProcessToken();
        if (currPosition < txtLength) {
          GetNextCh();
        } else {
          console.log("End of File!");
          break;
        }
        output = {
          lexeme: "",
          Token: "",
        };
      }

      // Log the output after processing a token
      outputToken();
    }
    console.log(tokenList);
  }; //  End of GetNextToken

  //  Handles the output of tokens relating to comments
  const outputToken = () => {
    if ( commCount == 0 ) {
      // tokenList.push(output.Token);
      tokenList.push({
        type: output.Token,
        value: output.lexeme
      });
      console.log(output);

    } else if(output.Token == "closeCommentT" && commCount !== 0 ){
      console.log("Missing Open comment...");
      //  HANDLE ANY EXTRA PROCEDURES FOR A MISSING COMMENT
    }
  }  

  //ProcessToken function
  const ProcessToken = () => {
    const typeSwitch = () => {
      output.Token = RESERVEDWORDSANDSYMBOLS[output.lexeme] || "idT";
    };

    while (currPosition < txtLength) {
      const ch = GetNextCh();

      switch (true) {
        case /\s/.test(ch): // Skip whitespace
          if (ch == "\n") {
            lineCount++;
            // console.log("Line Number :" + lineCount);
          }
          break;

        case /[a-zA-Z]/.test(ch): // Start of an identifier or keyword
          output.lexeme = ch;
          while (/[a-zA-Z0-9]/.test(input[currPosition + 1])) {
            currPosition++;
            output.lexeme += GetNextCh();
          }
          typeSwitch();
          if (output.lexeme.length > 17) {
              output.Token = "unknownT";
          }
          // Log the output when a token is done processing
          outputToken();
          break;

          case /\d/.test(ch): // Start of a number
          output.lexeme = ch;
          while (/\d/.test(input[currPosition + 1]) || /\./.test(input[currPosition + 1])) {
            currPosition++;
            output.lexeme += GetNextCh();
          }
          if (/\d+(\.\d*)?/.test(output.lexeme)) {
            output.Token = "numT";
          } else {
            throw new SyntaxError("Invalid number format");
          }
          // Log the output when a token is done processing
          outputToken();
          break;

        //  Catching comments
        case output.lexeme == "(" || output.lexeme == "*":
          const testComment = output.lexeme + ch;

          //  if its a comment "(*" or "*)"
          if (RESERVEDWORDSANDSYMBOLS[testComment]) {

            //  Setting the inComment to enable skipping chars in comments
            if(RESERVEDWORDSANDSYMBOLS[testComment] == "openCommentT"){
              commCount ++;
            } else if (RESERVEDWORDSANDSYMBOLS[testComment] == "closeCommentT") {
              commCount --;
            } 
            output.lexeme = testComment;
            output.Token = RESERVEDWORDSANDSYMBOLS[output.lexeme];
            // outputToken();
          } else {
            output.lexeme = ch;
          }
          break;
        default:
          // Check for double tokens
          const doubleToken = output.lexeme + ch;
          if (RESERVEDWORDSANDSYMBOLS[doubleToken]) {
            output.lexeme = doubleToken;
            output.Token = RESERVEDWORDSANDSYMBOLS[doubleToken];
            // Log the output when a token is done processing
            outputToken();
            typeSwitch();
            // output.lexeme = "";
          } else if (
            RESERVEDWORDSANDSYMBOLS[ch + input[currPosition + 1]]
          ) {
            output.lexeme = ch;
            typeSwitch();
            // Log the output when a token is done processing
          } else {
            output.lexeme = ch;
            typeSwitch();
            outputToken();
          }
          break;
      }
      currPosition++; //  Increase the currPosition for fetching chars in the code
    }
  }; //  End of ProcessToken function 
  
  ProcessToken();
  return tokenList;
};

export default LexicalAnalyzer;
