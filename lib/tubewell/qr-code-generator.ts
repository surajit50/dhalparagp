// lib/tubewell/qr-code-generator.ts
/**
 * Generate QR Code for tube wells
 */

import QRCode from 'qrcode';

export async function generateQRCodeDataUrl(tubeWellId: string, assetId: string): Promise<string> {
  // Format: TW-[ASSETID]
  const qrData = `TW-${assetId}`;

  try {
    // Generate QR code as data URL
    const dataUrl = await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 300,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });

    return dataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
}

/**
 * Generate QR code as buffer (for image upload)
 */
export async function generateQRCodeBuffer(tubeWellId: string, assetId: string): Promise<Buffer> {
  const qrData = `TW-${assetId}`;

  try {
    const buffer = await QRCode.toBuffer(qrData, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 300,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });

    return buffer;
  } catch (error) {
    console.error('Error generating QR code buffer:', error);
    throw new Error('Failed to generate QR code');
  }
}
