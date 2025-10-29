// import React, { useState } from 'react';
// import { Layout } from '../components/Layout';
// import { Users, Plus, Check, X, Edit, Trash2, Eye, Search, Filter } from 'lucide-react';

// interface User {
//   id: string;
//   name: string;
//   email: string;
//   role: 'student' | 'teacher' | 'admin';
//   status: 'pending' | 'approved' | 'rejected';
//   createdAt: string;
//   lastActive: string;
//   progress: {
//     listening: number;
//     speaking: number;
//     reading: number;
//     writing: number;
//   };
// }

// export function UserManagement() {
//   const [users, setUsers] = useState<User[]>([]);

//   const [searchTerm, setSearchTerm] = useState('');
//   const [filterRole, setFilterRole] = useState('all');
//   const [filterStatus, setFilterStatus] = useState('all');
//   const [showAddModal, setShowAddModal] = useState(false);
//   const [selectedUser, setSelectedUser] = useState<User | null>(null);

//   const filteredUsers = users.filter(user => {
//     const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                          user.email.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesRole = filterRole === 'all' || user.role === filterRole;
//     const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    
//     return matchesSearch && matchesRole && matchesStatus;
//   });

//   const handleApprove = (userId: string) => {
//     setUsers(users.map(user => 
//       user.id === userId ? { ...user, status: 'approved' as const } : user
//     ));
//   };

//   const handleReject = (userId: string) => {
//     setUsers(users.map(user => 
//       user.id === userId ? { ...user, status: 'rejected' as const } : user
//     ));
//   };

//   const handleDelete = (userId: string) => {
//     if (confirm('Are you sure you want to delete this user?')) {
//       setUsers(users.filter(user => user.id !== userId));
//     }
//   };

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case 'approved': return 'text-secondary-600 bg-secondary-50';
//       case 'pending': return 'text-yellow-600 bg-yellow-50';
//       case 'rejected': return 'text-red-600 bg-red-50';
//       default: return 'text-gray-600 bg-gray-50';
//     }
//   };

//   const getRoleColor = (role: string) => {
//     switch (role) {
//       case 'admin': return 'text-purple-600 bg-purple-50';
//       case 'teacher': return 'text-blue-600 bg-blue-50';
//       case 'student': return 'text-gray-600 bg-gray-50';
//       default: return 'text-gray-600 bg-gray-50';
//     }
//   };

//   const getOverallProgress = (progress: User['progress']) => {
//     return Math.round((progress.listening + progress.speaking + progress.reading + progress.writing) / 4);
//   };

//   const AddUserModal = () => (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white rounded-2xl p-6 w-full max-w-md">
//         <h3 className="text-xl font-poppins font-bold text-gray-900 mb-4">Add New User</h3>
//         <form className="space-y-4" onSubmit={(e) => {
//           e.preventDefault();
//           // Handle form submission
//           setShowAddModal(false);
//         }}>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
//             <input 
//               type="text" 
//               required
//               className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent" 
//               placeholder="Enter full name"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
//             <input 
//               type="email" 
//               required
//               className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent" 
//               placeholder="Enter email address"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
//             <select className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent">
//               <option value="student">Student</option>
//               <option value="teacher">Teacher</option>
//               <option value="admin">Admin</option>
//             </select>
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Initial Status</label>
//             <select className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent">
//               <option value="pending">Pending Approval</option>
//               <option value="approved">Approved</option>
//             </select>
//           </div>
//           <div className="flex space-x-3 pt-4">
//             <button
//               type="button"
//               onClick={() => setShowAddModal(false)}
//               className="flex-1 px-4 py-2 border border-gray-300 rounded-xl font-inter font-medium text-gray-700 hover:bg-gray-50 transition-colors"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               className="flex-1 px-4 py-2 bg-primary-900 text-white rounded-xl font-inter font-medium hover:bg-primary-800 transition-colors"
//             >
//               Add User
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );

//   const UserDetailsModal = () => selectedUser && (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
//         <div className="flex items-center justify-between mb-6">
//           <h3 className="text-xl font-poppins font-bold text-gray-900">User Details</h3>
//           <button
//             onClick={() => setSelectedUser(null)}
//             className="text-gray-400 hover:text-gray-600"
//           >
//             <X className="w-6 h-6" />
//           </button>
//         </div>
        
