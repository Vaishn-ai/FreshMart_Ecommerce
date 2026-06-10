import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Layout } from '../components/Layout';
import { orderAPI } from '../api';
import '../style/Cart.css';

function CartItem({ item, onUpdate, onRemove }) {
  const [removing, setRemoving] = useState(false);

  const handleRemove = async () => {
    setRemoving(true);
    await onRemove(item.id);
  };

  return (
    <div className={`cart-item ${removing ? 'cart-item--removing' : ''}`}>
      <div className="cart-item__img-wrap">
        <img src={item.product.image_url} alt={item.product.name} className="cart-item__img" />
      </div>
      <div className="cart-item__body">
        <div className="cart-item__top">
          <div className="cart-item__info">
            <h3 className="cart-item__name">{item.product.name}</h3>
            <p className="cart-item__unit">{item.product.unit}</p>
          </div>
          <button
            onClick={handleRemove}
            className="cart-item__remove"
            aria-label={`Remove ${item.product.name}`}
          >
            <span className="material-symbols-outlined">delete</span>
          </button>
        </div>
        <div className="cart-item__bottom">
          <span className="cart-item__price">₹{item.product.price}</span>
          <div className="qty-control">
            <button
              className="qty-control__btn"
              onClick={() => onUpdate(item.id, item.quantity - 1)}
              aria-label="Decrease quantity"
            >
              <span className="material-symbols-outlined">remove</span>
            </button>
            <span className="qty-control__val">{item.quantity}</span>
            <button
              className="qty-control__btn qty-control__btn--add"
              onClick={() => onUpdate(item.id, item.quantity + 1)}
              aria-label="Increase quantity"
            >
              <span className="material-symbols-outlined">add</span>
            </button>
          </div>
        </div>
        <p className="cart-item__line-total">
          Line total: <strong>₹{(parseFloat(item.product.price) * item.quantity).toFixed(2)}</strong>
        </p>
      </div>
    </div>
  );
}

export default function Cart() {
  const { cart, user, updateCartItem, removeCartItem, clearCart, showToast, fetchCart } = useApp();
  const navigate = useNavigate();
  const [placing, setPlacing] = useState(false);

  const subtotal = parseFloat(cart?.subtotal || 0);
  const delivery = 0;
  const tax = Math.round(subtotal * 0.07 * 100) / 100;
  const total = subtotal + delivery + tax;

  const handleCheckout = async () => {
    if (!user) return navigate('/login');
    setPlacing(true);
    try {
      await orderAPI.create(user.id, {});
      await fetchCart(user.id);
      showToast('Order placed successfully!');
      navigate('/profile');
    } catch {
      showToast('Failed to place order', 'error');
    } finally {
      setPlacing(false);
    }
  };

  /* ── Empty state ── */
  if (!cart || cart.items?.length === 0) {
    return (
      <Layout>
        <div className="cart-empty">
          <div className="cart-empty__icon-wrap">
            <span className="material-symbols-outlined cart-empty__icon">shopping_basket</span>
          </div>
          <h2 className="cart-empty__title">Your cart is empty</h2>
          <p className="cart-empty__sub">Add some fresh items to get started</p>
          <Link to="/browse" className="btn-browse">Browse Products</Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="cart">

        {/* ── Header ── */}
        <header className="cart__header">
          <div>
            <h1 className="cart__title">Your Cart</h1>
            <p className="cart__count">{cart.total_items} {cart.total_items === 1 ? 'item' : 'items'}</p>
          </div>
          <button onClick={clearCart} className="btn-clear-cart">
            <span className="material-symbols-outlined">delete_sweep</span>
            Clear all
          </button>
        </header>

        {/* ── Items list ── */}
        <section className="cart-items">
          {cart.items.map(item => (
            <CartItem
              key={item.id}
              item={item}
              onUpdate={updateCartItem}
              onRemove={removeCartItem}
            />
          ))}
        </section>

        {/* ── Promo placeholder ── */}
        <div className="cart-promo">
          <span className="material-symbols-outlined cart-promo__icon">confirmation_number</span>
          <input className="cart-promo__input" placeholder="Enter coupon code" />
          <button className="cart-promo__btn">Apply</button>
        </div>

        {/* ── Order summary ── */}
        <section className="cart-summary">
          <h2 className="cart-summary__title">Order Summary</h2>

          <div className="cart-summary__rows">
            <div className="cart-summary__row">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="cart-summary__row">
              <span>Delivery</span>
              <span className="cart-summary__free">FREE</span>
            </div>
            <div className="cart-summary__row">
              <span>Tax (7%)</span>
              <span>₹{tax.toFixed(2)}</span>
            </div>
          </div>

          <div className="cart-summary__divider" />

          <div className="cart-summary__total">
            <span>Total</span>
            <span className="cart-summary__total-val">₹{total.toFixed(2)}</span>
          </div>

          <button
            onClick={handleCheckout}
            disabled={placing}
            className={`btn-checkout ${placing ? 'btn-checkout--loading' : ''}`}
          >
            {placing ? (
              <>
                <span className="btn-checkout__spinner" />
                Placing Order…
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">shopping_cart_checkout</span>
                {user ? 'Place Order' : 'Login to Checkout'}
              </>
            )}
          </button>

          <p className="cart-summary__note">
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>lock</span>
            Secure checkout &nbsp;·&nbsp; Free returns
          </p>
        </section>

      </div>
    </Layout>
  );
}