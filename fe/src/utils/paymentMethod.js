export const PAYMENT_METHOD_OPTIONS = [
  {
    value: 'Online',
    label: 'Thanh toán bằng mã QR',
    description: 'Quét mã QR của shop để chuyển khoản ngay sau khi đặt hàng.',
  },
  {
    value: 'COD',
    label: 'Thanh toán trực tiếp khi gặp mặt',
    description: 'Thanh toán khi giao hàng hoặc gặp mặt trực tiếp.',
  },
];

export const getPaymentMethodMeta = (method) => {
  if (method === 'Online') {
    return PAYMENT_METHOD_OPTIONS[0];
  }

  return PAYMENT_METHOD_OPTIONS[1];
};

export const isOnlinePayment = (method) => method === 'Online';
