import React, { useState, useRef, forwardRef, useImperativeHandle, useEffect } from 'react';
import { runTask } from '../utils/workerClient';

import { formatFileSize } from '../utils/utils';

const FileInput = forwardRef(({
    enablePageRange = false,
    enableSorting = true,
    enableRemoval = true,
    acceptedFileTypes = '',
    allowMultiple = true
}, ref) => {
    const [files, setFiles] = useState([]);
    const fileInputRef = useRef(null);
    const [dragActive, setDragActive] = useState(false);


    useEffect(() => {
        return () => {
            files.forEach(f => {
                if (f.thumbnail) URL.revokeObjectURL(f.thumbnail);
            });
        };
    }, [files]);


    const handleFileChange = async (e) => {
        const rawFiles = Array.from(e.target.files).map(file => ({
            file,
            pageRange: {}
        }));

        const enrichedFiles = await Promise.all(rawFiles.map(enrichFileMetadata));

        if (allowMultiple) {
            setFiles(prevFiles => [...prevFiles, ...enrichedFiles]);
        } else {
            setFiles(enrichedFiles);
        }

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    useImperativeHandle(ref, () => ({
        getFilesWithPageRanges: () => {
            return files.map(({ file, pageRange }) => {
                const { start, end } = pageRange || {};
                return { file, pageRange: start != null || end != null ? [start != null ? start - 1 : null, end != null ? end - 1 : null] : null };
            });
        },
    }));

    const handlePageRangeChange = (index, field, value) => {
        setFiles(prevFiles =>
            prevFiles.map((item, i) =>
                i === index ? { ...item, pageRange: { ...item.pageRange, [field]: value } } : item
            )
        );
    };

    const handleRemove = (index) => {
        setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    };

    const handleSort = (fromIndex, toIndex) => {
        if (toIndex < 0 || toIndex >= files.length) return;
        const updatedFiles = [...files];
        const [movedFile] = updatedFiles.splice(fromIndex, 1);
        updatedFiles.splice(toIndex, 0, movedFile);
        setFiles(updatedFiles);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragActive(false);

        if (e.dataTransfer?.files?.length) {
            const droppedFiles = Array.from(e.dataTransfer.files).filter(file =>
                isAcceptedFile(file, acceptedFileTypes)
            );

            if (!droppedFiles.length) {
                console.warn("No accepted files were dropped.");
                return;
            }

            const filesToAdd = allowMultiple ? droppedFiles : [droppedFiles[0]];
            const fakeEvent = { target: { files: filesToAdd } };
            handleFileChange(fakeEvent);
        }
    };



    const handleDragOver = (e) => {
        e.preventDefault();
        setDragActive(true);
    };

    const handleDragLeave = () => {
        setDragActive(false);
    };

    const enrichFileMetadata = async (fileObj) => {
        const buffer = await fileObj.file.arrayBuffer();

        const { pageCount, buffer: thumbBuffer, mime } = await runTask("getPdfSummary", { buffer, dpi: 40 });

        const blob = new Blob([thumbBuffer], { type: mime });
        const thumbnail = URL.createObjectURL(blob);

        return {
            ...fileObj,
            pageCount,
            sizeLabel: formatFileSize(fileObj.file.size),
            thumbnail,
        };
    };

    function isAcceptedFile(file, acceptedTypes) {
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
                className={`flex flex-col justify-center items-center border-2 border-dashed rounded-md text-center transition-colors cursor-pointer 
              hover:bg-slate-200 ${dragActive ? 'bg-blue-50 border-blue-400' : 'border-gray-300'} h-20 sm:h-40 lg:h-56 xl:h-64 p-4 sm:p-6`}
            >
                <p className="text-gray-600 text-sm mb-2">
                    📂 Drag & drop PDF files here or click to browse
                </p>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept={acceptedFileTypes}
                    {...(allowMultiple ? { multiple: true } : {})}
                    onChange={handleFileChange}
                    className="hidden"
                />
            </div>
            <ul className='my-4'>
                {files.map((item, index) => (
                    <li key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between sm:space-x-4 space-y-2 sm:space-y-0">
                        {item.thumbnail && (
                            <img
                                src={item.thumbnail}
                                alt="Thumbnail"
                                className="w-20 h-auto max-w-full border rounded shadow-sm"
                            />
                        )}
                        <div className='flex-1'>
                            <div className="font-medium break-words">{item.file.name}</div>
                            <div className="text-sm text-gray-500">
                                {item.sizeLabel} • {item.pageCount || "?"} page{item.pageCount > 1 && "s"}
                            </div></div>
                        {enableSorting && (
                            <div className="flex w-20">
                                {index > 0 && (
                                    <button className='btn rounded-none rounded-s size-10 me-auto' onClick={() => handleSort(index, index - 1)}>
                                        &#x2191; {/* Up arrow */}
                                    </button>
                                )}
                                {index < files.length - 1 && (
                                    <button className='btn rounded-none rounded-e size-10 ms-auto' onClick={() => handleSort(index, index + 1)}>
                                        &#x2193; {/* Down arrow */}
                                    </button>
                                )}
                            </div>
                        )}
                        {enablePageRange && (
                            <span className="flex space-x-2">
                                <label className="flex flex-col items-start">
                                    <span className="text-sm text-gray-600">Start</span>
                                    <input
                                        type="number"
                                        placeholder="Start"
                                        value={item.pageRange?.start || 1}
                                        max={item.pageCount}
                                        onChange={(e) => handlePageRangeChange(index, 'start', e.target.value, 10)}
                                        className="w-16 p-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-300"
                                    />
                                </label>
                                <label className="flex flex-col items-start">
                                    <span className="text-sm text-gray-600">End</span>
                                    <input
                                        type="number"
                                        placeholder="End"
                                        value={item.pageRange?.end || item.pageCount}
                                        max={item.pageCount}
                                        onChange={(e) => handlePageRangeChange(index, 'end', e.target.value)}
                                        className="w-16 p-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-300"
                                    />
                                </label>
                            </span>
                        )}
                        {enableRemoval && (
                            <button className='rounded size-10 p-1 hover:bg-red-100 cursor-pointer' onClick={() => handleRemove(index)}>
                                &#128465; {/* Trash can icon */}
                            </button>
                        )}
                    </li>
                ))}
            </ul>
        </>
    );
});

export default FileInput;
