import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaLock, FaSignInAlt } from 'react-icons/fa';
import config from '../config/config';

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(config().login, credentials, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });

      const user = response.data.user;
      if (user.role != 'admin') {
        setError('Доступ запрещен: только администраторы могут войти.');
        return;
      }

      localStorage.setItem('authToken', response.data.access_token);
      localStorage.setItem('userData', JSON.stringify(response.data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка авторизации');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 transition-all duration-300 hover:shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Добро пожаловать
          </h1>
          <p className="text-gray-500">Введите данные для входа в систему</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <FaUser className="absolute top-1/2 left-4 transform -translate-y-1/2 text-gray-400" />
              <input
                id="username"
                type="text"
                placeholder="Логин"
                className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                value={credentials.username}
                onChange={(e) =>
                  setCredentials({ ...credentials, username: e.target.value })
                }
              />
            </div>

            <div className="relative">
              <FaLock className="absolute top-1/2 left-4 transform -translate-y-1/2 text-gray-400" />
              <input
                id="password"
                type="password"
                placeholder="Пароль"
                className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all"
                value={credentials.password}
                onChange={(e) =>
                  setCredentials({ ...credentials, password: e.target.value })
                }
              />
            </div>
          </div>

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
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-blue-500 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center"
          >
            <FaSignInAlt className="mr-2" />
            Войти
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            className="text-purple-600 hover:text-purple-700 text-sm underline"
            onClick={() => alert('Password recovery not implemented yet')}
          >
            Забыли пароль?
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
