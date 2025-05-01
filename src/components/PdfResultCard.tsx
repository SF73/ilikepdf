import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Fullscreen, Eye, EyeClosed } from 'lucide-react';
import {
    Card,
    // CardContent,
    CardDescription,
    // CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"

// import { useBlobUrl } from "@/hooks/useBlobUrl";
  
interface PdfPreviewCardProps {
    arrayBuffer: ArrayBuffer | null;
    blobName?: string | null;
    autoPreview?: boolean;
    mime?: string;
}
const PdfPreviewCard : React.FC<PdfPreviewCardProps>= ({
    arrayBuffer,
    blobName = "file.pdf",
    autoPreview = true,
    mime = "application/pdf",
}) => {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isPreviewVisible, setIsPreviewVisible] = useState<boolean>(false);
    const blob = arrayBuffer ? new Blob([arrayBuffer], { type: mime }) : null;
    useEffect(() => {
        const isDesktop = window.innerWidth >= 768;
        if (autoPreview && isDesktop && blob) {
            generatePreviewUrl();
        }
        return cleanupPreviewUrl;
    }, [arrayBuffer]);

    const generatePreviewUrl = () => {
        console.log("Generating preview URL");
        cleanupPreviewUrl();
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        setIsPreviewVisible(true);
        console.log("Preview URL generated:", url);
    };

    const cleanupPreviewUrl = () => {
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }
        setIsPreviewVisible(false);
        console.log("Preview URL cleaned up");
    };

    const handleDownload = () => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = blobName || "file.pdf";
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 5000);
    };

    const handleOpenInTab = () => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");
        setTimeout(() => URL.revokeObjectURL(url), 5000);
    };

    if (!blob) return null;

    return (
        <Card>
              <CardHeader>
                <CardTitle>File ready</CardTitle>
                    <CardDescription>{blobName}</CardDescription>
            </CardHeader>
                <div className="flex flex-wrap gap-2 justify-end">
                    <Button
                        className="btn"
                        onClick={isPreviewVisible ? cleanupPreviewUrl : generatePreviewUrl}
                    >
                        {isPreviewVisible ? <><EyeClosed/>Hide Preview</> : <><Eye/>Show Preview</>}
                    </Button>
                    <Button
                        onClick={handleDownload}
                        className="btn"
                    >
                        <Download/> Save
                    </Button>
                    <Button
                        onClick={handleOpenInTab}
                        className="btn"
                    >
                        <Fullscreen/> Open in New Tab
                    </Button>
                </div>

            {isPreviewVisible && previewUrl && (
                <div className="border rounded overflow-hidden shadow-sm">
                    <iframe
                        src={previewUrl}
                        title="PDF Preview"
                        className="w-full h-[500px] border-0"
                    ></iframe>
                </div>
            )}
        </Card>
    );
};

export default PdfPreviewCard;
