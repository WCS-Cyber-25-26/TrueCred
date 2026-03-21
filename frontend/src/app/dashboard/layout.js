"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { LogOut } from 'lucide-react';

function ShieldIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2L3 7V12C3 16.55 7.08 20.74 12 22C16.92 20.74 21 16.55 21 12V7L12 2Z"
        stroke="#60a5fa"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 12L11 14L15 10"
        stroke="#60a5fa"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [logoutHover, setLogoutHover] = useState(false);

  useEffect(() => {
    const match = document.cookie.match(/(^| )user_info=([^;]+)/);
    if (!match) {
      router.replace('/login');
    } else {
      setChecked(true);
    }
  }, []);

  if (!checked) return null;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#020817' }}>
      <header
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4"
        style={{
          backgroundColor: '#020817',
          borderBottom: '1px solid rgba(37,99,235,0.2)',
        }}
      >
        {/* Logo */}
        <Link href="/" className="inline-flex items-center gap-2">
          <ShieldIcon />
          <span
            className="font-bold text-white text-xl tracking-tight"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            TrueCred
          </span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {user && (
            <>
              <span
                className="text-sm hidden sm:block"
                style={{ color: '#94a3b8', fontFamily: "'DM Sans', sans-serif" }}
              >
                {user.email}
              </span>
              <span
                className="text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-md"
                style={{
                  backgroundColor: 'rgba(37,99,235,0.15)',
                  border: '1px solid rgba(37,99,235,0.3)',
                  color: '#60a5fa',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {user.role}
              </span>
            </>
          )}
          <button
            onClick={logout}
            className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors duration-200"
            style={{
              color: logoutHover ? '#f87171' : '#64748b',
              fontFamily: "'DM Sans', sans-serif",
            }}
            onMouseEnter={() => setLogoutHover(true)}
            onMouseLeave={() => setLogoutHover(false)}
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:block">Logout</span>
          </button>
        </div>
      </header>

      <div className="pt-16">{children}</div>
    </div>
  );
}
