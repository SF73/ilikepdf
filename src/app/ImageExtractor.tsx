import React, { useState, memo } from 'react';
import FileInput from '@/components/FileInput';
// import ProgressBar from './ProgressBar';
import { runTask } from '../utils/workerClient';
import usePdfFileManager from '@/hooks/usePdfFileManager';
import { Button } from '@/components/ui/button';
import { useBlobUrl } from '@/hooks/useBlobUrl';
import MemoizedFileCard from '@/components/MemoizedFileCard';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';

const ImageCard = memo(({ image }: { image: RawImage }) => {

  const url = useBlobUrl(image.data, image.mimeType);
  if (!url) return null;
  return (
    <div>
      <img src={url} alt={image.name} />
      <p className='text-sm'>{image.name}</p>
    </div>
  );
});

interface RawImage {
  name: string;
  mimeType: string;
  data: ArrayBuffer;
}

const ImageExtractorReact = () => {
  const [ignoreSmask, setIgnoreSmask] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [progressMessage, setProgressMessage] = useState("");
  const [images, setImages] = useState<RawImage[]>([]);
  const { files, replaceFiles, setPageRange, removeFile } = usePdfFileManager();

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
    <div>
      <FileInput
        enablePageRange={true}
        acceptedFileTypes="application/pdf"
        allowMultiple={false}
        onFilesChange={replaceFiles}
        className={`w-full mb-4 ${files?.length > 0 ? 'h-20' : 'h-20 sm:h-40 lg:h-56 xl:h-64 p-4 sm:p-6'}`}
      />

      {files.length > 0 && (
        <div className="flex flex-row">
          <MemoizedFileCard className="flex grow-1" file={files[0]} onDelete={() => removeFile(files[0].id)} onPageRangeChange={(start, end) => setPageRange(files[0].id, start, end)} />
          <div className="flex grow-5 flex-col">
            <div className="flex items-center space-x-2">
              <Checkbox id="ignoreSmask" />
              <label
                htmlFor="ignoreSmask"
              >
                Ignore soft masks
              </label>
            </div>
            <Button onClick={handleExtractImages}>
              Extract Images
            </Button>
          <Progress value={progress} className="w-full" />
          {progressMessage && <p className="text-sm text-gray-500">{progressMessage}</p>}
          </div>
        </div>
      )}
      <div className='grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 w-full'>
        {images.map((image, index) => (
          <ImageCard key={index} image={image} />
        ))}
      </div>
    </div>
  );
};

export default ImageExtractorReact;
