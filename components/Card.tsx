
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = "" }) => (
  <div className={`bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden transition-all duration-300 ${className}`}>
    {children}
  </div>
);

export const Badge: React.FC<{ text: string; color?: string }> = ({ text, color = "bg-blue-100 text-blue-700" }) => (
  <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${color}`}>
    {text}
  </span>
);
