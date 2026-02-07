import { useEffect, useState } from 'react';
import FileInput, { getFileInputHeightClass } from '../components/FileInput';
import { runTask } from '../utils/workerClient';
import PdfPreviewCard from '../components/PdfResultCard';
import usePdfFileManager from '@/hooks/usePdfFileManager';
import useSaveOptions from '@/hooks/useSaveOptions';
import SaveOptionsPanel from '@/components/SaveOptionsPanel';
import { Button } from '@/components/ui/button';
import MemoizedFileCard from '@/components/MemoizedFileCard';
import { Input } from '@/components/ui/input';
import { Label } from "@/components/ui/label"
import { Progress } from '@/components/ui/progress';

const Compress = () => {
    const [buffer, setBuffer] = useState<ArrayBuffer | null>(null);
    const [fileName, setFileName] = useState<string>('');
    const [maxFactor, setMaxFactor] = useState<number>(2);
    const [progress, setProgress] = useState<number>(0);
    const [progressMessage, setProgressMessage] = useState<string>("");
    const [showSaveOptions, setShowSaveOptions] = useState(false);
    const { files, replaceFiles, removeFile } = usePdfFileManager();
    const { saveOptions, setSaveOptions } = useSaveOptions();

    useEffect(() => {
        setProgress(0);
        setProgressMessage("");
        setBuffer(null);
        setFileName('');
    }, [files]);

    const handleProcessFiles = async () => {
        try {
            if (files.length === 0) return;
            setBuffer(null);
            setProgress(0);
            setProgressMessage("");
            const input = await files[0].fileHandle.arrayBuffer();
            runTask('compress', { buffer: input, maxFactor, saveOptions })
                .onProgress((percent: number, message?: string) => {
                    console.log(`Progress: ${percent}% - ${message}`);
                    setProgress(percent);
                    if (message) setProgressMessage(message);
                })
                .then(({ buffer }) => {
                    setProgressMessage("Compression completed.");
                    setBuffer(buffer);
                    setFileName(files[0].fileHandle.name + `_compressed.pdf`);
                });

        } catch (err) {
            console.error("Failed to compress:", err);
        }
    };

    return (
        <div className="flex justify-center">
            <div className="max-w-6xl w-full p-4 space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold mb-2">Compress</h1>
                    <p>This is experimental, for a more standard tool you can use my other webapp based on ghostscript <a href='https://sf73.github.io/gs-wasm/' target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">here</a></p>
                    <p>
                        Reduce PDF size by downscaling images that are much larger than needed for display.
                    </p>
                    <p>
                        For smaller files, try increasing garbage collection and enabling options. Note: it may increase processing time significantly. More info on these options can be found in pymupdf documentation{' '}
                        <a href="https://pymupdf.readthedocs.io/en/latest/document.html#Document.save" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                            here
                        </a>.
                    </p>
                </div>

                <FileInput
                    id="pdfUpload"
                    acceptedFileTypes="application/pdf"
                    allowMultiple={false}
                    onFilesChange={replaceFiles}
                    className={`w-full ${getFileInputHeightClass(files)}`} />

                {files.length > 0 && (
                    <div className="flex flex-col sm:flex-row gap-4 items-start">
                        {/* Uploaded File Card */}
                        <MemoizedFileCard className="flex grow-0" file={files[0]} onDelete={() => removeFile(files[0].id)} />

                        {/* options */}
                        <div className="flex flex-col w-full justify-between">
                            {/* Max Factor */}
                            <div className="mb-4">
                                <Label htmlFor="maxFactor">
                                    Size-to-display maximum ratio (1-10)
                                </Label>
                                <Input
                                    type="number"
                                    min={1}
                                    max={10}
                                    defaultValue={2}
                                    onChange={(e) => {
                                        const value = e.target.value ? parseFloat(e.target.value) : 2;
                                        setMaxFactor(value);
                                    }}
                                    className="w-full"
                                    placeholder="Max Factor"
                                    id="maxFactor"
                                />
                            </div>

                            {/* Save Options Button */}
                            <Button 
                                variant="outline" 
                                className="w-full mb-4" 
                                onClick={() => setShowSaveOptions(true)}
                            >
                                Configure Save Options
                            </Button>

                            {/* Compress Button */}
                            <Button className="w-full mb-4" onClick={handleProcessFiles}>
                                Compress
                            </Button>

                            {/* Progress Bar */}
                            <Progress value={progress} className="w-full mb-2" />
                            {progressMessage && (
                                <p className="text-sm text-gray-500 mb-4">{progressMessage}</p>
                            )}
                        </div>
                    </div>
                )}

                {buffer && (
                    <PdfPreviewCard
                        arrayBuffer={buffer}
                        blobName={fileName}
                        autoPreview={false}
                    />
                )}

                {showSaveOptions && (
                    <SaveOptionsPanel
                        initialOptions={saveOptions}
                        onConfirm={(options) => {
                            setSaveOptions(options);
                            setShowSaveOptions(false);
                        }}
                        onCancel={() => setShowSaveOptions(false)}
                    />
                )}
            </div>
        </div>
    );
};

export default Compress;
