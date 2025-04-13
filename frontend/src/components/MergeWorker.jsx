import React, { useRef, useState } from 'react';
import FileInput from './FileInput';
import LoadingButton from './LoadingButton';
import { runTask } from '../utils/workerClient';
import PdfPreviewCard from './PdfPreviewCard';

const MergeWorker = () => {
  const fileInputRef = useRef();
  const [blob, setBlob] = useState(null);
  const [loading, setLoading] = useState(false);
  

  const handleMerge = async () => {
    setLoading(true);
    if (!fileInputRef.current) return;
    const filesWithRanges = fileInputRef.current.getFilesWithPageRanges();
    const buffers = await Promise.all(
      filesWithRanges.map(({ file }) => file.arrayBuffer())
    );
    const { buffer, mime } = await runTask("mergePdfs", {
      buffers,
      pageRanges: filesWithRanges.map(({ pageRange }) => pageRange),
    });

    setBlob(new Blob([buffer], { type: mime }));
    setLoading(false);
  };

  return (
    <div>
      <FileInput ref={fileInputRef} enablePageRange={true} acceptedFileTypes="application/pdf" allowMultiple={true} />
      <LoadingButton className='btn' loading={loading} onClick={handleMerge}>Merge PDFs</LoadingButton>
      {blob && <PdfPreviewCard blob={blob} blobName="merged.pdf" autoPreview={false} />}
    </div>
  );
};

export default MergeWorker;
