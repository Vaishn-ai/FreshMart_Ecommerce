import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Layout } from '../components/Layout';
import { userAPI, orderAPI } from '../api';
import '../style/Profile.css';

const STATUS = {
  in_transit: { label: 'In Transit', cls: 'status--transit' },
  delivered:  { label: 'Delivered',  cls: 'status--delivered' },
  confirmed:  { label: 'Confirmed',  cls: 'status--confirmed' },
  pending:    { label: 'Pending',    cls: 'status--pending' },
  cancelled:  { label: 'Cancelled', cls: 'status--cancelled' },
};

const ORDER_ICON = {
  in_transit: 'local_shipping',
  delivered:  'check_circle',
  confirmed:  'inventory_2',
  pending:    'schedule',
  cancelled:  'cancel',
};

const CARD_COLORS = {
  VISA:       '#1A1F71',
  Mastercard: '#EB001B',
  Amex:       '#007BC1',
};

export default function Profile() {
  const { user, logout } = useApp();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    Promise.all([
      orderAPI.list(user.id),
      userAPI.addresses(user.id),
      userAPI.paymentMethods(user.id),
    ]).then(([o, a, p]) => {
      setOrders(o.data);
      setAddresses(a.data);
      setPayments(p.data);
    });
  }, [user, navigate]);

  if (!user) return null;

  const profile = user.profile || {};
  const avatarUrl = profile.avatar_url ||
    `https://ui-avatars.com/api/?name=${user.first_name}+${user.last_name}&background=006e2f&color=fff&size=128`;
  const membership = (profile.membership || 'member');
  const membershipLabel = membership.charAt(0).toUpperCase() + membership.slice(1);
  const points = (profile.points || 0).toLocaleString();
  const wallet = `₹${parseFloat(profile.wallet_balance || 0).toFixed(2)}`;
  const rewardPct = Math.min(100, Math.round(((parseFloat(profile.wallet_balance || 0) % 50) / 50) * 100)) || 75;

  return (
    <Layout>
      <div className="profile">

        {/* ── Hero ── */}
        <section className="profile-hero">
          <div className="profile-hero__avatar-ring">
            <img src={avatarUrl} alt="Profile" className="profile-hero__avatar" />
            <span className="profile-hero__online" aria-hidden="true" />
          </div>
          <div className="profile-hero__info">
            <h1 className="profile-hero__name">{user.first_name} {user.last_name}</h1>
            <span className="profile-hero__badge">{membershipLabel} Member</span>
            <p className="profile-hero__email">{user.email}</p>
          </div>
          <div className="profile-stats">
            {[['Orders', orders.length, 'receipt_long'], ['Points', points, 'stars'], ['Wallet', wallet, 'account_balance_wallet']].map(([label, val, icon]) => (
              <div key={label} className="profile-stat">
                <span className="material-symbols-outlined profile-stat__icon">{icon}</span>
                <span className="profile-stat__val">{val}</span>
                <span className="profile-stat__label">{label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Rewards card ── */}
        <section className="rewards-card">
          <div className="rewards-card__left">
            <span className="rewards-card__eyebrow">Organic Rewards</span>
            <h2 className="rewards-card__heading">₹50 away from your next ₹10 credit!</h2>
          </div>
          <div className="rewards-card__bar-wrap">
            <div className="rewards-card__bar">
              <div className="rewards-card__fill" style={{ width: `${rewardPct}%` }} />
            </div>
            <span className="rewards-card__pct">{rewardPct}% complete</span>
          </div>
          <div className="rewards-card__deco" aria-hidden="true" />
        </section>

        {/* ── Orders ── */}
        <section className="profile-section">
          <div className="profile-section__header">
            <span className="material-symbols-outlined profile-section__icon">shopping_basket</span>
            <h2 className="profile-section__title">My Orders</h2>
          </div>
          {orders.length === 0 ? (
            <div className="profile-empty">
              <span className="material-symbols-outlined profile-empty__icon">receipt_long</span>
              <p>No orders yet</p>
            </div>
          ) : (
            <div className="orders-list">
              {orders.slice(0, 4).map(order => {
                const st = STATUS[order.status] || STATUS.pending;
                const icon = ORDER_ICON[order.status] || 'receipt_long';
                return (
                  <div key={order.id} className="order-row">
                    <div className="order-row__icon-wrap">
                      <span className="material-symbols-outlined">{icon}</span>
                    </div>
                    <div className="order-row__body">
                      <p className="order-row__num">Order #{order.order_number}</p>
                      <p className="order-row__meta">{order.items_count} items</p>
                    </div>
                    <div className="order-row__right">
                      <span className="order-row__total">₹{parseFloat(order.total_amount).toFixed(2)}</span>
                      <span className={`status-chip ${st.cls}`}>{st.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ── Addresses ── */}
        <section className="profile-section">
          <div className="profile-section__header">
            <span className="material-symbols-outlined profile-section__icon">location_on</span>
            <h2 className="profile-section__title">Saved Addresses</h2>
            <button className="profile-section__add" aria-label="Add address">
              <span className="material-symbols-outlined">add</span>
            </button>
          </div>
          <div className="address-list">
            {addresses.map(addr => (
              <div key={addr.id} className={`address-card ${addr.is_default ? 'address-card--default' : ''}`}>
                <div className="address-card__icon-wrap">
                  <span className="material-symbols-outlined">{addr.icon || 'home'}</span>
                </div>
                <div className="address-card__body">
                  <p className="address-card__label">{addr.label}</p>
                  <p className="address-card__line">{addr.line1}, {addr.city}, {addr.state}</p>
                </div>
                {addr.is_default && <span className="address-card__default-badge">Default</span>}
              </div>
            ))}
          </div>
        </section>

        {/* ── Payment Methods ── */}
        <section className="profile-section">
          <div className="profile-section__header">
            <span className="material-symbols-outlined profile-section__icon">credit_card</span>
            <h2 className="profile-section__title">Payment Methods</h2>
            <button className="profile-section__add" aria-label="Add payment method">
              <span className="material-symbols-outlined">add</span>
            </button>
          </div>
          <div className="payment-list">
            {payments.map(pm => (
              <div key={pm.id} className="payment-card">
                <div
                  className="payment-card__logo"
                  style={{ background: CARD_COLORS[pm.card_type] || '#3d4a3d' }}
                >
                  <span className="payment-card__type">{pm.card_type}</span>
                </div>
                <div className="payment-card__body">
                  <p className="payment-card__num">•••• •••• •••• {pm.last_four}</p>
                  {pm.expiry && <p className="payment-card__expiry">Expires {pm.expiry}</p>}
                </div>
                <span className="material-symbols-outlined payment-card__chevron">chevron_right</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Menu links ── */}
        <section className="profile-menu">
          {[
            ['notifications', 'Notifications'],
            ['help', 'Help & Support'],
            ['privacy_tip', 'Privacy Policy'],
          ].map(([icon, label]) => (
            <button key={label} className="profile-menu__item">
              <span className="material-symbols-outlined profile-menu__item-icon">{icon}</span>
              <span className="profile-menu__item-label">{label}</span>
              <span className="material-symbols-outlined profile-menu__item-chevron">chevron_right</span>
            </button>
          ))}
        </section>

        {/* ── Logout ── */}
        <button
          className="btn-logout"
          onClick={() => { logout(); navigate('/'); }}
        >
          <span className="material-symbols-outlined">logout</span>
          Logout from FreshMart
        </button>

      </div>
    </Layout>
  );
}