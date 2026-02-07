import { useEffect, useState } from 'react';
import FileInput, { getFileInputHeightClass } from '../components/FileInput';
import PdfPreviewCard from '../components/PdfResultCard';
import { runTask } from "@/utils/workerClient";
import usePdfFileManager from "@/hooks/usePdfFileManager";
import useSaveOptions from "@/hooks/useSaveOptions";
import SaveOptionsPanel from "@/components/SaveOptionsPanel";
import { Button } from '../components/ui/button';
import { FileGrid } from '../components/FileGrid';
import ToolLayout from '@/components/ToolLayout';

export const Merge = () => {
  const { files, addFiles, removeFile, reorderFiles, setPageRange } = usePdfFileManager();
  const [buffer, setBuffer] = useState<ArrayBuffer | null>(null);
  const [showSaveOptions, setShowSaveOptions] = useState(false);
  const { saveOptions, setSaveOptions } = useSaveOptions();

  useEffect(() => {
    setBuffer(null);
  }, [files]);

  const handleMerge = async () => {
    if (!files.length) return;
    const buffers = await Promise.all(
      files.map(({ fileHandle }) => fileHandle.arrayBuffer())
    );

    const { buffer } = await runTask("mergePdfs", {
      buffers,
      pageRanges: files.map((file) => file.pageRange),
      saveOptions,
    });
    setBuffer(buffer);
  };

  return (
    <ToolLayout title='Merge PDFs' description={<>
      <p>Merge multiple PDF files into a single document. You can select multiple files, reorder them by drag and drop, and specify page ranges for each file if needed.</p>
    </>}>

      <FileInput
        acceptedFileTypes="application/pdf"
        allowMultiple={true}
        onFilesChange={addFiles}
        className={`w-full ${getFileInputHeightClass(files)}`} />

      {
        files.length > 0 && (
          <>
            <FileGrid files={files} onDelete={removeFile} onReorder={reorderFiles} onPageRangeChange={setPageRange} />
            
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => setShowSaveOptions(true)}
            >
              Configure Save Options
            </Button>

            <Button className="w-full" onClick={handleMerge}>Merge PDFs</Button>
          </>
        )
      }

      {buffer && <PdfPreviewCard arrayBuffer={buffer} blobName={"merged.pdf"} autoPreview={false} />}

      {showSaveOptions && (
        <SaveOptionsPanel
          initialOptions={saveOptions}
          onConfirm={(options) => {
            setSaveOptions(options);
            setShowSaveOptions(false);
          }}
          onCancel={() => setShowSaveOptions(false)}
        />
      )}
    </ToolLayout>
  );
};

export default Merge;
