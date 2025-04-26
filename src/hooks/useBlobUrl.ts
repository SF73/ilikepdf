import { useEffect, useMemo, useState } from "react";

export function useBlobUrl(buffer: ArrayBuffer | null, type: string) {
    const [url, setUrl] = useState<string | null>(null);

    const blobUrl = useMemo(() => {
        if (!buffer) return null;
        const blob = new Blob([buffer], { type });
        return URL.createObjectURL(blob);
    }
        , [buffer, type]);

    useEffect(() => {
        if (!blobUrl) {
            setUrl(null);
            return;
        }
        setUrl(blobUrl);
        return () => {
            if (blobUrl) {
                URL.revokeObjectURL(blobUrl);
            }
        };
    }, [blobUrl]);

    return url;
}