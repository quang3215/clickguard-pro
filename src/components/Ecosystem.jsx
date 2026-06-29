import React from 'react';
import { ExternalLink, MonitorSmartphone, Target, ShoppingCart, ShieldAlert, ArrowRight, Zap, TrendingUp, Globe } from 'lucide-react';
import './Ecosystem.css';
import Logo28 from './Logo28';

export default function Ecosystem() {
  return (
    <div className="eco-container">
      {/* Header Section */}
      <div className="eco-header">
        <div className="eco-badge">
          <span className="eco-badge-dot"></span>
          Đang hoạt động trên toàn cầu
        </div>
        <h1 className="eco-title">Hệ Sinh Thái <span className="text-gradient-brand">MinhQuang28</span></h1>
        <p className="eco-subtitle">
          Giải pháp Performance Marketing &amp; Website High-end toàn diện. <br/>
          Chúng tôi không chỉ làm dịch vụ, chúng tôi xây dựng cỗ máy in tiền cho doanh nghiệp của bạn.
        </p>
        <a href="https://quang3215.github.io/minhquang28.shop/" target="_blank" rel="noopener noreferrer" className="eco-cta">
          Khám phá ngay <ArrowRight size={18} />
        </a>
      </div>

      {/* Bento Grid */}
      <div className="bento-grid">
        
        {/* Card 1: Web Design (Large) */}
        <div className="bento-card bento-large card-web">
          <div className="bento-bg-gradient gradient-blue"></div>
          <div className="bento-content">
            <div className="bento-icon-wrapper">
              <MonitorSmartphone size={28} />
            </div>
            <div className="bento-text">
              <h2>Thiết kế Website High-end</h2>
              <p>Trải nghiệm chuẩn Premium, tốc độ tải trang siêu tốc, tối ưu UI/UX để giữ chân khách hàng lâu nhất có thể.</p>
            </div>
            <div className="bento-tags">
              <span>Độc quyền</span>
              <span>Chuẩn SEO</span>
              <span>Mobile-first</span>
            </div>
          </div>
          <div className="bento-image-mockup">
            <Globe size={120} className="mockup-icon" opacity={0.1} />
          </div>
        </div>

        {/* Card 2: Performance Marketing */}
        <div className="bento-card card-ads">
          <div className="bento-bg-gradient gradient-green"></div>
          <div className="bento-content">
            <div className="bento-icon-wrapper">
              <Target size={28} />
            </div>
            <div className="bento-text">
              <h2>Performance Marketing</h2>
              <p>Chiến dịch đa kênh Facebook, Google, TikTok. Đốt tiền thông minh, thu lead chất lượng, tối đa hóa ROAS.</p>
            </div>
          </div>
        </div>

        {/* Card 3: E-commerce */}
        <div className="bento-card card-ecom">
          <div className="bento-bg-gradient gradient-purple"></div>
          <div className="bento-content">
            <div className="bento-icon-wrapper">
              <ShoppingCart size={28} />
            </div>
            <div className="bento-text">
              <h2>Tối ưu E-Commerce</h2>
              <p>Bùng nổ doanh số Shopee, TikTok Shop bằng chiến lược Ads và setup chuẩn SEO.</p>
            </div>
          </div>
        </div>

        {/* Card 4: ClickGuard Pro */}
        <div className="bento-card bento-wide card-tool">
          <div className="bento-bg-gradient gradient-red"></div>
          <div className="bento-content bento-content-row">
            <div className="bento-left-col">
              <div className="bento-icon-wrapper">
                <ShieldAlert size={28} />
              </div>
              <div className="bento-text">
                <h2>ClickGuard Pro</h2>
                <p>Bạn đang sử dụng hệ thống bảo vệ ngân sách quảng cáo độc quyền từ hệ sinh thái của chúng tôi.</p>
              </div>
            </div>
            <div className="bento-stats">
              <div className="stat-item">
                <Zap size={20} color="#f87171" />
                <div>
                  <strong>Real-time</strong>
                  <span>Phát hiện tức thì</span>
                </div>
              </div>
              <div className="stat-item">
                <TrendingUp size={20} color="#81cd29" />
                <div>
                  <strong>Bảo vệ</strong>
                  <span>100% ngân sách</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
