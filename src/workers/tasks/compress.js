export async function compress({ id, pymupdf, pyodide, buffer, jpgQuality, maxFactor, dctAll, reportProgress }) {
  function replaceImage(page, xref, { filename = null, pixmap = null, stream = null}) {
  const doc = page.parent; // the owning document
  if (!doc.xref_is_image(xref)) {
    throw new Error("xref not an image"); // insert new image anywhere in page
  }
  if (filename && stream && pixmap) {
    throw new Error("Exactly one of filename/stream/pixmap must be given");
  }
  const newXref = page.insert_image.callKwargs(page.rect, { filename, stream, pixmap });
  console.log("New Xref:", newXref, "Old Xref:", xref);
  const oldLength = doc.xref_get_key(xref, "Length");
  const newLength = doc.xref_get_key(newXref, "Length");
  console.log("Old Length:", oldLength, "New Length:", newLength);
  if (parseInt(oldLength[1]) <= parseInt(newLength[1])){
    page.delete_image(newXref);
    return;
  }
  doc.xref_copy(newXref, xref); // copy over new to old
  const lastContentsXref = page.get_contents().slice(-1)[0];
  console.log("Last contents xref:", lastContentsXref);
  // new image insertion has created a new /Contents source,
  // which we will set to spaces now
  const spaceByte = pyodide.runPython(`b" "`);
  doc.update_stream(lastContentsXref, spaceByte);
  page._image_info = pyodide.toPy({});
}
  
  
  const doc = pymupdf.Document.callKwargs({ stream: pyodide.toPy(buffer) });
  const pageCount = doc.page_count;
  for (const page of doc) {
    console.log("Page:", page);
    const imageList = page.get_images({ full: true }).toJs();
    for (const img of imageList) {
      const xref = img[0];
      const smask = img[1];
      if (xref === 0 || xref === undefined) {
        continue;
      }
      const width = img[2];
      const height = img[3];
      const encoding = img[8]; // FlateDecode or DCTDecode
      const bpc = img[4]; // Bits per component
      const csName = img[5]; // DeviceRGB, DeviceGray, etc.

      const rects = page.get_image_rects(xref);
      const bbox = rects[0];
      const dwidth = bbox.width;
      const dheight = bbox.height;
      const factor = width / dwidth;
      console.log("Image ", xref, "factor:", factor, "encoding:", encoding, "smask:", smask);

      if (factor > maxFactor) {
        let pixmap = pymupdf.Pixmap(doc, xref);
        // console.log("Pixmap:", pixmap, "width:", pixmap.width, "height:", pixmap.height, "encoding:", pixmap.colorspace, "bpp:", pixmap.n, "alpha", pixmap.alpha); 

        // Downsampling
        pixmap = pymupdf.Pixmap(pixmap, Math.round(dwidth * maxFactor), Math.round(dheight * maxFactor));
        // console.log("Pixmap:", pixmap, "width:", pixmap.width, "height:", pixmap.height, "encoding:", pixmap.colorspace, "bpp:", pixmap.n, "alpha", pixmap.alpha); 
        if (encoding === "DCTDecode" || dctAll) {
          // jpg : Downsampling and recompressing
          const bytes = pixmap.tobytes.callKwargs({ output: "jpg", jpg_quality: jpgQuality });
          pixmap = pymupdf.Pixmap(bytes);
        }
        // else if (encoding === "FlateDecode") {
        //   // png : Downsampling only
        // }
        // continue;


        // const newImg = pymupdf.Pixmap(pixmap, Math.round(dwidth * maxFactor), Math.round(dheight * maxFactor));
        if (false && smask !== 0) {
          let maskPixmap = pymupdf.Pixmap(doc, smask);
          maskPixmap = pymupdf.Pixmap(maskPixmap, Math.round(dwidth * maxFactor), Math.round(dheight * maxFactor));
          pixmap = pymupdf.Pixmap(pixmap, maskPixmap);
        }
        // page.replace_image.callKwargs(xref, { pixmap: pixmap });
        replaceImage(page, xref, { stream: pixmap.tobytes.callKwargs({ output: "jpg", jpg_quality: jpgQuality }) });
        // if (encoding === "FlateDecode") {
        //   page.replace_image.callKwargs(xref, { pixmap: newImg });
        // }
        // else {
        //   const bytes = newImg.tobytes.callKwargs({jpg_quality: jpgQuality });
        //   console.log("Bytes:", bytes);
        //   page.replace_image.callKwargs(xref, { stream: bytes });
        // }
      }
    }
    if (reportProgress) {
      reportProgress(Math.round(page.number / pageCount) * 100, `Processed page ${page.number + 1}`);
    }
  }
  if (reportProgress) {
    reportProgress(100, `Cleaning up...`);
  }
  // const compressedBuffer = doc.tobytes.callKwargs({ deflate: false, garbage: 0, use_objstms: false, clean: false });
  
  const compressedBuffer = doc.tobytes.callKwargs({ deflate: true, garbage: 4, use_objstms: 1, clean: true });
  
  doc.close();
  return {
    buffer: compressedBuffer.toJs().buffer,
    mime: 'application/pdf',
  };
}




// def replace_image(page: pymupdf.Page, xref: int, *, filename=None, pixmap=None, stream=None):
//     """Replace the image referred to by xref.

//     Replace the image by changing the object definition stored under xref. This
//     will leave the pages appearance instructions intact, so the new image is
//     being displayed with the same bbox, rotation etc.
//     By providing a small fully transparent image, an effect as if the image had
//     been deleted can be achieved.
//     A typical use may include replacing large images by a smaller version,
//     e.g. with a lower resolution or graylevel instead of colored.

//     Args:
//         xref: the xref of the image to replace.
//         filename, pixmap, stream: exactly one of these must be provided. The
//             meaning being the same as in Page.insert_image.
//     """
//     doc = page.parent  # the owning document
//     if not doc.xref_is_image(xref):
//         raise ValueError("xref not an image")  # insert new image anywhere in page
//     if bool(filename) + bool(stream) + bool(pixmap) != 1:
//         raise ValueError("Exactly one of filename/stream/pixmap must be given")
//     new_xref = page.insert_image(
//         page.rect, filename=filename, stream=stream, pixmap=pixmap
//     )
//     doc.xref_copy(new_xref, xref)  # copy over new to old
//     last_contents_xref = page.get_contents()[-1]
//     # new image insertion has created a new /Contents source,
//     # which we will set to spaces now
//     doc.update_stream(last_contents_xref, b" ")