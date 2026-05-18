/**
 * Resizes an image file and converts it to a compressed base64 string.
 * @param {File} file - The image file to compress.
 * @param {number} maxWidth - Maximum width of the output image.
 * @param {number} maxHeight - Maximum height of the output image.
 * @param {number} quality - JPEG compression quality (0 to 1).
 * @returns {Promise<string>} A promise that resolves with the base64 string.
 */
export const compressImage = (file, maxWidth = 300, maxHeight = 300, quality = 0.8) => {
    return new Promise((resolve, reject) => {
        if (!file || !file.type.startsWith('image/')) {
            reject(new Error('Invalid file type. Must be an image.'));
            return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Calculate the new dimensions while maintaining aspect ratio
                if (width > height) {
                    if (width > maxWidth) {
                        height = Math.round((height *= maxWidth / width));
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = Math.round((width *= maxHeight / height));
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Convert canvas to base64 JPEG
                const dataUrl = canvas.toDataURL('image/jpeg', quality);
                resolve(dataUrl);
            };
            img.onerror = (err) => reject(err);
        };
        reader.onerror = (err) => reject(err);
    });
};
