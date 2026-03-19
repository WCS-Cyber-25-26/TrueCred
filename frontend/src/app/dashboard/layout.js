"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [checked, setChecked] = useState(false);

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
    <div className="min-h-screen bg-[#f1f5f9]">
      <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between fixed top-0 left-0 right-0 z-50 shadow-sm">
        <Link href="/">
          <span className="text-2xl font-black">
            <span className="text-black">True</span>
            <span className="text-[#043682]">Cred</span>
          </span>
        </Link>
        <div className="flex items-center gap-4">
          {user && (
            <>
              <span className="text-sm font-bold text-gray-600 hidden sm:block">{user.email}</span>
              <span className="text-xs font-black text-[#043682] bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider">
                {user.role}
              </span>
            </>
          )}
          <button
            onClick={logout}
            className="text-sm font-black text-gray-500 hover:text-red-600 transition-colors"
          >
            Logout
          </button>
        </div>
      </header>
      <div className="pt-16">{children}</div>
    </div>
  );
}
