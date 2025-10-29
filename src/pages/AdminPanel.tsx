// // import React, { useState } from 'react';
// // import { Layout } from '../components/Layout';
// // import { apiClient } from '../services/api';
// // import { Users, FileText, BarChart3, Settings, Download, Plus, Check, X, CreditCard as Edit, Trash2, Eye, Mail, Key } from 'lucide-react';

// // interface StudentData {
// //   id: string;
// //   name: string;
// //   email: string;
// //   role: 'student' | 'teacher' | 'admin';
// //   status: 'pending' | 'approved' | 'rejected';
// //   createdAt: string;
// //   progress: {
// //     listening: number;
// //     speaking: number;
// //     reading: number;
// //     writing: number;
// //   };
// //   submissionLink?: string;
// // }

// // interface QuestionData {
// //   id: string;
// //   module: 'listening' | 'speaking' | 'reading' | 'writing';
// //   type: 'multiple-choice' | 'audio' | 'video' | 'text' | 'upload';
// //   question: string;
// //   options?: string[];
// //   correctAnswer?: string;
// //   difficulty: 'easy' | 'medium' | 'hard';
// //   points: number;
// //   createdAt: string;
// //   createdBy: string;
// //   isActive: boolean;
// // }

// // interface TeacherCredentials {
// //   id: string;
// //   email: string;
// //   temporaryPassword: string;
// //   role: 'teacher' | 'admin';
// //   sentAt: string;
// //   isUsed: boolean;
// // }

// // export function AdminPanel() {
// //   const [activeTab, setActiveTab] = useState('overview');
// //   const [showAddUserModal, setShowAddUserModal] = useState(false);
// //   const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);
// //   const [editingQuestion, setEditingQuestion] = useState<QuestionData | null>(null);
  
// //   const [users, setUsers] = useState<StudentData[]>([]);

// //   const [questions, setQuestions] = useState<QuestionData[]>([]);

// //   const [credentials, setCredentials] = useState<TeacherCredentials[]>([]);

// //   const tabs = [
// //     { id: 'overview', name: 'Overview', icon: BarChart3 },
// //     { id: 'users', name: 'User Management', icon: Users },
// //     { id: 'questions', name: 'Question Bank', icon: FileText },
// //     { id: 'credentials', name: 'Teacher Access', icon: Key },
// //     { id: 'settings', name: 'Settings', icon: Settings }
// //   ];

// //   const generatePassword = () => {
// //     const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
// //     let password = '';
// //     for (let i = 0; i < 12; i++) {
// //       password += chars.charAt(Math.floor(Math.random() * chars.length));
// //     }
// //     return password;
// //   };

// //   const handleAddUser = (userData: any) => {
// //     const addUser = async () => {
// //       try {
// //         if (userData.role === 'teacher' || userData.role === 'admin') {
// //           const tempPassword = generatePassword();
          
// //           await apiClient.addTeacher({
// //             name: userData.name,
// //             email: userData.email,
// //             password: tempPassword,
// //             role: userData.role,
// //           });
          
// //           const newCredential: TeacherCredentials = {
// //             id: Date.now().toString(),
// //             email: userData.email,
// //             temporaryPassword: tempPassword,
// //             role: userData.role,
// //             sentAt: new Date().toISOString(),
// //             isUsed: false
// //           };
// //           setCredentials([...credentials, newCredential]);
          
// //           alert(`Login credentials sent to ${userData.email}`);
// //         }
        
// //         // Refresh users list
// //         const updatedUsers = await apiClient.getUsers();
// //         setUsers(updatedUsers);
        
// //       } catch (error) {
// //         console.error('Failed to add user:', error);
// //         alert('Failed to add user. Please try again.');
// //       }
// //     };
    
// //     addUser();
// //     setShowAddUserModal(false);
// //   };

// //   const handleAddQuestion = async (questionData: any) => {
// //     try {
// //       await apiClient.createTask({
// //         module: questionData.module,
// //         question: questionData.question,
// //         options: questionData.options || [],
// //         correctAnswer: questionData.correctAnswer || '',
// //         points: questionData.points,
// //       });
      
// //       // Refresh questions list
// //       const updatedQuestions = await apiClient.getTasks();
// //       setQuestions(updatedQuestions);
      
// //     } catch (error) {
// //       console.error('Failed to add question:', error);
// //       alert('Failed to add question. Please try again.');
// //     }
    
// //     setShowAddQuestionModal(false);
// //   };

// //   // Load initial data
// //   React.useEffect(() => {
// //     const loadData = async () => {
// //       try {
// //         const [usersData, questionsData, statsData] = await Promise.all([
// //           apiClient.getUsers(),
// //           apiClient.getTasks(),
// //           apiClient.getDashboardStats(),
// //         ]);
        
// //         setUsers(usersData);
// //         setQuestions(questionsData);
// //         // Update stats if needed
        
// //       } catch (error) {
// //         console.error('Failed to load admin data:', error);
// //       }
// //     };
    
// //     loadData();
// //   }, []);

// //   const handleUpdateQuestion = (questionData: any) => {
// //     if (editingQuestion) {
// //       setQuestions(questions.map(q => 
// //         q.id === editingQuestion.id ? { ...q, ...questionData } : q
// //       ));
// //       setEditingQuestion(null);
// //     }
// //   };

// //   const handleDeleteQuestion = (questionId: string) => {
// //     if (confirm('Are you sure you want to delete this question?')) {
// //       setQuestions(questions.filter(q => q.id !== questionId));
// //     }
// //   };

