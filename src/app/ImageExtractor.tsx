import { useState, memo, useEffect } from 'react';
import FileInput, { getFileInputHeightClass } from '@/components/FileInput';
import { runTask } from '../utils/workerClient';
import usePdfFileManager from '@/hooks/usePdfFileManager';
import { Button } from '@/components/ui/button';
import { useBlobUrl } from '@/hooks/useBlobUrl';
import MemoizedFileCard from '@/components/MemoizedFileCard';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import ToolLayout from '@/components/ToolLayout';

const ImageCard = memo(({ image }: { image: RawImage }) => {

  const url = useBlobUrl(image.data, image.mimeType);
  if (!url) return null;
  return (
    <div>
      <img src={url} alt={image.name} />
      <p className='text-sm truncate'>{image.name}</p>
    </div>
  );
});

interface RawImage {
  name: string;
  mimeType: string;
  data: ArrayBuffer;
}

const ImageExtractorReact = () => {
  const [ignoreSmask, setIgnoreSmask] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [progressMessage, setProgressMessage] = useState<string>("");
  const [images, setImages] = useState<RawImage[]>([]);
  const { files, replaceFiles, setPageRange, removeFile } = usePdfFileManager();

  useEffect(() => {
    setProgress(0);
    setProgressMessage("");
    setImages([]);
  }
    , [files]);

  const handleExtractImages = async () => {
    if (files.length == 0) return;
    console.log("Extracting images from files:", files);
    const buffer = await files[0].fileHandle.arrayBuffer();
    const pageRange = files[0].pageRange;
    setImages([]);
    runTask('extractImages', { buffer, ignoreSmask, pageRange })
      .onPartial((data: any) => {
        setImages((prev) => [...prev, {
          name: data.name,
          mimeType: data.mime,
          data: data.buffer
        }]);
      })
      .onProgress((percent: number, message?: string) => {
        console.log(`Progress: ${percent}% - ${message}`);
        setProgress(percent);
        if (message) setProgressMessage(message);
      })
      .then(() => {
        console.log("All images extracted.");
      })
      .catch((err: any) => {
        console.error("Extraction failed:", err);
      });
  };

  return (
    <ToolLayout title='Extract Images from PDF' description={<>
      <p>
        Extract images from PDF files. Supports page range selection and ignores soft masks.
      </p></>}>

      <FileInput
        enablePageRange
        acceptedFileTypes="application/pdf"
        allowMultiple={false}
        onFilesChange={replaceFiles}
        className={`w-full ${getFileInputHeightClass(files)}`} />

      {files.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-4 items-start">
          <MemoizedFileCard
            className="flex grow-0"
            file={files[0]}
            onDelete={() => removeFile(files[0].id)}
            onPageRangeChange={(start, end) => setPageRange(files[0].id, start, end)}
          />

          <div className="flex flex-col w-full sm:w-2/3 space-y-4 justify-between">
            <div className="flex items-center space-x-2">
              <Checkbox id="ignoreSmask" onCheckedChange={(checked) => setIgnoreSmask(checked as boolean)} />
              <label htmlFor="ignoreSmask" className="text-sm">Ignore soft masks</label>
            </div>
            <Button className="w-max" onClick={handleExtractImages}>
              Extract Images
            </Button>
            <div className="space-y-1">
              <Progress value={progress} />
              {progressMessage && <p className="text-sm text-gray-500">{progressMessage}</p>}
            </div>
          </div>
        </div>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {images.map((image, index) => (
            <ImageCard key={index} image={image} />
          ))}
        </div>
      )}
    </ToolLayout>
  );
};

export default ImageExtractorReact;
