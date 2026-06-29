import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { ShieldAlert, LogIn, UserPlus, AlertTriangle, Loader2, MonitorSmartphone, Target, ShoppingCart } from 'lucide-react';
import Logo28 from './Logo28';
import './Login.css';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      let msg = 'Đã có lỗi xảy ra. Vui lòng thử lại!';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        msg = 'Email hoặc mật khẩu không chính xác.';
      } else if (err.code === 'auth/email-already-in-use') {
        msg = 'Email này đã được đăng ký.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'Mật khẩu phải có ít nhất 6 ký tự.';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'Email không hợp lệ.';
      }
      setError(msg);
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setError('Đăng nhập bằng Google thất bại. Vui lòng thử lại!');
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      {/* Cột trái: Landing Page / Giới thiệu */}
      <div className="login-left">
        <div className="login-left-content">
          <Logo28 size={64} className="mb-4" style={{marginBottom: '24px'}} />
          <h1 className="brand-title">Hệ Sinh Thái <span className="text-gradient-brand">MinhQuang28</span></h1>
          <p className="brand-slogan">
            Bứt phá doanh thu với giải pháp toàn diện từ MinhQuang28. 
            Từ thiết kế nền tảng đến tối ưu chuyển đổi, chúng tôi đồng hành cùng sự tăng trưởng của bạn.
          </p>

          <div className="features-list">
            <div className="feature-item">
              <div className="feature-icon-wrapper">
                <MonitorSmartphone size={24} color="#38bdf8" />
              </div>
              <div className="feature-text">
                <h3>Thiết kế Website High-end</h3>
                <p>Giao diện độc quyền, trải nghiệm mượt mà, tối ưu UX/UI chuẩn Premium để nâng tầm thương hiệu.</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon-wrapper">
                <Target size={24} color="#81cd29" />
              </div>
              <div className="feature-text">
                <h3>Performance Marketing Đa Kênh</h3>
                <p>Chiến dịch quảng cáo chuyển đổi sâu trên Facebook, Google, TikTok mang lại doanh thu thực tế.</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-icon-wrapper">
                <ShoppingCart size={24} color="#a78bfa" />
              </div>
              <div className="feature-text">
                <h3>Tối ưu Thương Mại Điện Tử</h3>
                <p>Giải pháp tăng trưởng doanh số toàn diện trên Shopee, TikTok Shop và các nền tảng E-commerce.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cột phải: Form đăng nhập */}
      <div className="login-right">
        <div className="auth-panel">
          <div className="auth-logo">
            <div>
              <h1>{isRegister ? 'Tạo Tài Khoản' : 'Đăng Nhập'}</h1>
              <p>Truy cập vào hệ thống ClickGuard Pro</p>
            </div>
          </div>

          {error && (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '12px', borderRadius: '8px', color: '#fca5a5', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
              <AlertTriangle size={16} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Email của bạn</label>
              <div className="input-wrapper">
                <div className="input-icon">@</div>
                <input 
                  type="email" 
                  className="auth-input" 
                  placeholder="admin@minhquang28.shop"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label>Mật khẩu</label>
              <div className="input-wrapper">
                <div className="input-icon">***</div>
                <input 
                  type="password" 
                  className="auth-input" 
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
            </div>

            <button type="submit" className="btn-auth" disabled={loading}>
              {loading ? <Loader2 className="spin" size={18} /> : (isRegister ? <UserPlus size={18} /> : <LogIn size={18} />)}
              {isRegister ? 'Đăng ký ngay' : 'Đăng nhập'}
            </button>
          </form>

          <div className="divider">HOẶC</div>

          <button type="button" className="btn-google" onClick={handleGoogleLogin} disabled={loading}>
            <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Tiếp tục với Google
          </button>

          <div className="auth-toggle">
            {isRegister ? 'Đã có tài khoản?' : 'Chưa có tài khoản?'}
            <button onClick={() => setIsRegister(!isRegister)}>
              {isRegister ? 'Đăng nhập' : 'Đăng ký'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
