// Sử dụng đường dẫn ảo /images đã cấu hình ở Backend
const BASE_URL = 'http://localhost:3000/images';

export const getProductImageUrl = (imageName) => {
  if (!imageName || imageName === 'NULL' || imageName === 'EMPTY' || imageName.trim() === '') {
    return 'https://via.placeholder.com/150?text=No+Image';
  }
  
  if (imageName.startsWith('blob:') || imageName.startsWith('http')) {
    return imageName;
  }

  // Nối chuỗi sạch sẽ, không lo lỗi tiếng Việt trên URL
  return `${BASE_URL}/${imageName}`;
};