//         <div className="space-y-6">
//           <div className="flex items-center space-x-4">
//             <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
//               <span className="text-primary-700 font-bold text-xl">
//                 {selectedUser.name.split(' ').map(n => n[0]).join('')}
//               </span>
//             </div>
//             <div>
//               <h4 className="text-lg font-poppins font-bold text-gray-900">{selectedUser.name}</h4>
//               <p className="text-gray-600 font-inter">{selectedUser.email}</p>
//               <div className="flex items-center space-x-2 mt-1">
//                 <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(selectedUser.role)}`}>
//                   {selectedUser.role}
//                 </span>
//                 <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedUser.status)}`}>
//                   {selectedUser.status}
//                 </span>
//               </div>
//             </div>
//           </div>

//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <label className="text-sm font-medium text-gray-700">Joined Date</label>
//               <p className="text-gray-900 font-inter">{selectedUser.createdAt}</p>
//             </div>
//             <div>
//               <label className="text-sm font-medium text-gray-700">Last Active</label>
//               <p className="text-gray-900 font-inter">{selectedUser.lastActive}</p>
//             </div>
//           </div>

//           <div>
//             <h5 className="font-inter font-medium text-gray-900 mb-3">Test Progress</h5>
//             <div className="space-y-3">
//               {Object.entries(selectedUser.progress).map(([module, progress]) => (
//                 <div key={module} className="flex items-center justify-between">
//                   <span className="text-sm text-gray-600 capitalize font-inter">{module}</span>
//                   <div className="flex items-center space-x-3">
//                     <div className="w-24 bg-gray-200 rounded-full h-2">
//                       <div
//                         className="bg-primary-500 h-2 rounded-full transition-all duration-300"
//                         style={{ width: `${progress}%` }}
//                       />
//                     </div>
//                     <span className="text-sm font-medium text-gray-900 w-10">{progress}%</span>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>

//           <div className="flex space-x-3 pt-4 border-t border-gray-200">
//             {selectedUser.status === 'pending' && (
//               <>
//                 <button
//                   onClick={() => {
//                     handleApprove(selectedUser.id);
//                     setSelectedUser(null);
//                   }}
//                   className="flex-1 flex items-center justify-center space-x-2 bg-secondary-600 text-white px-4 py-2 rounded-xl font-inter font-medium hover:bg-secondary-700 transition-colors"
//                 >
//                   <Check className="w-4 h-4" />
//                   <span>Approve</span>
//                 </button>
//                 <button
//                   onClick={() => {
//                     handleReject(selectedUser.id);
//                     setSelectedUser(null);
//                   }}
//                   className="flex-1 flex items-center justify-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-xl font-inter font-medium hover:bg-red-700 transition-colors"
//                 >
//                   <X className="w-4 h-4" />
//                   <span>Reject</span>
//                 </button>
//               </>
//             )}
//             <button
//               onClick={() => setSelectedUser(null)}
//               className="px-6 py-2 border border-gray-300 rounded-xl font-inter font-medium text-gray-700 hover:bg-gray-50 transition-colors"
//             >
//               Close
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );

//   return (
//     <Layout title="User Management">
//       <div className="space-y-6 animate-fade-in">
//         <div className="flex items-center justify-between">
//           <div>
//             <h2 className="text-2xl font-poppins font-bold text-gray-900">User Management</h2>
//             <p className="text-gray-600 font-inter">Manage students, teachers, and administrators</p>
//           </div>
//           <button
//             onClick={() => setShowAddModal(true)}
//             className="flex items-center space-x-2 bg-primary-900 text-white px-4 py-2 rounded-xl font-inter font-medium hover:bg-primary-800 transition-colors"
//           >
//             <Plus className="w-4 h-4" />
//             <span>Add User</span>
//           </button>
//         </div>

//         <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
//           <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 mb-6">
//             <div className="flex items-center space-x-4">
//               <div className="relative">
//                 <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
//                 <input
//                   type="text"
//                   placeholder="Search users..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent font-inter"
//                 />
//               </div>
//               <div className="flex items-center space-x-2">
//                 <Filter className="w-5 h-5 text-gray-400" />
//                 <select
//                   value={filterRole}
//                   onChange={(e) => setFilterRole(e.target.value)}
//                   className="border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent font-inter"
//                 >
//                   <option value="all">All Roles</option>
//                   <option value="student">Students</option>
//                   <option value="teacher">Teachers</option>
//                   <option value="admin">Admins</option>
//                 </select>
//                 <select
//                   value={filterStatus}
//                   onChange={(e) => setFilterStatus(e.target.value)}
//                   className="border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent font-inter"
//                 >
//                   <option value="all">All Status</option>
//                   <option value="approved">Approved</option>
//                   <option value="pending">Pending</option>
//                   <option value="rejected">Rejected</option>
//                 </select>
//               </div>
//             </div>
            
