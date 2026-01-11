// Utilities to normalize user-uploaded photos so orientation is consistent (fixes 90° rotated outputs)

const readAsArrayBuffer = (file: File) =>
  new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });

const readAsDataURL = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = src;
  });

// Minimal EXIF orientation parser for JPEGs
// Returns 1..8 when available, otherwise null
export const getJpegExifOrientation = (buffer: ArrayBuffer): number | null => {
  const view = new DataView(buffer);
  if (view.byteLength < 4) return null;
  // JPEG SOI
  if (view.getUint16(0, false) !== 0xffd8) return null;

  let offset = 2;
  while (offset + 4 < view.byteLength) {
    if (view.getUint8(offset) !== 0xff) break;
    const marker = view.getUint8(offset + 1);
    offset += 2;

    // EOI or SOS
    if (marker === 0xd9 || marker === 0xda) break;

    const size = view.getUint16(offset, false);
    if (size < 2) break;

    // APP1
    if (marker === 0xe1) {
      const exifOffset = offset + 2;
      // 'Exif\0\0'
      if (
        exifOffset + 6 <= view.byteLength &&
        view.getUint32(exifOffset, false) === 0x45786966 &&
        view.getUint16(exifOffset + 4, false) === 0x0000
      ) {
        const tiffOffset = exifOffset + 6;
        if (tiffOffset + 8 > view.byteLength) return null;

        const endian = view.getUint16(tiffOffset, false);
        const littleEndian = endian === 0x4949; // 'II'
        if (!littleEndian && endian !== 0x4d4d) return null; // 'MM'

        const firstIfdOffset = view.getUint32(tiffOffset + 4, littleEndian);
        let ifd0 = tiffOffset + firstIfdOffset;
        if (ifd0 + 2 > view.byteLength) return null;

        const numEntries = view.getUint16(ifd0, littleEndian);
        ifd0 += 2;

        for (let i = 0; i < numEntries; i++) {
          const entryOffset = ifd0 + i * 12;
          if (entryOffset + 12 > view.byteLength) break;
          const tag = view.getUint16(entryOffset, littleEndian);
          if (tag === 0x0112) {
            // Orientation
            const type = view.getUint16(entryOffset + 2, littleEndian);
            const count = view.getUint32(entryOffset + 4, littleEndian);
            if (type === 3 && count === 1) {
              const value = view.getUint16(entryOffset + 8, littleEndian);
              return value >= 1 && value <= 8 ? value : null;
            }
          }
        }
      }
    }

    offset += size;
  }

  return null;
};

const orientationToTransform = (orientation: number, w: number, h: number) => {
  // returns: [a,b,c,d,e,f] for ctx.transform(a,b,c,d,e,f)
  switch (orientation) {
    case 2: // flip X
      return { w, h, t: [-1, 0, 0, 1, w, 0] as const };
    case 3: // 180
      return { w, h, t: [-1, 0, 0, -1, w, h] as const };
    case 4: // flip Y
      return { w, h, t: [1, 0, 0, -1, 0, h] as const };
    case 5: // transpose
      return { w: h, h: w, t: [0, 1, 1, 0, 0, 0] as const };
    case 6: // 90 CW
      return { w: h, h: w, t: [0, 1, -1, 0, h, 0] as const };
    case 7: // transverse
      return { w: h, h: w, t: [0, -1, -1, 0, h, w] as const };
    case 8: // 270
      return { w: h, h: w, t: [0, -1, 1, 0, 0, w] as const };
    default:
      return { w, h, t: [1, 0, 0, 1, 0, 0] as const };
  }
};

export const normalizeUserUploadImage = async (file: File) => {
  // Only JPEGs commonly have EXIF orientation; for PNG/WebP the file pixels are already in correct orientation.
  const isJpeg = file.type === 'image/jpeg' || file.type === 'image/jpg';
  if (!isJpeg) {
    return { file, dataUrl: await readAsDataURL(file) };
  }

  const buffer = await readAsArrayBuffer(file);
  const orientation = getJpegExifOrientation(buffer);
  if (!orientation || orientation === 1) {
    return { file, dataUrl: await readAsDataURL(file) };
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await loadImage(objectUrl);
    const { w: outW, h: outH, t } = orientationToTransform(orientation, img.naturalWidth, img.naturalHeight);

    const canvas = document.createElement('canvas');
    canvas.width = outW;
    canvas.height = outH;

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas not supported');

    ctx.transform(t[0], t[1], t[2], t[3], t[4], t[5]);
    ctx.drawImage(img, 0, 0);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('Failed to export normalized image'))),
        'image/jpeg',
        0.92
      );
    });

    const normalizedFile = new File([blob], file.name.replace(/\.(jpe?g)$/i, '.jpg'), {
      type: 'image/jpeg',
      lastModified: Date.now(),
    });

    const dataUrl = await readAsDataURL(normalizedFile);
    return { file: normalizedFile, dataUrl };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
};
