def fix_xref(doc):
    """
    Fix the cross-reference table of a PDF document.

    Args:
        doc (pymupdf.Document): The PDF document to fix.
    """
    for xref in range(1, doc.xref_length()):
        try:
            o = doc.xref_object(xref)
            if o == 'null':
                raise ValueError(f"Object {xref} is null")
        except:
            print(f"Found bad object {xref}")
            doc.update_object(xref, "<<>>")


def parse_slices(input_str, count=None, convert_from_one_indexed=False):
    result = []
    for item in input_str.split(','):
        item = item.strip()
        if ':' in item:
            parts = item.split(':')
            parts += [None] * (3 - len(parts))
            start = int(parts[0]) if parts[0] else None
            stop = int(parts[1]) if parts[1] else None
            step = int(parts[2]) if parts[2] else None

            if convert_from_one_indexed:
                if start is not None:
                    start -= 1
                if stop is not None:
                    stop -= 1

            s = slice(start, stop, step)

            if count is not None:
                result.extend(range(count)[s])
            else:
                result.append(s)
        else:
            num = int(item)
            result.append(num - 1 if convert_from_one_indexed else num)

    return result
