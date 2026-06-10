import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI, cartAPI } from '../api';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [user, setUser] = useState(() => {
    const s = localStorage.getItem('fm_user');
    return s ? JSON.parse(s) : null;
  });
  const [cart, setCart] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2500);
  };

  const fetchCart = useCallback(async (userId) => {
    try { const r = await cartAPI.get(userId); setCart(r.data); } catch {}
  }, []);

  useEffect(() => { if (user) fetchCart(user.id); }, [user, fetchCart]);

  const login = async (username, password) => {
    const res = await authAPI.login({ username, password });
    const u = res.data.user;
    setUser(u);
    localStorage.setItem('fm_user', JSON.stringify(u));
    await fetchCart(u.id);
    return u;
  };

  const register = async (data) => {
    await authAPI.register(data);
    return login(data.username, data.password);
  };

  const logout = () => {
    setUser(null); setCart(null);
    localStorage.removeItem('fm_user');
  };

  const addToCart = async (productId, quantity = 1) => {
    if (!user) return showToast('Please login first', 'error');
    const r = await cartAPI.add(user.id, { product_id: productId, quantity });
    setCart(r.data);
    showToast('Added to cart!');
  };

  const updateCartItem = async (itemId, quantity) => {
    const r = await cartAPI.update(user.id, itemId, { quantity });
    setCart(r.data);
  };

  const removeCartItem = async (itemId) => {
    const r = await cartAPI.remove(user.id, itemId);
    setCart(r.data);
    showToast('Item removed');
  };

  const clearCart = async () => {
    const r = await cartAPI.clear(user.id);
    setCart(r.data);
  };

  return (
    <AppContext.Provider value={{ user, cart, toast, login, register, logout,
      addToCart, updateCartItem, removeCartItem, clearCart, fetchCart, showToast }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);