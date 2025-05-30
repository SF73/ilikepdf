import { useEffect, useState } from 'react';
import FileInput from '../components/FileInput';
import { runTask } from '../utils/workerClient';
import PdfPreviewCard from '../components/PdfResultCard';
import { Textarea } from '@/components/ui/textarea';
import usePdfFileManager from '@/hooks/usePdfFileManager';
import { Button } from '@/components/ui/button';
import MemoizedFileCard from '@/components/MemoizedFileCard';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';

const Compress = () => {
    const [buffer, setBuffer] = useState<ArrayBuffer | null>(null);
    const [fileName, setFileName] = useState<string>('');
    const [jpgQuality, setJpgQuality] = useState<number>(95);
    const [maxFactor, setMaxFactor] = useState<number>(2);
    const [dctAll, setDctAll] = useState<boolean>(false);
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
            runTask('compress', { buffer: input, jpgQuality: jpgQuality, maxFactor: maxFactor, dctAll: dctAll })
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
            <FileInput
                acceptedFileTypes="application/pdf"
                allowMultiple={false}
                onFilesChange={replaceFiles}
                className={`w-full mb-4 ${files?.length > 0 ? 'h-20' : 'h-20 sm:h-40 lg:h-56 xl:h-64 p-4 sm:p-6'}`}
            />
            {files.length > 0 && (<>
                <div className='flex flex-row gap-2 mb-4'>
                    <MemoizedFileCard file={files[0]} onDelete={() => removeFile(files[0].id)} />
                </div>
                <Input
                    type="number"
                    min={1}
                    max={100}
                    defaultValue={95}
                    onChange={(e) => {
                        const value = e.target.value ? parseInt(e.target.value) : 95;
                        setJpgQuality(value);
                    }}
                    className="mb-2"
                    placeholder="JPG Quality"
                    id="jpgQuality"
                />
                <Input
                    type="number"
                    min={1}
                    max={10}
                    defaultValue={2}
                    onChange={(e) => {
                        const value = e.target.value ? parseFloat(e.target.value) : 2;
                        setMaxFactor(value);
                    }}
                    className="mb-2"
                    placeholder="Max Factor"
                    id="maxFactor"
                />
                <Input
                    type="checkbox"
                    defaultChecked={false}
                    onChange={(e) => {
                        const value = e.target.checked;
                        setDctAll(value);
                    }}
                    className="mb-2"
                    id="dctAll"
                />
                <Button className="w-full" onClick={handleProcessFiles}>
                    Compress
                </Button>

                <Progress value={progress} className="w-full" />
                {progressMessage && <p className="text-sm text-gray-500">{progressMessage}</p>}

                {buffer && <PdfPreviewCard arrayBuffer={buffer} blobName={fileName} autoPreview={false} />}
            </>
            )}
        </div>
    );
};

export default Compress;
