import React, { useEffect, useState } from 'react';
import {
  FaUserPlus,
  FaEdit,
  FaTrashAlt,
  FaKey,
  FaUser,
  FaIdCard,
  FaUserTag,
  FaSave,
  FaTimes,
  FaLock,
  FaEye,
  FaEyeSlash,
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

  // États pour les modals
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  // États pour les formulaires
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [userForm, setUserForm] = useState({
    username: '',
    full_name: '',
    password: '',
    role: 'user',
  });

  const [formErrors, setFormErrors] = useState({});
  const [formSuccess, setFormSuccess] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('/auth/users');
        setUsers(response.data);
      } catch (error) {
        setError(error.response?.data?.message || 'Ошибка загрузки');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Filtrage et pagination
  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
        await api.delete(`/auth/${userId}`);
        setUsers(users.filter((user) => user.uid !== userId));
      } catch (error) {
        alert(`Ошибка: ${error.response?.data?.message || error.message}`);
      }
    }
  };

  // Ouvrir la modale de changement de mot de passe
  const openPasswordModal = (user) => {
    setSelectedUser(user);
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
    setPasswordSuccess('');
    setPasswordModalOpen(true);
  };

  // Changer le mot de passe d'un utilisateur
  const changeUserPassword = async () => {
    // Validation
    if (newPassword.length < 8) {
      setPasswordError('Пароль должен содержать не менее 8 символов');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Пароли не совпадают');
      return;
    }

    try {
      const response = await api.patch(
        `/auth/update-password/${selectedUser.uid}`,
        { password: newPassword },
      );

      if (response.data && response.data.success) {
        setPasswordSuccess('Пароль успешно обновлен!');
        setTimeout(() => setPasswordModalOpen(false), 1500);
      }
    } catch (error) {
      setPasswordError(
        error.response?.data?.detail || 'Ошибка при обновлении пароля',
      );
    }
  };

  // Ouvrir le modal de création
  const openCreateModal = () => {
    setUserForm({
      username: '',
      full_name: '',
      password: '',
      role: 'user',
    });
    setFormErrors({});
    setFormSuccess('');
    setCreateModalOpen(true);
  };

  // Ouvrir le modal d'édition
  const openEditModal = (user) => {
    setSelectedUser(user);
    setUserForm({
      username: user.username,
      full_name: user.full_name,
      role: user.role,
      password: '', // Le mot de passe n'est pas pré-rempli
    });
    setFormErrors({});
    setFormSuccess('');
    setEditModalOpen(true);
  };

  // Gestion des changements dans les formulaires
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserForm({
      ...userForm,
      [name]: value,
    });
  };

  // Validation du formulaire
  const validateForm = () => {
    const errors = {};

    if (!userForm.username.trim()) {
      errors.username = 'Логин обязателен';
    }

    if (!userForm.full_name.trim()) {
      errors.full_name = 'Полное имя обязательно';
    }

    // Pour la création, le mot de passe est requis
    if (createModalOpen && !userForm.password) {
      errors.password = 'Пароль обязателен';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Créer un nouvel utilisateur
  const createNewUser = async () => {
    if (!validateForm()) return;

    try {
      const response = await api.post('/auth/signup', userForm);

      // Mettre à jour la liste des utilisateurs
      setUsers([...users, response.data.user]);

      setFormSuccess('Пользователь успешно создан!');
      setTimeout(() => {
        setCreateModalOpen(false);
        setFormSuccess('');
      }, 1500);
    } catch (error) {
      setFormErrors({
        general: error.response?.data?.detail || 'Ошибка создания пользователя',
      });
    }
  };

  // Mettre à jour un utilisateur
  const updateUser = async () => {
    if (!validateForm()) return;

    try {
      const response = await api.patch(`/auth/update/${selectedUser.uid}`, {
        username: userForm.username,
        full_name: userForm.full_name,
        role: userForm.role,
      });

      // Mettre à jour la liste des utilisateurs
      const updatedUsers = users.map((user) =>
        user.uid === selectedUser.uid ? { ...user, ...response.data } : user,
      );
      setUsers(updatedUsers);

      setFormSuccess('Данные пользователя обновлены!');
      setTimeout(() => {
        setEditModalOpen(false);
        setFormSuccess('');
      }, 1500);
    } catch (error) {
      setFormErrors({
        general:
          error.response?.data?.detail || 'Ошибка обновления пользователя',
      });
    }
  };

  const translateRole = (role) => {
    const rolesMap = {
      admin: 'Администратор',
      user: 'Пользователь',
      guest: 'Гость',
      work: 'Рабочий',
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 p-6 rounded-lg text-red-700 max-w-md text-center">
          <p className="font-medium">Ошибка загрузки</p>
          <p className="mt-2 text-sm">{error}</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="w-full mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
            Управление пользователями
          </h1>
          <p className="text-gray-600">Все пользователи системы</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header avec bouton et recherche */}
          <div className="p-4 flex flex-col md:flex-row justify-between items-center gap-4 border-b border-gray-100">
            <button
              onClick={openCreateModal}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors w-full md:w-auto"
            >
              <FaUserPlus />
              <span>Создать пользователя</span>
            </button>

            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="Поиск пользователей..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                ></path>
              </svg>
            </div>
          </div>

          {/* Tableau */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Логин
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Полное имя
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Роль
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Создан
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Обновлён
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {currentUsers.length === 0 ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      {searchTerm
                        ? 'Пользователи не найдены'
                        : 'Нет пользователей'}
                    </td>
                  </tr>
                ) : (
                  currentUsers.map((user) => (
                    <tr
                      key={user.uid}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {user.username}
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {user.full_name || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            user.role === 'admin'
                              ? 'bg-red-100 text-red-800'
                              : user.role === 'user'
                                ? 'bg-blue-100 text-blue-800'
                                : user.role === 'work'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {translateRole(user.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-sm">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-sm">
                        {formatDate(user.updated_at)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openPasswordModal(user)}
                            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                            title="Изменить пароль"
                          >
                            <FaKey />
                          </button>
                          <button
                            onClick={() => openEditModal(user)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            title="Редактировать"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(user.uid)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Удалить"
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
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Показано {indexOfFirstUser + 1}-
                {Math.min(indexOfLastUser, filteredUsers.length)} из{' '}
                {filteredUsers.length} пользователей
              </div>

              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => paginate(page)}
                      className={`w-8 h-8 rounded flex items-center justify-center ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  ),
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de changement de mot de passe */}
      <Modal
        isOpen={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">
              Изменить пароль для {selectedUser?.username}
            </h2>
            <button
              onClick={() => setPasswordModalOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <FaTimes />
            </button>
          </div>

          {passwordSuccess ? (
            <div className="bg-green-50 p-3 rounded-lg text-green-700 mb-4">
              {passwordSuccess}
            </div>
          ) : (
            <>
              {passwordError && (
                <div className="bg-red-50 p-3 rounded-lg text-red-700 mb-4">
                  {passwordError}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="new-password"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Новый пароль
                  </label>
                  <div className="relative">
                    <input
                      id="new-password"
                      type={showPassword ? 'text' : 'password'}
                      className="w-full p-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Введите новый пароль"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          ></path>
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          ></path>
                        </svg>
                      ) : (
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                          ></path>
                        </svg>
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Минимум 8 символов
                  </p>
                </div>
                <div>
                  <label
                    htmlFor="confirm-password"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Подтвердите пароль
                  </label>
                  <div className="relative">
                    <input
                      id="confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      className="w-full p-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Подтвердите новый пароль"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? (
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          ></path>
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          ></path>
                        </svg>
                      ) : (
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                          ></path>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setPasswordModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Отмена
                </button>
                <button
                  onClick={changeUserPassword}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Сохранить пароль
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* Modal de création d'utilisateur */}
      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <FaUserTag className="text-purple-600" />
              Создание пользователя
            </h2>
            <button
              onClick={() => setCreateModalOpen(false)}
              className="text-gray-500 hover:text-gray-700"
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

              <form className="space-y-4">
                <div className="relative">
                  <FaUser className="absolute top-1/2 left-4 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="username"
                    placeholder="Логин"
                    className="w-full pl-12 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
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
                  <FaIdCard className="absolute top-1/2 left-4 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="full_name"
                    placeholder="Полное имя"
                    className="w-full pl-12 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
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
                  <FaLock className="absolute top-1/2 left-4 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Пароль"
                    className="w-full pl-12 pr-12 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    value={userForm.password}
                    onChange={handleInputChange}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
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
                  <FaUserTag className="absolute top-1/2 left-4 transform -translate-y-1/2 text-gray-400" />
                  <select
                    name="role"
                    className="w-full pl-12 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                    value={userForm.role}
                    onChange={handleInputChange}
                  >
                    <option value="user">Обычный пользователь</option>
                    <option value="admin">Администратор</option>
                    <option value="guest">Гость</option>
                    <option value="work">Рабочий</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setCreateModalOpen(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Отмена
                  </button>
                  <button
                    type="button"
                    onClick={createNewUser}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <FaUserPlus />
                    Создать
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </Modal>

      {/* Modal d'édition d'utilisateur */}
      <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <FaUser className="text-purple-600" />
              Редактирование пользователя
            </h2>
            <button
              onClick={() => setEditModalOpen(false)}
              className="text-gray-500 hover:text-gray-700"
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

              <form className="space-y-4">
                <div className="relative">
                  <FaUser className="absolute top-1/2 left-4 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="username"
                    placeholder="Логин"
                    className="w-full pl-12 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
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
                  <FaIdCard className="absolute top-1/2 left-4 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="full_name"
                    placeholder="Полное имя"
                    className="w-full pl-12 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
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
                  <FaUserTag className="absolute top-1/2 left-4 transform -translate-y-1/2 text-gray-400" />
                  <select
                    name="role"
                    className="w-full pl-12 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                    value={userForm.role}
                    onChange={handleInputChange}
                  >
                    <option value="admin">Администратор</option>
                    <option value="user">Пользователь</option>
                    <option value="guest">Гость</option>
                    <option value="work">Рабочий</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setEditModalOpen(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Отмена
                  </button>
                  <button
                    type="button"
                    onClick={updateUser}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <FaSave />
                    Сохранить
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default Dashboard;