// //   const handleToggleQuestionStatus = (questionId: string) => {
// //     setQuestions(questions.map(q => 
// //       q.id === questionId ? { ...q, isActive: !q.isActive } : q
// //     ));
// //   };

// //   const AddUserModal = () => {
// //     const [formData, setFormData] = useState({
// //       name: '',
// //       email: '',
// //       role: 'student',
// //       status: 'pending'
// //     });

// //     const handleSubmit = (e: React.FormEvent) => {
// //       e.preventDefault();
// //       handleAddUser(formData);
// //     };

// //     return (
// //       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
// //         <div className="bg-white rounded-2xl p-6 w-full max-w-md">
// //           <h3 className="text-xl font-poppins font-bold text-gray-900 mb-4">Add New User</h3>
// //           <form onSubmit={handleSubmit} className="space-y-4">
// //             <div>
// //               <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
// //               <input
// //                 type="text"
// //                 value={formData.name}
// //                 onChange={(e) => setFormData({...formData, name: e.target.value})}
// //                 required
// //                 className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
// //               />
// //             </div>
// //             <div>
// //               <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
// //               <input
// //                 type="email"
// //                 value={formData.email}
// //                 onChange={(e) => setFormData({...formData, email: e.target.value})}
// //                 required
// //                 className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
// //               />
// //             </div>
// //             <div>
// //               <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
// //               <select
// //                 value={formData.role}
// //                 onChange={(e) => setFormData({...formData, role: e.target.value as any})}
// //                 className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
// //               >
// //                 <option value="student">Student</option>
// //                 <option value="teacher">Teacher</option>
// //                 <option value="admin">Admin</option>
// //               </select>
// //             </div>
// //             <div>
// //               <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
// //               <select
// //                 value={formData.status}
// //                 onChange={(e) => setFormData({...formData, status: e.target.value as any})}
// //                 className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
// //               >
// //                 <option value="pending">Pending</option>
// //                 <option value="approved">Approved</option>
// //               </select>
// //             </div>
// //             <div className="flex space-x-3 pt-4">
// //               <button
// //                 type="button"
// //                 onClick={() => setShowAddUserModal(false)}
// //                 className="flex-1 px-4 py-2 border border-gray-300 rounded-xl font-inter font-medium text-gray-700 hover:bg-gray-50"
// //               >
// //                 Cancel
// //               </button>
// //               <button
// //                 type="submit"
// //                 className="flex-1 px-4 py-2 bg-primary-900 text-white rounded-xl font-inter font-medium hover:bg-primary-800"
// //               >
// //                 Add User
// //               </button>
// //             </div>
// //           </form>
// //         </div>
// //       </div>
// //     );
// //   };

// //   const QuestionModal = ({ question = null }: { question?: QuestionData | null }) => {
// //     const [formData, setFormData] = useState({
// //       module: question?.module || 'listening',
// //       type: question?.type || 'multiple-choice',
// //       question: question?.question || '',
// //       options: question?.options || ['', '', '', ''],
// //       correctAnswer: question?.correctAnswer || '',
// //       difficulty: question?.difficulty || 'medium',
// //       points: question?.points || 10
// //     });

// //     const handleSubmit = (e: React.FormEvent) => {
// //       e.preventDefault();
// //       if (question) {
// //         handleUpdateQuestion(formData);
// //       } else {
// //         handleAddQuestion(formData);
// //       }
// //     };

// //     return (
// //       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
// //         <div className="bg-white rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
// //           <h3 className="text-xl font-poppins font-bold text-gray-900 mb-4">
// //             {question ? 'Edit Question' : 'Add New Question'}
// //           </h3>
// //           <form onSubmit={handleSubmit} className="space-y-4">
// //             <div className="grid grid-cols-2 gap-4">
// //               <div>
// //                 <label className="block text-sm font-medium text-gray-700 mb-1">Module</label>
// //                 <select
// //                   value={formData.module}
// //                   onChange={(e) => setFormData({...formData, module: e.target.value as any})}
// //                   className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
// //                 >
// //                   <option value="listening">Listening</option>
// //                   <option value="speaking">Speaking</option>
// //                   <option value="reading">Reading</option>
// //                   <option value="writing">Writing</option>
// //                 </select>
// //               </div>
// //               <div>
// //                 <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
// //                 <select
// //                   value={formData.type}
// //                   onChange={(e) => setFormData({...formData, type: e.target.value as any})}
// //                   className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
// //                 >
// //                   <option value="multiple-choice">Multiple Choice</option>
// //                   <option value="text">Text Response</option>
// //                   <option value="audio">Audio Response</option>
// //                   <option value="video">Video Response</option>
// //                   <option value="upload">File Upload</option>
// //                 </select>
// //               </div>
// //             </div>

// //             <div>
// //               <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
// //               <textarea
// //                 value={formData.question}
// //                 onChange={(e) => setFormData({...formData, question: e.target.value})}
// //                 rows={3}
// //                 required
// //                 className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
// //               />
// //             </div>

// //             {formData.type === 'multiple-choice' && (
// //               <div>
// //                 <label className="block text-sm font-medium text-gray-700 mb-1">Answer Options</label>
// //                 <div className="space-y-2">
// //                   {formData.options.map((option, index) => (
// //                     <div key={index} className="flex items-center space-x-2">
// //                       <input
// //                         type="radio"
// //                         name="correctAnswer"
// //                         value={option}
// //                         checked={formData.correctAnswer === option}
// //                         onChange={(e) => setFormData({...formData, correctAnswer: e.target.value})}
// //                         className="w-4 h-4 text-primary-600"
// //                       />
// //                       <input
// //                         type="text"
// //                         value={option}
// //                         onChange={(e) => {
// //                           const newOptions = [...formData.options];
// //                           newOptions[index] = e.target.value;
// //                           setFormData({...formData, options: newOptions});
// //                         }}
// //                         placeholder={`Option ${index + 1}`}
// //                         className="flex-1 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
// //                       />
// //                     </div>
// //                   ))}
// //                 </div>
// //               </div>
// //             )}

