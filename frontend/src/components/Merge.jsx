import React, { useRef, useState } from 'react';
import FileInput from './FileInput';
import { usePyodide } from './PyodideProvider';

const Merge = () => {
  const fileInputRef = useRef();
  const { pyodide, mypkg } = usePyodide();
  const [mergedBlobUrl, setMergedBlobUrl] = useState(null); // State to store the merged PDF blob URL

  const handleMerge = async () => {
    if (!mypkg) {
      console.warn("Package is still loading");
      return;
    }
    if (fileInputRef.current) {
      const filesWithRanges = fileInputRef.current.getFilesWithPageRanges(); // Get files and page ranges
      const mergedDoc = mypkg.Document(); // Create an empty document for merging

      for (const { file, pageRange } of filesWithRanges) {
        const buffer = await file.arrayBuffer();
        const pdfDoc = mypkg.Document.callKwargs({ stream: pyodide.toPy(buffer) });
        const [start, end] = pageRange;

        mergedDoc.insert_pdf.callKwargs(pdfDoc, { from_page: start, to_page: end });
        pdfDoc.close();
      }

      const mergedBuffer = mergedDoc.write(); // Write the merged document
      mergedDoc.close();

      // Release the previous blob URL if it exists
      if (mergedBlobUrl) {
        URL.revokeObjectURL(mergedBlobUrl);
      }

      const mergedBlob = new Blob([mergedBuffer.toJs()], { type: 'application/pdf' });
      const newBlobUrl = URL.createObjectURL(mergedBlob);
      setMergedBlobUrl(newBlobUrl); // Store the new blob URL in state
    }
  };

  return (
    <div>
      <FileInput ref={fileInputRef} enablePageRange={true} acceptedFileTypes="application/pdf" allowMultiple={true} />
      <button onClick={handleMerge}>Merge PDFs</button>
      {mergedBlobUrl && (
        <iframe
          src={mergedBlobUrl}
          style={{ width: '100%', height: '500px', marginTop: '10px', border: '1px solid #ccc' }}
          title="Merged PDF"
        ></iframe>
      )}
    </div>
  );
};

export default Merge;
