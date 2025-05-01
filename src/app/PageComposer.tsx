import { useState } from 'react';
import FileInput from '../components/FileInput';
import { runTask } from '../utils/workerClient';
import PdfPreviewCard from '../components/PdfResultCard';
import { Textarea } from '@/components/ui/textarea';
import usePdfFileManager from '@/hooks/usePdfFileManager';
import { Button } from '@/components/ui/button';
import MemoizedFileCard from '@/components/MemoizedFileCard';

const PageComposer = () => {
  const [resultBuffer, setResultBuffer] = useState<ArrayBuffer | null>(null);
  const [slices, setSlices] = useState<string>('');
  const [filename, setFilename] = useState<string>('');
  const { files, replaceFiles, removeFile } = usePdfFileManager();

  const handleProcessFiles = async () => {
    try {
      if (files.length === 0) return;
      const inputBuffer = await files[0].fileHandle.arrayBuffer();
      const inputFilename = files[0].fileHandle.name || "composed.pdf";
      const { buffer: newBuffer } = await runTask("selectPages", {
        buffer: inputBuffer,
        slices: slices,
      });
      setResultBuffer(newBuffer);
      setFilename(inputFilename);
    } catch (err) {
      console.error("Error:", err);
    } finally {
    }
  };

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
          <MemoizedFileCard file={files[0]} onDelete={() => removeFile(files[0].id)} />
          <Textarea
            id="splits-input"
            rows={12}
            onChange={(e) => setSlices(e.target.value)}
          ></Textarea>
        </div>
        <Button className="w-full" onClick={handleProcessFiles}>
          Compose
        </Button>

        {resultBuffer && <PdfPreviewCard arrayBuffer={resultBuffer} blobName={filename} autoPreview={false} />}
      </>
      )}
    </div>
  );
};

export default PageComposer;