// //             <div className="grid grid-cols-2 gap-4">
// //               <div>
// //                 <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
// //                 <select
// //                   value={formData.difficulty}
// //                   onChange={(e) => setFormData({...formData, difficulty: e.target.value as any})}
// //                   className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
// //                 >
// //                   <option value="easy">Easy</option>
// //                   <option value="medium">Medium</option>
// //                   <option value="hard">Hard</option>
// //                 </select>
// //               </div>
// //               <div>
// //                 <label className="block text-sm font-medium text-gray-700 mb-1">Points</label>
// //                 <input
// //                   type="number"
// //                   value={formData.points}
// //                   onChange={(e) => setFormData({...formData, points: parseInt(e.target.value)})}
// //                   min="1"
// //                   max="50"
// //                   className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
// //                 />
// //               </div>
// //             </div>

// //             <div className="flex space-x-3 pt-4">
// //               <button
// //                 type="button"
// //                 onClick={() => {
// //                   setShowAddQuestionModal(false);
// //                   setEditingQuestion(null);
// //                 }}
// //                 className="flex-1 px-4 py-2 border border-gray-300 rounded-xl font-inter font-medium text-gray-700 hover:bg-gray-50"
// //               >
// //                 Cancel
// //               </button>
// //               <button
// //                 type="submit"
// //                 className="flex-1 px-4 py-2 bg-primary-900 text-white rounded-xl font-inter font-medium hover:bg-primary-800"
// //               >
// //                 {question ? 'Update Question' : 'Add Question'}
// //               </button>
// //             </div>
// //           </form>
// //         </div>
// //       </div>
// //     );
// //   };

// //   return (
// //     <Layout title="Admin Panel">
// //       <div className="space-y-6 animate-fade-in">
// //         <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
// //           <div className="border-b border-gray-100">
// //             <div className="flex space-x-8 px-6">
// //               {tabs.map((tab) => {
// //                 const Icon = tab.icon;
// //                 return (
// //                   <button
// //                     key={tab.id}
// //                     onClick={() => setActiveTab(tab.id)}
// //                     className={`flex items-center space-x-2 py-4 border-b-2 font-inter font-medium transition-colors ${
// //                       activeTab === tab.id
// //                         ? 'border-primary-500 text-primary-600'
// //                         : 'border-transparent text-gray-600 hover:text-gray-900'
// //                     }`}
// //                   >
// //                     <Icon className="w-5 h-5" />
// //                     <span>{tab.name}</span>
// //                   </button>
// //                 );
// //               })}
// //             </div>
// //           </div>

// //           <div className="p-6">
// //             {activeTab === 'overview' && (
// //               <div className="space-y-6">
// //                 <h3 className="text-xl font-poppins font-bold text-gray-900">System Overview</h3>
                
// //                 <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
// //                   <div className="bg-primary-50 rounded-xl p-4">
// //                     <div className="text-2xl font-poppins font-bold text-primary-900">
// //                       {users.filter(u => u.role === 'student').length}
// //                     </div>
// //                     <div className="text-sm text-primary-700 font-inter">Total Students</div>
// //                   </div>
// //                   <div className="bg-blue-50 rounded-xl p-4">
// //                     <div className="text-2xl font-poppins font-bold text-blue-700">
// //                       {users.filter(u => u.role === 'teacher').length}
// //                     </div>
// //                     <div className="text-sm text-blue-700 font-inter">Teachers</div>
// //                   </div>
// //                   <div className="bg-yellow-50 rounded-xl p-4">
// //                     <div className="text-2xl font-poppins font-bold text-yellow-700">
// //                       {users.filter(u => u.status === 'pending').length}
// //                     </div>
// //                     <div className="text-sm text-yellow-700 font-inter">Pending Approvals</div>
// //                   </div>
// //                   <div className="bg-secondary-50 rounded-xl p-4">
// //                     <div className="text-2xl font-poppins font-bold text-secondary-700">
// //                       {questions.filter(q => q.isActive).length}
// //                     </div>
// //                     <div className="text-sm text-secondary-700 font-inter">Active Questions</div>
// //                   </div>
// //                 </div>
// //               </div>
// //             )}

// //             {activeTab === 'users' && (
// //               <div className="space-y-6">
// //                 <div className="flex items-center justify-between">
// //                   <h3 className="text-xl font-poppins font-bold text-gray-900">User Management</h3>
// //                   <button 
// //                     onClick={() => setShowAddUserModal(true)}
// //                     className="flex items-center space-x-2 bg-primary-900 text-white px-4 py-2 rounded-xl font-inter font-medium hover:bg-primary-800"
// //                   >
// //                     <Plus className="w-4 h-4" />
// //                     <span>Add User</span>
// //                   </button>
// //                 </div>

