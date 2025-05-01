import { useEffect, useState } from "react";

// Due to some safety policies (?) we need to create a new blob URL every time the component renders ?
export function useBlobUrl(buffer: ArrayBuffer | null, type: string) {
    const [url, setUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!buffer) {
            setUrl(null);
            return;
        }

        const blob = new Blob([buffer], { type });
        const blobUrl = URL.createObjectURL(blob);
        setUrl(blobUrl);
        console.log("Creating blob URL:", blobUrl);

        return () => {
            console.log("Revoking blob URL:", blobUrl);
            URL.revokeObjectURL(blobUrl);
        };
    }, [buffer, type]);

    return url;
}
