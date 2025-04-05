import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';

const FileInput = forwardRef(({
    enablePageRange = false,
    enableSorting = true,
    enableRemoval = true,
    acceptedFileTypes = '',
    allowMultiple = true
}, ref) => {
    const [files, setFiles] = useState([]);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files).map(file => ({
            file,
            pageRange: {}
        }));

        if (allowMultiple) {
            setFiles(prevFiles => [...prevFiles, ...selectedFiles]);
        } else {
            setFiles(selectedFiles);
        }

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    // Expose both file references and page ranges to the parent via the ref
    useImperativeHandle(ref, () => ({
        getFilesWithPageRanges: () => {
            return files.map(({ file, pageRange }) => {
                const { start, end } = pageRange || {};
                return { file, pageRange: start != null || end != null ? [start != null ? start - 1 : null, end != null ? end - 1 : null] : null };
            });
        },
    }));

    // Helper to update page range for a file
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

    // Helper to swap file positions (for sorting)
    const handleSort = (fromIndex, toIndex) => {
        if (toIndex < 0 || toIndex >= files.length) return;
        const updatedFiles = [...files];
        const [movedFile] = updatedFiles.splice(fromIndex, 1);
        updatedFiles.splice(toIndex, 0, movedFile);
        setFiles(updatedFiles);
    };

    return (
        <div>
            <input
                ref={fileInputRef}
                type="file"
                accept={acceptedFileTypes}
                {...(allowMultiple ? { multiple: true } : {})}
                onChange={handleFileChange}
                className="block w-full file:px-2 file:py-2 file:bg-slate-100 hover:file:bg-slate-200 rounded-lg cursor-pointer"
            />
            <ul className='mt-4'>
                {files.map((item, index) => (
                    <li key={index} className="flex items-center justify-between space-x-4">
                        <span className='flex-1'>{item.file.name}</span>
                        {enableSorting && (
                            <span className="flex w-20">
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
                            </span>
                        )}
                        {enablePageRange && (
                            <span className="flex space-x-2">
                                <input
                                    type="number"
                                    placeholder="Start"
                                    value={item.pageRange?.start || ''}
                                    onChange={(e) => handlePageRangeChange(index, 'start', e.target.value, 10)}
                                    className="w-16 p-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-300"
                                />
                                <input
                                    type="number"
                                    placeholder="End"
                                    value={item.pageRange?.end || ''}
                                    onChange={(e) => handlePageRangeChange(index, 'end', e.target.value)}
                                    className="w-16 p-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-300"
                                />
                            </span>
                        )}
                        {enableRemoval && (
                            <button className='rounded size-10 p-1 hover:bg-red-100' onClick={() => handleRemove(index)}>
                                &#128465;
                            </button>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
});

export default FileInput;