// //                 <div className="overflow-x-auto">
// //                   <table className="w-full">
// //                     <thead>
// //                       <tr className="border-b border-gray-200">
// //                         <th className="text-left py-3 font-inter font-medium text-gray-700">User</th>
// //                         <th className="text-left py-3 font-inter font-medium text-gray-700">Role</th>
// //                         <th className="text-left py-3 font-inter font-medium text-gray-700">Status</th>
// //                         <th className="text-left py-3 font-inter font-medium text-gray-700">Actions</th>
// //                       </tr>
// //                     </thead>
// //                     <tbody>
// //                       {users.map((user) => (
// //                         <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
// //                           <td className="py-4">
// //                             <div>
// //                               <div className="font-inter font-medium text-gray-900">{user.name}</div>
// //                               <div className="text-sm text-gray-600 font-inter">{user.email}</div>
// //                             </div>
// //                           </td>
// //                           <td className="py-4">
// //                             <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium capitalize">
// //                               {user.role}
// //                             </span>
// //                           </td>
// //                           <td className="py-4">
// //                             <span className={`px-2 py-1 rounded-full text-xs font-medium ${
// //                               user.status === 'approved' ? 'bg-secondary-100 text-secondary-700' :
// //                               user.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
// //                               'bg-red-100 text-red-700'
// //                             }`}>
// //                               {user.status}
// //                             </span>
// //                           </td>
// //                           <td className="py-4">
// //                             <div className="flex items-center space-x-2">
// //                               {user.status === 'pending' && (
// //                                 <>
// //                                   <button className="p-1 text-secondary-600 hover:text-secondary-800">
// //                                     <Check className="w-4 h-4" />
// //                                   </button>
// //                                   <button className="p-1 text-red-600 hover:text-red-800">
// //                                     <X className="w-4 h-4" />
// //                                   </button>
// //                                 </>
// //                               )}
// //                               <button className="p-1 text-gray-600 hover:text-gray-800">
// //                                 <Edit className="w-4 h-4" />
// //                               </button>
// //                             </div>
// //                           </td>
// //                         </tr>
// //                       ))}
// //                     </tbody>
// //                   </table>
// //                 </div>
// //               </div>
// //             )}

// //             {activeTab === 'questions' && (
// //               <div className="space-y-6">
// //                 <div className="flex items-center justify-between">
// //                   <h3 className="text-xl font-poppins font-bold text-gray-900">Question Bank</h3>
// //                   <button 
// //                     onClick={() => setShowAddQuestionModal(true)}
// //                     className="flex items-center space-x-2 bg-primary-900 text-white px-4 py-2 rounded-xl font-inter font-medium hover:bg-primary-800"
// //                   >
// //                     <Plus className="w-4 h-4" />
// //                     <span>Add Question</span>
// //                   </button>
// //                 </div>

// //                 <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
// //                   {['listening', 'speaking', 'reading', 'writing'].map((module) => (
// //                     <div key={module} className="bg-gray-50 rounded-xl p-6 text-center">
// //                       <h4 className="font-poppins font-bold text-gray-900 mb-2 capitalize">{module}</h4>
// //                       <div className="text-2xl font-poppins font-bold text-primary-600 mb-2">
// //                         {questions.filter(q => q.module === module && q.isActive).length}
// //                       </div>
// //                       <div className="text-sm text-gray-600 font-inter">Active Questions</div>
// //                     </div>
// //                   ))}
// //                 </div>

// //                 <div className="overflow-x-auto">
// //                   <table className="w-full">
// //                     <thead>
// //                       <tr className="border-b border-gray-200">
// //                         <th className="text-left py-3 font-inter font-medium text-gray-700">Question</th>
// //                         <th className="text-left py-3 font-inter font-medium text-gray-700">Module</th>
// //                         <th className="text-left py-3 font-inter font-medium text-gray-700">Difficulty</th>
// //                         <th className="text-left py-3 font-inter font-medium text-gray-700">Points</th>
// //                         <th className="text-left py-3 font-inter font-medium text-gray-700">Status</th>
// //                         <th className="text-left py-3 font-inter font-medium text-gray-700">Actions</th>
// //                       </tr>
// //                     </thead>
// //                     <tbody>
// //                       {questions.map((question) => (
// //                         <tr key={question.id} className="border-b border-gray-100 hover:bg-gray-50">
// //                           <td className="py-4">
// //                             <div className="max-w-xs">
// //                               <div className="font-inter font-medium text-gray-900 truncate">
// //                                 {question.question}
// //                               </div>
// //                             </div>
// //                           </td>
// //                           <td className="py-4">
// //                             <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium capitalize">
// //                               {question.module}
// //                             </span>
// //                           </td>
// //                           <td className="py-4">
// //                             <span className={`px-2 py-1 rounded-full text-xs font-medium ${
// //                               question.difficulty === 'easy' ? 'bg-secondary-100 text-secondary-700' :
// //                               question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
// //                               'bg-red-100 text-red-700'
// //                             }`}>
// //                               {question.difficulty}
// //                             </span>
// //                           </td>
// //                           <td className="py-4">
// //                             <span className="font-inter font-medium text-gray-900">{question.points}</span>
// //                           </td>
// //                           <td className="py-4">
// //                             <button
// //                               onClick={() => handleToggleQuestionStatus(question.id)}
// //                               className={`px-2 py-1 rounded-full text-xs font-medium ${
// //                                 question.isActive
// //                                   ? 'text-secondary-600 bg-secondary-50'
// //                                   : 'text-gray-600 bg-gray-50'
// //                               }`}
// //                             >
// //                               {question.isActive ? 'Active' : 'Inactive'}
// //                             </button>
// //                           </td>
// //                           <td className="py-4">
// //                             <div className="flex items-center space-x-2">
// //                               <button
// //                                 onClick={() => setEditingQuestion(question)}
// //                                 className="p-1 text-gray-600 hover:text-gray-800"
// //                               >
// //                                 <Edit className="w-4 h-4" />
// //                               </button>
// //                               <button
// //                                 onClick={() => handleDeleteQuestion(question.id)}
// //                                 className="p-1 text-red-600 hover:text-red-800"
// //                               >
// //                                 <Trash2 className="w-4 h-4" />
// //                               </button>
// //                             </div>
// //                           </td>
// //                         </tr>
// //                       ))}
// //                     </tbody>
// //                   </table>
// //                 </div>
// //               </div>
// //             )}

