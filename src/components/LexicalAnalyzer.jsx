//  comments,
import React, { useState } from "react";

const RESERVEDWORDSANDSYMBOLS = {
  INT: "integert",
  REAL: "realt",
  CHAR: "chart",
  MODULE: "modulet",
  PROCEDURE: "proceduret",
  VAR: "vart",
  BEGIN: "begint",
  END: "endt",
  IF: "ift",
  THEN: "thent",
  ELSE: "elset",
  ELSIF: "elsift",
  WHILE: "whilet",
  DO: "dot",
  ARRAY: "arrayt",
  RECORD: "recordt",
  CONST: "constt",
  TYPE: "typet",
  "(*": "openCommentt",
  "*)": "closeCommentt",
  "+": "plust",
  ":=": "assignt",
  "-": "minust",
  "^": "carett",
  "*": "multiplyt",
  "=": "equalt",
  "/": "dividet",
  "#": "nott",
  "~": "bitwisenott",
  "<": "lessthant",
  "&": "bitwiseandt",
  ">": "greaterthant",
  ".": "dott",
  "<=": "lessthanequalt",
  ",": "commat",
  ">=": "greaterthanequalt",
  ";": "semicolont",
  "..": "doubledott",
  "|": "bitwiseort",
  ":": "colont",
  "(": "leftparenthesist",
  ")": "rightparenthesist",

  "[": "leftsquarebrackett",
  "]": "rightsquarebrackett",
  "{": "leftcurlybracet",
  "}": "rightcurlybracet",
  // WORK ON THESE AFTER PROCEDURE 2
};

// const oberonCode = `MODULE SampleModule;
//       VAR
//         x: INTEGER;
//       BEGIN
//       (*    *)
//         x := 42;  :=
//         IF x >= 0 THEN
//           WriteString("Hello, Oberon!");
//         END;
//     END SampleModule.`;

const LexicalAnalyzer = (props) => {
  let currPosition = 0;
  let ch = props.file[currPosition];
  let txtLength = props.file.length;
  let lineCount = 1;
  let output = {
    lexeme: "",
    Token: "",
  };

  //Rule for identifying whitespace
  const whiteSpace = /^\s+/;

  // GetNextCh function
  const GetNextCh = () => {
    if (currPosition < txtLength) {
      return props.file[currPosition];
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
      console.log(output);
    }
  }; //  End of GetNextToken

  //ProcessToken function
  const ProcessToken = () => {
    const typeSwitch = () => {
      output.Token = RESERVEDWORDSANDSYMBOLS[output.lexeme] || "idt";
    };

    while (currPosition < txtLength) {
      const ch = GetNextCh();

      switch (true) {
        case /\s/.test(ch): // Skip whitespace
          if (ch == "\n") {
            lineCount++;
            console.log(lineCount);
          }
          if (output.lexeme !== "") {
            // Log the output when a token is done processing
          }
          break;

        case /[a-zA-Z]/.test(ch): // Start of an identifier or keyword
          output.lexeme = ch;
          while (/[a-zA-Z0-9]/.test(props.file[currPosition + 1])) {
            currPosition++;
            output.lexeme += GetNextCh();
          }
          typeSwitch();
          if (output.lexeme.length > 17) {    // 	idt of max length = 17
            output.lexeme = "idt too long!"
          }
          // Log the output when a token is done processing
          console.log(output);
          break;

        case /\d/.test(ch): // Start of a number
          output.lexeme = ch;
          while (/\d/.test(props.file[currPosition + 1])) {
            currPosition++;
            output.lexeme += GetNextCh();
          }
          output.Token = "numt";
          // Log the output when a token is done processing
          console.log(output);
          break;
          
        //  Catching comments
        case output.lexeme == "(" || output.lexeme == "*":
          const testComment = output.lexeme + ch;
          if (RESERVEDWORDSANDSYMBOLS[testComment]) {
            output.lexeme = testComment;
            // currPosition ++;
            output.Token = RESERVEDWORDSANDSYMBOLS[output.lexeme];
            console.log(output);
          } else {
            output.lexeme = ch;
            console.log(output);
          }
          break;
          
        default:
          // Check for double tokens
          const doubleToken = output.lexeme + ch;
          if (RESERVEDWORDSANDSYMBOLS[doubleToken]) {
            output.lexeme = doubleToken;
            output.Token = RESERVEDWORDSANDSYMBOLS[doubleToken];
            // Log the output when a token is done processing
            console.log(output);
            typeSwitch();
            output.lexeme = "";
          } else if (
            RESERVEDWORDSANDSYMBOLS[ch + props.file[currPosition + 1]]
          ) {
            output.lexeme = ch;
            typeSwitch();
            // Log the output when a token is done processing
          } else {
            output.lexeme = ch;
            typeSwitch();
            console.log(output);
          }
          break;
      }
      currPosition++; //  Increase the currPosition for fetching chars in the code
    }
  }; //  End of ProcessToken function

  GetNextToken();

  return <>Results</>;
};

export default LexicalAnalyzer;
