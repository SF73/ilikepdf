import React, { useEffect, useState } from "react";import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton";

interface PdfCardProps {
    blob?: Blob | null;  
}

const PdfPreviewCard : React.FC<PdfCardProps>= ({
    blob
}) => {
    const [url, setUrl] = useState<string | null>(null);

    useEffect(() => {
        if (blob) {
            const newUrl = URL.createObjectURL(blob);
            setUrl(newUrl);
            return () => {
                URL.revokeObjectURL(newUrl);
            };
        }
    }, [blob]);

    return (
        <Card className="w-[210px] h-[297px]">
            <CardContent>
                {url ? (
                    <img src={url}></img>
                ):
                (<Skeleton className="h-[210px] w-[297px]" />)
                }
            </CardContent>
        </Card>
        );
                
                
}