import React, { useEffect, useMemo, useState } from 'react';
import { Button, Radio, message, Empty, Row, Col, Tag, Spin, Tooltip, Input, Space, Skeleton } from 'antd';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingCartOutlined, 
  HeartOutlined, 
  ReloadOutlined, 
  ArrowRightOutlined,
  RocketOutlined,
  SafetyCertificateOutlined,
  CreditCardOutlined,
  CrownOutlined,
  AppleOutlined,
  MobileOutlined,
  AppstoreOutlined,
  MoreOutlined,
  TagOutlined 
} from '@ant-design/icons';
import { productService, cartService } from '../Services';
import { getProductImageUrl } from '../utils/productImage';

const promos = [
  { icon: <RocketOutlined />, title: 'Giao Hàng Hỏa Tốc', description: 'Nhận hàng nhanh chóng trong 2 giờ nội thành.' },
  { icon: <SafetyCertificateOutlined />, title: 'Bảo Hành Toàn Diện', description: 'Cam kết 1 đổi 1 trong 30 ngày đầu tiên.' },
  { icon: <CreditCardOutlined />, title: 'Trả Góp 0%', description: 'Hỗ trợ thanh toán linh hoạt qua thẻ tín dụng.' },
  { icon: <CrownOutlined />, title: 'Dịch Vụ Premium', description: 'Hỗ trợ kỹ thuật chuyên sâu 24/7.' },
];

const categories = [
  { name: 'Apple', icon: <AppleOutlined /> },
  { name: 'Samsung', icon: <MobileOutlined /> },
  { name: 'Xiaomi', icon: <AppstoreOutlined /> },
  { name: 'Khác', icon: <MoreOutlined /> },
];

