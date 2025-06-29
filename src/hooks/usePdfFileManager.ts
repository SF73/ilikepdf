import { useState } from "react";
import { FileMetadata } from "@/types/fileTypes";
import { runTask } from "@/utils/workerClient";
import { formatFileSize } from "@/utils/utils";
import { v4 as uuidv4 } from 'uuid';

export function usePdfFileManager() {
  const [files, setFiles] = useState<FileMetadata[]>([]);

  async function addFiles(newFiles: File[]) {
    const fileMetadataArray: FileMetadata[] = newFiles.map((file) => ({
      id: uuidv4(),
      fileHandle: file,
      pageRange: { start: null, end: null },
      pageCount: null,
      sizeLabel: formatFileSize(file.size),
      thumbnailBuffer: null,
      thumbnailType: null,
    }));
    setFiles((prev) => [...prev, ...fileMetadataArray]);
  
    getPdfSummary(newFiles, files.length);
  }
  
  async function replaceFiles(newFiles: File[]) {
    const fileMetadataArray: FileMetadata[] = newFiles.map((file) => ({
      id: uuidv4(),
      fileHandle: file,
      pageRange: { start: null, end: null },
      pageCount: null,
      sizeLabel: formatFileSize(file.size),
      thumbnailBuffer: null,
      thumbnailType: null,
    }));
    setFiles(fileMetadataArray);
  
    getPdfSummary(newFiles, 0);
  }

  function removeFile(id: string) {
    setFiles((prev) => prev.filter((file) => file.id !== id));
  }

  function setPageRange(id: string, start: number | null, end: number | null) {
    setFiles((prev) =>
      prev.map((file) =>
        file.id === id
          ? { ...file, pageRange: { start, end } }
          : file
      )
    );
  }
  

  async function getPdfSummary(newFiles: File[], startIndex: number) {
    newFiles.forEach((file, index) => {
      file.arrayBuffer()
        .then((buffer) => runTask("getPdfSummary", { buffer, dpi: 40 }))
        .then(({ pageCount, buffer: thumbBuffer, mime }) => {
          setFiles((prev) => {
            if (!prev.length) return prev;
  
            const realIndex = startIndex + index;
            if (realIndex >= prev.length) return prev;
  
            const updated = prev.slice();
  
            updated[realIndex] = {
              ...updated[realIndex],
              thumbnailBuffer: thumbBuffer,
              thumbnailType: mime,
              pageCount,
              pageRange: { start: 1, end: pageCount },
            };
  
            return updated;
          });
        });
    });
  }
  
  function reorderFiles(newOrder: FileMetadata[]) {
    setFiles(newOrder);
  }

  return {
    files,
    addFiles,
    removeFile,
    replaceFiles,
    reorderFiles,
    setPageRange,
  };
}
export default usePdfFileManager;