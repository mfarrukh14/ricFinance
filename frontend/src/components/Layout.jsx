import { Outlet } from 'react-router-dom';
import React from 'react';
import Sidebar from './Sidebar';
import { Bell, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full pl-12 pr-4 py-2.5 bg-slate-100 border-0 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2.5 hover:bg-slate-100 rounded-xl transition-colors">
              <Bell className="w-5 h-5 text-slate-600" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-semibold shadow-lg shadow-teal-500/20">
                {user?.fullName?.charAt(0) || 'U'}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-slate-700">{user?.fullName}</p>
                <p className="text-xs text-slate-500">{user?.role}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
