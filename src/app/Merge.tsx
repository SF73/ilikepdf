import { useState } from 'react';
import FileInput from '../components/FileInput';
import PdfPreviewCard from '../components/PdfResultCard';
import { runTask  } from "@/utils/workerClient";
import usePdfFileManager from "@/hooks/usePdfFileManager";
import { Button } from '../components/ui/button';
import { FileGrid } from '../components/FileGrid';

export const Merge = () => {
  const {files, addFiles, removeFile, reorderFiles, setPageRange} = usePdfFileManager();
  const [buffer, setBuffer] = useState<ArrayBuffer | null>(null);
  

  const handleMerge = async () => {
    if (!files.length) return;
    const buffers = await Promise.all(
      files.map(({ fileHandle }) => fileHandle.arrayBuffer())
    );

    const { buffer } = await runTask("mergePdfs", {
      buffers,
      pageRanges: files.map((file) => file.pageRange),
    });
    setBuffer(buffer);
  };

  return (
    <div>
        <FileInput
        acceptedFileTypes="application/pdf"
        allowMultiple={true}
        onFilesChange={addFiles}
        className={`w-full mb-4 ${files?.length > 0 ? 'h-20' : 'h-20 sm:h-40 lg:h-56 xl:h-64 p-4 sm:p-6'}`}
      />
      <FileGrid files={files} onDelete={removeFile} onReorder={reorderFiles} onPageRangeChange={setPageRange}/>
      <Button className="w-full" onClick={handleMerge}>Merge PDFs</Button>
      {buffer && <PdfPreviewCard arrayBuffer={buffer} blobName={"merged.pdf"} autoPreview={false} />}
    </div>
  );
};

export default Merge;