//             <div className="text-sm text-gray-600 font-inter">
//               Showing {filteredUsers.length} of {users.length} users
//             </div>
//           </div>

//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead>
//                 <tr className="border-b border-gray-200">
//                   <th className="text-left py-3 font-inter font-medium text-gray-700">User</th>
//                   <th className="text-left py-3 font-inter font-medium text-gray-700">Role</th>
//                   <th className="text-left py-3 font-inter font-medium text-gray-700">Status</th>
//                   <th className="text-left py-3 font-inter font-medium text-gray-700">Progress</th>
//                   <th className="text-left py-3 font-inter font-medium text-gray-700">Last Active</th>
//                   <th className="text-left py-3 font-inter font-medium text-gray-700">Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filteredUsers.map((user) => (
//                   <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
//                     <td className="py-4">
//                       <div className="flex items-center space-x-3">
//                         <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
//                           <span className="text-primary-700 font-medium text-sm">
//                             {user.name.split(' ').map(n => n[0]).join('')}
//                           </span>
//                         </div>
//                         <div>
//                           <div className="font-inter font-medium text-gray-900">{user.name}</div>
//                           <div className="text-sm text-gray-600 font-inter">{user.email}</div>
//                         </div>
//                       </div>
//                     </td>
//                     <td className="py-4">
//                       <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getRoleColor(user.role)}`}>
//                         {user.role}
//                       </span>
//                     </td>
//                     <td className="py-4">
//                       <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(user.status)}`}>
//                         {user.status}
//                       </span>
//                     </td>
//                     <td className="py-4">
//                       <div className="flex items-center space-x-3">
//                         <div className="w-16 bg-gray-200 rounded-full h-2">
//                           <div
//                             className="bg-primary-500 h-2 rounded-full transition-all duration-300"
//                             style={{ width: `${getOverallProgress(user.progress)}%` }}
//                           />
//                         </div>
//                         <span className="text-sm font-inter font-medium">{getOverallProgress(user.progress)}%</span>
//                       </div>
//                     </td>
//                     <td className="py-4">
//                       <span className="text-sm text-gray-600 font-inter">{user.lastActive}</span>
//                     </td>
//                     <td className="py-4">
//                       <div className="flex items-center space-x-2">
//                         {user.status === 'pending' && (
//                           <>
//                             <button
//                               onClick={() => handleApprove(user.id)}
//                               className="p-1 text-secondary-600 hover:text-secondary-800 transition-colors"
//                               title="Approve"
//                             >
//                               <Check className="w-4 h-4" />
//                             </button>
//                             <button
//                               onClick={() => handleReject(user.id)}
//                               className="p-1 text-red-600 hover:text-red-800 transition-colors"
//                               title="Reject"
//                             >
//                               <X className="w-4 h-4" />
//                             </button>
//                           </>
//                         )}
//                         <button
//                           onClick={() => setSelectedUser(user)}
//                           className="p-1 text-gray-600 hover:text-gray-800 transition-colors"
//                           title="View Details"
//                         >
//                           <Eye className="w-4 h-4" />
//                         </button>
//                         <button
//                           className="p-1 text-gray-600 hover:text-gray-800 transition-colors"
//                           title="Edit"
//                         >
//                           <Edit className="w-4 h-4" />
//                         </button>
//                         <button
//                           onClick={() => handleDelete(user.id)}
//                           className="p-1 text-red-600 hover:text-red-800 transition-colors"
//                           title="Delete"
//                         >
//                           <Trash2 className="w-4 h-4" />
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           {filteredUsers.length === 0 && (
//             <div className="text-center py-8">
//               <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//               <p className="text-gray-600 font-inter">No users found matching your criteria</p>
//             </div>
//           )}
//         </div>
//       </div>

//       {showAddModal && <AddUserModal />}
//       {selectedUser && <UserDetailsModal />}
//     </Layout>
//   );
// }


// src/pages/UserManagement.tsx
import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Users, Plus, Check, X, Edit, Trash2, Eye, Search, Filter, Mail, Key } from 'lucide-react';
import { apiClient } from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  lastActive: string;
  progress?: {
    listening: string;
    speaking: string;
    reading: string;
    writing: string;
  };
  isVerified: boolean;
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const usersData = await apiClient.getUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('Failed to load users:', error);
      // Mock data for development
      setUsers([
       ]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleAddUser = async (userData: any) => {
    try {
      if (userData.role === 'teacher' || userData.role === 'admin') {
        await apiClient.addTeacher(userData);
      }
      await loadUsers();
      setShowAddModal(false);
    } catch (error) {
      console.error('Failed to add user:', error);
      alert('Failed to add user. Please try again.');
    }
  };

  const handleApprove = async (userId: string) => {
    try {
      // Implement approve API call
      setUsers(users.map(user => 
        user.id === userId ? { ...user, status: 'approved' as const } : user
      ));
    } catch (error) {
      console.error('Failed to approve user:', error);
    }
  };

  const handleReject = async (userId: string) => {
    try {
      // Implement reject API call
      setUsers(users.map(user => 
        user.id === userId ? { ...user, status: 'rejected' as const } : user
      ));
    } catch (error) {
      console.error('Failed to reject user:', error);
    }
  };

  const handleDelete = async (userId: string) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        // Implement delete API call
        setUsers(users.filter(user => user.id !== userId));
      } catch (error) {
        console.error('Failed to delete user:', error);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-50';
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'rejected': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'text-purple-600 bg-purple-50';
      case 'teacher': return 'text-blue-600 bg-blue-50';
      case 'student': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getProgressColor = (progress: string) => {
    switch (progress) {
      case 'not_started': return 'bg-gray-200';
      case 'submitted': return 'bg-yellow-400';
      case 'evaluated': return 'bg-green-400';
      default: return 'bg-gray-200';
    }
  };

  const AddUserModal = () => {
    const [formData, setFormData] = useState({
      name: '',
      email: '',
      role: 'student' as 'student' | 'teacher' | 'admin',
      status: 'pending' as 'pending' | 'approved'
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      handleAddUser(formData);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-6 w-full max-w-md">
          <h3 className="text-xl font-poppins font-bold text-gray-900 mb-4">Add New User</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent" 
                placeholder="Enter full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input 
                type="email" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent" 
                placeholder="Enter email address"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select 
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value as any})}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Initial Status</label>
              <select 
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="pending">Pending Approval</option>
                <option value="approved">Approved</option>
              </select>
            </div>
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-xl font-inter font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-primary-900 text-white rounded-xl font-inter font-medium hover:bg-primary-800 transition-colors"
              >
                Add User
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const UserDetailsModal = () => selectedUser && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-poppins font-bold text-gray-900">User Details</h3>
          <button
            onClick={() => setSelectedUser(null)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-primary-700 font-bold text-xl">
                {selectedUser.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div>
              <h4 className="text-lg font-poppins font-bold text-gray-900">{selectedUser.name}</h4>
              <p className="text-gray-600 font-inter">{selectedUser.email}</p>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(selectedUser.role)}`}>
                  {selectedUser.role}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedUser.status)}`}>
                  {selectedUser.status}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  selectedUser.isVerified ? 'text-green-600 bg-green-50' : 'text-yellow-600 bg-yellow-50'
                }`}>
                  {selectedUser.isVerified ? 'Verified' : 'Pending Verification'}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Joined Date</label>
              <p className="text-gray-900 font-inter">{selectedUser.createdAt}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Last Active</label>
              <p className="text-gray-900 font-inter">{selectedUser.lastActive}</p>
            </div>
          </div>

          {selectedUser.role === 'student' && selectedUser.progress && (
            <div>
              <h5 className="font-inter font-medium text-gray-900 mb-3">Test Progress</h5>
              <div className="space-y-3">
                {Object.entries(selectedUser.progress).map(([module, status]) => (
                  <div key={module} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 capitalize font-inter">{module}</span>
                    <div className="flex items-center space-x-3">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(status)}`}
                          style={{ 
                            width: status === 'not_started' ? '0%' : 
                                   status === 'submitted' ? '50%' : '100%' 
                          }}
                        />
                      </div>
                      <span className={`text-xs font-medium capitalize ${
                        status === 'not_started' ? 'text-gray-600' :
                        status === 'submitted' ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex space-x-3 pt-4 border-t border-gray-200">
            {selectedUser.status === 'pending' && (
              <>
                <button
                  onClick={() => {
                    handleApprove(selectedUser.id);
                    setSelectedUser(null);
                  }}
                  className="flex-1 flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-xl font-inter font-medium hover:bg-green-700 transition-colors"
                >
                  <Check className="w-4 h-4" />
                  <span>Approve</span>
                </button>
                <button
                  onClick={() => {
                    handleReject(selectedUser.id);
                    setSelectedUser(null);
                  }}
                  className="flex-1 flex items-center justify-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-xl font-inter font-medium hover:bg-red-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                  <span>Reject</span>
                </button>
              </>
            )}
            <button
              onClick={() => setSelectedUser(null)}
              className="px-6 py-2 border border-gray-300 rounded-xl font-inter font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Layout title="User Management">
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-poppins font-bold text-gray-900">User Management</h2>
            <p className="text-gray-600 font-inter">Manage students, teachers, and administrators</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 bg-primary-900 text-white px-4 py-2 rounded-xl font-inter font-medium hover:bg-primary-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add User</span>
          </button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="text-center">
              <div className="text-2xl font-poppins font-bold text-primary-600 mb-1">
                {users.filter(u => u.role === 'student').length}
              </div>
              <div className="text-sm text-gray-600 font-inter">Students</div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="text-center">
              <div className="text-2xl font-poppins font-bold text-blue-600 mb-1">
                {users.filter(u => u.role === 'teacher').length}
              </div>
              <div className="text-sm text-gray-600 font-inter">Teachers</div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="text-center">
              <div className="text-2xl font-poppins font-bold text-purple-600 mb-1">
                {users.filter(u => u.role === 'admin').length}
              </div>
              <div className="text-sm text-gray-600 font-inter">Admins</div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="text-center">
              <div className="text-2xl font-poppins font-bold text-yellow-600 mb-1">
                {users.filter(u => u.status === 'pending').length}
              </div>
              <div className="text-sm text-gray-600 font-inter">Pending</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 mb-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent font-inter"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent font-inter"
                >
                  <option value="all">All Roles</option>
                  <option value="student">Students</option>
                  <option value="teacher">Teachers</option>
                  <option value="admin">Admins</option>
                </select>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent font-inter"
                >
                  <option value="all">All Status</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
            
            <div className="text-sm text-gray-600 font-inter">
              Showing {filteredUsers.length} of {users.length} users
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 font-inter font-medium text-gray-700">User</th>
                  <th className="text-left py-3 font-inter font-medium text-gray-700">Role</th>
                  <th className="text-left py-3 font-inter font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 font-inter font-medium text-gray-700">Verification</th>
                  <th className="text-left py-3 font-inter font-medium text-gray-700">Progress</th>
                  <th className="text-left py-3 font-inter font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-primary-700 font-medium text-sm">
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <div className="font-inter font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-600 font-inter">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getRoleColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(user.status)}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.isVerified ? 'text-green-600 bg-green-50' : 'text-yellow-600 bg-yellow-50'
                      }`}>
                        {user.isVerified ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                    <td className="py-4">
                      {user.role === 'student' && user.progress ? (
                        <div className="flex space-x-1">
                          {Object.entries(user.progress).map(([module, status]) => (
                            <div
                              key={module}
                              className={`w-2 h-2 rounded-full ${getProgressColor(status)}`}
                              title={`${module}: ${status}`}
                            />
                          ))}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">-</span>
                      )}
                    </td>
                    <td className="py-4">
                      <div className="flex items-center space-x-2">
                        {user.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(user.id)}
                              className="p-1 text-green-600 hover:text-green-800 transition-colors"
                              title="Approve"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleReject(user.id)}
                              className="p-1 text-red-600 hover:text-red-800 transition-colors"
                              title="Reject"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="p-1 text-gray-600 hover:text-gray-800 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          className="p-1 text-gray-600 hover:text-gray-800 transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="p-1 text-red-600 hover:text-red-800 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 font-inter">No users found matching your criteria</p>
            </div>
          )}
        </div>
      </div>

      {showAddModal && <AddUserModal />}
      {selectedUser && <UserDetailsModal />}
    </Layout>
  );
}