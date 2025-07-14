const qr = require('qr-image');
const fs = require('fs'); // Only needed if saving to file, not for buffer

/**
 * Generates a QR code image buffer for the given text.
 * @param {string} text - The text to encode in the QR code.
 * @returns {Promise<Buffer>} A promise that resolves with the QR code image buffer (PNG).
 * @throws {Error} If QR code generation fails.
 */
const generateQrCodeBuffer = async (text) => {
    try {
        // qr.image returns a readable stream. We need to collect data from it into a buffer.
        const qrStream = qr.image(text, { type: 'png', margin: 2, size: 5 }); // size for pixel density
        
        return new Promise((resolve, reject) => {
            const chunks = [];
            qrStream.on('data', (chunk) => {
                chunks.push(chunk);
            });
            qrStream.on('end', () => {
                resolve(Buffer.concat(chunks));
            });
            qrStream.on('error', (err) => {
                console.error('Error generating QR code stream:', err);
                reject(err);
            });
        });
    } catch (error) {
        console.error('Failed to generate QR code:', error);
        throw error; // Re-throw the error to be handled by the caller
    }
};

module.exports = {
    generateQrCodeBuffer
};

/* 
// Example usage (for testing this module directly):
if (require.main === module) {
    (async () => {
        try {
            const textToEncode = 'https://example.com/verify?bookingId=12345ABC';
            console.log(`Generating QR code for: ${textToEncode}`);
            const buffer = await generateQrCodeBuffer(textToEncode);
            
            // To test, save it to a file
            const filePath = './test_qr_code.png';
            fs.writeFileSync(filePath, buffer);
            console.log(`QR code saved to ${filePath}`);

            // To use as base64 (alternative to cid embedding)
            // const base64Image = buffer.toString('base64');
            // console.log('Base64 QR Code:', `data:image/png;base64,${base64Image.substring(0, 50)}...`);

        } catch (error) {
            console.error('Test QR generation failed:', error);
        }
    })();
}
*/
