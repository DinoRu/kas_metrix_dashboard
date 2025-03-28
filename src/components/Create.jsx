import { useState } from 'react';
import { FaUser, FaLock, FaIdCard, FaUserTag, FaSave } from 'react-icons/fa';
import config from '../config/config';
import { useNavigate } from 'react-router-dom';

const CreateUser = () => {
  const [userData, setUserData] = useState({
    username: '',
    full_name: '',
    password: '',
    role: 'user',
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const uri = config().createuser;
      const response = await fetch(uri, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        setSuccess('Пользователь успешно создан!');
        setError('');
        setUserData({
          username: '',
          full_name: '',
          password: '',
          role: 'user',
        });
        setTimeout(() => setSuccess(''), 3000);
        navigate('/dashboard');
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Ошибка при создании пользователя');
      }
    } catch (error) {
      setError('Ошибка соединения с сервером');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 transition-all duration-300 hover:shadow-2xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 flex items-center justify-center gap-2">
            <FaUserTag className="text-purple-600" />
            Создание пользователя
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <div className="relative">
              <FaUser className="absolute top-1/2 left-4 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Логин"
                className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                value={userData.username}
                onChange={(e) =>
                  setUserData({ ...userData, username: e.target.value })
                }
                required
              />
            </div>

            <div className="relative">
              <FaIdCard className="absolute top-1/2 left-4 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Полное имя"
                className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                value={userData.full_name}
                onChange={(e) =>
                  setUserData({ ...userData, full_name: e.target.value })
                }
                required
              />
            </div>

            <div className="relative">
              <FaLock className="absolute top-1/2 left-4 transform -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                placeholder="Пароль"
                className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                value={userData.password}
                onChange={(e) =>
                  setUserData({ ...userData, password: e.target.value })
                }
                required
              />
            </div>

            <div className="relative">
              <select
                className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 appearance-none bg-white"
                value={userData.role}
                onChange={(e) =>
                  setUserData({ ...userData, role: e.target.value })
                }
              >
                <option value="user">Обычный пользователь</option>
                <option value="admin">Администратор</option>
              </select>
              <FaUserTag className="absolute top-1/2 left-4 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {success && (
            <div className="bg-green-50 p-3 rounded-lg flex items-center text-green-700">
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
              {success}
            </div>
          )}

          {error && (
            <div className="bg-red-50 p-3 rounded-lg flex items-center text-red-700">
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
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-blue-500 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
          >
            <FaSave className="text-lg" />
            Создать пользователя
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateUser;