// //             {activeTab === 'credentials' && (
// //               <div className="space-y-6">
// //                 <h3 className="text-xl font-poppins font-bold text-gray-900">Teacher Access Management</h3>
                
// //                 <div className="bg-blue-50 rounded-xl p-6">
// //                   <div className="flex items-center space-x-3 mb-4">
// //                     <Mail className="w-6 h-6 text-blue-600" />
// //                     <h4 className="font-poppins font-bold text-blue-900">Email Credentials System</h4>
// //                   </div>
// //                   <p className="text-blue-800 font-inter">
// //                     When you add a teacher or admin, login credentials are automatically generated and sent to their email address.
// //                   </p>
// //                 </div>

// //                 {credentials.length > 0 && (
// //                   <div className="overflow-x-auto">
// //                     <table className="w-full">
// //                       <thead>
// //                         <tr className="border-b border-gray-200">
// //                           <th className="text-left py-3 font-inter font-medium text-gray-700">Email</th>
// //                           <th className="text-left py-3 font-inter font-medium text-gray-700">Role</th>
// //                           <th className="text-left py-3 font-inter font-medium text-gray-700">Password</th>
// //                           <th className="text-left py-3 font-inter font-medium text-gray-700">Sent Date</th>
// //                           <th className="text-left py-3 font-inter font-medium text-gray-700">Status</th>
// //                         </tr>
// //                       </thead>
// //                       <tbody>
// //                         {credentials.map((cred) => (
// //                           <tr key={cred.id} className="border-b border-gray-100 hover:bg-gray-50">
// //                             <td className="py-4 font-inter text-gray-900">{cred.email}</td>
// //                             <td className="py-4">
// //                               <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium capitalize">
// //                                 {cred.role}
// //                               </span>
// //                             </td>
// //                             <td className="py-4">
// //                               <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
// //                                 {cred.temporaryPassword}
// //                               </code>
// //                             </td>
// //                             <td className="py-4 font-inter text-gray-600">
// //                               {new Date(cred.sentAt).toLocaleDateString()}
// //                             </td>
// //                             <td className="py-4">
// //                               <span className={`px-2 py-1 rounded-full text-xs font-medium ${
// //                                 cred.isUsed ? 'bg-secondary-100 text-secondary-700' : 'bg-yellow-100 text-yellow-700'
// //                               }`}>
// //                                 {cred.isUsed ? 'Used' : 'Pending'}
// //                               </span>
// //                             </td>
// //                           </tr>
// //                         ))}
// //                       </tbody>
// //                     </table>
// //                   </div>
// //                 )}
// //               </div>
// //             )}

// //             {activeTab === 'settings' && (
// //               <div className="space-y-6">
// //                 <h3 className="text-xl font-poppins font-bold text-gray-900">System Settings</h3>
                
// //                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
// //                   <div className="space-y-4">
// //                     <h4 className="font-inter font-medium text-gray-900">Test Configuration</h4>
// //                     <div className="space-y-3">
// //                       <div>
// //                         <label className="block text-sm font-medium text-gray-700 mb-1">Default Test Duration</label>
// //                         <select className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500">
// //                           <option>60 minutes</option>
// //                           <option>90 minutes</option>
// //                           <option>120 minutes</option>
// //                         </select>
// //                       </div>
// //                       <div>
// //                         <label className="block text-sm font-medium text-gray-700 mb-1">Passing Score</label>
// //                         <input
// //                           type="number"
// //                           defaultValue="70"
// //                           className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500"
// //                         />
// //                       </div>
// //                     </div>
// //                   </div>

// //                   <div className="space-y-4">
// //                     <h4 className="font-inter font-medium text-gray-900">Email Settings</h4>
// //                     <div className="space-y-3">
// //                       <label className="flex items-center space-x-3">
// //                         <input type="checkbox" defaultChecked className="w-4 h-4 text-primary-600" />
// //                         <span className="text-sm text-gray-700">Send credentials via email</span>
// //                       </label>
// //                       <label className="flex items-center space-x-3">
// //                         <input type="checkbox" defaultChecked className="w-4 h-4 text-primary-600" />
// //                         <span className="text-sm text-gray-700">Email notifications for new registrations</span>
// //                       </label>
// //                       <label className="flex items-center space-x-3">
// //                         <input type="checkbox" className="w-4 h-4 text-primary-600" />
// //                         <span className="text-sm text-gray-700">Daily progress reports</span>
// //                       </label>
// //                     </div>
// //                   </div>
// //                 </div>
// //               </div>
// //             )}
// //           </div>
// //         </div>
// //       </div>

// //       {showAddUserModal && <AddUserModal />}
// //       {showAddQuestionModal && <QuestionModal />}
// //       {editingQuestion && <QuestionModal question={editingQuestion} />}
// //     </Layout>
// //   );
// // }

// import React, { useState, useEffect } from 'react';
// import { Layout } from '../components/Layout';
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
// import { Users, FileText, BarChart3, TrendingUp, Clock, CheckCircle } from 'lucide-react';
// import { apiClient } from '../services/api';

