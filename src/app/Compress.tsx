import { useState } from 'react';
import FileInput from '../components/FileInput';
import { runTask } from '../utils/workerClient';
import PdfPreviewCard from '../components/PdfResultCard';
import usePdfFileManager from '@/hooks/usePdfFileManager';
import { Button } from '@/components/ui/button';
import MemoizedFileCard from '@/components/MemoizedFileCard';
import { Input } from '@/components/ui/input';
import { Label } from "@/components/ui/label"
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';

const Compress = () => {
    const [buffer, setBuffer] = useState<ArrayBuffer | null>(null);
    const [fileName, setFileName] = useState<string>('');
    const [maxFactor, setMaxFactor] = useState<number>(2);
    const [garbage, setGarbage] = useState<number>(0);
    const [clean, setClean] = useState<boolean>(false);
    const [deflate, setDeflate] = useState<boolean>(false);
    const [useObjStms, setUseObjStms] = useState<boolean>(false);
    const [progress, setProgress] = useState<number>(0);
    const [progressMessage, setProgressMessage] = useState<string>("");
    const { files, replaceFiles, removeFile } = usePdfFileManager();

    const handleProcessFiles = async () => {
        try {
            if (files.length === 0) return;
            setBuffer(null);
            setProgress(0);
            setProgressMessage("");
            const input = await files[0].fileHandle.arrayBuffer();
            runTask('compress', { buffer: input, maxFactor: maxFactor, garbage, clean, deflate, useObjStms })
            .onProgress((percent: number, message?: string) => {
                console.log(`Progress: ${percent}% - ${message}`);
                setProgress(percent);
                if (message) setProgressMessage(message);
            })
            .then(({buffer}) => {
                setProgressMessage("Compression completed.");
                setBuffer(buffer);
            });
            
        } catch (err) {
            console.error("Failed to compress:", err);
        } finally {
        }
    };

    return (
        <div>
            {/* File Input */}
            <Label htmlFor="pdfUpload" className="block mb-1">
                Upload PDF File
            </Label>
            <FileInput
                id="pdfUpload"
                acceptedFileTypes="application/pdf"
                allowMultiple={false}
                onFilesChange={replaceFiles}
                className={`w-full mb-4 ${files?.length > 0 ? 'h-20' : 'h-20 sm:h-40 lg:h-56 xl:h-64 p-4 sm:p-6'}`}
            />

            {files.length > 0 && (
                <>
                    {/* Uploaded File Card */}
                    <div className='flex flex-row gap-2 mb-4'>
                        <MemoizedFileCard file={files[0]} onDelete={() => removeFile(files[0].id)} />
                    </div>

                    {/* Garbage Collection Level */}
                    <div className="mb-2">
                        <Label htmlFor="garbage">
                            Garbage Collection Level (0-4)
                        </Label>
                        <Input
                            type="number"
                            min={0}
                            max={4}
                            defaultValue={0}
                            onChange={(e) => {
                                const value = e.target.value ? parseInt(e.target.value) : 0;
                                setGarbage(value);
                            }}
                            id="garbage"
                            className="w-full"
                        />
                    </div>

                    {/* Max Factor */}
                    <div className="mb-2">
                        <Label htmlFor="maxFactor">
                            Size to display maximum ratio (1-10)
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

                    <div className="flex items-center gap-2 mb-2">
                        <Checkbox
                            id="cleanCheckbox"
                            onCheckedChange={(checked) => setClean(checked as boolean)}
                        />
                        <Label htmlFor="cleanCheckbox">Clean</Label>
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                        <Checkbox
                            id="deflateCheckbox"
                            onCheckedChange={(checked) => setDeflate(checked as boolean)}
                        />
                        <Label htmlFor="deflateCheckbox">Deflate</Label>
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                        <Checkbox
                            id="useObjStmsCheckbox"
                            onCheckedChange={(checked) => setUseObjStms(checked as boolean)}
                        />
                        <Label htmlFor="useObjStmsCheckbox">Use Object Streams</Label>
                    </div>

                    {/* Compress Button */}
                    <Button className="w-full mb-4" onClick={handleProcessFiles}>
                        Compress
                    </Button>

                    {/* Progress Bar */}
                    <Progress value={progress} className="w-full mb-2" />
                    {progressMessage && (
                        <p className="text-sm text-gray-500 mb-4">{progressMessage}</p>
                    )}

                    {/* PDF Preview */}
                    {buffer && (
                        <PdfPreviewCard
                            arrayBuffer={buffer}
                            blobName={fileName}
                            autoPreview={false}
                        />
                    )}
                </>
            )}
        </div>
    );
};

export default Compress;
