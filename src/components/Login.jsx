import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import {
  FaUser,
  FaLock,
  FaSignInAlt,
  FaEye,
  FaEyeSlash,
  FaLeaf,
} from 'react-icons/fa';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await login(username, password);
      if (success) {
        navigate('/');
      }
    } catch (error) {
      setError(error.message || 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md p-8">
        {/* En-tête avec logo */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 p-4 rounded-full">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 w-16 h-16 rounded-full flex items-center justify-center">
                <FaLeaf className="text-white text-2xl" />
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-green-800 mb-2">
            КАСПЭНЕРГОСБЫТ
          </h1>
          <p className="text-green-600">СЧЕТ-УЧЕТ</p>
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded-lg border border-green-100 p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-green-800 mb-6 text-center">
            Добро пожаловать
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4">
              <div className="relative">
                <FaUser className="absolute top-1/2 left-4 transform -translate-y-1/2 text-green-400" />
                <input
                  id="username"
                  type="text"
                  placeholder="Логин"
                  className="w-full pl-12 pr-4 py-3 rounded-lg border border-green-200 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all text-green-800 placeholder-green-300"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div className="relative">
                <FaLock className="absolute top-1/2 left-4 transform -translate-y-1/2 text-green-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Пароль"
                  className="w-full pl-12 pr-10 py-3 rounded-lg border border-green-200 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all text-green-800"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute top-1/2 right-4 transform -translate-y-1/2 text-green-400 hover:text-green-600"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 p-3 rounded-lg flex items-center text-red-700 border border-red-200">
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
              disabled={isLoading}
              className={`w-full ${
                isLoading
                  ? 'bg-green-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
              } text-white py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center shadow-sm`}
            >
              {isLoading ? (
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
                <>
                  <FaSignInAlt className="mr-2" />
                  Войти
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/reset-password"
              className="text-green-600 hover:text-green-700 text-sm underline"
            >
              Забыли пароль?
            </Link>
          </div>
        </div>

        {/* Pied de page */}
        <div className="mt-10 text-center text-green-500 text-sm">
          <p>© 2025 КАСПИЭНЕРГОСБЫТ. СЧЕТ-УЧЕТ</p>
          <p className="mt-1">Версия 1.0.1</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
