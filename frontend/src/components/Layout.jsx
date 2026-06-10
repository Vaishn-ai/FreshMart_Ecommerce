import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const NAV = [
  { path: '/', label: 'Home', icon: 'home' },
  { path: '/browse', label: 'Browse', icon: 'search' },
  { path: '/cart', label: 'Cart', icon: 'shopping_basket' },
  { path: '/profile', label: 'Profile', icon: 'person' },
];

export function Header() {
  const { cart } = useApp();
  const loc = useLocation();
  const count = cart?.total_items || 0;

  return (
    <header className="fm-header">
      <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
        <span className="material-symbols-outlined" style={{ color:'#3d4a3d', cursor:'pointer' }}>menu</span>
        <Link to="/" style={{ textDecoration:'none' }}>
          <h1 style={{ fontSize:'1.25rem', fontWeight:800, color:'#006e2f' }}>FreshMart</h1>
        </Link>
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:'1.5rem' }}>
        <nav style={{ display:'flex', gap:'0.5rem' }}>
          {NAV.map(({ path, label }) => (
            <Link key={path} to={path} style={{
              textDecoration:'none', fontSize:'12px', fontWeight:600,
              padding:'4px 12px', borderRadius:'9999px',
              background: loc.pathname === path ? '#22c55e' : 'transparent',
              color: loc.pathname === path ? '#004b1e' : '#3d4a3d',
            }}>{label}</Link>
          ))}
        </nav>
        <Link to="/cart" style={{ position:'relative', textDecoration:'none' }}>
          <span className="material-symbols-outlined" style={{ color:'#3d4a3d' }}>shopping_cart</span>
          {count > 0 && (
            <span style={{ position:'absolute', top:-4, right:-4, background:'#ba1a1a', color:'#fff',
              fontSize:'10px', width:16, height:16, borderRadius:'50%',
              display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700 }}>
              {count}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}

export function BottomNav() {
  const loc = useLocation();
  const { cart } = useApp();
  const count = cart?.total_items || 0;

  return (
    <nav style={{ position:'fixed', bottom:0, width:'100%', zIndex:50, background:'#f8f9ff',
      borderTop:'1px solid #bccbb9', display:'flex', justifyContent:'space-around',
      alignItems:'center', height:'5rem' }}>
      {NAV.map(({ path, label, icon }) => {
        const active = loc.pathname === path;
        return (
          <Link key={path} to={path} style={{ display:'flex', flexDirection:'column', alignItems:'center',
            justifyContent:'center', padding:'4px 16px', borderRadius:'9999px', textDecoration:'none',
            background: active ? '#22c55e' : 'transparent', color: active ? '#004b1e' : '#5d5f5f' }}>
            <div style={{ position:'relative' }}>
              <span className="material-symbols-outlined"
                style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}>{icon}</span>
              {icon === 'shopping_basket' && count > 0 && (
                <span style={{ position:'absolute', top:-8, right:-8, background:'#ba1a1a', color:'#fff',
                  fontSize:'9px', width:14, height:14, borderRadius:'50%',
                  display:'flex', alignItems:'center', justifyContent:'center' }}>{count}</span>
              )}
            </div>
            <span style={{ fontSize:'11px', fontWeight:600 }}>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function Toast() {
  const { toast } = useApp();
  if (!toast) return null;
  return (
    <div style={{ position:'fixed', bottom:'6rem', left:'50%', transform:'translateX(-50%)',
      zIndex:100, padding:'12px 24px', borderRadius:'9999px', boxShadow:'0 4px 20px rgba(0,0,0,0.15)',
      display:'flex', alignItems:'center', gap:8, fontSize:'14px', fontWeight:600,
      background: toast.type === 'error' ? '#ba1a1a' : '#0b1c30', color:'#fff' }}>
      <span className="material-symbols-outlined" style={{ fontSize:18 }}>
        {toast.type === 'error' ? 'error' : 'check_circle'}
      </span>
      {toast.message}
    </div>
  );
}

export function Layout({ children }) {
  return (
    <div style={{ minHeight:'100vh', background:'#f8f9ff', paddingBottom:'6rem' }}>
      <Header />
      <main style={{ maxWidth:'1280px', margin:'0 auto', padding:'4rem 1rem 0' }}>
        {children}
      </main>
      <BottomNav />
      <Toast />
    </div>
  );
}