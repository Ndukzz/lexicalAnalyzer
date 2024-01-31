import React, { ChangeEvent, useState } from "react";
import Results from "./Results";

const FileInputComponent = () => {
  const [fileContent, setFileContent] = useState(null);

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

  return (
    <div>
      <input type="file" onChange={handleFileSelect} />
      {fileContent && (
        <div>
          <h4>File Content:</h4>
          <pre>{fileContent}</pre>
          <Results file={fileContent} />
        </div>
      )}
    </div>
  );
};

export default FileInputComponent;
