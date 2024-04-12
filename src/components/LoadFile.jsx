import React, { ChangeEvent, useEffect, useState } from "react";
import LexicalAnalyzer from "./LexicalAnalyzer";
import Parser from "./Parser";

const FileInputComponent = () => {
  const [fileContent, setFileContent] = useState(null);
  let tokenList;

  const handleFileSelect = (event) => {
    const files = event.target.files;

    if (files && files.length > 0) {
      const selectedFile = files[0];
      readFileContents(selectedFile);
    }
  };

  const readFileContents = (file) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const result = event.target?.result;
      setFileContent(result);
    };

    reader.readAsText(file);
  };

    fileContent && (tokenList = LexicalAnalyzer(fileContent));
    if (tokenList) {
      const tokenParser = new Parser(tokenList);
      let output = tokenParser.parseProgram();
      // console.log(output);
    }

  return (
    <div>
      <input type="file" onChange={handleFileSelect} />
      {fileContent && (
        <div>
          <h4>File Content:</h4>
          <pre>{fileContent}</pre>
        </div>
      )}
    </div>
  );
};

export default FileInputComponent;
