import pymupdf
from .utils import fix_xref, parse_slices

def compose(buffer, pages, convert_from_one_indexed=False, **save_options):
    print(convert_from_one_indexed)
    print(save_options)
    doc = pymupdf.Document(stream=buffer)
    fix_xref(doc)
    
    save_options.setdefault("garbage", 3)
    save_options.setdefault("use_objstms", 1)
    save_options.setdefault("deflate", True)

    pages = parse_slices(pages, count=doc.page_count, convert_from_one_indexed=convert_from_one_indexed)
    print(f"Selecting pages {pages}")
    doc.select(pages)
    merged_buffer = doc.tobytes(**save_options)
    doc.close()
    return merged_buffer