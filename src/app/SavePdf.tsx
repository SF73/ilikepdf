import { useEffect, useState } from 'react';
import FileInput, { getFileInputHeightClass } from '../components/FileInput';
import { runTask } from '../utils/workerClient';
import PdfPreviewCard from '../components/PdfResultCard';
import usePdfFileManager from '@/hooks/usePdfFileManager';
import useSaveOptions from '@/hooks/useSaveOptions';
import SaveOptionsPanel from '@/components/SaveOptionsPanel';
import { Button } from '@/components/ui/button';
import MemoizedFileCard from '@/components/MemoizedFileCard';
import { Progress } from '@/components/ui/progress';

const SavePdf = () => {
    const [buffer, setBuffer] = useState<ArrayBuffer | null>(null);
    const [fileName, setFileName] = useState<string>('');
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
            runTask('savePdf', { buffer: input, saveOptions })
                .onProgress((percent: number, message?: string) => {
                    console.log(`Progress: ${percent}% - ${message}`);
                    setProgress(percent);
                    if (message) setProgressMessage(message);
                })
                .then(({ buffer }) => {
                    setProgressMessage("Save completed.");
                    setBuffer(buffer);
                    setFileName(files[0].fileHandle.name.replace('.pdf', '_saved.pdf'));
                });

        } catch (err) {
            console.error("Failed to save:", err);
        }
    };

    return (
        <div className="flex justify-center">
            <div className="max-w-6xl w-full p-4 space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold mb-2">Save PDF with Options</h1>
                    <p>
                        Upload a PDF and save it with custom options. Configure garbage collection, compression, encryption, permissions, and more.
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

                        {/* Controls */}
                        <div className="flex flex-col w-full justify-between">
                            {/* Save Options Button */}
                            <Button 
                                variant="outline" 
                                className="w-full mb-4" 
                                onClick={() => setShowSaveOptions(true)}
                            >
                                Configure Save Options
                            </Button>

                            {/* Save Button */}
                            <Button className="w-full mb-4" onClick={handleProcessFiles}>
                                Save PDF
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

export default SavePdf;
