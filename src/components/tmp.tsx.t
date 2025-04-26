
        const processFiles = async (files: File[]) => {
            const rawFiles = files.map(file => ({
                file,
                pageRange: {}
            }));
        
            const enrichedFiles = await Promise.all(rawFiles.map(enrichFileMetadata));
        
            if (allowMultiple) {
                setFiles(prevFiles => [...prevFiles, ...enrichedFiles]);
            } else {
                setFiles(enrichedFiles);
            }
        };

        const handlePageRangeChange = (index: number, field: "start" | "end", value: any) => {
            setFiles(prevFiles =>
                prevFiles.map((item, i) =>
                    i === index ? { ...item, pageRange: { ...item.pageRange, [field]: value } } : item
                )
            );
        };

        const handleRemove = (index: number) => {
            setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
        };

        const handleSort = (fromIndex: number, toIndex: number) => {
            if (toIndex < 0 || toIndex >= files.length) return;
            const updatedFiles = [...files];
            const [movedFile] = updatedFiles.splice(fromIndex, 1);
            updatedFiles.splice(toIndex, 0, movedFile);
            setFiles(updatedFiles);
        };