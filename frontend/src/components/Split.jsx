import React, { useRef, useState } from 'react';
import FileInput from './FileInput';
import { usePyodide } from './PyodideProvider';
import LoadingButton from './LoadingButton';
import { splitPdf } from '../utils/pymupdfUtils';

const Split = () => {
  const fileInputRef = useRef();
  const { pyodide, loading, pymupdf } = usePyodide();
  const [blobUrls, setBlobUrls] = useState([]); // State to store blob URLs for split PDFs
  const [activeSplit, setActiveSplit] = useState(null); // State to track the active split for iframe

  const handleSplit = async () => {
    if (!pymupdf) {
      console.warn("Package is still loading");
      return;
    }
    if (fileInputRef.current) {
      const { file } = fileInputRef.current.getFilesWithPageRanges()[0];
      const splits = JSON.parse(document.getElementById("splitsInput").value);
      const splitBlobs = await splitPdf(pymupdf, pyodide, file, splits);

      // Release previous blob URLs
      blobUrls.forEach(({ url }) => URL.revokeObjectURL(url));
      setBlobUrls(
        splitBlobs.map((blob, idx) => ({
          url: URL.createObjectURL(blob),
          name: `split_${idx + 1}.pdf`,
        }))
      );
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
      <LoadingButton className='btn' loading={loading} onClick={handleSplit}>Split PDF</LoadingButton>
      <div style={{ marginTop: "10px" }}>
        {blobUrls.map(({ url, name }, idx) => (
          <div key={idx} style={{ marginBottom: "10px" }}>
            <button className='btn' onClick={() => handleViewSplit(url)}>{name}</button>
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
