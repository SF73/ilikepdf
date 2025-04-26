import { useState } from "react";
import { FileMetadata } from "@/types/fileTypes";
import { safeRunTask } from "@/utils/workerClient";
import { formatFileSize } from "@/utils/utils";

export function usePdfFileManager() {
  const [files, setFiles] = useState<FileMetadata[]>([]);

  async function addFiles(newFiles: File[]) {
    const fileMetadataArray: FileMetadata[] = newFiles.map((file) => ({
      id: crypto.randomUUID(),
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
      id: crypto.randomUUID(),
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
        .then((buffer) => safeRunTask("getPdfSummary", { buffer, dpi: 40 }))
        .then(({ pageCount, buffer: thumbBuffer, mime }) => {
          setFiles((prev) => {
            if (!prev.length) return prev; // nothing to update
  
            const realIndex = startIndex + index;
            if (realIndex >= prev.length) return prev; // safety check
  
            const updated = prev.slice(); // lighter shallow copy (not spread)
  
            updated[realIndex] = {
              ...updated[realIndex],
              thumbnailBuffer: thumbBuffer,
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