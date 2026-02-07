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
import { Checkbox } from '@/components/ui/checkbox';

const RewriteImages = () => {
    const [buffer, setBuffer] = useState<ArrayBuffer | null>(null);
    const [fileName, setFileName] = useState<string>('');
    const [progress, setProgress] = useState<number>(0);
    const [progressMessage, setProgressMessage] = useState<string>("");
    
    const [dpiThreshold, setDpiThreshold] = useState<number | null>(null);
    const [dpiTarget, setDpiTarget] = useState<number>(0);
    const [quality, setQuality] = useState<number>(0);
    const [lossy, setLossy] = useState<boolean>(true);
    const [lossless, setLossless] = useState<boolean>(true);
    const [bitonal, setBitonal] = useState<boolean>(true);
    const [color, setColor] = useState<boolean>(true);
    const [gray, setGray] = useState<boolean>(true);
    const [setToGray, setSetToGray] = useState<boolean>(false);
    
    const { files, replaceFiles, removeFile } = usePdfFileManager();
    const [showSaveOptions, setShowSaveOptions] = useState(false);
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
            
            const options = {
                dpi_threshold: dpiThreshold,
                dpi_target: dpiTarget,
                quality,
                lossy,
                lossless,
                bitonal,
                color,
                gray,
                set_to_gray: setToGray,
            };
                runTask('rewriteImages', { buffer: input, options, saveOptions })
                .onProgress((percent: number, message?: string) => {
                    console.log(`Progress: ${percent}% - ${message}`);
                    setProgress(percent);
                    if (message) setProgressMessage(message);
                })
                .then(({ buffer }) => {
                    setProgressMessage("Image rewriting completed.");
                    setBuffer(buffer);
                    setFileName(files[0].fileHandle.name.replace('.pdf', '_rewritten.pdf'));
                });

        } catch (err) {
            console.error("Failed to rewrite images:", err);
        }
    };

    return (
        <div className="flex justify-center">
            <div className="max-w-6xl w-full p-4 space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold mb-2">Rewrite Images</h1>
                    <p>
                        Walk through all images and rewrite them according to specified parameters.
                        Useful for reducing file size, changing image formats, or converting color spaces.
                    </p>
                </div>

                <FileInput
                    id="pdfUpload"
                    acceptedFileTypes="application/pdf"
                    allowMultiple={false}
                    onFilesChange={replaceFiles}
                    className={`w-full ${getFileInputHeightClass(files)}`} />

                {files.length > 0 && (
                    <div className="flex flex-col gap-6">
                        {/* Uploaded File Card */}
                        <MemoizedFileCard className="flex grow-0" file={files[0]} onDelete={() => removeFile(files[0].id)} />

                        {/* Controls */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border rounded-lg p-6 bg-accent">
                            {/* DPI Settings */}
                            <div className="md:col-span-2">
                                <h3 className="font-semibold mb-4">DPI Settings</h3>
                            </div>
                            
                            <div>
                                <Label htmlFor="dpiThreshold">
                                    DPI Threshold (optional)
                                </Label>
                                <p className="text-xs mb-2">Images above this DPI will be resampled. Leave empty for no resampling</p>
                                <Input
                                    type="number"
                                    min={1}
                                    value={dpiThreshold ?? ''}
                                    onChange={(e) => {
                                        const value = e.target.value ? parseInt(e.target.value) : null;
                                        setDpiThreshold(value);
                                    }}
                                    className="w-full"
                                    placeholder="e.g., 150"
                                    id="dpiThreshold"
                                />
                            </div>

                            <div>
                                <Label htmlFor="dpiTarget">
                                    DPI Target
                                </Label>
                                <p className="text-xs mb-2">Target DPI for resampled images (must be less than threshold)</p>
                                <Input
                                    type="number"
                                    min={0}
                                    value={dpiTarget}
                                    onChange={(e) => setDpiTarget(e.target.value ? parseInt(e.target.value) : 0)}
                                    className="w-full"
                                    placeholder="e.g., 72"
                                    id="dpiTarget"
                                />
                            </div>

                            {/* Quality Settings */}
                            <div className="md:col-span-2">
                                <h3 className="font-semibold mb-4">Quality & Format</h3>
                            </div>

                            <div>
                                <Label htmlFor="quality">
                                    JPEG Quality (0-100)
                                </Label>
                                <p className="text-xs mb-2">0 = no change, 100 = best quality</p>
                                <Input
                                    type="number"
                                    min={0}
                                    max={100}
                                    value={quality}
                                    onChange={(e) => setQuality(e.target.value ? parseInt(e.target.value) : 0)}
                                    className="w-full"
                                    placeholder="0"
                                    id="quality"
                                />
                            </div>

                            {/* Image Type Filters */}
                            <div className="md:col-span-2">
                                <h3 className="font-semibold mb-4">Image Types to Process</h3>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="lossy"
                                    checked={lossy}
                                    onCheckedChange={(checked) => setLossy(checked as boolean)}
                                />
                                <Label htmlFor="lossy" className="cursor-pointer font-normal">
                                    Lossy (e.g., JPEG)
                                </Label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="lossless"
                                    checked={lossless}
                                    onCheckedChange={(checked) => setLossless(checked as boolean)}
                                />
                                <Label htmlFor="lossless" className="cursor-pointer font-normal">
                                    Lossless (e.g., PNG)
                                </Label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="bitonal"
                                    checked={bitonal}
                                    onCheckedChange={(checked) => setBitonal(checked as boolean)}
                                />
                                <Label htmlFor="bitonal" className="cursor-pointer font-normal">
                                    Bitonal (black & white, e.g., FAX)
                                </Label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="color"
                                    checked={color}
                                    onCheckedChange={(checked) => setColor(checked as boolean)}
                                />
                                <Label htmlFor="color" className="cursor-pointer font-normal">
                                    Color
                                </Label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="gray"
                                    checked={gray}
                                    onCheckedChange={(checked) => setGray(checked as boolean)}
                                />
                                <Label htmlFor="gray" className="cursor-pointer font-normal">
                                    Grayscale
                                </Label>
                            </div>

                            {/* Grayscale Conversion */}
                            <div className="md:col-span-2 border-t pt-4">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="setToGray"
                                        checked={setToGray}
                                        onCheckedChange={(checked) => setSetToGray(checked as boolean)}
                                    />
                                    <div className="flex-1">
                                        <Label htmlFor="setToGray" className="cursor-pointer font-medium">
                                            Convert to Grayscale
                                        </Label>
                                        <p className="text-xs">
                                            Converts entire PDF to grayscale including text and vector graphics
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="md:col-span-2 border-t pt-4 flex flex-col gap-2">
                                    {/* Save Options Button */}
                                    <Button 
                                        variant="outline" 
                                        className="w-full mb-4" 
                                        onClick={() => setShowSaveOptions(true)}
                                    >
                                        Configure Save Options
                                    </Button>

                                <Button className="w-full" onClick={handleProcessFiles}>
                                    Rewrite Images
                                </Button>

                                {/* Progress Bar */}
                                <Progress value={progress} className="w-full" />
                                {progressMessage && (
                                    <p className="text-sm text-gray-500">{progressMessage}</p>
                                )}
                            </div>
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

export default RewriteImages;