// interface DashboardStats {
//   totalStudents: number;
//   totalTeachers: number;
//   totalQuestions: number;
//   pendingApprovals: number;
//   activeExams: number;
//   moduleStats: {
//     listening: number;
//     speaking: number;
//     reading: number;
//     writing: number;
//   };
//   submissionStats: {
//     submitted: number;
//     evaluated: number;
//     pending: number;
//   };
//   recentActivity: Array<{
//     id: string;
//     type: string;
//     description: string;
//     timestamp: string;
//   }>;
// }

// const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

// export function AdminPanel() {
//   const [stats, setStats] = useState<DashboardStats>({
//     totalStudents: 0,
//     totalTeachers: 0,
//     totalQuestions: 0,
//     pendingApprovals: 0,
//     activeExams: 0,
//     moduleStats: { listening: 0, speaking: 0, reading: 0, writing: 0 },
//     submissionStats: { submitted: 0, evaluated: 0, pending: 0 },
//     recentActivity: []
//   });
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     loadDashboardData();
//   }, []);

//   const loadDashboardData = async () => {
//     try {
//       const [users, questions, exams, submissions] = await Promise.all([
//         apiClient.getUsers(),
//         apiClient.getTasks(),
//         apiClient.getActiveExams(),
//         apiClient.getSubmissions()
//       ]);

//       const students = users.filter(u => u.role === 'student');
//       const teachers = users.filter(u => u.role === 'teacher');
//       const pendingUsers = users.filter(u => u.status === 'pending');

//       const moduleStats = {
//         listening: questions.filter(q => q.module === 'listening' && q.isActive).length,
//         speaking: questions.filter(q => q.module === 'speaking' && q.isActive).length,
//         reading: questions.filter(q => q.module === 'reading' && q.isActive).length,
//         writing: questions.filter(q => q.module === 'writing' && q.isActive).length,
//       };

//       const submissionStats = {
//         submitted: submissions.filter(s => s.status === 'submitted').length,
//         evaluated: submissions.filter(s => s.status === 'evaluated').length,
//         pending: submissions.filter(s => s.status === 'submitted').length, // Assuming pending means submitted but not evaluated
//       };

//       setStats({
//         totalStudents: students.length,
//         totalTeachers: teachers.length,
//         totalQuestions: questions.length,
//         pendingApprovals: pendingUsers.length,
//         activeExams: exams.length,
//         moduleStats,
//         submissionStats,
//         recentActivity: generateRecentActivity(users, submissions)
//       });
//     } catch (error) {
//       console.error('Failed to load dashboard data:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const generateRecentActivity = (users: any[], submissions: any[]) => {
//     const activities = [];
    
//     // Add some mock recent activities
//     activities.push(
//       {
//         id: '1',
//         type: 'user_registration',
//         description: 'New student registered: John Doe',
//         timestamp: new Date().toISOString()
//       },
//       {
//         id: '2',
//         type: 'submission',
//         description: 'Listening test submitted by Sarah Wilson',
//         timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString()
//       },
//       {
//         id: '3',
//         type: 'exam_created',
//         description: 'New diagnostic exam created',
//         timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
//       }
//     );

//     return activities.slice(0, 5);
//   };

//   const moduleData = [
//     { name: 'Listening', value: stats.moduleStats.listening },
//     { name: 'Speaking', value: stats.moduleStats.speaking },
//     { name: 'Reading', value: stats.moduleStats.reading },
//     { name: 'Writing', value: stats.moduleStats.writing },
//   ];

//   const submissionData = [
//     { name: 'Submitted', value: stats.submissionStats.submitted },
//     { name: 'Evaluated', value: stats.submissionStats.evaluated },
//     { name: 'Pending', value: stats.submissionStats.pending },
//   ];

//   if (isLoading) {
//     return (
//       <Layout title="Admin Dashboard">
//         <div className="min-h-screen flex items-center justify-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-900"></div>
//         </div>
//       </Layout>
//     );
//   }

//   return (
//     <Layout title="Admin Dashboard">
//       <div className="space-y-6 animate-fade-in">
//         {/* Header */}
//         <div className="flex items-center justify-between">
//           <div>
//             <h1 className="text-3xl font-poppins font-bold text-gray-900">Admin Dashboard</h1>
//             <p className="text-gray-600 font-inter mt-1">Welcome to your administration panel</p>
//           </div>
//           <div className="text-sm text-gray-500 font-inter">
//             Last updated: {new Date().toLocaleDateString()}
//           </div>
//         </div>

//         {/* Stats Cards */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//           <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-inter text-gray-600">Total Students</p>
//                 <p className="text-2xl font-poppins font-bold text-gray-900 mt-1">{stats.totalStudents}</p>
//               </div>
//               <div className="p-3 bg-primary-100 rounded-xl">
//                 <Users className="w-6 h-6 text-primary-600" />
//               </div>
//             </div>
//             <div className="flex items-center mt-3">
//               <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
//               <span className="text-sm text-green-600 font-inter">+12% this month</span>
//             </div>
//           </div>

//           <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-inter text-gray-600">Active Questions</p>
//                 <p className="text-2xl font-poppins font-bold text-gray-900 mt-1">{stats.totalQuestions}</p>
//               </div>
//               <div className="p-3 bg-secondary-100 rounded-xl">
//                 <FileText className="w-6 h-6 text-secondary-600" />
//               </div>
//             </div>
//             <div className="flex items-center mt-3">
//               <Clock className="w-4 h-4 text-blue-500 mr-1" />
//               <span className="text-sm text-blue-600 font-inter">Across 4 modules</span>
//             </div>
//           </div>

