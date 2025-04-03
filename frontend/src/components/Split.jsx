import React, { useRef, useState } from 'react';
import FileInput from './FileInput';
import { usePyodide } from './PyodideProvider';

const Split = () => {
  const fileInputRef = useRef();
  const { pyodide, mypkg } = usePyodide();
  const [blobUrls, setBlobUrls] = useState([]); // State to store blob URLs for split PDFs
  const [activeSplit, setActiveSplit] = useState(null); // State to track the active split for iframe

  const handleSplit = async () => {
    if (!mypkg) {
      console.warn("Package is still loading");
      return;
    }
    if (fileInputRef.current) {
      const { file } = fileInputRef.current.getFilesWithPageRanges()[0]; // Single file
      const buffer = await file.arrayBuffer();
      const doc = mypkg.Document.callKwargs({ stream: pyodide.toPy(buffer) });

      const splits = JSON.parse(document.getElementById("splitsInput").value); // Get splits from input
      const splitBlobs = [];

      splits.forEach(([start, end], idx) => {
        const newDoc = mypkg.Document();
        newDoc.insert_pdf.callKwargs(doc, { from_page: start, to_page: end });
        const splitBuffer = newDoc.write();
        newDoc.close();
        const splitBlob = new Blob([splitBuffer.toJs()], { type: "application/pdf" });
        const fileName = `pages_${start + 1}-${end + 1}.pdf`; // Include page range in the file name
        splitBlobs.push({ url: URL.createObjectURL(splitBlob), name: fileName });
      });

      doc.close();

      // Release previous blob URLs
      blobUrls.forEach(({ url }) => URL.revokeObjectURL(url));
      setBlobUrls(splitBlobs); // Store new blob URLs
    }
  };

  const handleViewSplit = (url) => {
    setActiveSplit(url); // Set the active split URL for the iframe
  };

  return (
    <div>
      <FileInput ref={fileInputRef} enablePageRange={false} acceptedFileTypes="application/pdf" allowMultiple={false} />
      <textarea
        id="splitsInput"
        placeholder='Enter splits as JSON (e.g., [[0, 1], [2, 4]])'
        rows="5"
        cols="50"
        style={{ display: "block", marginTop: "10px" }}
      ></textarea>
      <button onClick={handleSplit}>Split PDF</button>
      <div style={{ marginTop: "10px" }}>
        {blobUrls.map(({ url, name }, idx) => (
          <div key={idx} style={{ marginBottom: "10px" }}>
            <button onClick={() => handleViewSplit(url)}>{name}</button>
          </div>
        ))}
      </div>
      {activeSplit && (
        <iframe
          src={activeSplit}
          style={{ width: "100%", height: "500px", marginTop: "10px", border: "1px solid #ccc" }}
          title="Active Split"
        ></iframe>
      )}
    </div>
  );
};

export default Split;
