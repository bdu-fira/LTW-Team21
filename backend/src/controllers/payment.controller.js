const PORT = process.env.PORT || 3000;
const SERVER_PUBLIC_URL = (process.env.SERVER_PUBLIC_URL || `http://localhost:${PORT}`).replace(/\/$/, '');
const QR_PAYMENT_IMAGE_PATH = process.env.QR_PAYMENT_IMAGE_PATH || '/payment-qr/maqr.jpg';

const generateQrUrl = () => `${SERVER_PUBLIC_URL}${QR_PAYMENT_IMAGE_PATH}`;

module.exports = { generateQrUrl };
