// Pure helpers + re-exports of hooks/providers (which live in calimara.jsx because they use JSX).
export {
  useReducedMotion,
  useSettings,
  SettingsProvider,
  useCart,
  CartProvider,
} from '@/lib/calimara.jsx';

export const formatPrice = (n, currency = 'RON') => `${Number(n || 0).toFixed(0)} ${currency}`;
export const formatDate = (d) => {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString('ro-RO', { day: '2-digit', month: 'long', year: 'numeric' });
  } catch { return d; }
};
export const formatMonthYear = (d) => {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString('ro-RO', { month: 'long', year: 'numeric' });
  } catch { return d; }
};
export const formatDateShort = (d) => {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
  } catch { return d; }
};
export const hasImage = (url) => typeof url === 'string' && url.length > 0;