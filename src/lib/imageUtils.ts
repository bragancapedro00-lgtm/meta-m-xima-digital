/**
 * Utility functions for client-side avatar image processing
 */

export async function processAvatarFile(file: File, maxSize = 320): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('O arquivo selecionado não é uma imagem válida.');
  }

  // Max 10MB raw file size guard
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('O tamanho da imagem não pode ultrapassar 10MB.');
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error('Erro ao ler o arquivo de imagem.'));

    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Erro ao processar os dados da imagem.'));

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Compute square crop / resize dimensions for avatar
          const minDim = Math.min(width, height);
          const startX = (width - minDim) / 2;
          const startY = (height - minDim) / 2;

          const targetSize = Math.min(maxSize, minDim);
          canvas.width = targetSize;
          canvas.height = targetSize;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            // Fallback to raw data url if canvas context fails
            return resolve(reader.result as string);
          }

          // Draw cropped & centered square image
          ctx.drawImage(
            img,
            startX,
            startY,
            minDim,
            minDim,
            0,
            0,
            targetSize,
            targetSize
          );

          // Export as optimized JPEG
          const optimizedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          resolve(optimizedDataUrl);
        } catch (err) {
          // Fallback to raw data url
          resolve(reader.result as string);
        }
      };

      img.src = reader.result as string;
    };

    reader.readAsDataURL(file);
  });
}
