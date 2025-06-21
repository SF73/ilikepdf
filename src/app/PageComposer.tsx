import { useState } from 'react';
import FileInput, { getFileInputHeightClass } from '../components/FileInput';
import { runTask } from '../utils/workerClient';
import PdfPreviewCard from '../components/PdfResultCard';
import { Textarea } from '@/components/ui/textarea';
import usePdfFileManager from '@/hooks/usePdfFileManager';
import { Button } from '@/components/ui/button';
import MemoizedFileCard from '@/components/MemoizedFileCard';
import ToolLayout from '@/components/ToolLayout';

const PageComposer = () => {
  const [resultBuffer, setResultBuffer] = useState<ArrayBuffer | null>(null);
  const [inputPages, setInputPages] = useState<string>('');
  const [filename, setFilename] = useState<string>('');
  const { files, replaceFiles, removeFile } = usePdfFileManager();

  const handleProcessFiles = async () => {
    try {
      if (files.length === 0) return;
      const inputBuffer = await files[0].fileHandle.arrayBuffer();
      const inputFilename = files[0].fileHandle.name || "composed.pdf";
      const { buffer: newBuffer } = await runTask("selectPages", {
        buffer: inputBuffer,
        inputPages
      });
      setResultBuffer(newBuffer);
      setFilename(inputFilename);
    } catch (err) {
      console.error("Error:", err);
    } finally {
    }
  };

  return (
    <ToolLayout title='Compose / Select pages' description={<>
    <p>Create a new pdf given a set of pages. Input format is a comma separated list of number or python slice (<code>start:stop:step</code> with stop excluded)</p>
    <p>For example, <code>1, 2, 4:8, 12:9:-1</code> will contain pages 1, 2, 4 to 7, 12 to 10</p>
    </>}>
      <FileInput
        acceptedFileTypes="application/pdf"
        allowMultiple={false}
        onFilesChange={replaceFiles}
        className={`w-full ${getFileInputHeightClass(files)}`} />

      {files.length > 0 && (<>
        <div className='flex flex-row gap-2 mb-4'>
          <MemoizedFileCard file={files[0]} onDelete={() => removeFile(files[0].id)} />
          <Textarea
            id="splits-input"
            rows={12}
            onChange={(e) => setInputPages(e.target.value)}
          ></Textarea>
        </div>
        <Button className="w-full" onClick={handleProcessFiles}>
          Compose
        </Button>

        {resultBuffer && <PdfPreviewCard arrayBuffer={resultBuffer} blobName={filename} autoPreview={false} />}
      </>
      )}
    </ToolLayout>

  );
};

export default PageComposer;
