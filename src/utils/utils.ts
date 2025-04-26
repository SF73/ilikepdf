import { FileMetadata } from '@/types/fileTypes';

function generateRange(start: number, end: number, step: number): number[] {
    const range: number[] = [];
    if (step === 0) return range;

    if (step > 0) {
        for (let i = start; i < end; i += step) {
            range.push(i);
        }
    } else {
        for (let i = start; i > end; i += step) {
            range.push(i);
        }
    }

    return range;
}

const getFilesWithPageRanges = (files: FileMetadata[]) => {
    return files.map(({ fileHandle, pageRange }) => {
        const { start, end } = pageRange || {};
        return {
            fileHandle,
            pageRange:
                start != null || end != null
                    ? [start != null ? start - 1 : null, end != null ? end - 1 : null]
                    : null,
        };
    });
};


export function parsePageRanges(rangeStrings: string, pageCount : (number | null) = null): number[] {
    const result: number[] = [];
    console.log("parsePageRanges", rangeStrings, pageCount);
    const resolveIndex = (i: number) => {
        return i >= 0 ? i : (pageCount != null ? pageCount + i : i);
    };

    const parseSlice = (slice: string) => {
        let parts = slice.split(':').map(x => x.trim() === '' ? null : parseInt(x.trim(), 10));
        while (parts.length < 3) parts.push(null);
        let [rawStart, rawEnd, rawStep] = parts;
        const step = rawStep ?? 1;

        let start = resolveIndex(rawStart ?? 0);
        let end = resolveIndex(rawEnd ?? (pageCount ?? start + 1));
        return generateRange(start, end, step);
    };

    for (const part of rangeStrings.split(',')) {
        const trimmed = part.trim();
        if (trimmed.includes(':')) {
            result.push(...parseSlice(trimmed));
        } else if (trimmed !== '') {
            let page = parseInt(trimmed, 10);
            page = resolveIndex(page);
            if (!isNaN(page)) result.push(page);
        }
    }

    return pageCount != null
        ? result.filter(p => p >= 0 && p < pageCount)
        : result;
}


export function formatFileSize(bytes: number): string {
    if (bytes < 1024) {
      return `${bytes} B`;
    } else if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    } else {
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }
}
  