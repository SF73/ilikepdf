import React, { useEffect, useState } from 'react';
import FileInput from '../components/FileInput';
import { runTask } from '../utils/workerClient';
import PdfPreviewCard from '../components/PdfResultCard';
import { Textarea } from '@/components/ui/textarea';
import usePdfFileManager from '@/hooks/usePdfFileManager';
import { Button } from '@/components/ui/button';
import MemoizedFileCard from '@/components/MemoizedFileCard';

const MetadataEditor = () => {
  const [buffer, setBuffer] = useState<ArrayBuffer | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [textareaValue, setTextareaValue] = useState<string>('');
  const { files, replaceFiles, removeFile } = usePdfFileManager();

  useEffect(() => {
    if (files.length > 0) {
      handleProcessFiles();
    }
  }, [files]);

  const handleProcessFiles = async () => {
    try {
      if (files.length === 0) return;
      const buffer = await files[0].fileHandle.arrayBuffer();
      const metadata = await runTask('getPdfMetadata', { buffer });
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
      const { buffer: updatedBuffer } = await runTask("setPdfMetadata", {
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
        className={`w-full mb-4 ${files?.length > 0 ? 'h-20' : 'h-20 sm:h-40 lg:h-56 xl:h-64 p-4 sm:p-6'}`}
      />
      {files.length > 0 && (<>
      <div className='flex flex-row gap-2 mb-4'>
        <MemoizedFileCard file={files[0]} onDelete={()=>removeFile(files[0].id)}/>
        <Textarea
          id="output"
          rows={12}
          value={textareaValue}
          onChange={(e) => setTextareaValue(e.target.value)}
        ></Textarea>
      </div>
      <Button className="w-full" onClick={handleSetAndDownload}>
        Set Metadata
      </Button>

      {buffer && <PdfPreviewCard arrayBuffer={buffer} blobName={fileName} autoPreview={false} />}
      </>
    )}
    </div>
  );
};

export default MetadataEditor;