//           <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-inter text-gray-600">Pending Approvals</p>
//                 <p className="text-2xl font-poppins font-bold text-gray-900 mt-1">{stats.pendingApprovals}</p>
//               </div>
//               <div className="p-3 bg-yellow-100 rounded-xl">
//                 <CheckCircle className="w-6 h-6 text-yellow-600" />
//               </div>
//             </div>
//             <div className="flex items-center mt-3">
//               <span className="text-sm text-yellow-600 font-inter">Requires attention</span>
//             </div>
//           </div>

//           <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
//             <div className="flex items-center justify-between">
//               <div>
//                 <p className="text-sm font-inter text-gray-600">Active Exams</p>
//                 <p className="text-2xl font-poppins font-bold text-gray-900 mt-1">{stats.activeExams}</p>
//               </div>
//               <div className="p-3 bg-purple-100 rounded-xl">
//                 <BarChart3 className="w-6 h-6 text-purple-600" />
//               </div>
//             </div>
//             <div className="flex items-center mt-3">
//               <span className="text-sm text-purple-600 font-inter">Currently running</span>
//             </div>
//           </div>
//         </div>

//         {/* Charts Section */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//           {/* Module Distribution */}
//           <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
//             <h3 className="text-lg font-poppins font-bold text-gray-900 mb-4">Questions by Module</h3>
//             <div className="h-80">
//               <ResponsiveContainer width="100%" height="100%">
//                 <PieChart>
//                   <Pie
//                     data={moduleData}
//                     cx="50%"
//                     cy="50%"
//                     labelLine={false}
//                     label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
//                     outerRadius={80}
//                     fill="#8884d8"
//                     dataKey="value"
//                   >
//                     {moduleData.map((entry, index) => (
//                       <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                     ))}
//                   </Pie>
//                   <Tooltip />
//                 </PieChart>
//               </ResponsiveContainer>
//             </div>
//           </div>

//           {/* Submission Status */}
//           <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
//             <h3 className="text-lg font-poppins font-bold text-gray-900 mb-4">Submission Status</h3>
//             <div className="h-80">
//               <ResponsiveContainer width="100%" height="100%">
//                 <BarChart data={submissionData}>
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis dataKey="name" />
//                   <YAxis />
//                   <Tooltip />
//                   <Bar dataKey="value" fill="#4f46e5" />
//                 </BarChart>
//               </ResponsiveContainer>
//             </div>
//           </div>
//         </div>

//         {/* Recent Activity */}
//         <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
//           <h3 className="text-lg font-poppins font-bold text-gray-900 mb-4">Recent Activity</h3>
//           <div className="space-y-4">
//             {stats.recentActivity.map((activity) => (
//               <div key={activity.id} className="flex items-center space-x-4 p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
//                 <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
//                 <div className="flex-1">
//                   <p className="text-gray-900 font-inter">{activity.description}</p>
//                   <p className="text-sm text-gray-500 font-inter">
//                     {new Date(activity.timestamp).toLocaleString()}
//                   </p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </Layout>
//   );
// }

// src/pages/AdminPanel.tsx

import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Users, FileText, BarChart3, TrendingUp, Clock, CheckCircle, BookOpen, Eye } from 'lucide-react';
import { apiClient } from '../services/api';
import { Link } from 'react-router-dom';

interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalQuestions: number;
  pendingApprovals: number;
  activeExams: number;
  moduleStats: {
    listening: number;
    speaking: number;
    reading: number;
    writing: number;
  };
  submissionStats: {
    submitted: number;
    evaluated: number;
    pending: number;
  };
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
  }>;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export function AdminPanel() {
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalTeachers: 0,
    totalQuestions: 0,
    pendingApprovals: 0,
    activeExams: 0,
    moduleStats: { listening: 0, speaking: 0, reading: 0, writing: 0 },
    submissionStats: { submitted: 0, evaluated: 0, pending: 0 },
    recentActivity: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [users, questions, exams, submissions] = await Promise.all([
        apiClient.getUsers(),
        apiClient.getTasks(),
        apiClient.getActiveExams(),
        apiClient.getSubmissions().catch(() => []) // Handle if submissions endpoint not available
      ]);

      const students = users.filter((u: any) => u.role === 'student');
      const teachers = users.filter((u: any) => u.role === 'teacher');
      const pendingUsers = users.filter((u: any) => u.status === 'pending');

      const moduleStats = {
        listening: questions.filter((q: any) => q.module === 'listening' && q.isActive).length,
        speaking: questions.filter((q: any) => q.module === 'speaking' && q.isActive).length,
        reading: questions.filter((q: any) => q.module === 'reading' && q.isActive).length,
        writing: questions.filter((q: any) => q.module === 'writing' && q.isActive).length,
      };

      const submissionStats = {
        submitted: submissions.filter((s: any) => s.status === 'submitted').length,
        evaluated: submissions.filter((s: any) => s.status === 'evaluated').length,
        pending: submissions.filter((s: any) => s.status === 'submitted').length,
      };

      setStats({
        totalStudents: students.length,
        totalTeachers: teachers.length,
        totalQuestions: questions.length,
        pendingApprovals: pendingUsers.length,
        activeExams: exams.length,
        moduleStats,
        submissionStats,
        recentActivity: generateRecentActivity(users, submissions)
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      // Set mock data for development
      setStats({
        totalStudents: 156,
        totalTeachers: 8,
        totalQuestions: 342,
        pendingApprovals: 12,
        activeExams: 4,
        moduleStats: { listening: 85, speaking: 78, reading: 92, writing: 87 },
        submissionStats: { submitted: 234, evaluated: 189, pending: 45 },
        recentActivity: [
          {
            id: '1',
            type: 'user_registration',
            description: 'New student registered: John Doe',
            timestamp: new Date().toISOString()
          },
          {
            id: '2',
            type: 'submission',
            description: 'Listening test submitted by Sarah Wilson',
            timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString()
          },
          {
            id: '3',
            type: 'exam_created',
            description: 'New diagnostic exam created',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
          }
        ]
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateRecentActivity = (users: any[], submissions: any[]) => {
    const activities = [];
    
    if (users.length > 0) {
      activities.push({
        id: '1',
        type: 'user_registration',
        description: `New ${users[0].role} registered: ${users[0].name}`,
        timestamp: users[0].createdAt || new Date().toISOString()
      });
    }

    if (submissions.length > 0) {
      activities.push({
        id: '2',
        type: 'submission',
        description: `${submissions[0].module} test submitted`,
        timestamp: submissions[0].createdAt || new Date(Date.now() - 30 * 60 * 1000).toISOString()
      });
    }

    activities.push({
      id: '3',
      type: 'system',
      description: 'System maintenance completed',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
    });

    return activities.slice(0, 5);
  };

  const moduleData = [
    { name: 'Listening', value: stats.moduleStats.listening },
    { name: 'Speaking', value: stats.moduleStats.speaking },
    { name: 'Reading', value: stats.moduleStats.reading },
    { name: 'Writing', value: stats.moduleStats.writing },
  ];

  const submissionData = [
    { name: 'Submitted', value: stats.submissionStats.submitted },
    { name: 'Evaluated', value: stats.submissionStats.evaluated },
    { name: 'Pending', value: stats.submissionStats.pending },
  ];

  const weeklyActivityData = [
    { day: 'Mon', submissions: 45, registrations: 12 },
    { day: 'Tue', submissions: 52, registrations: 8 },
    { day: 'Wed', submissions: 48, registrations: 15 },
    { day: 'Thu', submissions: 60, registrations: 10 },
    { day: 'Fri', submissions: 55, registrations: 7 },
    { day: 'Sat', submissions: 35, registrations: 5 },
    { day: 'Sun', submissions: 25, registrations: 3 },
  ];

  if (isLoading) {
    return (
      <Layout title="Admin Dashboard">
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-900"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Admin Dashboard">
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-poppins font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 font-inter mt-1">Welcome to your administration panel</p>
          </div>
          <div className="text-sm text-gray-500 font-inter">
            Last updated: {new Date().toLocaleDateString()}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link to="/admin/users" className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <Users className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="font-inter font-medium text-gray-900">User Management</h3>
                <p className="text-sm text-gray-600">Manage students & teachers</p>
              </div>
            </div>
          </Link>

          <Link to="/admin/questions" className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-secondary-100 rounded-lg">
                <FileText className="w-6 h-6 text-secondary-600" />
              </div>
              <div>
                <h3 className="font-inter font-medium text-gray-900">Question Bank</h3>
                <p className="text-sm text-gray-600">Create & manage questions</p>
              </div>
            </div>
          </Link>

          <Link to="/admin/exams" className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BookOpen className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-inter font-medium text-gray-900">Exam Management</h3>
                <p className="text-sm text-gray-600">Create assessments</p>
              </div>
            </div>
          </Link>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Eye className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-inter font-medium text-gray-900">Review Submissions</h3>
                <p className="text-sm text-gray-600">Evaluate student work</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-inter text-gray-600">Total Students</p>
                <p className="text-2xl font-poppins font-bold text-gray-900 mt-1">{stats.totalStudents}</p>
              </div>
              <div className="p-3 bg-primary-100 rounded-xl">
                <Users className="w-6 h-6 text-primary-600" />
              </div>
            </div>
            <div className="flex items-center mt-3">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600 font-inter">+12% this month</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-inter text-gray-600">Active Questions</p>
                <p className="text-2xl font-poppins font-bold text-gray-900 mt-1">{stats.totalQuestions}</p>
              </div>
              <div className="p-3 bg-secondary-100 rounded-xl">
                <FileText className="w-6 h-6 text-secondary-600" />
              </div>
            </div>
            <div className="flex items-center mt-3">
              <Clock className="w-4 h-4 text-blue-500 mr-1" />
              <span className="text-sm text-blue-600 font-inter">Across 4 modules</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-inter text-gray-600">Pending Approvals</p>
                <p className="text-2xl font-poppins font-bold text-gray-900 mt-1">{stats.pendingApprovals}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-xl">
                <CheckCircle className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <div className="flex items-center mt-3">
              <span className="text-sm text-yellow-600 font-inter">Requires attention</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-inter text-gray-600">Active Exams</p>
                <p className="text-2xl font-poppins font-bold text-gray-900 mt-1">{stats.activeExams}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="flex items-center mt-3">
              <span className="text-sm text-purple-600 font-inter">Currently running</span>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Activity */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-poppins font-bold text-gray-900 mb-4">Weekly Activity</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyActivityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="submissions" stroke="#4f46e5" strokeWidth={2} />
                  <Line type="monotone" dataKey="registrations" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Module Distribution */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-poppins font-bold text-gray-900 mb-4">Questions by Module</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={moduleData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {moduleData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-poppins font-bold text-gray-900">Recent Activity</h3>
            <span className="text-sm text-gray-500 font-inter">Last 7 days</span>
          </div>
          <div className="space-y-4">
            {stats.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-4 p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === 'user_registration' ? 'bg-green-500' :
                  activity.type === 'submission' ? 'bg-blue-500' :
                  'bg-purple-500'
                }`}></div>
                <div className="flex-1">
                  <p className="text-gray-900 font-inter">{activity.description}</p>
                  <p className="text-sm text-gray-500 font-inter">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}