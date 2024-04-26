import React from 'react';

const DownloadFile = (props) => {
  const handleDownload = () => {
    const fileContent = props.content; // Content of the file
    const fileName = props.name; // File name
    const contentType = "text/plain"; // File type

    // Create a Blob from the content
    const blob = new Blob([fileContent], { type: contentType });

    // Create a link element, use it to download the blob, and then remove it
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
    
    // Optional: remove the blob after it's downloaded
    setTimeout(() => window.URL.revokeObjectURL(link.href), 100);
  };
  return (
    <div>
      <button onClick={handleDownload}>Download Output</button>
    </div>
  );
};

export default DownloadFile;
