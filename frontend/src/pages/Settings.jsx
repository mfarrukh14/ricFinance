import React,{ useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  User,
  Lock,
  Shield,
  Mail,
  Building2,
  Save,
  AlertCircle,
  CheckCircle,
  Settings as SettingsIcon,
} from 'lucide-react';

export default function Settings() {
  const { user } = useAuth();
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await api.changePassword(passwordData.currentPassword, passwordData.newPassword);
      setSuccess('Password changed successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your account settings and preferences</p>
      </div>

      {/* Profile Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <User className="w-5 h-5 text-teal-500" />
            Profile Information
          </h2>
        </div>
        <div className="p-6">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-blue-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-xl shadow-teal-500/20">
              {user?.fullName?.charAt(0) || 'U'}
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{user?.fullName}</h3>
              <p className="text-slate-500 dark:text-slate-400">{user?.email}</p>
              <span className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 bg-teal-100 text-teal-700 text-xs font-semibold rounded-full">
                <Shield className="w-3.5 h-3.5" />
                {user?.role}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-transparent dark:border-slate-800">
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300 mb-1">
                <User className="w-4 h-4" />
                <span className="text-sm font-medium">Username</span>
              </div>
              <p className="text-slate-800 dark:text-slate-100 font-semibold pl-7">{user?.username}</p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-transparent dark:border-slate-800">
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300 mb-1">
                <Mail className="w-4 h-4" />
                <span className="text-sm font-medium">Email</span>
              </div>
              <p className="text-slate-800 dark:text-slate-100 font-semibold pl-7">{user?.email}</p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-transparent dark:border-slate-800">
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300 mb-1">
                <Building2 className="w-4 h-4" />
                <span className="text-sm font-medium">Department</span>
              </div>
              <p className="text-slate-800 dark:text-slate-100 font-semibold pl-7">{user?.department || 'Not specified'}</p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-transparent dark:border-slate-800">
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300 mb-1">
                <Shield className="w-4 h-4" />
                <span className="text-sm font-medium">Role</span>
              </div>
              <p className="text-slate-800 dark:text-slate-100 font-semibold pl-7">{user?.role}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Lock className="w-5 h-5 text-teal-500" />
            Change Password
          </h2>
        </div>
        <div className="p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-700">
              <CheckCircle className="w-5 h-5" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-5 max-w-md">
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5">Current Password</label>
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100"
                placeholder="Enter current password"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5">New Password</label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100"
                placeholder="Enter new password"
                required
                minLength={6}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1.5">Confirm New Password</label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 transition-all bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100"
                placeholder="Confirm new password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl hover:from-teal-600 hover:to-teal-700 transition-all font-medium flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>

      {/* System Info */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-teal-500" />
            System Information
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-teal-50 to-blue-50 dark:from-slate-950 dark:to-slate-900 rounded-xl border border-transparent dark:border-slate-800">
              <p className="text-3xl font-bold text-teal-600">v1.0.0</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Application Version</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-slate-950 dark:to-slate-900 rounded-xl border border-transparent dark:border-slate-800">
              <p className="text-3xl font-bold text-purple-600">.NET 9</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Backend Framework</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-950 dark:to-slate-900 rounded-xl border border-transparent dark:border-slate-800">
              <p className="text-3xl font-bold text-amber-600">React 19</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Frontend Framework</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
