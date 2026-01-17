import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  FileSpreadsheet,
  BarChart3,
  Settings,
  Users,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Calendar,
  BookOpen,
  FileText,
  CreditCard,
  Banknote,
  Package,
} from 'lucide-react';
import React,{ useState } from 'react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'My Desk', href: '/desk', icon: FileText },
  { name: 'Budget Entries', href: '/budget', icon: FileSpreadsheet },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  { name: 'Object Codes', href: '/object-codes', icon: BookOpen },
  { name: 'Fiscal Years', href: '/fiscal-years', icon: Calendar },
  { name: 'Contingent Bills', href: '/contingent-bills', icon: FileText },
  { name: 'Sanction Orders', href: '/sanction-orders', icon: FileText, roleOnly: ['AccountOfficer'] },
  { name: 'Purchase Orders', href: '/purchase-orders', icon: Package },
  { name: 'Schedule of Payments', href: '/schedule-of-payments', icon: Banknote },
  { name: 'Cheques', href: '/asaan-cheques', icon: CreditCard },
  { name: 'User Management', href: '/users', icon: Users, adminOnly: true },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filteredNav = navigation.filter((item) => {
    if (item.adminOnly && user?.role !== 'Admin') return false;
    if (item.roleOnly && !item.roleOnly.includes(user?.role)) return false;
    return true;
  });

  return (
    <aside
      className={`${
        collapsed ? 'w-20' : 'w-72'
      } bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 min-h-screen flex flex-col transition-all duration-300 border-r border-slate-700/50`}
    >
      {/* Logo Section */}
      <div className="p-5 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/20 flex-shrink-0">
            <img src="/logo.jpg" alt="RIC Logo" className="w-full h-full object-cover rounded-xl" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="text-white font-bold text-lg leading-tight">RIC Finance</h1>
              <p className="text-slate-400 text-xs">Management System</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1.5">
        {filteredNav.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive
                  ? 'bg-gradient-to-r from-teal-500/20 to-blue-500/20 text-teal-400 border border-teal-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="font-medium">{item.name}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-slate-700/50">
        {!collapsed && (
          <div className="mb-4 p-3 bg-slate-800/50 rounded-xl">
            <p className="text-white font-medium text-sm truncate">{user?.fullName}</p>
            <p className="text-slate-400 text-xs truncate">{user?.email}</p>
            <span className="inline-block mt-2 px-2 py-0.5 bg-teal-500/20 text-teal-400 text-xs font-medium rounded-full">
              {user?.role}
            </span>
          </div>
        )}

        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 ${
            collapsed ? 'justify-center' : ''
          }`}
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute top-24 -right-3 w-6 h-6 bg-slate-700 hover:bg-slate-600 rounded-full flex items-center justify-center text-slate-300 transition-colors shadow-lg border border-slate-600"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </aside>
  );
}
