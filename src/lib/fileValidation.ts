// Matches the backend's single shared multer limit (backend/middleware/upload.js)
// exactly, so a rejection here is never followed by the backend accepting
// a file just under this bound or vice versa.
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

// Catches an oversized file the instant it's picked, instead of only after
// a full upload/submit round-trip hits the backend's multer limit.
export function validateFileSize(file: File, maxBytes: number = MAX_FILE_SIZE_BYTES): string | null {
  if (file.size > maxBytes) {
    return `File is too large (max ${Math.floor(maxBytes / (1024 * 1024))}MB).`;
  }
  return null;
}
