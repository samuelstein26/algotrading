import Compressor from 'compressorjs';

export const useImageCompressor = () => {
  const compressImage = (file, options = {}) => {
    return new Promise((resolve, reject) => {
      new Compressor(file, {
        quality: 0.7,
        maxWidth: 800,
        ...options,
        success: (compressedFile) => resolve(compressedFile),
        error: (err) => reject(err),
      });
    });
  };

  return { compressImage };
};