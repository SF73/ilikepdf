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
            pageRange: ''
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
        getFilesWithPageRanges: () => files,
    }));

    // Helper to update page range for a file
    const handlePageRangeChange = (index, value) => {
        setFiles(prevFiles =>
            prevFiles.map((item, i) =>
                i === index ? { ...item, pageRange: value } : item
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
            <input ref={fileInputRef} type="file" accept={acceptedFileTypes} {...(allowMultiple ? { multiple: true } : {})} onChange={handleFileChange} />
            <ul>
                {files.map((item, index) => (
                    <li key={index} style={{ marginBottom: '1rem' }}>
                        <span>{item.file.name}</span>
                        {enableSorting && (
                            <span style={{ marginLeft: '1rem' }}>
                                {index > 0 && (
                                    <button onClick={() => handleSort(index, index - 1)}>&#x2191;</button>
                                )}
                                {index < files.length - 1 && (
                                    <button onClick={() => handleSort(index, index + 1)} style={{ marginLeft: '0.5rem' }}>
                                        &#x2193;
                                    </button>
                                )}
                            </span>
                        )}
                        {enablePageRange && (
                            <input
                                type="text"
                                placeholder="Page range (e.g. 1-5)"
                                value={item.pageRange}
                                onChange={(e) => handlePageRangeChange(index, e.target.value)}
                                style={{ marginLeft: '1rem' }}
                            />
                        )}
                        {enableRemoval && (
                            <button onClick={() => handleRemove(index)} style={{ marginLeft: '1rem' }}>
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
