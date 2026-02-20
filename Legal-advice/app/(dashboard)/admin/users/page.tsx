import { Users, Shield, UserPlus } from 'lucide-react';
import BackButton from '@/components/shared/BackButton';

export default function AdminUsersPage() {
  const users = [
    {
      id: 1,
      name: 'James Wilson',
      email: 'james.wilson@example.com',
      role: 'lawyer',
      status: 'active',
      cases: 24,
      joinedDate: '2023-01-15',
    },
    {
      id: 2,
      name: 'Sarah Chen',
      email: 'sarah.chen@example.com',
      role: 'lawyer',
      status: 'active',
      cases: 32,
      joinedDate: '2023-02-20',
    },
    {
      id: 3,
      name: 'Tech Solutions Pvt Ltd',
      email: 'legal@techsolutions.com',
      role: 'client',
      status: 'active',
      cases: 12,
      joinedDate: '2023-03-10',
    },
    {
      id: 4,
      name: 'Henderson & Associates',
      email: 'admin@henderson.law',
      role: 'firm',
      status: 'active',
      cases: 156,
      joinedDate: '2022-11-05',
    },
    {
      id: 5,
      name: 'NorthStar Bank',
      email: 'legal.ops@northstar.com',
      role: 'bank',
      status: 'active',
      cases: 89,
      joinedDate: '2023-01-08',
    },
    {
      id: 6,
      name: 'Michael Ross',
      email: 'michael.ross@example.com',
      role: 'lawyer',
      status: 'suspended',
      cases: 0,
      joinedDate: '2023-04-12',
    },
  ];

  const getRoleBadge = (role: string) => {
    const styles = {
      client: 'bg-blue-100 text-blue-700',
      lawyer: 'bg-purple-100 text-purple-700',
      firm: 'bg-green-100 text-green-700',
      bank: 'bg-orange-100 text-orange-700',
      admin: 'bg-red-100 text-red-700',
    };
    return styles[role as keyof typeof styles] || styles.client;
  };

  return (
    <div className="flex flex-col flex-1 p-8 gap-8 max-w-[1400px] mx-auto w-full">
      {/* Back Button */}
      <div>
        <BackButton href="/dashboard/admin" />
      </div>

      {/* Page Heading */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-slate-900 text-3xl font-extrabold tracking-tight">User Management</h1>
          <p className="text-slate-500 text-base">
            Manage all users, roles, and permissions across the platform
          </p>
        </div>
        <button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-bold shadow-lg shadow-primary/20 transition-all">
          <UserPlus className="size-5" />
          Add New User
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-500 text-sm font-medium">Total Users</p>
            <Users className="size-5 text-primary" />
          </div>
          <p className="text-slate-900 text-3xl font-bold">1,248</p>
          <p className="text-green-600 text-sm mt-2 flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">trending_up</span>
            +12% this month
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-500 text-sm font-medium">Active Lawyers</p>
            <span className="material-symbols-outlined text-purple-600">work</span>
          </div>
          <p className="text-slate-900 text-3xl font-bold">524</p>
          <p className="text-slate-500 text-sm mt-2">98.5% verified</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-500 text-sm font-medium">Active Clients</p>
            <span className="material-symbols-outlined text-blue-600">person</span>
          </div>
          <p className="text-slate-900 text-3xl font-bold">612</p>
          <p className="text-slate-500 text-sm mt-2">Individual & SMEs</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-slate-500 text-sm font-medium">Pending Reviews</p>
            <Shield className="size-5 text-orange-600" />
          </div>
          <p className="text-slate-900 text-3xl font-bold">18</p>
          <p className="text-orange-600 text-sm mt-2">Requires verification</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-slate-400">search</span>
          </div>
          <input
            className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-lg leading-5 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm transition duration-150 ease-in-out"
            placeholder="Search by name, email, or role..."
            type="text"
          />
        </div>
        <div className="flex gap-4">
          <select className="block pl-3 pr-10 py-2.5 text-base border-slate-200 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-lg bg-slate-50 text-slate-900 cursor-pointer">
            <option>All Roles</option>
            <option>Client</option>
            <option>Lawyer</option>
            <option>Firm</option>
            <option>Bank</option>
            <option>Admin</option>
          </select>
          <select className="block pl-3 pr-10 py-2.5 text-base border-slate-200 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-lg bg-slate-50 text-slate-900 cursor-pointer">
            <option>All Status</option>
            <option>Active</option>
            <option>Suspended</option>
            <option>Pending</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  User
                </th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Cases
                </th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full bg-slate-200 flex items-center justify-center text-sm font-bold text-slate-600">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-slate-900 font-bold text-sm">{user.name}</p>
                        <p className="text-slate-500 text-xs">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${getRoleBadge(
                        user.role
                      )}`}
                    >
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </td>
                  <td className="p-4">
                    {user.status === 'active' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                        <span className="size-1.5 rounded-full bg-green-600"></span>
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                        <span className="size-1.5 rounded-full bg-red-600"></span>
                        Suspended
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-sm text-slate-700 font-medium">{user.cases}</td>
                  <td className="p-4 text-sm text-slate-500">
                    {new Date(user.joinedDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-slate-400 hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-[20px]">edit</span>
                      </button>
                      <button className="p-2 text-slate-400 hover:text-danger transition-colors">
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">Showing 1-6 of 1,248 users</span>
          <div className="flex gap-2">
            <button
              className="size-8 flex items-center justify-center rounded bg-white border border-slate-300 text-slate-400 hover:text-slate-600 disabled:opacity-50"
              disabled
            >
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>
            <button className="size-8 flex items-center justify-center rounded bg-white border border-slate-300 text-slate-600 hover:text-slate-900">
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
