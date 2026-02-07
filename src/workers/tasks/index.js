// import { extractImagesFromPdf } from "./extractImagesFromPdf.js";
import { getPdfMetadata } from "./getPdfMetadata.js";
import { extractImages } from "./extractImages.js";
import { setPdfMetadata } from "./setPdfMetadata.js";
import { selectPages } from "./selectPages.js";
import { getPdfSummary } from "./getPdfSummary.js";
import { mergePdfs } from "./mergePdf.js";
import { compress } from "./compress.js";
import { savePdf } from "./savePdf.js";
import { rewriteImages } from "./rewriteImages.js";
import { getPdfObjectSizes } from "./getPdfObjectSizes.js";
export const tasks = {
  extractImages,
  getPdfMetadata,
  setPdfMetadata,
  selectPages,
  getPdfSummary,
  getPdfObjectSizes,
  mergePdfs,
  compress,
  savePdf,
  rewriteImages,
};
