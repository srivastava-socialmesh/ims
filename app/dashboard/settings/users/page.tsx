'use client';

import { useState } from 'react';
import { useUsers } from '@/lib/hooks/useUsers';
import { 
  UserPlus, 
  Edit, 
  Trash2, 
  Shield, 
  User, 
  UserCog, 
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Search,
  Filter,
  MoreVertical,
} from 'lucide-react';
import Link from 'next/link';

export default function UsersPage() {
  const { users, loading, error, currentUser, inviteUser, updateUserRole, updateUserStatus, removeUser } = useUsers();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  
  // Invite modal state
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState('worker');
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState('');

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [editRole, setEditRole] = useState('');

  const roleColors = {
    admin: 'bg-purple-100 text-purple-800',
    manager: 'bg-blue-100 text-blue-800',
    worker: 'bg-green-100 text-green-800',
  };

  const statusColors = {
    active: 'bg-green-100 text-green-800',
    suspended: 'bg-red-100 text-red-800',
    invited: 'bg-yellow-100 text-yellow-800',
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.auth_user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole ? user.role === filterRole : true;
    const matchesStatus = filterStatus ? user.status === filterStatus : true;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviting(true);
    setInviteError('');
    try {
      await inviteUser(inviteEmail, inviteRole, inviteName);
      setShowInviteModal(false);
      setInviteEmail('');
      setInviteName('');
      setInviteRole('worker');
    } catch (err: any) {
      setInviteError(err.message);
    } finally {
      setInviting(false);
    }
  };

  const handleEdit = (user: any) => {
    setEditingUser(user);
    setEditRole(user.role);
    setShowEditModal(true);
  };

  const handleUpdateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateUserRole(editingUser.id, editRole);
      setShowEditModal(false);
      setEditingUser(null);
    } catch (err: any) {
      alert('Error updating role: ' + err.message);
    }
  };

  const handleToggleStatus = async (user: any) => {
    const newStatus = user.status === 'active' ? 'suspended' : 'active';
    if (confirm(`Are you sure you want to ${newStatus === 'active' ? 'activate' : 'suspend'} this user?`)) {
      try {
        await updateUserStatus(user.id, newStatus);
      } catch (err: any) {
        alert('Error updating status: ' + err.message);
      }
    }
  };

  const handleRemove = async (user: any) => {
    if (confirm(`Are you sure you want to remove ${user.full_name || user.auth_user?.email} from the organization?`)) {
      try {
        await removeUser(user.id);
      } catch (err: any) {
        alert('Error removing user: ' + err.message);
      }
    }
  };

  if (loading) return <div className="text-center py-8">Loading users...</div>;
  if (error) return <div className="bg-red-100 text-red-700 p-4 rounded">Error: {error}</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage team members and their access</p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
        >
          <UserPlus size={20} />
          Invite User
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Users</p>
              <p className="text-xl font-bold">{users.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active</p>
              <p className="text-xl font-bold">{users.filter(u => u.status === 'active').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock size={20} className="text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Invited</p>
              <p className="text-xl font-bold">{users.filter(u => u.status === 'invited').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Shield size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Admins</p>
              <p className="text-xl font-bold">{users.filter(u => u.role === 'admin').length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="manager">Manager</option>
          <option value="worker">Worker</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="invited">Invited</option>
        </select>
      </div>

      {/* User Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Sign In</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white font-medium text-sm">
                          {user.full_name?.[0]?.toUpperCase() || user.auth_user?.email?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {user.full_name || 'Unnamed User'}
                          </p>
                          <p className="text-xs text-gray-500">{user.auth_user?.email || 'No email'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleColors[user.role as keyof typeof roleColors] || 'bg-gray-100 text-gray-800'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[user.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
                        {user.status || 'active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.auth_user?.last_sign_in_at 
                        ? new Date(user.auth_user.last_sign_in_at).toLocaleDateString()
                        : 'Never'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        {currentUser?.id !== user.id && (
                          <>
                            <button
                              onClick={() => handleEdit(user)}
                              className="p-1 text-gray-400 hover:text-blue-600 transition"
                              title="Edit role"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => handleToggleStatus(user)}
                              className={`p-1 transition ${
                                user.status === 'active' 
                                  ? 'text-gray-400 hover:text-yellow-600' 
                                  : 'text-gray-400 hover:text-green-600'
                              }`}
                              title={user.status === 'active' ? 'Suspend' : 'Activate'}
                            >
                              {user.status === 'active' ? <XCircle size={18} /> : <CheckCircle size={18} />}
                            </button>
                            <button
                              onClick={() => handleRemove(user)}
                              className="p-1 text-gray-400 hover:text-red-600 transition"
                              title="Remove"
                            >
                              <Trash2 size={18} />
                            </button>
                          </>
                        )}
                        {currentUser?.id === user.id && (
                          <span className="text-xs text-gray-400">You</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Invite User</h2>
              <button onClick={() => setShowInviteModal(false)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>
            <form onSubmit={handleInvite}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input
                    type="text"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="worker">Worker</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                {inviteError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-2 rounded-lg">
                    {inviteError}
                  </div>
                )}
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  disabled={inviting}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition disabled:opacity-50"
                >
                  {inviting ? 'Sending...' : 'Send Invite'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Edit User Role</h2>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>
            <form onSubmit={handleUpdateRole}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">User</label>
                  <p className="mt-1 text-gray-900 font-medium">
                    {editingUser.full_name || editingUser.auth_user?.email}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                    className="w-full mt-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="worker">Worker</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition"
                >
                  Update Role
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
