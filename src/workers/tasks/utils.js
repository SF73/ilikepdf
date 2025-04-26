function generateRange(start, end, step) {
    const range = [];
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


export function parsePageRanges(rangeStrings, pageCount = null) {
    const result = [];
    console.log("parsePageRanges", rangeStrings, pageCount);
    const resolveIndex = (i) => {
        if (i == null) return null;
        return i >= 0 ? i : (pageCount != null ? pageCount + i : i);
    };

    const parseSlice = (slice) => {
        const parts = slice.split(':').map(x => x.trim() === '' ? null : parseInt(x.trim(), 10));
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
