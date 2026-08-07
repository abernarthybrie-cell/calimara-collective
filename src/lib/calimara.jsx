import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { db } from '@/api/client';

/* ----------------------------- Reduced motion ----------------------------- */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === 'undefined') return false;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    return mq.matches || localStorage.getItem('calimara.reduceMotion') === '1';
  });
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => {
      const want = mq.matches || localStorage.getItem('calimara.reduceMotion') === '1';
      setReduced(want);
      document.documentElement.classList.toggle('reduce-motion', want);
    };
    apply();
    mq.addEventListener?.('change', apply);
    return () => mq.removeEventListener?.('change', apply);
  }, []);
  const toggle = useCallback(() => {
    const next = !(localStorage.getItem('calimara.reduceMotion') === '1');
    localStorage.setItem('calimara.reduceMotion', next ? '1' : '0');
    setReduced(next);
    document.documentElement.classList.toggle('reduce-motion', next);
  }, []);
  return { reduced, toggle };
}

/* ------------------------------- Site settings ---------------------------- */
const SettingsCtx = createContext({ settings: null, loading: true });
export const useSettings = () => useContext(SettingsCtx);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let alive = true;
    db.entities.SiteSettings.list()
      .then((rows) => alive && setSettings(rows[0] || null))
      .catch(() => alive && setSettings(null))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, []);
  return <SettingsCtx.Provider value={{ settings, loading }}>{children}</SettingsCtx.Provider>;
}

/* --------------------------------- Cart ----------------------------------- */
const CartCtx = createContext(null);
export const useCart = () => useContext(CartCtx);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('calimara.cart') || '[]'); } catch { return []; }
  });
  useEffect(() => { localStorage.setItem('calimara.cart', JSON.stringify(items)); }, [items]);

  const add = useCallback((product) => {
    setItems((prev) => {
      const found = prev.find((i) => i.slug === product.slug);
      if (found) return prev.map((i) => i.slug === product.slug ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { slug: product.slug, name: product.name, price: product.price, object_number: product.object_number, qty: 1 }];
    });
  }, []);
  const remove = useCallback((slug) => setItems((prev) => prev.filter((i) => i.slug !== slug)), []);
  const setQty = useCallback((slug, qty) => setItems((prev) => prev.map((i) => i.slug === slug ? { ...i, qty: Math.max(1, qty) } : i)), []);
  const clear = useCallback(() => setItems([]), []);
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const count = items.reduce((s, i) => s + i.qty, 0);

  return (
    <CartCtx.Provider value={{ items, add, remove, setQty, clear, subtotal, count }}>
      {children}
    </CartCtx.Provider>
  );
}