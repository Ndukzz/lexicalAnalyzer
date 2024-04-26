import React, { useState, useEffect } from "react";
import LexicalAnalyzer from "./LexicalAnalyzer";
import Parser from "./Parser";
import DownloadFile from "./DownloadFile";

const FileInputComponent = () => {
  const [fileContent, setFileContent] = useState(null);
  const [output, setOutput] = useState(null);
  const [name, setName] = useState(null);

  useEffect(() => {
    if (fileContent) {
      const tokenList = LexicalAnalyzer(fileContent);
      if (tokenList) {
        const tokenParser = new Parser(tokenList);
        const program = tokenParser.parseProgram();
        setOutput(program);
        console.log(output);
      }
    }
  }, [fileContent]); // Dependency on fileContent only

  const handleFileSelect = (event) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      readFileContents(file);
      let fileName = file.name;
      const lastIndex = fileName.lastIndexOf(".");
      const baseName =
        lastIndex > 0 ? fileName.substring(0, lastIndex) : fileName;
        setName(baseName);
      console.log(name); // Output: "example"
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

  return (
    <div>
      <input type="file" onChange={handleFileSelect} />
      {fileContent && (
        <div>
          <h4>File Content:</h4>
          <pre>{fileContent}</pre>
          {output ? <pre>{output}</pre> : "Nothing to display yet"}
        </div>
      )}
      {name && output && <DownloadFile name={name} content={output} />}
    </div>
  );
};

export default FileInputComponent;
