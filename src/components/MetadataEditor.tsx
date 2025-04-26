import React, { useEffect, useState } from 'react';
import FileInput from './FileInput';
import { safeRunTask } from '../utils/workerClient';
import PdfPreviewCard from './PdfResultCard';
import { Textarea } from '@/components/ui/textarea';
import usePdfFileManager from '@/hooks/usePdfFileManager';
import { Button } from '@/components/ui/button';
import MemoizedFileCard from './MemoizedFileCard';

const MetadataEditor = () => {
  const [buffer, setBuffer] = useState<ArrayBuffer | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [textareaValue, setTextareaValue] = useState<string>('');
  const { files, addFiles, removeFile, replaceFiles, reorderFiles, setPageRange } = usePdfFileManager();


  useEffect(() => {
    if (files.length > 0) {
      handleProcessFiles();
    }
  }, [files]);

  const handleProcessFiles = async () => {
    try {
      if (files.length === 0) return;
      const buffer = await files[0].fileHandle.arrayBuffer();
      const metadata = await safeRunTask('getPdfMetadata', { buffer });
      const metadataJson = JSON.stringify(metadata, null, 2);
      setTextareaValue(metadataJson);

    } catch (err) {
      console.error("Failed to get metadata:", err);
    } finally {
    }
  };

  const handleSetAndDownload = async () => {
    if (files.length === 0) return;
    const buffer = await files[0].fileHandle.arrayBuffer();
    const newMetadata = JSON.parse(textareaValue);
    const filename = files[0].fileHandle.name || "updated.pdf";
    try {
      const { buffer: updatedBuffer, mime } = await safeRunTask("setPdfMetadata", {
        buffer,
        newMetadata
      });

      setBuffer(updatedBuffer);
      setFileName(filename);

    } catch (err) {
      console.error("Failed to set metadata:", err);
    } finally {
    }
  }

  return (
    <div>
      <FileInput
        acceptedFileTypes="application/pdf"
        allowMultiple={false}
        onFilesChange={replaceFiles}
        className={`w-full m-4 ${files?.length > 0 ? 'h-20' : 'h-20 sm:h-40 lg:h-56 xl:h-64 p-4 sm:p-6'}`}
      />
      {files.length > 0 && (<>
      <div className='flex flex-row gap-2'>
        <MemoizedFileCard file={files[0]} />
        <Textarea
          id="output"
          rows={12}
          value={textareaValue}
          onChange={(e) => setTextareaValue(e.target.value)}
        ></Textarea>
      </div>
      <Button onClick={handleSetAndDownload}>
        Set Metadata
      </Button>

      {buffer && <PdfPreviewCard arrayBuffer={buffer} blobName={fileName} autoPreview={false} />}
      </>
    )}
    </div>
  );
};

export default MetadataEditor;
