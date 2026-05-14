import React from 'react';
import { Button, Col, Row } from 'antd';
import {
  ArrowRightOutlined,
  CheckCircleFilled,
  ClockCircleOutlined,
  CustomerServiceOutlined,
  MailOutlined,
  PhoneOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';

const accentColor = '#b49a6c';

const supportChannels = [
  {
    icon: <MailOutlined />,
    label: 'Email ho tro',
    value: 'support@phonestore.com',
    note: 'Kenh tiep nhan chi tiet cho don hang, bao hanh va tu van san pham.',
    actionLabel: 'Gui email',
    href: 'mailto:support@phonestore.com',
  },
  {
    icon: <PhoneOutlined />,
    label: 'Hotline PhoneStore',
    value: '0889237769',
    note: 'Phu hop khi can ho tro nhanh ve giao hang, thanh toan hoac kiem tra tinh trang don.',
    actionLabel: 'Goi ngay',
    href: 'tel:0889237769',
  },
  {
    icon: <ClockCircleOutlined />,
    label: 'Khung gio tiep nhan',
    value: '08:00 - 22:00 moi ngay',
    note: 'Ngoai khung gio tren, email van duoc ghi nhan va xu ly som nhat trong ca tiep theo.',
    actionLabel: 'San sang',
  },
  {
    icon: <SafetyCertificateOutlined />,
    label: 'Noi dung duoc uu tien',
    value: 'Bao hanh, doi tra, tu van chon may',
    note: 'Doi ngu ho tro se huong dan tung buoc de ban xu ly nhanh va de dang hon.',
    actionLabel: 'Uu tien',
  },
];

const highlights = [
  'Tu van mua may phu hop theo nhu cau hoc tap, cong viec va giai tri.',
  'Ho tro kiem tra don hang, thanh toan, van chuyen va thong tin bao hanh.',
  'Giao dien toi mau, nhan vang va nen sang giu cung chat sang trong cua website.',
];

const metricCards = [
  { title: 'Kenh chinh', value: '2', subtitle: 'Email va hotline' },
  { title: 'Hỗ trợ', value: 'Premium', subtitle: 'Giúp bản giải đáp mọi thắc mắc' },
  { title: 'Tiep nhan', value: '08:00 - 22:00', subtitle: 'Moi ngay trong tuan' },
];

const SupportPage = () => {
  return (
    <div style={{ maxWidth: 1180, margin: '0 auto', padding: '8px 0 24px' }}>
      <style>{`
        .support-shell {
          position: relative;
          overflow: hidden;
          border-radius: 32px;
          background:
            radial-gradient(circle at top left, rgba(180, 154, 108, 0.22), transparent 32%),
            radial-gradient(circle at bottom right, rgba(255, 255, 255, 0.08), transparent 25%),
            linear-gradient(135deg, #0f172a 0%, #111827 55%, #1f2937 100%);
          color: #ffffff;
          padding: 40px;
          box-shadow: 0 24px 60px rgba(15, 23, 42, 0.24);
        }

        .support-board {
          margin-top: -56px;
          position: relative;
          z-index: 2;
          background: #ffffff;
          border-radius: 28px;
          border: 1px solid rgba(15, 23, 42, 0.08);
          box-shadow: 0 24px 60px rgba(15, 23, 42, 0.1);
          overflow: hidden;
        }

        .support-row {
          padding: 24px 28px;
          border-bottom: 1px solid #eef1f5;
          transition: background 0.25s ease, transform 0.25s ease;
        }

        .support-row:last-child {
          border-bottom: none;
        }

        .support-row:hover {
          background: linear-gradient(90deg, rgba(180, 154, 108, 0.08), rgba(255, 255, 255, 0));
        }

        .support-icon {
          width: 56px;
          height: 56px;
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, rgba(180, 154, 108, 0.16), rgba(17, 24, 39, 0.08));
          color: #111827;
          font-size: 24px;
        }

        .support-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.14);
          background: rgba(255, 255, 255, 0.06);
          color: #f9fafb;
          font-size: 12px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          font-weight: 700;
        }

        @media (max-width: 768px) {
          .support-shell {
            border-radius: 24px;
            padding: 24px;
          }

          .support-board {
            margin-top: 24px;
            border-radius: 22px;
          }

          .support-row {
            padding: 20px;
          }
        }
      `}</style>

      <section className="support-shell">
        <Row gutter={[32, 32]} align="middle">
          <Col xs={24} lg={13}>
            <div className="support-pill">
              <CustomerServiceOutlined />
              Trung tam ho tro PhoneStore
            </div>

            <h1
              style={{
                margin: '20px 0 18px',
                fontSize: 'clamp(34px, 5vw, 54px)',
                lineHeight: 1.06,
                fontWeight: 800,
                letterSpacing: '-0.03em',
                color: '#ffffff',
              }}
            >
              Bạn đang cần hỗ trợ hãy liên hệ ngay với chúng tôi!
            </h1>

            <p
              style={{
                maxWidth: 620,
                margin: 0,
                color: '#d1d5db',
                fontSize: 17,
                lineHeight: 1.75,
              }}
            >
              Can doi tra, bao hanh hay tu van chon may? PhoneStore giu cho ban mot khu ho tro
              gon gang, sang trong va thao tac nhanh voi email support va hotline hien thi noi bat.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 28 }}>
              <Button
                type="primary"
                href="mailto:support@phonestore.com"
                icon={<MailOutlined />}
                size="large"
                style={{
                  height: 50,
                  paddingInline: 24,
                  borderRadius: 999,
                  background: accentColor,
                  borderColor: accentColor,
                  boxShadow: '0 12px 24px rgba(180, 154, 108, 0.25)',
                  fontWeight: 700,
                }}
              >
                support@phonestore.com
              </Button>
              <Button
                href="tel:0889237769"
                size="large"
                icon={<PhoneOutlined />}
                style={{
                  height: 50,
                  paddingInline: 24,
                  borderRadius: 999,
                  background: 'transparent',
                  color: '#ffffff',
                  borderColor: 'rgba(255,255,255,0.26)',
                  fontWeight: 700,
                }}
              >
                0889237769
              </Button>
            </div>

            <div style={{ marginTop: 30, display: 'grid', gap: 12 }}>
              {highlights.map((item) => (
                <div key={item} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <CheckCircleFilled style={{ color: accentColor, marginTop: 4, fontSize: 16 }} />
                  <span style={{ color: '#e5e7eb', lineHeight: 1.7 }}>{item}</span>
                </div>
              ))}
            </div>
          </Col>

          <Col xs={24} lg={11}>
            <div
              style={{
                padding: 24,
                borderRadius: 28,
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
                backdropFilter: 'blur(16px)',
              }}
            >
              <div style={{ marginBottom: 20 }}>
                <div
                  style={{
                    color: '#9ca3af',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  Tong quan nhanh
                </div>
                <div style={{ color: '#ffffff', fontSize: 28, fontWeight: 800, marginTop: 8 }}>
                  Ho tro cao cap cho khach hang PhoneStore
                </div>
              </div>

              <div style={{ display: 'grid', gap: 14 }}>
                {metricCards.map((card) => (
                  <div
                    key={card.title}
                    style={{
                      borderRadius: 22,
                      padding: '18px 20px',
                      background: 'rgba(15,23,42,0.35)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    <div style={{ color: '#9ca3af', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                      {card.title}
                    </div>
                    <div style={{ color: '#ffffff', fontSize: 24, fontWeight: 800, margin: '8px 0 4px' }}>
                      {card.value}
                    </div>
                    <div style={{ color: '#d1d5db', lineHeight: 1.6 }}>{card.subtitle}</div>
                  </div>
                ))}
              </div>
            </div>
          </Col>
        </Row>
      </section>

      <section className="support-board">
        <div
          style={{
            padding: '28px 28px 20px',
            background: 'linear-gradient(180deg, #ffffff 0%, #fbfbfd 100%)',
            borderBottom: '1px solid #eef1f5',
          }}
        >
          <div
            style={{
              color: accentColor,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              fontSize: 12,
              fontWeight: 800,
              marginBottom: 10,
            }}
          >
            Bang thong tin ho tro
          </div>
          <div style={{ fontSize: 30, fontWeight: 800, color: '#111827', marginBottom: 8 }}>
            Cac kenh lien he chinh
          </div>
          <p style={{ margin: 0, color: '#6b7280', fontSize: 16, lineHeight: 1.7 }}>
            Toan bo thong tin ben duoi da duoc sap xep theo tung hang de khach hang de nhin,
            de tim va de tuong tac ngay khi can.
          </p>
        </div>

        {supportChannels.map((item) => (
          <div key={item.label} className="support-row">
            <Row gutter={[20, 20]} align="middle">
              <Col xs={24} md={4} lg={3}>
                <div className="support-icon">{item.icon}</div>
              </Col>
              <Col xs={24} md={8} lg={6}>
                <div
                  style={{
                    color: '#6b7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    fontSize: 12,
                    fontWeight: 800,
                    marginBottom: 8,
                  }}
                >
                  {item.label}
                </div>
                <div style={{ color: '#111827', fontSize: 24, fontWeight: 800, wordBreak: 'break-word' }}>
                  {item.href ? (
                    <a
                      href={item.href}
                      style={{ color: '#111827', textDecoration: 'none' }}
                    >
                      {item.value}
                    </a>
                  ) : (
                    item.value
                  )}
                </div>
              </Col>
              <Col xs={24} md={8} lg={10}>
                <p style={{ margin: 0, color: '#6b7280', fontSize: 15, lineHeight: 1.75 }}>
                  {item.note}
                </p>
              </Col>
              <Col xs={24} md={4} lg={5} style={{ textAlign: 'right' }}>
                {item.href ? (
                  <Button
                    type="default"
                    href={item.href}
                    icon={<ArrowRightOutlined />}
                    style={{
                      height: 46,
                      paddingInline: 20,
                      borderRadius: 999,
                      borderColor: '#d1d5db',
                      fontWeight: 700,
                    }}
                  >
                    {item.actionLabel}
                  </Button>
                ) : (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: 46,
                      padding: '0 18px',
                      borderRadius: 999,
                      background: '#f3f4f6',
                      color: '#111827',
                      fontWeight: 700,
                    }}
                  >
                    {item.actionLabel}
                  </span>
                )}
              </Col>
            </Row>
          </div>
        ))}
      </section>
    </div>
  );
};

export default SupportPage;
