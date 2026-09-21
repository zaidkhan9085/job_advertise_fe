// Shrinks a poster photo for SCANNING only (the original file is still what
// gets posted with the job). The OCR service's free plan rejects anything
// over 1MB, and a phone photo is routinely 2-5MB; text on a poster stays
// perfectly readable at ~1800px, so this scales the longest side down and
// re-encodes as JPEG until the file is comfortably under the limit.
//
// Never throws: a file that can't be decoded in this browser (e.g. HEIC) or
// that's already small enough is returned untouched and the server copes.

const TARGET_BYTES = 900 * 1024;
const MAX_SIDE = 1800;

export async function compressForScan(file: File): Promise<File> {
  try {
    if (file.size <= TARGET_BYTES && file.type !== "image/webp") return file;

    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;

    // JPEG has no transparency -- a transparent PNG would come out black.
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    for (const quality of [0.85, 0.75, 0.65, 0.55]) {
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
      if (blob && blob.size <= TARGET_BYTES) {
        return new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" });
      }
    }
    return file;
  } catch {
    return file;
  }
}
