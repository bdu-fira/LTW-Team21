export const ORDER_STATUS_OPTIONS = [
  { value: 'Pending', label: 'Đã tiếp nhận', color: 'gold', description: 'Hệ thống đã ghi nhận đơn hàng.' },
  { value: 'Processing', label: 'Đang xử lý', color: 'blue', description: 'Nhân viên đang kiểm tra và xác nhận đơn.' },
  { value: 'Packing', label: 'Đang đóng gói', color: 'cyan', description: 'Đơn hàng đang được đóng gói.' },
  { value: 'Shipping', label: 'Đang giao hàng', color: 'purple', description: 'Đơn hàng đang trên đường giao tới bạn.' },
  { value: 'Delivered', label: 'Đã giao hàng', color: 'green', description: 'Đơn đã được giao thành công.' },
  { value: 'Received', label: 'Khách đã nhận', color: 'green', description: 'Khách hàng đã xác nhận nhận đơn.' },
  { value: 'Paid', label: 'Đã thanh toán', color: 'geekblue', description: 'Đơn hàng đã được thanh toán hoàn tất.' },
  { value: 'Refused', label: 'Từ chối / Hủy', color: 'red', description: 'Đơn hàng đã bị từ chối hoặc hủy.' },
];

export const getOrderStatusMeta = (status) =>
  ORDER_STATUS_OPTIONS.find((item) => item.value === status) || {
    value: status,
    label: status,
    color: 'default',
    description: 'Trạng thái đơn hàng đang được cập nhật.',
  };
