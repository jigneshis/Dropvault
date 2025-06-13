import QRCode from 'qrcode';

export const generateQRCode = async (text: string): Promise<string> => {
  try {
    const qrCodeDataURL = await QRCode.toDataURL(text, {
      color: {
        dark: '#00ff41',
        light: '#0a0a0a',
      },
      margin: 2,
      width: 256,
      errorCorrectionLevel: 'M',
    });
    return qrCodeDataURL;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
};