import React, { useRef, useState } from 'react';
import FileInput from './FileInput';
import { usePyodide } from './PyodideProvider';
import LoadingButton from './LoadingButton'; // Import the new button component

const Merge = () => {
  const fileInputRef = useRef();
  const { pyodide, pymupdf, loading } = usePyodide();
  const [mergedBlobUrl, setMergedBlobUrl] = useState(null); // State to store the merged PDF blob URL

  const handleMerge = async () => {
    if (!pymupdf) {
      console.warn("Package is still loading");
      return;
    }
    if (fileInputRef.current) {
      const filesWithRanges = fileInputRef.current.getFilesWithPageRanges();
      console.log(filesWithRanges);
      const mergedDoc = pymupdf.Document(); 
      for (const { file, pageRange } of filesWithRanges) {
        const buffer = await file.arrayBuffer();
        const pdfDoc = pymupdf.Document.callKwargs({ stream: pyodide.toPy(buffer) });
        let [start, end] = pageRange;

        mergedDoc.insert_pdf.callKwargs(pdfDoc, { from_page: start, to_page: end });
        pdfDoc.close();
      }

      const mergedBuffer = mergedDoc.write();
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
      <LoadingButton className='btn' loading={loading} onClick={handleMerge}>Merge PDFs</LoadingButton>
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