const sectionTitleStyle = {
  fontSize: 32,
  marginBottom: 12,
  color: '#000000',
  fontWeight: 800,
  letterSpacing: '-0.02em',
  textTransform: 'uppercase',
};

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [brandFilter, setBrandFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  
  const [voucherInput, setVoucherInput] = useState('');
  const [isVoucherApplied, setIsVoucherApplied] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await productService.getAll();
      const nextProducts = data.data || [];
      setProducts(nextProducts);
      setFilteredProducts(nextProducts);
    } catch (error) {
      console.error('Lỗi lấy danh sách sản phẩm:', error);
      message.error('Không kết nối được server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = [...products];

    if (brandFilter !== 'all') {
      result = result.filter((product) => product.brand?.toLowerCase() === brandFilter);
    }

    if (priceFilter === 'low') result = result.filter((product) => product.price < 20000000);
    else if (priceFilter === 'mid') result = result.filter((product) => product.price >= 20000000 && product.price <= 25000000);
    else if (priceFilter === 'high') result = result.filter((product) => product.price > 25000000);

    setFilteredProducts(result);
  }, [brandFilter, priceFilter, products]);

  const handleApplyVoucher = () => {
    if (!voucherInput.trim()) {
      message.warning('Vui lòng nhập mã giảm giá');
      return;
    }
    
    if (voucherInput.trim().toUpperCase() === 'SHOPDB') {
      setIsVoucherApplied(true);
      message.success('Áp dụng mã giảm giá SHOPDB thành công! Giảm 25% toàn bộ sản phẩm.');
    } else {
      setIsVoucherApplied(false);
      message.error('Mã giảm giá không hợp lệ hoặc đã hết hạn!');
    }
  };

  const getEffectivePrice = (price) => {
    return isVoucherApplied ? price * 0.75 : price;
  };

  const featuredProduct = useMemo(() => filteredProducts[0] || products[0] || null, [filteredProducts, products]);

  const handleAddToCart = async (event, product) => {
    event.stopPropagation();
    const token = localStorage.getItem('token');
    if (!token) {
      message.warning('Bạn cần đăng nhập để mua hàng');
      return;
    }

    if (Number(product?.stock || 0) <= 0) {
      message.warning(`${product?.name || 'Sản phẩm'} đã hết hàng`);
      return;
    }

    try {
      const res = await cartService.addItem(product.id, 1);
      if (res.success) {
        message.success(res.message || 'Đã thêm vào giỏ hàng');
        window.dispatchEvent(new Event('storage'));
      }
    } catch (error) {
      message.error(error?.response?.data?.message || error.message || 'Lỗi thêm vào giỏ hàng');
    }
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);

  const scrollToProducts = () => {
    document.getElementById('product-showcase')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div style={{ background: '#f5f5f5', minHeight: '100vh', fontFamily: '"Inter", -apple-system, sans-serif', position: 'relative' }}>
      
      {/* --- QUẢNG CÁO HAI BÊN (SIDE BANNERS) --- */}
      <style>{`
        @media (max-width: 1399px) { .side-banner { display: none !important; } }
        .side-banner {
          position: fixed; top: 50%; transform: translateY(-50%); z-index: 1000;
          width: 130px; padding: 24px 10px; text-align: center; transition: all 0.3s ease;
        }
        .side-banner:hover { transform: translateY(-52%); }
      `}</style>

      {/* Banner Trái (Dark) */}
      <div className="side-banner" style={{ left: '15px', backgroundColor: '#000', border: '1px solid #d4af37' }}>
        <TagOutlined style={{ fontSize: 28, color: '#d4af37', marginBottom: 12 }} />
        <div style={{ color: '#fff', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>Ưu Đãi Đặc Biệt</div>
        <div style={{ color: '#d4af37', fontSize: 24, fontWeight: 900, marginBottom: 12 }}>-25%</div>
        <div style={{ borderTop: '1px solid #333', paddingTop: 10 }}>
          <span style={{ color: '#888', fontSize: 10 }}>NHẬP MÃ:</span>
          <div style={{ color: '#fff', fontSize: 15, fontWeight: 800, marginTop: 4 }}>SHOPDB</div>
        </div>
      </div>

      {/* Banner Phải (Light) */}
      <div className="side-banner" style={{ right: '15px', backgroundColor: '#fff', border: '2px solid #000' }}>
        <RocketOutlined style={{ fontSize: 28, color: '#000', marginBottom: 12 }} />
        <div style={{ color: '#000', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>Mua Ngay</div>
        <div style={{ background: '#ff4d4f', color: '#fff', fontSize: 12, padding: '4px 8px', fontWeight: 700, marginBottom: 15 }}>GIẢM SỐC</div>
        <Button 
          type="primary" 
          size="small" 
          onClick={scrollToProducts}
          style={{ background: '#000', borderRadius: 0, fontSize: 10, fontWeight: 700 }}
        >
          XEM SẢN PHẨM
        </Button>
      </div>

      {/* --- NỘI DUNG CHÍNH --- */}
      
      {/* HERO SECTION */}
      <section
        style={{
          position: 'relative',
          padding: '120px 24px 140px',
          background: `linear-gradient(rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0.85)), url('https://images.unsplash.com/photo-1556656793-08538906a9f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          color: '#ffffff',
        }}
      >
        <div style={{ maxWidth: 1240, margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <Row gutter={[48, 48]} align="middle">
            <Col xs={24} lg={12}>
              <div style={{ 
                display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', 
                background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.3)', 
                color: '#fff', marginBottom: 24, letterSpacing: '0.1em', textTransform: 'uppercase', fontSize: 12, fontWeight: 600
              }}>
                Bộ Sưu Tập Mới Nhất 2026
              </div>

              <h1 style={{ fontSize: 'clamp(46px, 6vw, 68px)', fontWeight: 800, lineHeight: 1.1, margin: '0 0 24px', color: '#ffffff', letterSpacing: '-0.03em' }}>
                Công Nghệ <br/> Đỉnh Cao.
              </h1>

              <p style={{ maxWidth: 540, fontSize: 18, lineHeight: 1.6, color: '#cccccc', marginBottom: 36, fontWeight: 300 }}>
                Trải nghiệm không gian mua sắm hiện đại, tinh tế. Khám phá các dòng điện thoại cao cấp nhất với dịch vụ hậu mãi chuẩn quốc tế.
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                <Button
                  type="primary"
                  size="large"
                  icon={<ArrowRightOutlined />}
                  onClick={scrollToProducts}
                  style={{
                    height: 54, paddingInline: 36, background: '#ffffff', color: '#000000', 
                    borderColor: '#ffffff', fontWeight: 600, borderRadius: 0, fontSize: 16
                  }}
                >
                  Khám Phá Ngay
                </Button>
                <Button
                  size="large"
                  onClick={() => window.scrollTo({ top: 800, behavior: 'smooth' })}
                  style={{
                    height: 54, paddingInline: 36, background: 'transparent', color: '#ffffff', 
                    borderColor: '#ffffff', fontWeight: 600, borderRadius: 0, fontSize: 16
                  }}
                >
                  Dịch Vụ & Ưu Đãi
                </Button>
              </div>
            </Col>

            <Col xs={24} lg={12}>
              <div
                style={{
                  padding: 32,
                  background: 'rgba(25, 25, 25, 0.6)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 24px 40px rgba(0,0,0,0.4)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 12, color: '#999', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Sản Phẩm Tiêu Điểm</p>
                    <h3 style={{ margin: '8px 0 0', fontSize: 24, color: '#ffffff', fontWeight: 700 }}>
                      {featuredProduct?.name || 'Mẫu Flagship Cao Cấp'}
                    </h3>
                  </div>
                  <Tag color="#ffffff" style={{ color: '#000', borderRadius: 0, padding: '4px 12px', fontWeight: 600, border: 'none' }}>
                    HOT
                  </Tag>
                </div>

                <div style={{ height: 320, background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
                  <img
                    src={getProductImageUrl(featuredProduct?.image)}
                    alt={featuredProduct?.name || 'featured-product'}
                    style={{ width: '100%', maxWidth: 260, height: 260, objectFit: 'contain' }}
                    onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/360x300?text=Premium+Phone'; }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginTop: 24 }}>
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: 12 }}>
                    <div style={{ fontSize: 12, color: '#999', textTransform: 'uppercase' }}>Giá Ưu Đãi</div>
                    {featuredProduct ? (
                      isVoucherApplied ? (
                        <>
                          <div style={{ fontSize: 14, color: '#999', textDecoration: 'line-through', marginTop: 4 }}>
                            {formatPrice(featuredProduct.price)}
                          </div>
                          <div style={{ fontSize: 20, fontWeight: 700, color: '#ff4d4f' }}>
                            {formatPrice(getEffectivePrice(featuredProduct.price))}
                          </div>
                        </>
                      ) : (
                        <div style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginTop: 4 }}>
                          {formatPrice(featuredProduct.price)}
                        </div>
                      )
                    ) : (
                      <div style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginTop: 4 }}>Liên hệ</div>
                    )}
                  </div>
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: 12 }}>
                    <div style={{ fontSize: 12, color: '#999', textTransform: 'uppercase' }}>Tình trạng</div>
                    <div style={{ fontSize: 16, fontWeight: 500, color: '#fff', marginTop: 8 }}>
                      {Number(featuredProduct?.stock || 0) > 0
                        ? `Còn ${featuredProduct?.stock} máy`
                        : 'Hết hàng'}
                    </div>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </section>

      {/* PROMOS SECTION */}
      <div style={{ maxWidth: 1240, margin: '-60px auto 0', padding: '0 24px', position: 'relative', zIndex: 4 }}>
        <Row gutter={[24, 24]}>
          {promos.map((promo) => (
            <Col xs={24} sm={12} lg={6} key={promo.title}>
              <div
                style={{
                  height: '100%', padding: '32px 24px', background: '#ffffff',
                  border: '1px solid #e0e0e0', boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                  transition: 'transform 0.3s ease', cursor: 'default'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ fontSize: 32, marginBottom: 16, color: '#000000' }}>{promo.icon}</div>
                <h3 style={{ marginBottom: 12, color: '#000000', fontWeight: 700, fontSize: 18 }}>{promo.title}</h3>
                <p style={{ margin: 0, color: '#666666', lineHeight: 1.6, fontSize: 14 }}>{promo.description}</p>
              </div>
            </Col>
          ))}
        </Row>
      </div>

      {/* CATEGORIES SECTION */}
      <section style={{ maxWidth: 1240, margin: '80px auto 0', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h2 style={sectionTitleStyle}>Thương Hiệu</h2>
          <div style={{ width: 60, height: 4, background: '#000', margin: '0 auto' }}></div>
        </div>

        <Row gutter={[24, 24]}>
          {categories.map((category) => (
            <Col key={category.name} xs={12} sm={12} lg={6}>
              <div
                onClick={() => setBrandFilter(category.name.toLowerCase())}
                style={{
                  background: brandFilter === category.name.toLowerCase() ? '#000' : '#fff',
                  color: brandFilter === category.name.toLowerCase() ? '#fff' : '#000',
                  padding: '40px 24px', textAlign: 'center', cursor: 'pointer',
                  border: '1px solid #000', transition: 'all 0.3s ease',
                }}
              >
                <div style={{ fontSize: 48, marginBottom: 16 }}>{category.icon}</div>
                <div style={{ fontWeight: 700, fontSize: 18, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{category.name}</div>
              </div>
            </Col>
          ))}
        </Row>
      </section>

      {/* FILTER & VOUCHER SECTION */}
      <section style={{ maxWidth: 1240, margin: '60px auto 0', padding: '0 24px' }}>
        <div style={{ background: '#ffffff', padding: '32px 40px', border: '1px solid #e0e0e0' }}>
          <Row gutter={[32, 24]} align="middle">
            <Col xs={24} md={7}>
              <div style={{ fontWeight: 600, color: '#000', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: 13 }}>Bộ Lọc Thương Hiệu</div>
              <Radio.Group onChange={(e) => setBrandFilter(e.target.value)} value={brandFilter}>
                <Space wrap size="large">
                  <Radio value="all" style={{ fontWeight: 500 }}>Tất cả</Radio>
                  <Radio value="apple" style={{ fontWeight: 500 }}>Apple</Radio>
                  <Radio value="samsung" style={{ fontWeight: 500 }}>Samsung</Radio>
                  <Radio value="xiaomi" style={{ fontWeight: 500 }}>Xiaomi</Radio>
                </Space>
              </Radio.Group>
            </Col>
            
            <Col xs={24} md={7}>
              <div style={{ fontWeight: 600, color: '#000', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: 13 }}>Mức Giá</div>
              <Radio.Group onChange={(e) => setPriceFilter(e.target.value)} value={priceFilter}>
                <Space wrap size="large">
                  <Radio value="all" style={{ fontWeight: 500 }}>Tất cả</Radio>
                  <Radio value="low" style={{ fontWeight: 500 }}>Dưới 20Tr</Radio>
                  <Radio value="mid" style={{ fontWeight: 500 }}>20 - 25Tr</Radio>
                  <Radio value="high" style={{ fontWeight: 500 }}>Trên 25Tr</Radio>
                </Space>
              </Radio.Group>
            </Col>

            <Col xs={24} md={6}>
              <div style={{ fontWeight: 600, color: '#000', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: 13 }}>
                <TagOutlined style={{ marginRight: 6 }}/> Mã Giảm Giá
              </div>
              <div style={{ display: 'flex' }}>
                <Input 
                  placeholder="Nhập SHOPDB..." 
                  value={voucherInput}
                  onChange={(e) => setVoucherInput(e.target.value)}
                  disabled={isVoucherApplied}
                  style={{ borderRadius: 0, borderColor: '#000' }}
                />
                {isVoucherApplied ? (
                  <Button 
                    type="primary" 
                    danger
                    onClick={() => {
                      setIsVoucherApplied(false);
                      setVoucherInput('');
                      message.info('Đã gỡ mã giảm giá');
                    }}
                    style={{ borderRadius: 0, fontWeight: 600 }}
                  >
                    Hủy
                  </Button>
                ) : (
                  <Button 
                    type="primary" 
                    onClick={handleApplyVoucher}
                    style={{ borderRadius: 0, background: '#000', borderColor: '#000', fontWeight: 600 }}
                  >
                    Áp dụng
                  </Button>
                )}
              </div>
            </Col>

            <Col xs={24} md={4} style={{ textAlign: 'right' }}>
              <Button
                onClick={loadProducts}
                icon={<ReloadOutlined />}
                style={{ height: 44, borderRadius: 0, borderColor: '#000', color: '#000', fontWeight: 600, marginTop: 34 }}
              >
                Tải Lại
              </Button>
            </Col>
          </Row>
        </div>
      </section>

      {/* PRODUCT SHOWCASE */}
      <section id="product-showcase" style={{ maxWidth: 1240, margin: '60px auto 0', padding: '0 24px 80px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40, borderBottom: '2px solid #000', paddingBottom: 16 }}>
          <h2 style={{ fontSize: 28, margin: 0, fontWeight: 800, textTransform: 'uppercase' }}>SẢN PHẨM</h2>
          <div style={{ color: '#666', fontWeight: 600 }}>{filteredProducts.length} Kết quả</div>
        </div>

        <Spin spinning={loading} size="large">
          {loading && !products.length ? (
            <Row gutter={[24, 32]}>
              {Array.from({ length: 8 }).map((_, index) => (
                <Col key={index} xs={24} sm={12} md={8} lg={6}>
                  <div style={{ background: '#fff', border: '1px solid #e0e0e0', padding: 20 }}>
                    <Skeleton.Image style={{ width: '100%', height: 240 }} active />
                    <Skeleton active paragraph={{ rows: 3 }} style={{ marginTop: 20 }} />
                  </div>
                </Col>
              ))}
            </Row>
          ) : filteredProducts.length > 0 ? (
            <Row gutter={[24, 32]}>
              {filteredProducts.map((product) => (
                <Col key={product.id} xs={24} sm={12} md={8} lg={6}>
                  <div
                    onClick={() => navigate(`/product/${product.id}`)}
                    style={{
                      background: '#fff', border: '1px solid #e0e0e0', cursor: 'pointer',
                      height: '100%', display: 'flex', flexDirection: 'column', transition: 'all 0.3s ease',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 15px 30px rgba(0,0,0,0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                  >
                    {isVoucherApplied && (
                      <div style={{ 
                        position: 'absolute', top: 16, left: 16, background: '#ff4d4f', 
                        color: '#fff', padding: '4px 8px', fontSize: 12, fontWeight: 'bold', zIndex: 2 
                      }}>
                        -25%
                      </div>
                    )}

                    {Number(product.stock || 0) <= 0 && (
                      <div
                        style={{
                          position: 'absolute',
                          top: isVoucherApplied ? 52 : 16,
                          left: 16,
                          background: '#111827',
                          color: '#fff',
                          padding: '4px 10px',
                          fontSize: 12,
                          fontWeight: 700,
                          zIndex: 2,
                          letterSpacing: '0.04em',
                          textTransform: 'uppercase',
                        }}
                      >
                        Hết hàng
                      </div>
                    )}

                    <div style={{ position: 'relative', height: 280, background: '#fafafa', padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ position: 'absolute', top: 16, right: 16, color: '#000', zIndex: 2 }}>
                        <Tooltip title="Yêu thích">
                          <HeartOutlined style={{ fontSize: 20 }} />
                        </Tooltip>
                      </div>
                      <img
                        alt={product.name}
                        src={getProductImageUrl(product.image)}
                        onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/250?text=Phone'; }}
                        style={{ width: '100%', height: '100%', objectFit: 'contain', transition: 'transform 0.4s ease' }}
                        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      />
                    </div>

                    <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                      <div style={{ flexGrow: 1 }}>
                        <div style={{ fontSize: 11, color: '#999', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>
                          {product.brand || 'Thương hiệu'}
                        </div>
                        <h3 style={{ fontSize: 16, color: '#000', marginBottom: 12, lineHeight: 1.5, fontWeight: 600, minHeight: 48 }}>
                          {product.name}
                        </h3>
                        
                        <div style={{ marginBottom: 24 }}>
                          {isVoucherApplied ? (
                            <>
                              <div style={{ fontSize: 13, color: '#999', textDecoration: 'line-through', marginBottom: 4 }}>
                                {formatPrice(product.price)}
                              </div>
                              <div style={{ fontSize: 20, fontWeight: 700, color: '#ff4d4f' }}>
                                {formatPrice(getEffectivePrice(product.price))}
                              </div>
                            </>
                          ) : (
                            <div style={{ fontSize: 20, fontWeight: 700, color: '#000' }}>
                              {formatPrice(product.price)}
                            </div>
                          )}
                        </div>

                        <Tag color={Number(product.stock || 0) > 0 ? 'green' : 'red'}>
                          {Number(product.stock || 0) > 0 ? `Còn ${product.stock} máy` : 'Hết hàng'}
                        </Tag>
                      </div>

                      <Button
                        onClick={(e) => handleAddToCart(e, product)}
                        type="primary"
                        block
                        icon={<ShoppingCartOutlined />}
                        disabled={Number(product.stock || 0) <= 0}
                        style={{ height: 44, borderRadius: 0, background: '#000', borderColor: '#000', fontWeight: 600, fontSize: 14 }}
                      >
                        {Number(product.stock || 0) > 0 ? 'Thêm Giỏ Hàng' : 'Hết hàng'}
                      </Button>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          ) : (
            <Empty description="Không tìm thấy sản phẩm" style={{ padding: '80px 0' }} />
          )}
        </Spin>
      </section>

      {/* NEWSLETTER SECTION */}
      <section style={{ background: '#000', padding: '80px 24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 32, color: '#fff', fontWeight: 800, textTransform: 'uppercase', marginBottom: 16 }}>Đăng Ký Nhận Thông Tin</h2>
          <p style={{ fontSize: 16, color: '#ccc', margin: '0 auto 32px', lineHeight: 1.6 }}>
            Nhận ngay các thông tin mới nhất về sản phẩm công nghệ và các đặc quyền ưu đãi dành riêng cho thành viên.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 0, maxWidth: 500, margin: '0 auto' }}>
            <input
              type="email"
              placeholder="Nhập địa chỉ email..."
              style={{
                flex: 1, padding: '16px 20px', border: '1px solid #333', background: '#111', color: '#fff', 
                outline: 'none', fontSize: 16, borderRadius: '4px 0 0 4px'
              }}
            />
            <Button
              type="primary"
              style={{
                height: 'auto', paddingInline: 32, background: '#fff', color: '#000', 
                borderColor: '#fff', fontWeight: 700, borderRadius: '0 4px 4px 0', fontSize: 15, textTransform: 'uppercase'
              }}
            >
              Đăng ký
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
