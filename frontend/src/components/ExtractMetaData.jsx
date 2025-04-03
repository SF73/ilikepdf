import React, { useState } from 'react';

const ExtractMetaData = () => {
  const [output, setOutput] = useState('');

  // Function that processes the dropped data
  const processData = (data) => {
    // For example, convert the text to uppercase
    return data.toUpperCase();
  };

  // Handler for drop events
  const handleDrop = (event) => {
    event.preventDefault();
    const data = event.dataTransfer.getData('text');
    const processedOutput = processData(data);
    setOutput(processedOutput);
  };

  // Handler to allow dropping by preventing default behavior
  const handleDragOver = (event) => {
    event.preventDefault();
  };

  return (
    <div>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        style={{
          border: '2px dashed #ccc',
          padding: '20px',
          textAlign: 'center',
          marginBottom: '20px',
        }}
      >
        Drag and drop some text here
      </div>
      <textarea
        value={output}
        readOnly
        style={{ width: '100%', height: '150px' }}
      />
    </div>
  );
};

export default ExtractMetaData;
