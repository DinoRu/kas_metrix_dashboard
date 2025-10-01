import { useEffect, useState } from 'react';
import {
  FaEdit,
  FaEye,
  FaEyeSlash,
  FaIdCard,
  FaKey,
  FaLeaf,
  FaLock,
  FaSave,
  FaSearch,
  FaTimes,
  FaTrashAlt,
  FaUser,
  FaUserPlus,
  FaUserTag,
} from 'react-icons/fa';
import api from '../api';
import Modal from '../components/Modal';

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 8;

  // Ref for search input
  const searchInputRef = useRef(null);

  // Modal states
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Form states
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoadingAction, setIsLoadingAction] = useState(false);

  const [userForm, setUserForm] = useState({
    username: '',
    full_name: '',
    password: '',
    role: 'controller',
  });

  const [formErrors, setFormErrors] = useState({});
  const [formSuccess, setFormSuccess] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('/user/users');
        setUsers(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('Error fetching users:', error);
        setError(error.response?.data?.detail || 'Error fetching users');
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Filtering and pagination
  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ??
        false) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleDelete = async (userId) => {
    if (window.confirm('Подтвердить удаление пользователя?')) {
      try {
        setIsLoadingAction(true);
        await api.delete(`/user/profile/${userId}`);
        setUsers(users.filter((user) => user.id !== userId));
      } catch (error) {
        alert(
          `Error: ${error.response?.data?.detail || 'Failed to delete user'}`,
        );
      } finally {
        setIsLoadingAction(false);
      }
    }
  };

  // Function to blur search input
  const blurSearchInput = () => {
    if (searchInputRef.current) {
      searchInputRef.current.blur();
    }
  };

  // Open password change modal
  const openPasswordModal = (user) => {
    setSelectedUser(user);
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
    setPasswordSuccess('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setPasswordModalOpen(true);
    blurSearchInput()
  };

  // Change user password
  const changeUserPassword = async () => {
    setPasswordError('');
    setPasswordSuccess('');
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    try {
      setIsLoadingAction(true);
      await api.put(`/user/${selectedUser.id}/password`, {
        user_id: selectedUser.id,
        new_password: newPassword,
      });
      setPasswordSuccess('Password updated successfully!');
      setTimeout(() => setPasswordModalOpen(false), 1500);
    } catch (error) {
      setPasswordError(
        error.response?.data?.detail || 'Error updating password',
      );
    } finally {
      setIsLoadingAction(false);
    }
  };

  // Open create modal
  const openCreateModal = () => {
    setUserForm({
      username: '',
      full_name: '',
      password: '',
      role: 'controller',
    });
    setFormErrors({});
    setFormSuccess('');
    setShowPassword(false);
    setCreateModalOpen(true);
    blurSearchInput();
  };

  // Open edit modal
  const openEditModal = (user) => {
    setSelectedUser(user);
    setUserForm({
      username: user.username,
      full_name: user.full_name || '',
      role: user.role,
      password: '',
    });
    setFormErrors({});
    setFormSuccess('');
    setEditModalOpen(true);
    blurSearchInput();
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserForm({
      ...userForm,
      [name]: value,
    });
  };

  // Validate form
  const validateForm = () => {
    const errors = {};

    if (!userForm.username.trim()) {
      errors.username = 'Username is required';
    }

    if (!userForm.full_name.trim()) {
      errors.full_name = 'Full name is required';
    }

    if (createModalOpen && !userForm.password) {
      errors.password = 'Password is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Create new user
  const createNewUser = async () => {
    if (!validateForm()) return;

    try {
      setIsLoadingAction(true);
      const response = await api.post('/user/register', userForm);
      const newUser = response.data;
      if (!newUser || !newUser.id) {
        throw new Error('Invalid user data in response');
      }
      setUsers([...users, newUser]);
      setFormSuccess('User created successfully!');
      setTimeout(() => {
        setCreateModalOpen(false);
        setFormSuccess('');
      }, 1500);
    } catch (error) {
      console.error('Create User Error:', error);
      setFormErrors({
        general: error.response?.data?.detail || 'Error creating user',
      });
    } finally {
      setIsLoadingAction(false);
    }
  };

  // Update user
  const updateUser = async () => {
    if (!validateForm()) return;

    try {
      setIsLoadingAction(true);
      const response = await api.put(`/user/update/${selectedUser.id}`, {
        username: userForm.username,
        full_name: userForm.full_name,
        role: userForm.role,
      });
      const updatedUsers = users.map((user) =>
        user.id === selectedUser.id ? { ...user, ...response.data } : user,
      );
      setUsers(updatedUsers);
      setFormSuccess('User data updated successfully!');
      setTimeout(() => {
        setEditModalOpen(false);
        setFormSuccess('');
      }, 1500);
    } catch (error) {
      setFormErrors({
        general: error.response?.data?.detail || 'Error updating user',
      });
    } finally {
      setIsLoadingAction(false);
    }
  };

  const translateRole = (role) => {
    const rolesMap = {
      admin: 'Администратор',
      controller: 'Контролер',
    };
    return rolesMap[role] || role;
  };

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent"></div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <div className="bg-red-50 p-6 rounded-lg text-red-700 max-w-md text-center border border-red-200">
          <p className="font-medium">Error loading</p>
          <p className="mt-2 text-sm">{error}</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen flex flex-col bg-green-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-600 to-emerald-700 text-white p-4 shadow-lg">
        <div className="w-full mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <div className="bg-white p-2 rounded-lg mr-4 shadow-md">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 w-10 h-10 rounded-full flex items-center justify-center">
                <FaLeaf className="text-white text-xl" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                КАСПИЭНЕРГОСБЫТ
              </h1>
              <p className="text-green-100">Управление пользователями</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8">
        <div className="w-full mx-auto">
          <div className="bg-white rounded-xl shadow-md border border-green-100 overflow-hidden">
            {/* Header with button and search */}
            <div className="p-4 flex flex-col md:flex-row justify-between items-center gap-4 border-b border-green-100">
              <button
                onClick={openCreateModal}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors w-full md:w-auto shadow-sm"
              >
                <FaUserPlus />
                <span>Создать пользователя</span>
              </button>

              <div className="relative w-full md:w-64">
                <FaSearch className="absolute top-1/2 left-4 transform -translate-y-1/2 text-green-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Поиск пользователей..."
                  className="w-full pl-12 pr-4 py-2 rounded-lg border border-green-200 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 transition-all text-green-800"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Логин
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Полное имя
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Роль
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Создан
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                      Обновлён
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-green-100">
                  {currentUsers.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-6 py-8 text-center text-green-600"
                      >
                        <div className="flex flex-col items-center">
                          <FaLeaf className="text-4xl text-green-300 mb-2" />
                          <p>
                            {searchTerm
                              ? 'Пользователи не найдены'
                              : 'Нет пользователей'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    currentUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="hover:bg-green-50 transition-colors"
                      >
                        <td className="px-6 py-4 font-medium text-green-800">
                          {user.username}
                        </td>
                        <td className="px-6 py-4 text-green-700">
                          {user.full_name || '-'}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${user.role === 'admin'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-emerald-100 text-emerald-800'
                              }`}
                          >
                            {translateRole(user.role)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-green-600 text-sm">
                          {formatDate(user.created_at)}
                        </td>
                        <td className="px-6 py-4 text-green-600 text-sm">
                          {formatDate(user.updated_at)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => openPasswordModal(user)}
                              className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                              title="Изменить пароль"
                              aria-label={`Изменить пароль для ${user.username}`}
                            >
                              <FaKey />
                            </button>
                            <button
                              onClick={() => openEditModal(user)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all"
                              title="Редактировать"
                              aria-label={`Редактировать пользователя ${user.username}`}
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDelete(user.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                              title="Удалить"
                              aria-label={`Удалить пользователя ${user.username}`}
                              disabled={isLoadingAction}
                            >
                              <FaTrashAlt />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredUsers.length > usersPerPage && (
              <div className="px-6 py-4 border-t border-green-100 flex flex-col sm:flex-row items-center justify-between bg-green-50">
                <div className="text-sm text-green-700 mb-2 sm:mb-0">
                  Показано {indexOfFirstUser + 1}-
                  {Math.min(indexOfLastUser, filteredUsers.length)} из{' '}
                  {filteredUsers.length} пользователей
                </div>
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => paginate(pageNum)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${currentPage === pageNum
                          ? 'bg-emerald-500 text-white'
                          : 'text-green-700 hover:bg-green-100'
                          }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-green-600 to-emerald-700 text-white py-4 shadow-inner">
        <div className="w-full mx-auto text-center">
          <p className="flex items-center justify-center">
            <FaLeaf className="mr-2 text-green-200" />© 2025 КАСПИЭНЕРГОСБЫТ.
            СЧЕТ-УЧЕТ
          </p>
          <p className="text-green-200 text-sm mt-1">Версия 1.0.1</p>
        </div>
      </footer>

      {/* Password Change Modal */}
      <Modal
        isOpen={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
      >
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-green-800 flex items-center gap-2">
              <FaKey className="text-emerald-600" />
              Изменить пароль для {selectedUser?.username}
            </h2>
            <button
              onClick={() => setPasswordModalOpen(false)}
              className="text-green-500 hover:text-green-700"
            >
              <FaTimes />
            </button>
          </div>

          {passwordSuccess ? (
            <div className="bg-green-50 p-3 rounded-lg flex items-center text-green-700 mb-4">
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              {passwordSuccess}
            </div>
          ) : (
            <>
              {passwordError && (
                <div className="bg-red-50 p-3 rounded-lg flex items-center text-red-700 mb-4">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {passwordError}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="new-password"
                    className="block text-sm font-medium text-green-700 mb-1"
                  >
                    Новый пароль
                  </label>
                  <div className="relative">
                    <FaLock className="absolute top-1/2 left-4 transform -translate-y-1/2 text-green-400" />
                    <input
                      id="new-password"
                      type={showPassword ? 'text' : 'password'}
                      className="w-full pl-12 pr-10 py-2 rounded-lg border border-green-200 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 transition-all text-green-800"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Введите новый пароль"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-400 hover:text-green-600"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                  <p className="text-xs text-green-600 mt-1">
                    Minimum 8 characters
                  </p>
                </div>
                <div>
                  <label
                    htmlFor="confirm-password"
                    className="block text-sm font-medium text-green-700 mb-1"
                  >
                    Подтвердите пароль
                  </label>
                  <div className="relative">
                    <FaLock className="absolute top-1/2 left-4 transform -translate-y-1/2 text-green-400" />
                    <input
                      id="confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      className="w-full pl-12 pr-10 py-2 rounded-lg border border-green-200 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 transition-all text-green-800"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Подтвердите новый пароль"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-400 hover:text-green-600"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setPasswordModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all"
                  disabled={isLoadingAction}
                >
                  Отмена
                </button>
                <button
                  onClick={changeUserPassword}
                  className={`px-4 py-2 flex items-center gap-2 rounded-lg transition-all ${isLoadingAction
                    ? 'bg-emerald-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white'
                    }`}
                  disabled={isLoadingAction}
                >
                  {isLoadingAction ? (
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  ) : (
                    <FaSave />
                  )}
                  Сохранить
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* Create User Modal */}
      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)}>
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-green-800 flex items-center gap-2">
              <FaUserTag className="text-emerald-600" />
              Создание пользователя
            </h2>
            <button
              onClick={() => setCreateModalOpen(false)}
              className="text-green-500 hover:text-green-700"
            >
              <FaTimes />
            </button>
          </div>

          {formSuccess ? (
            <div className="bg-green-50 p-3 rounded-lg flex items-center text-green-700 mb-4">
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              {formSuccess}
            </div>
          ) : (
            <>
              {formErrors.general && (
                <div className="bg-red-50 p-3 rounded-lg flex items-center text-red-700 mb-4">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {formErrors.general}
                </div>
              )}

              <div className="space-y-4">
                <div className="relative">
                  <FaUser className="absolute top-1/2 left-4 transform -translate-y-1/2 text-green-400" />
                  <input
                    type="text"
                    name="username"
                    placeholder="Логин"
                    className="w-full pl-12 pr-4 py-2 rounded-lg border border-green-200 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 transition-all text-green-800"
                    value={userForm.username}
                    onChange={handleInputChange}
                  />
                  {formErrors.username && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.username}
                    </p>
                  )}
                </div>

                <div className="relative">
                  <FaIdCard className="absolute top-1/2 left-4 transform -translate-y-1/2 text-green-400" />
                  <input
                    type="text"
                    name="full_name"
                    placeholder="Полное имя"
                    className="w-full pl-12 pr-4 py-2 rounded-lg border border-green-200 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 transition-all text-green-800"
                    value={userForm.full_name}
                    onChange={handleInputChange}
                  />
                  {formErrors.full_name && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.full_name}
                    </p>
                  )}
                </div>

                <div className="relative">
                  <FaLock className="absolute top-1/2 left-4 transform -translate-y-1/2 text-green-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Пароль"
                    className="w-full pl-12 pr-12 py-2 rounded-lg border border-green-200 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 transition-all text-green-800"
                    value={userForm.password}
                    onChange={handleInputChange}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-green-400 hover:text-green-600"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                  {formErrors.password && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.password}
                    </p>
                  )}
                </div>

                <div className="relative">
                  <FaUserTag className="absolute top-1/2 left-4 transform -translate-y-1/2 text-green-400" />
                  <select
                    name="role"
                    className="w-full pl-12 pr-4 py-2 rounded-lg border border-green-200 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 transition-all text-green-800 bg-white appearance-none"
                    value={userForm.role}
                    onChange={handleInputChange}
                  >
                    <option value="controller">Контролер</option>
                    <option value="admin">Администратор</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setCreateModalOpen(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all"
                    disabled={isLoadingAction}
                  >
                    Отмена
                  </button>
                  <button
                    type="button"
                    onClick={createNewUser}
                    className={`px-4 py-2 flex items-center gap-2 rounded-lg transition-all ${isLoadingAction
                      ? 'bg-emerald-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white'
                      }`}
                    disabled={isLoadingAction}
                  >
                    {isLoadingAction ? (
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    ) : (
                      <FaUserPlus />
                    )}
                    Создать
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* Edit User Modal */}
      <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)}>
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-green-800 flex items-center gap-2">
              <FaUser className="text-emerald-600" />
              Редактирование пользователя
            </h2>
            <button
              onClick={() => setEditModalOpen(false)}
              className="text-green-500 hover:text-green-700"
            >
              <FaTimes />
            </button>
          </div>

          {formSuccess ? (
            <div className="bg-green-50 p-3 rounded-lg flex items-center text-green-700 mb-4">
              <svg
                className="w-5 h-5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              {formSuccess}
            </div>
          ) : (
            <>
              {formErrors.general && (
                <div className="bg-red-50 p-3 rounded-lg flex items-center text-red-700 mb-4">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {formErrors.general}
                </div>
              )}

              <div className="space-y-4">
                <div className="relative">
                  <FaUser className="absolute top-1/2 left-4 transform -translate-y-1/2 text-green-400" />
                  <input
                    type="text"
                    name="username"
                    placeholder="Логин"
                    className="w-full pl-12 pr-4 py-2 rounded-lg border border-green-200 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 transition-all text-green-800"
                    value={userForm.username}
                    onChange={handleInputChange}
                  />
                  {formErrors.username && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.username}
                    </p>
                  )}
                </div>

                <div className="relative">
                  <FaIdCard className="absolute top-1/2 left-4 transform -translate-y-1/2 text-green-400" />
                  <input
                    type="text"
                    name="full_name"
                    placeholder="Полное имя"
                    className="w-full pl-12 pr-4 py-2 rounded-lg border border-green-200 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 transition-all text-green-800"
                    value={userForm.full_name}
                    onChange={handleInputChange}
                  />
                  {formErrors.full_name && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.full_name}
                    </p>
                  )}
                </div>

                <div className="relative">
                  <FaUserTag className="absolute top-1/2 left-4 transform -translate-y-1/2 text-green-400" />
                  <select
                    name="role"
                    className="w-full pl-12 pr-4 py-2 rounded-lg border border-green-200 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 transition-all text-green-800 bg-white appearance-none"
                    value={userForm.role}
                    onChange={handleInputChange}
                  >
                    <option value="controller">Контролер</option>
                    <option value="admin">Администратор</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setEditModalOpen(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all"
                    disabled={isLoadingAction}
                  >
                    Отмена
                  </button>
                  <button
                    type="button"
                    onClick={updateUser}
                    className={`px-4 py-2 flex items-center gap-2 rounded-lg transition-all ${isLoadingAction
                      ? 'bg-emerald-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white'
                      }`}
                    disabled={isLoadingAction}
                  >
                    {isLoadingAction ? (
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    ) : (
                      <FaSave />
                    )}
                    Сохранить
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Dashboard;
