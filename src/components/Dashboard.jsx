import React, { useEffect, useState } from 'react';
import {
  FaUserPlus,
  FaEdit,
  FaTrashAlt,
  FaSignOutAlt,
  FaUserCircle,
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import config from '../config/config';
import axios from 'axios';

const Dashboard = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(config().getusers, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
        });
        setUsers(response.data);
      } catch (error) {
        if (error.response?.status === 401) navigate('/login');
        setError(error.response?.data?.message || 'Ошибка загрузки');
      } finally {
        setLoading(false);
      }
    };

    const authCheck = () => {
      const token = localStorage.getItem('authToken');
      const userData = JSON.parse(localStorage.getItem('userData'));
      if (!token || !userData) navigate('/login');
      else {
        setCurrentUser(userData);
        fetchUsers();
      }
    };

    authCheck();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    navigate('/login');
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Подтвердить удаление пользователя?')) {
      try {
        await axios.delete(config().deleteuser(userId), {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('authToken')}`,
          },
        });
        setUsers(users.filter((user) => user.uid !== userId));
      } catch (error) {
        alert(`Ошибка: ${error.response?.data?.message || error.message}`);
      }
    }
  };

  const handleSave = async () => {
    try {
      const uri = config().updateuser(editingUser.uid);
      const response = await axios.patch(
        uri,
        {
          username: editingUser.username,
          full_name: editingUser.full_name,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.status === 200) {
        setUsers(
          users.map((u) =>
            u.uid === editingUser.uid ? { ...u, ...response.data } : u,
          ),
        );
        setEditingUser(null);
        alert('Данные успешно обновлены!');
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        'Ошибка обновления данных';

      alert(`Ошибка: ${JSON.stringify(errorMessage)}`);
    }
  };

  const HeaderSection = () => (
    <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white p-6 rounded-t-lg">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center mb-4 md:mb-0">
          <FaUserCircle className="text-3xl mr-3" />
          <div>
            <h1 className="text-2xl font-bold">Панель управления</h1>
            <p className="text-sm opacity-90">
              Добро пожаловать, {currentUser?.username}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate('/create')}
            className="bg-white/10 hover:bg-white/20 px-6 py-2 rounded-lg flex items-center gap-2 transition-all"
          >
            <FaUserPlus />
            <span>Новый пользователь</span>
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-500/90 hover:bg-red-600 px-6 py-2 rounded-lg flex items-center gap-2 transition-all"
          >
            <FaSignOutAlt />
            <span>Выход</span>
          </button>
        </div>
      </div>
    </div>
  );

  const EditUserModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-lg font-bold mb-4">Редактировать пользователя</h2>
        <label className="block mb-2">
          Логин:
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={editingUser.username}
            onChange={(e) =>
              setEditingUser((prev) => ({ ...prev, username: e.target.value }))
            }
          />
        </label>
        <label className="block mb-2">
          Полное имя:
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={editingUser.full_name}
            onChange={(e) =>
              setEditingUser((prev) => ({ ...prev, full_name: e.target.value }))
            }
          />
        </label>
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={() => setEditingUser(null)}
            className="px-4 py-2 bg-gray-300 rounded"
          >
            Отмена
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );

  const UserTable = () => (
    <div className="rounded-b-lg overflow-hidden border border-gray-100 shadow-sm">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            {[
              'Логин',
              'Полное имя',
              'Роль',
              'Создан',
              'Обновлён',
              'Действия',
            ].map((header, index) => (
              <th
                key={index}
                className="px-6 py-4 text-left text-sm font-semibold text-gray-600"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-100">
          {users.map((user) => (
            <tr key={user.uid} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 font-medium">{user.username}</td>
              <td className="px-6 py-4">{user.full_name || '-'}</td>
              <td className="px-6 py-4">
                <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-sm border border-purple-200">
                  {user.role}
                </span>
              </td>
              <td className="px-6 py-4">{formatDate(user.created_at)}</td>
              <td className="px-6 py-4">{formatDate(user.updated_at)}</td>
              <td className="px-6 py-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/edit-user/${user.uid}`)}
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
          ))}
        </tbody>
      </table>

      {!users.length && (
        <div className="p-8 text-center text-gray-500">
          <p className="mb-2">Пользователи не найдены</p>
          <button
            onClick={() => navigate('/create')}
            className="text-blue-600 hover:underline"
          >
            Создать нового пользователя
          </button>
        </div>
      )}
      {editingUser && <EditUserModal />}
    </div>
  );

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
      <div className="mx-auto max-w-7xl">
        <HeaderSection />
        <UserTable />
      </div>
    </div>
  );
};

export default Dashboard;
