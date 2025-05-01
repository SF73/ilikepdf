export interface FileMetadata {
    fileHandle: File;
    pageRange: { start?: number | null; end?: number | null };
    pageCount: number | null;
    sizeLabel: string | null;
    thumbnailBuffer: ArrayBuffer | null;
    thumbnailType: string | null;
    id: string;
}