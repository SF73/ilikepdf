import React, { useRef, ChangeEvent } from 'react';
import { cn } from '@/lib/utils';
import { FileInput as LucideFileInput } from 'lucide-react';

interface FileInputProps {
    acceptedFileTypes?: string;
    allowMultiple?: boolean;
    onFilesChange?: (files: File[]) => void;
    className?: string;
    [key: string]: any;
}

export function getFileInputHeightClass(files: any[] | undefined) {
  return files && files.length > 0
    ? 'h-20'
    : 'h-32 sm:h-40 lg:h-48 p-4';
}

const FileInput: React.FC<FileInputProps> =
    (
        {
            acceptedFileTypes = '',
            allowMultiple = true,
            onFilesChange,
            className,
            // ...props
        }) => {
        const fileInputRef = useRef<HTMLInputElement | null>(null);
        // const [dragActive, setDragActive] = useState(false);
        
        const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {

             if (!e.target.files) {
                 return;
             }

             const files = Array.from(e.target.files);
             onFilesChange?.(files);
        };

        const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            e.stopPropagation();
            // setDragActive(false);

            if (e.dataTransfer?.files?.length) {
                const droppedFiles = Array.from(e.dataTransfer.files).filter(file =>
                    isAcceptedFile(file, acceptedFileTypes)
                );

                if (!droppedFiles.length) {
                    console.warn("No accepted files were dropped.");
                    return;
                }

                const filesToAdd = allowMultiple ? droppedFiles : [droppedFiles[0]];
                onFilesChange?.(filesToAdd);
            }
        };

        const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            e.stopPropagation();
            // setDragActive(true);
        };

        const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            e.stopPropagation();
            // setDragActive(false);
        };

        function isAcceptedFile(file: File, acceptedTypes: string) {
            if (!acceptedTypes) return true;
            const types = acceptedTypes.split(',').map(t => t.trim());
            return types.some(type => {
                if (type.startsWith('.')) {
                    return file.name.toLowerCase().endsWith(type.toLowerCase());
                }
                return file.type === type;
            });
        }

        return (
            <>
                <div
                    onClick={() => fileInputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={cn(`flex flex-col justify-center items-center border-2 border-dashed rounded-md text-center cursor-pointer
                    transition-all duration-300 ease-in-out hover:bg-[var(--accent)]`, className)}
                    // ${dragActive ? 'bg-blue-50 border-blue-400' : 'border-gray-300'}
                    // ${files?.length ? 'h-20' : 'h-20 sm:h-40 lg:h-56 xl:h-64 p-4 sm:p-6'}
                >
                    <div className="flex items-center gap-2">
                        <LucideFileInput /> <span><strong>Drag & drop</strong> files here or <strong>click</strong> to browse</span>
                    </div>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept={acceptedFileTypes}
                        {...(allowMultiple ? { multiple: true } : {})}
                        onChange={handleFileChange}
                        className="hidden"
                    />
                </div>
            </>
        );
    }
export default FileInput;
