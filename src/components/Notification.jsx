import React from 'react';

const icons = {
  success: '✅',
  error: '❌',
  info: 'ℹ️',
  warning: '⚠️',
};

const colors = {
  success: { bg: '#e6ffed', border: '#34c759', color: '#155724' },
  error: { bg: '#ffe6e6', border: '#ff3b30', color: '#721c24' },
  info: { bg: '#e6f0ff', border: '#007aff', color: '#084298' },
  warning: { bg: '#fffbe6', border: '#ffcc00', color: '#856404' },
};

export default function Notification({ type = 'info', message, onClose }) {
  if (!message) return null;
  const style = {
    position: 'fixed',
    top: 24,
    right: 24,
    minWidth: 280,
    zIndex: 2000,
    background: colors[type].bg,
    color: colors[type].color,
    border: `1.5px solid ${colors[type].border}`,
    borderRadius: 8,
    padding: '16px 24px 16px 16px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    fontSize: 16,
    fontWeight: 500,
    transition: 'all 0.3s',
  };
  return (
    <div style={style}>
      <span style={{ fontSize: 22 }}>{icons[type]}</span>
      <span style={{ flex: 1 }}>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          color: colors[type].color,
          fontSize: 20,
          cursor: 'pointer',
          marginLeft: 8,
        }}
        aria-label="Đóng"
      >
        ×
      </button>
    </div>
  );
} 