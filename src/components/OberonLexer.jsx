import React from 'react';

const OberonLexer = () => {
  const oberonCode = `
    MODULE SampleModule;
      VAR
        x: INTEGER;
      BEGIN
        x := 42;
        IF x > 0 THEN
          WriteString("Hello, Oberon!");
        END;
    END SampleModule.
  `;

  let currPosition = 0;
  const txtLength = oberonCode.length;
  let ch = '';
  let output = {
    lexeme: '',
    Token: '',
  };

  // Object containing reserved words and symbols
  const RESERVEDWORDSANDSYMBOLS = {
    MODULE: 'MODULE',
    VAR: 'VAR',
    BEGIN: 'BEGIN',
    END: 'END',
    IF: 'IF',
    THEN: 'THEN',
    ELSE: 'ELSE',
    INTEGER: 'INTEGER',
    WriteString: 'WriteString',
    ':=': 'ASSIGNMENT',
    '>': 'GREATER_THAN',
    '(': 'LEFT_PARENTHESIS',
    ')': 'RIGHT_PARENTHESIS',
    ';': 'SEMICOLON',
    '.': 'PERIOD',
  };

  // Function to get the next character
  const GetNextCh = () => {
    if (currPosition < txtLength) {
      return oberonCode[currPosition];
    } else {
      return ''; // End of file
    }
  };

  // Function to process the current token
  const ProcessToken = () => {
    const typeSwitch = () => {
      output.Token = RESERVEDWORDSANDSYMBOLS[output.lexeme] || 'IDENTIFIER';
    };

    while (currPosition < txtLength) {
      const ch = GetNextCh();

      switch (true) {
        case /\s/.test(ch): // Skip whitespace
          if (output.lexeme !== '') {
            // Log the output when a token is done processing
            console.log(output);
          }
          break;

        case /[a-zA-Z]/.test(ch): // Start of an identifier or keyword
          output.lexeme = ch;
          while (/[a-zA-Z0-9]/.test(oberonCode[currPosition + 1])) {
            currPosition++;
            output.lexeme += GetNextCh();
          }
          typeSwitch();
          // Log the output when a token is done processing
          console.log(output);
          break;

        case /\d/.test(ch): // Start of a number
          output.lexeme = ch;
          while (/\d/.test(oberonCode[currPosition + 1])) {
            currPosition++;
            output.lexeme += GetNextCh();
          }
          typeSwitch();
          // Log the output when a token is done processing
          console.log(output);
          break;

        default:
          // Check for double tokens
          const doubleToken = output.lexeme + ch;
          if (RESERVEDWORDSANDSYMBOLS[doubleToken]) {
            output.lexeme = doubleToken;
            output.Token = RESERVEDWORDSANDSYMBOLS[doubleToken];
            // Log the output when a token is done processing
            console.log(output);
            output.lexeme = '';
          } else {
            output.lexeme = ch;
            typeSwitch();
            // Log the output when a token is done processing
            console.log(output);
          }
          break;
      }

      currPosition++;
    }
  };

  // Function to get the next token
  const GetNextToken = () => {
    while (currPosition < txtLength) {
      const ch = GetNextCh();
      output = {
        lexeme: '',
        Token: '',
      };
      ProcessToken();
      console.log(output);
    }

    console.log('End of file!');
  };

  // Execute GetNextToken when the component mounts
  GetNextToken();

  return (
    <div>
      <h1>Oberon Lexer</h1>
      <h3></h3>
    </div>
  );
};

export default OberonLexer;
