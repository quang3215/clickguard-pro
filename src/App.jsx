import React, { useState, useEffect, useMemo } from 'react';
import { collection, query, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc, getDocs, where, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { db, auth } from './firebase';
import { Globe, Activity, Copy, Clock, AlertTriangle, CheckCircle, ShieldCheck, Plus, Code, Loader2, Trash2, Settings, Smartphone, Monitor, ServerCrash, Filter, Check, Info, X, DownloadCloud, LogOut, DatabaseBackup, Crown } from 'lucide-react';
import DateFilter from './components/DateFilter';
import Login from './components/Login';
import Logo28 from './components/Logo28';
import Ecosystem from './components/Ecosystem';
import './index.css';

// --- SUPER ADMIN CONFIG ---
const ADMIN_EMAILS = ['lmquang28@gmail.com'];

function App() {
  // Auth State
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const isAdmin = user && ADMIN_EMAILS.includes(user.email);

  // App State
  const [visits, setVisits] = useState([]);
  const [websites, setWebsites] = useState([]);
  const [activeSite, setActiveSite] = useState('Ecosystem');
  const [loading, setLoading] = useState(true);
  
  // Custom Alerts & Notifications
  const [toasts, setToasts] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState(null);

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  // Filter State
  const [ipFilter, setIpFilter] = useState('all'); 
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), 
      endDate: new Date(),
      key: 'selection'
    }
  ]);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  
  // Forms
  const [newDomain, setNewDomain] = useState('');
  const [newName, setNewName] = useState('');
  
  // Settings
  const [config, setConfig] = useState({
    maxClicks: parseInt(localStorage.getItem('cg_maxClicks')) || 2,
    timeWindowHours: parseInt(localStorage.getItem('cg_timeWindow')) || 24
  });
  const [tempConfig, setTempConfig] = useState({...config});

  // Check Authentication Status
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Fetch real-time data ONLY when user is authenticated
  useEffect(() => {
    if (!user) return; // Don't fetch if not logged in

    // If Admin -> fetch all, else -> filter by userId
    const qWebsites = isAdmin ? query(collection(db, 'websites')) : query(collection(db, 'websites'), where('userId', '==', user.uid));
    const unsubWebsites = onSnapshot(qWebsites, (snapshot) => {
      const siteData = [];
      snapshot.forEach((doc) => {
        siteData.push({ id: doc.id, ...doc.data() });
      });
      // Sort desc in memory
      siteData.sort((a, b) => {
        const tA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const tB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return tB - tA;
      });
      setWebsites(siteData);
    });

    const qVisits = isAdmin ? query(collection(db, 'visits')) : query(collection(db, 'visits'), where('userId', '==', user.uid));
    const unsubVisits = onSnapshot(qVisits, (snapshot) => {
      const visitData = [];
      snapshot.forEach((doc) => {
        visitData.push({ id: doc.id, ...doc.data() });
      });
      // Sort desc in memory
      visitData.sort((a, b) => {
        const tA = a.timestamp?.toMillis ? a.timestamp.toMillis() : 0;
        const tB = b.timestamp?.toMillis ? b.timestamp.toMillis() : 0;
        return tB - tA;
      });
      setVisits(visitData);
      setLoading(false);
    });

    return () => { unsubWebsites(); unsubVisits(); };
  }, [user, isAdmin]);

  const handleLogout = () => {
    setConfirmDialog({
      title: 'Đăng xuất',
      message: 'Bạn có chắc chắn muốn đăng xuất khỏi hệ thống không?',
      onConfirm: async () => {
        await signOut(auth);
        setConfirmDialog(null);
      }
    });
  };

  const formatTime = (ts) => {
    if (!ts) return '';
    const date = ts.toDate ? ts.toDate() : new Date(ts);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' ' + date.toLocaleDateString('vi-VN');
  };

  const parseDevice = (ua) => {
    if (!ua) return { type: 'Unknown', browser: 'Unknown', icon: <Monitor size={14}/> };
    const isMobile = /Mobile|Android|iPhone|iPad/i.test(ua);
    let browser = 'Other';
    if (ua.includes('Chrome')) browser = 'Chrome';
    else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
    else if (ua.includes('Firefox')) browser = 'Firefox';
    return {
      type: isMobile ? 'Mobile' : 'PC',
      browser,
      icon: isMobile ? <Smartphone size={14} color="#a78bfa" /> : <Monitor size={14} color="#60a5fa" />
    };
  };

  const handleExportCSV = (siteDomain) => {
    const siteVisits = visits.filter(v => v.website === siteDomain);
    if (siteVisits.length === 0) {
      showToast('Không có dữ liệu lịch sử nào để xuất!', 'warning');
      return;
    }
    
    const headers = ['Địa chỉ IP', 'Thiết bị', 'Trình duyệt', 'Nhà mạng (ISP)', 'Vị trí', 'Thời gian'];
    const csvContent = [
      headers.join(','),
      ...siteVisits.map(v => {
        const device = parseDevice(v.userAgent);
        const time = formatTime(v.timestamp);
        return `"${v.ip}","${device.type}","${device.browser}","${v.isp || ''}","${v.city || ''}","${time}"`;
      })
    ].join('\n');

    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `clickguard_data_${siteDomain}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast('Đã tải xuống file CSV thành công!', 'success');
  };

  const handleDeleteWebsite = (e, siteId, siteDomain) => {
    e.stopPropagation();
    setConfirmDialog({
      title: 'Cảnh báo Xóa Dữ Liệu',
      message: `Việc xóa website "${siteDomain}" sẽ xóa vĩnh viễn toàn bộ dữ liệu lịch sử click đi kèm. Bạn có muốn tải dữ liệu về máy (file CSV) để lưu trữ trước khi xóa không?`,
      onExport: () => handleExportCSV(siteDomain),
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, 'websites', siteId));
          const q = query(collection(db, 'visits'), where('website', '==', siteDomain), where('userId', '==', user.uid));
          const querySnapshot = await getDocs(q);
          querySnapshot.forEach(async (document) => {
            await deleteDoc(doc(db, 'visits', document.id));
          });

          if (activeSite === siteDomain) setActiveSite('All');
          showToast('Đã xóa website và toàn bộ dữ liệu thành công!', 'success');
        } catch (error) { 
          showToast('Có lỗi xảy ra khi xóa dữ liệu.', 'error'); 
        }
        setConfirmDialog(null);
      }
    });
  };
  
  const handleDeleteVisit = (visitId, ip) => {
    setConfirmDialog({
      title: 'Xóa Lượt Click',
      message: `Bạn có chắc chắn muốn xóa lượt click của IP ${ip} khỏi lịch sử không? (Chỉ xóa dòng này)`,
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, 'visits', visitId));
          showToast('Đã xóa lượt click thành công!', 'success');
        } catch (error) {
          showToast('Lỗi khi xóa dữ liệu.', 'error');
        }
        setConfirmDialog(null);
      }
    });
  };

  const handleClearAllData = () => {
    setConfirmDialog({
      title: 'Xóa Tất Cả Dữ Liệu',
      message: `Bạn đang chọn XÓA SẠCH toàn bộ lịch sử click hiện đang hiển thị trên bảng. Hành động này không thể hoàn tác. Bạn có chắc chắn không?`,
      onConfirm: async () => {
        try {
          displayVisits.forEach(async (visit) => {
             await deleteDoc(doc(db, 'visits', visit.id));
          });
          showToast('Đã xóa sạch dữ liệu trên bảng!', 'success');
        } catch (error) {
          showToast('Lỗi khi xóa dữ liệu.', 'error');
        }
        setConfirmDialog(null);
      }
    });
  };

  const handleAddWebsite = async (e) => {
    e.preventDefault();
    if (!user) return;

    let domain = newDomain.trim().toLowerCase();
    domain = domain.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
    if (!domain) return;
    
    if (websites.some(w => w.domain === domain)) {
      showToast('Tên miền này đã được thêm rồi!', 'error');
      return;
    }
    
    try {
      await addDoc(collection(db, 'websites'), {
        domain: domain, 
        name: newName.trim() || domain, 
        createdAt: serverTimestamp(),
        userId: user.uid,
        ownerEmail: user.email // Save email for Admin view
      });
      setNewDomain(''); setNewName(''); setShowAddModal(false);
      showToast('Đã thêm website thành công!', 'success');
    } catch (error) { 
      showToast('Có lỗi xảy ra khi thêm website.', 'error'); 
    }
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    localStorage.setItem('cg_maxClicks', tempConfig.maxClicks);
    localStorage.setItem('cg_timeWindow', tempConfig.timeWindowHours);
    setConfig({...tempConfig});
    setShowSettingsModal(false);
    showToast('Đã lưu cấu hình tần suất chặn thành công!', 'success');
  };

  const copyTrackingCode = () => {
    setShowCodeModal(true);
  };

  const copySpecificCode = (type) => {
    let code = '';
    const uid = user ? user.uid : 'UNKNOWN_USER';
    
    if (type === 'compat') {
      code = `<!-- CLICKGUARD TRACKING CODE - Tương thích 100% -->
<script src="https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore-compat.js"></script>
<script>
  const firebaseConfig = {
    apiKey: "AIzaSyA5wRPP391kOLAosnhc0wWTDn1EgVy03zw",
    authDomain: "clickfrauddashboard.firebaseapp.com",
    projectId: "clickfrauddashboard",
    storageBucket: "clickfrauddashboard.firebasestorage.app",
    messagingSenderId: "145645586634",
    appId: "1:145645586634:web:1b1a8aae91a4a06fdbcc33"
  };
  if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore();
  async function initClickGuard() {
    try {
      const ipRes = await fetch('https://api.ipify.org?format=json');
      const ipData = await ipRes.json();
      let currentDomain = window.location.hostname.replace('www.', '');
      if (!currentDomain) currentDomain = 'local-test';
      await db.collection("visits").add({
        ip: ipData.ip, website: currentDomain,
        userId: "${uid}",
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        userAgent: navigator.userAgent
      });
      console.log("ClickGuard: OK");
    } catch (e) {}
  }
  initClickGuard();
</script>
<!-- END CLICKGUARD -->`;
    } else {
      code = `<!-- CLICKGUARD TRACKING CODE - Web Framework -->
<script type="module">
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
  import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
  const firebaseConfig = {
    apiKey: "AIzaSyA5wRPP391kOLAosnhc0wWTDn1EgVy03zw",
    authDomain: "clickfrauddashboard.firebaseapp.com",
    projectId: "clickfrauddashboard",
    storageBucket: "clickfrauddashboard.firebasestorage.app",
    messagingSenderId: "145645586634",
    appId: "1:145645586634:web:1b1a8aae91a4a06fdbcc33"
  };
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  async function initClickGuard() {
    try {
      const ipRes = await fetch('https://ipwho.is/');
      const ipData = await ipRes.json();
      const currentDomain = window.location.hostname.replace('www.', '');
      
      await addDoc(collection(db, "visits"), {
        ip: ipData.ip || 'Unknown', 
        website: currentDomain, 
        userId: "${uid}",
        timestamp: serverTimestamp(),
        userAgent: navigator.userAgent,
        isp: ipData.connection?.isp || ipData.connection?.org || 'Unknown',
        city: ipData.city || 'Unknown',
        isProxy: ipData.security?.vpn || ipData.security?.proxy || false
      });
    } catch (e) {}
  }
  initClickGuard();
//]]>
</script>
<!-- KẾT THÚC CLICKGUARD TRACKING CODE -->`;
    }
    
    navigator.clipboard.writeText(code).then(() => {
      setShowCodeModal(false);
      showToast('Đã copy Mã theo dõi! Đoạn mã này đã được gắn ID bảo mật của bạn.', 'success');
    }).catch(() => {
      showToast('Lỗi khi copy mã.', 'error');
    });
  };

  const getActiveSiteName = () => {
    if (activeSite === 'All') return 'Tổng quan Hệ thống';
    const site = websites.find(w => w.domain === activeSite);
    return site ? site.name : activeSite;
  };

  const filteredVisits = useMemo(() => {
    return visits.filter(v => {
      if (activeSite !== 'All' && v.website !== activeSite) return false;
      const vTime = v.timestamp?.toMillis ? v.timestamp.toMillis() : (v.timestamp || Date.now());
      const start = dateRange[0].startDate.getTime();
      const end = new Date(dateRange[0].endDate);
      end.setHours(23, 59, 59, 999);
      if (vTime < start || vTime > end.getTime()) return false;
      return true;
    });
  }, [visits, activeSite, dateRange]);

  const { ipStats, blacklistIPs } = useMemo(() => {
    const stats = {};
    filteredVisits.forEach(visit => {
      const time = visit.timestamp?.toMillis ? visit.timestamp.toMillis() : (visit.timestamp || Date.now());
      if (!stats[visit.ip]) {
        stats[visit.ip] = { count: 0, lastSeen: time, website: visit.website, isp: visit.isp, city: visit.city };
      }
      stats[visit.ip].count += 1;
      if (time > stats[visit.ip].lastSeen) stats[visit.ip].lastSeen = time;
    });

    const blacklisted = Object.entries(stats)
      .filter(([_, data]) => {
        const timeDiffHours = (Date.now() - data.lastSeen) / 3600000;
        return data.count > config.maxClicks && timeDiffHours <= config.timeWindowHours;
      })
      .map(([ip]) => ip);

    return { ipStats: stats, blacklistIPs: blacklisted };
  }, [filteredVisits, config]);

  const isSuspiciousISP = (isp) => {
    if (!isp) return false;
    const lower = isp.toLowerCase();
    return lower.includes('cloud') || lower.includes('hosting') || lower.includes('datacenter') || lower.includes('digitalocean') || lower.includes('vultr') || lower.includes('amazon');
  };

  const getVisitCategory = (visit) => {
    const count = ipStats[visit.ip]?.count || 1;
    const isDanger = count > config.maxClicks;
    const isVPN = isSuspiciousISP(visit.isp) || visit.isProxy;
    if (isDanger) return 'blacklisted';
    if (count > 1 || isVPN) return 'warning';
    return 'valid';
  };

  const counts = {
    all: filteredVisits.length,
    valid: filteredVisits.filter(v => getVisitCategory(v) === 'valid').length,
    warning: filteredVisits.filter(v => getVisitCategory(v) === 'warning').length,
    blacklisted: filteredVisits.filter(v => getVisitCategory(v) === 'blacklisted').length,
  };

  const displayVisits = filteredVisits.filter(v => {
    if (ipFilter === 'all') return true;
    return getVisitCategory(v) === ipFilter;
  });

  const copyBlacklist = () => {
    if (blacklistIPs.length > 0) {
      navigator.clipboard.writeText(blacklistIPs.join('\n'));
      showToast(`Đã copy ${blacklistIPs.length} IP Sổ Đen!`, 'success');
    } else {
      showToast('Không có IP nào trong Sổ Đen.', 'info');
    }
  };

  // ----- RENDERING -----

  // Loading State
  if (authLoading) {
    return (
      <div style={{height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)', color: 'white'}}>
        <Loader2 className="spin" size={48} color="var(--accent-blue)" />
      </div>
    );
  }

  // Not Logged In
  if (!user) {
    return <Login />;
  }

  // Logged In -> Dashboard
  return (
    <div className="app-container">
      
      {/* Toast Notifications */}
      <div className="toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`toast ${toast.type}`}>
            {toast.type === 'success' && <CheckCircle color="var(--success)" size={20} />}
            {toast.type === 'error' && <AlertTriangle color="var(--danger)" size={20} />}
            {toast.type === 'info' && <Info color="var(--accent-blue)" size={20} />}
            {toast.type === 'warning' && <AlertTriangle color="var(--warning)" size={20} />}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

      {/* Confirm Dialog Modal */}
      {confirmDialog && (
        <div className="modal-overlay">
          <div className="modal-content" style={{maxWidth: '480px'}}>
            <div style={{display: 'flex', justifyContent: 'center', marginBottom: '20px'}}>
              <div style={{background: 'var(--danger-bg)', padding: '16px', borderRadius: '50%'}}>
                <AlertTriangle size={32} color="var(--danger)" />
              </div>
            </div>
            <h2 style={{textAlign: 'center', marginBottom: '16px', fontSize: '1.4rem'}}>{confirmDialog.title}</h2>
            <p style={{textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '32px', lineHeight: '1.6'}}>
              {confirmDialog.message}
            </p>
            <div style={{display: 'flex', gap: '12px'}}>
              <button className="btn-cancel" style={{flex: 1}} onClick={() => setConfirmDialog(null)}>Hủy bỏ</button>
              
              {confirmDialog.onExport && (
                <button className="btn-primary" style={{flex: 1.2, justifyContent: 'center', background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'}} onClick={confirmDialog.onExport}>
                  <DownloadCloud size={16} /> Lưu Data (CSV)
                </button>
              )}

              <button className="btn-danger" style={{flex: 1, justifyContent: 'center'}} onClick={confirmDialog.onConfirm}>Xác Nhận</button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className="sidebar glass-panel">
        <div className="logo-area" style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
          <Logo28 size={32} />
          <div style={{display: 'flex', flexDirection: 'column'}}>
            <span>ClickGuard Pro</span>
            {isAdmin && <div style={{fontSize: '0.65rem', color: '#fca5a5', fontWeight: 'bold', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px'}}><Crown size={10} /> SUPER ADMIN</div>}
          </div>
        </div>

        <div className="nav-section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{isAdmin ? 'Tất cả Dự án' : 'Khách Hàng'}</span>
          <button className="add-btn-small" onClick={() => setShowAddModal(true)}>
            <Plus size={14} /> Thêm Web
          </button>
        </div>
        
        <div className="site-list">
          <button 
            className={`site-btn ${activeSite === 'All' ? 'active' : ''}`}
            onClick={() => setActiveSite('All')}
          >
            <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
              <Globe size={18} /> Tất cả Website
            </div>
            <span className="count-badge">{visits.length}</span>
          </button>

          <button 
            className={`site-btn ${activeSite === 'Ecosystem' ? 'active' : ''}`}
            onClick={() => setActiveSite('Ecosystem')}
            style={{background: activeSite === 'Ecosystem' ? 'linear-gradient(135deg, rgba(31, 149, 200, 0.2) 0%, rgba(129, 205, 41, 0.2) 100%)' : 'transparent', border: activeSite === 'Ecosystem' ? '1px solid rgba(129, 205, 41, 0.3)' : '1px solid transparent'}}
          >
            <div style={{display: 'flex', alignItems: 'center', gap: '12px', color: activeSite === 'Ecosystem' ? '#81cd29' : 'var(--text-secondary)'}}>
              <span style={{fontSize: '1.2rem'}}>✨</span> Hệ Sinh Thái <span className="text-gradient-brand">MinhQuang28</span>
            </div>
          </button>
          
          {websites.map(site => {
            const hasData = visits.some(v => v.website === site.domain);
            return (
              <div key={site.id} className="site-btn-wrapper" style={{position: 'relative', display: 'flex', alignItems: 'center'}}>
                <button 
                  className={`site-btn ${activeSite === site.domain ? 'active' : ''}`}
                  onClick={() => setActiveSite(site.domain)}
                  style={{ flex: 1, paddingRight: '40px' }}
                >
                  <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', flex: 1}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '8px', color: 'white', fontWeight: '600'}}>
                      <Globe size={16} /> {site.name}
                    </div>
                    {isAdmin && site.ownerEmail && (
                      <div style={{fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px', wordBreak: 'break-all'}}>
                        {site.ownerEmail}
                      </div>
                    )}
                    <div className={`status-indicator ${hasData ? 'success' : 'waiting'}`} style={{marginTop: isAdmin && site.ownerEmail ? '4px' : 0}}>
                      {hasData ? <><CheckCircle size={12} /> Đã nhận mã</> : <><Loader2 size={12} className="spin" /> Đang chờ mã...</>}
                    </div>
                  </div>
                </button>
                <button className="delete-site-btn" onClick={(e) => handleDeleteWebsite(e, site.id, site.domain)} title="Xóa Website">
                  <Trash2 size={16} />
                </button>
              </div>
            )
          })}
        </div>
        
        <div style={{marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '10px'}}>
          
          <div style={{display: 'flex', gap: '10px'}}>
            <button className="btn-cancel" onClick={() => setShowSettingsModal(true)} style={{padding: '12px', flex: '0 0 auto'}} title="Cấu hình">
              <Settings size={18} />
            </button>
            <button className="btn-primary" onClick={copyTrackingCode} style={{flex: 1, justifyContent: 'center'}}>
              <Code size={18} /> Lấy Mã
            </button>
          </div>

          <button onClick={handleLogout} className="btn-cancel" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', color: 'var(--text-secondary)'}}>
            <LogOut size={16} /> {user.email}
          </button>

        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {activeSite === 'Ecosystem' ? (
          <Ecosystem />
        ) : (
          <>
            <header className="header">
              <div>
                <h1>{getActiveSiteName()}</h1>
                <p style={{color: 'var(--text-secondary)', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px'}}>
                  <Activity size={16} className="pulse" color="var(--success)" /> 
                  Theo dõi gian lận (Luật: &gt;{config.maxClicks} click / {config.timeWindowHours}h)
                </p>
              </div>
              <div>
                <DateFilter dateRange={dateRange} setDateRange={setDateRange} />
              </div>
            </header>

        <div className="stats-grid">
          <div className="stat-card glass-panel">
            <div className="stat-title"><Globe size={18} /> Lượt truy cập (Theo bộ lọc)</div>
            <div className="stat-value">{filteredVisits.length}</div>
          </div>
          <div className="stat-card glass-panel" style={{borderColor: blacklistIPs.length > 0 ? 'var(--danger-glow)' : 'var(--panel-border)'}}>
            <div className="stat-title"><AlertTriangle size={18} color="var(--danger)" /> IP Bị Đưa Vào Sổ Đen</div>
            <div className={`stat-value ${blacklistIPs.length > 0 ? 'danger' : ''}`}>{blacklistIPs.length}</div>
          </div>
        </div>

        <div className="tables-grid">
          <div className="panel glass-panel" style={{gridColumn: '1 / -1', padding: 0, overflow: 'hidden'}}>
            
            <div className="smart-table-header">
              <div style={{display: 'flex', alignItems: 'center', gap: '12px', padding: '24px 28px 16px', borderBottom: '1px solid var(--panel-border)'}}>
                <Filter size={20} color="var(--text-secondary)" />
                <div className="filter-tabs">
                  <button className={`filter-tab ${ipFilter === 'all' ? 'active' : ''}`} onClick={() => setIpFilter('all')}>
                    Tất cả <span className="tab-count">{counts.all}</span>
                  </button>
                  <button className={`filter-tab valid ${ipFilter === 'valid' ? 'active' : ''}`} onClick={() => setIpFilter('valid')}>
                    Bình thường <span className="tab-count">{counts.valid}</span>
                  </button>
                  <button className={`filter-tab warning ${ipFilter === 'warning' ? 'active' : ''}`} onClick={() => setIpFilter('warning')}>
                    Nghi vấn <span className="tab-count">{counts.warning}</span>
                  </button>
                  <button className={`filter-tab danger ${ipFilter === 'blacklisted' ? 'active' : ''}`} onClick={() => setIpFilter('blacklisted')}>
                    Sổ Đen <span className="tab-count">{counts.blacklisted}</span>
                  </button>
                </div>
                
                <div style={{marginLeft: 'auto', display: 'flex', gap: '10px'}}>
                  {displayVisits.length > 0 && (
                     <button className="add-btn-small" style={{background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid var(--danger-glow)'}} onClick={handleClearAllData}>
                       <Trash2 size={14} /> Dọn rác
                     </button>
                  )}
                  {(ipFilter === 'blacklisted' || ipFilter === 'all') && blacklistIPs.length > 0 && (
                     <button className="btn-danger" onClick={copyBlacklist}>
                       <Copy size={16} /> Copy IP Sổ Đen
                     </button>
                  )}
                </div>
              </div>
            </div>

            <div className="table-container" style={{overflowX: 'auto', padding: '0 28px 28px'}}>
              {loading ? (
                <div className="empty-state pulse" style={{padding: '40px 0'}}>Đang tải dữ liệu...</div>
              ) : displayVisits.length === 0 ? (
                <div className="empty-state" style={{padding: '60px 0', textAlign: 'center'}}>
                  <ShieldCheck size={48} color="var(--text-muted)" style={{opacity: 0.3, margin: '0 auto 16px'}} />
                  <p style={{color: 'var(--text-secondary)'}}>Chưa có dữ liệu nào trong khoảng thời gian này.</p>
                </div>
              ) : (
                <table style={{marginTop: '16px'}}>
                  <thead>
                    <tr>
                      <th>IP / Thiết bị</th>
                      <th>Nhà mạng (ISP)</th>
                      <th>Vị trí</th>
                      <th>Thời gian</th>
                      {activeSite === 'All' && <th>Dự án</th>}
                      <th>Trạng thái</th>
                      <th style={{width: '40px'}}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayVisits.slice(0, 100).map(visit => {
                      const count = ipStats[visit.ip]?.count || 1;
                      const category = getVisitCategory(visit);
                      const isVPN = isSuspiciousISP(visit.isp) || visit.isProxy;
                      const device = parseDevice(visit.userAgent);
                      
                      return (
                        <tr key={visit.id} className={category === 'blacklisted' ? 'row-danger' : category === 'warning' ? 'row-warning' : ''}>
                          <td>
                            <strong style={{fontSize: '1.05rem', color: category === 'blacklisted' ? '#fca5a5' : 'white'}}>{visit.ip}</strong>
                            <div style={{display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px'}}>
                              {device.icon} {device.type} ({device.browser})
                            </div>
                          </td>
                          <td>
                            <div style={{fontWeight: '500', color: isVPN ? '#fca5a5' : 'var(--text-secondary)'}}>
                              {visit.isp || 'Đang cập nhật...'}
                            </div>
                            {isVPN && (
                              <div style={{fontSize: '0.75rem', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px'}}>
                                <ServerCrash size={12}/> VPN / Cloud
                              </div>
                            )}
                          </td>
                          <td>{visit.city || '---'}</td>
                          <td style={{fontVariantNumeric: 'tabular-nums'}}>{formatTime(visit.timestamp).split(' ')[0]}</td>
                          {activeSite === 'All' && <td>{websites.find(w=>w.domain===visit.website)?.name || visit.website}</td>}
                          <td>
                            {category === 'blacklisted' ? (
                              <span className="badge danger">Click Tặc ({count})</span>
                            ) : category === 'warning' ? (
                              <span className="badge warning">Nghi vấn ({count})</span>
                            ) : (
                              <span className="badge success">Hợp lệ</span>
                            )}
                          </td>
                          <td>
                            <button className="delete-row-btn" onClick={() => handleDeleteVisit(visit.id, visit.ip)} title="Xóa lượt click này khỏi bảng">
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
        </>
        )}
      </main>

      {/* Add Website Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 style={{marginBottom: '20px', fontSize: '1.5rem', fontWeight: '800'}}>Thêm Website</h2>
            <form onSubmit={handleAddWebsite}>
              <div style={{marginBottom: '16px'}}>
                <label style={{display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px'}}>Tên hiển thị (Tùy chọn)</label>
                <input type="text" className="input-field" placeholder="VD: Khách VIP 1..." value={newName} onChange={e => setNewName(e.target.value)} autoFocus />
              </div>
              <div style={{marginBottom: '16px'}}>
                <label style={{display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px'}}>Tên miền website (Bắt buộc)</label>
                <input type="text" className="input-field" placeholder="VD: capdongbactrungnam.com" value={newDomain} onChange={e => setNewDomain(e.target.value)} required />
              </div>
              <div style={{display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px'}}>
                <button type="button" className="btn-cancel" onClick={() => setShowAddModal(false)}>Hủy</button>
                <button type="submit" className="btn-primary">Thêm</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 style={{marginBottom: '20px', fontSize: '1.5rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px'}}>
              <Settings size={24} color="var(--accent-blue)" /> Cấu hình Tần suất
            </h2>
            <p style={{color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.9rem', lineHeight: '1.5'}}>
              Thiết lập quy luật nhận diện Click tặc. (Ví dụ: &gt; 2 clicks)
            </p>
            <form onSubmit={handleSaveSettings}>
              <div style={{marginBottom: '20px'}}>
                <label style={{display: 'block', fontSize: '0.9rem', fontWeight: '600', color: 'white', marginBottom: '8px'}}>Số lượt click tối đa cho phép</label>
                <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                  <input type="number" className="input-field" min="1" max="50" style={{width: '100px', fontSize: '1.2rem', fontWeight: '700'}} value={tempConfig.maxClicks} onChange={e => setTempConfig({...tempConfig, maxClicks: parseInt(e.target.value)})} required />
                  <span style={{color: 'var(--text-secondary)'}}>clicks</span>
                </div>
              </div>

              <div style={{marginBottom: '20px'}}>
                <label style={{display: 'block', fontSize: '0.9rem', fontWeight: '600', color: 'white', marginBottom: '8px'}}>Trong khoảng thời gian</label>
                <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                  <input type="number" className="input-field" min="1" max="720" style={{width: '100px', fontSize: '1.2rem', fontWeight: '700'}} value={tempConfig.timeWindowHours} onChange={e => setTempConfig({...tempConfig, timeWindowHours: parseInt(e.target.value)})} required />
                  <span style={{color: 'var(--text-secondary)'}}>giờ</span>
                </div>
              </div>

              <div style={{display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '32px'}}>
                <button type="button" className="btn-cancel" onClick={() => { setTempConfig({...config}); setShowSettingsModal(false); }}>Đóng</button>
                <button type="submit" className="btn-primary">Lưu Cấu Hình</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Get Code Modal */}
      {showCodeModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{maxWidth: '650px'}}>
            <h2 style={{marginBottom: '10px', fontSize: '1.5rem', fontWeight: '800'}}>Lấy Mã Theo Dõi</h2>
            <p style={{color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.95rem'}}>
              Chọn loại nền tảng website của bạn để lấy đoạn mã phù hợp nhất.
            </p>
            
            <div style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
              {/* Option 1 */}
              <div style={{background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '20px', borderRadius: '16px'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px'}}>
                  <div>
                    <h3 style={{fontSize: '1.15rem', color: 'white', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px'}}><Globe size={18} color="#81cd29"/> HTML thuần / Blogger / WordPress</h3>
                    <p style={{fontSize: '0.85rem', color: 'var(--text-secondary)'}}>Sử dụng thư viện truyền thống, tương thích 100% với mọi nền tảng kể cả chạy thử trên máy tính (file://).</p>
                  </div>
                  <button className="btn-primary" onClick={() => copySpecificCode('compat')} style={{padding: '8px 16px', fontSize: '0.9rem', flex: '0 0 auto', marginLeft: '12px', background: 'linear-gradient(135deg, rgba(129, 205, 41, 0.8) 0%, rgba(31, 149, 200, 0.8) 100%)'}}>
                    <Copy size={14} /> Copy Mã
                  </button>
                </div>
              </div>

              {/* Option 2 */}
              <div style={{background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)', padding: '20px', borderRadius: '16px'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px'}}>
                  <div>
                    <h3 style={{fontSize: '1.15rem', color: 'white', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px'}}><Zap size={18} color="#facc15"/> Web Framework (React, NextJS, Vite)</h3>
                    <p style={{fontSize: '0.85rem', color: 'var(--text-secondary)'}}>Sử dụng chuẩn ES Module hiện đại, tối ưu tốc độ tải trang cho các dự án code tay mới nhất.</p>
                  </div>
                  <button className="btn-primary" onClick={() => copySpecificCode('module')} style={{padding: '8px 16px', fontSize: '0.9rem', flex: '0 0 auto', marginLeft: '12px', background: 'linear-gradient(135deg, rgba(250, 204, 21, 0.8) 0%, rgba(245, 158, 11, 0.8) 100%)'}}>
                    <Copy size={14} /> Copy Mã
                  </button>
                </div>
              </div>
            </div>

            <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: '30px'}}>
              <button className="btn-cancel" onClick={() => setShowCodeModal(false)}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
