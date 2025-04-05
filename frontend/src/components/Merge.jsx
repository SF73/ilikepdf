import React, { useRef, useState } from 'react';
import FileInput from './FileInput';
import { usePyodide } from './PyodideProvider';
import LoadingButton from './LoadingButton';
import { mergePdfs } from '../utils/pymupdfUtils';

const Merge = () => {
  const fileInputRef = useRef();
  const { pyodide, pymupdf, loading } = usePyodide();
  const [mergedBlobUrl, setMergedBlobUrl] = useState(null);

  const handleMerge = async () => {
    if (!pymupdf) {
      console.warn("Package is still loading");
      return;
    }
    if (fileInputRef.current) {
      const filesWithRanges = fileInputRef.current.getFilesWithPageRanges();
      const mergedBlob = await mergePdfs(pymupdf, pyodide, filesWithRanges);

      // Release the previous blob URL if it exists
      if (mergedBlobUrl) {
        URL.revokeObjectURL(mergedBlobUrl);
      }

      const newBlobUrl = URL.createObjectURL(mergedBlob);
      setMergedBlobUrl(newBlobUrl);
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
