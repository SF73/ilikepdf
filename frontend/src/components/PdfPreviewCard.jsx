import React, { useEffect, useState } from "react";

const PdfPreviewCard = ({
    blob,
    blobName = "file.pdf",
    autoPreview = true,
    mime = "application/pdf",
}) => {
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isPreviewVisible, setIsPreviewVisible] = useState(false);

    useEffect(() => {
        const isDesktop = window.innerWidth >= 768;
        if (autoPreview && isDesktop && blob) {
            generatePreviewUrl();
        }
        return cleanupPreviewUrl;
    }, [blob]);

    const generatePreviewUrl = () => {
        cleanupPreviewUrl();
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        setIsPreviewVisible(true);
    };

    const cleanupPreviewUrl = () => {
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            setPreviewUrl(null);
        }
        setIsPreviewVisible(false);
    };

    const handleDownload = () => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = blobName;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 5000);
    };

    const handleOpenInTab = () => {
        const url = URL.createObjectURL(blob);
        window.open(url, "_blank");
        setTimeout(() => URL.revokeObjectURL(url), 5000);
    };

    if (!blob) return null;

    return (
        <div className="mt-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-slate-50 p-4 rounded border border-slate-300 shadow-sm space-y-2 sm:space-y-0">
                <div className="text-sm text-slate-700 truncate">
                    <strong>📄 File ready:</strong> {blobName}
                </div>
                <div className="flex flex-wrap gap-2 justify-end">
                    <button
                        className="btn"
                        onClick={isPreviewVisible ? cleanupPreviewUrl : generatePreviewUrl}
                    >
                        {isPreviewVisible ? "🙈 Hide Preview" : "👁 Show Preview"}
                    </button>
                    <button
                        onClick={handleDownload}
                        className="btn"
                    >
                        ⬇️ Download
                    </button>
                    <button
                        onClick={handleOpenInTab}
                        className="btn"
                    >
                        🔍 Open in New Tab
                    </button>
                </div>
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
        </div>
    );
};

export default PdfPreviewCard;
