import React from "react";
import { useBlobUrl } from "../hooks/useBlobUrl";
import { Skeleton } from "@/components/ui/skeleton";
import { FileMetadata } from "@/types/fileTypes";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export const MemoizedFileCard = React.memo(function FileCard({
    file,
    onDelete,
    onPageRangeChange,
}
    :
    {
        file: FileMetadata,
        onDelete?: () => void,
        onPageRangeChange?: (start: number | null, end: number | null) => void
    }) {

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id:file.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 10,
        boxShadow: isDragging
            ? "0 10px 25px rgba(0,0,0,0.3)"
            : "0 1px 3px rgba(0,0,0,0.1)",
        // transformOrigin: "center center",
        scale: isDragging ? 1.05 : 1, // Slight scale
        // rotate: isDragging ? "2deg" : "0deg", // Tiny rotation
    };

    const blobUrl = useBlobUrl(file.thumbnailBuffer, file.thumbnailType ?? "image/png");

    return (
        <div ref={setNodeRef}
            style={style}
            {...attributes} className="relative w-[210px] px-[8px] py-[12px] overflow-hidden group flex flex-col items-center p-2">
            <div
                {...listeners}
                className="cursor-grab active:cursor-grabbing">
                {blobUrl ? (
                    <img
                        src={blobUrl}
                        alt="Thumbnail"
                        className="w-full object-cover rounded-lg shadow-md"
                    />
                ) : (
                    <Skeleton className="h-[297px] w-[210px] rounded-lg shadow-md" />
                )}
            </div>
            <div className="text-xs text-gray-700 mt-1 text-center w-full">
                <div title={file.fileHandle.name} className="font-semibold w-full truncate overflow-hidden text-ellipsis whitespace-nowrap">{file.fileHandle.name}</div>
                <div>Pages: {file.pageCount ?? '-'}</div>
                <div>Size: {file.sizeLabel ?? '-'}</div>
            </div>

            {onDelete && (
            <Button onClick={(e) => {
                e.stopPropagation();
                onDelete();
            }} size="icon" variant="destructive" className="absolute top-1 right-1 invisible group-hover:visible opacity-40 hover:opacity-100 transition duration-200">
                <X className="h-4 w-4" />
            </Button>)}

            {(onPageRangeChange && file.pageCount && file.pageCount > 1) && (
                <div className="flex flex-col items-center mt-2 w-full">
                <div className="text-xs font-semibold">Select page range</div>
                    <div className="flex gap-2 w-full">
                        <div className="flex flex-col items-center flex-1">
                            <Label className="text-xs mb-1">Start</Label>
                            <Input
                                type="number"
                                min={1}
                                max={file.pageCount ?? undefined}
                                value={file.pageRange.start ?? ''}
                                onChange={(e) => {
                                    const start = e.target.value ? parseInt(e.target.value) : null;
                                    onPageRangeChange?.(start, file.pageRange.end ?? null);
                                }}
                                className="text-center text-xs px-1 py-0.5"
                                placeholder="Start"
                                id={`start-${file.id}`}
                            />
                        </div>

                        <div className="flex flex-col items-center flex-1">
                            <Label className="text-xs mb-1">End</Label>
                            <Input
                                type="number"
                                min={1}
                                max={file.pageCount ?? undefined}
                                value={file.pageRange.end ?? ''}
                                onChange={(e) => {
                                    const end = e.target.value ? parseInt(e.target.value) : null;
                                    onPageRangeChange?.(file.pageRange.start ?? null, end);
                                }}
                                className="text-center text-xs px-1 py-0.5"
                                placeholder="End"
                                id={`end-${file.id}`}
                            />
                        </div>
                    </div>
                </div>
            )}

        </div>
    );

});

export default MemoizedFileCard;