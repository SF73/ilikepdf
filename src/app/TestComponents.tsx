import React, {useState} from "react";
import FileInput from "@/components/FileInput";
import { TestGrid } from "@/components/TestGrid";
import { FileMetadata } from "@/types/fileTypes";
import { safeRunTask  } from "@/utils/workerClient";
import usePdfFileManager from "@/hooks/usePdfFileManager";

export function TestComponents() {
    const {files, addFiles, removeFile, replaceFiles, reorderFiles, setPageRange} = usePdfFileManager();

    return (
        <div className="flex flex-col items-center">
            <h1 className="text-2xl font-bold mb-4">Test Components</h1>
            <FileInput
                acceptedFileTypes="application/pdf"
                allowMultiple={true}
                onFilesChange={addFiles}
                className={`w-full m-4 ${files.length > 0 ? 'h-20' : 'h-20 sm:h-40 lg:h-56 xl:h-64 p-4 sm:p-6'}`}
            />
            <TestGrid files={files} onDelete={removeFile} onReorder={reorderFiles} onPageRangeChange={setPageRange}/>
        </div>
    );
}