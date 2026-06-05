/** Centralized toast styling for react-hot-toast */
export const erpToastOptions = {
  position: 'top-right',
  duration: 4000,
  style: {
    borderRadius: '4px',
    background: '#1a1a1a',
    color: '#fff',
    border: '1px solid #2d2d2d',
    fontSize: '12px',
    fontWeight: '500',
    padding: '10px 14px',
    maxWidth: '360px',
  },
  success: {
    iconTheme: { primary: '#15803d', secondary: '#fff' },
    style: { background: '#14532d', border: '1px solid #166534' },
  },
  error: {
    iconTheme: { primary: '#fca5a5', secondary: '#fff' },
    style: { background: '#7f1d1d', border: '1px solid #991b1b' },
  },
  loading: {
    style: { background: '#374151', border: '1px solid #4b5563' },
  },
};
