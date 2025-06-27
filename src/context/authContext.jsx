import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const response = await api.get('/auth/me');
          setUser(response.data);
        } catch (error) {
          logout();
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  // AuthContext.js

  const createUser = async (userData) => {
    try {
      const response = await api.post('/auth/signup', userData);
      return response.data;
    } catch (error) {
      console.error('User creation error:', error.response || error);

      let errorMessage = 'Ошибка при создании пользователя';
      if (error.response && error.response.data?.message) {
        errorMessage = error.response.data.message;
      }
      throw new Error(errorMessage);
    }
  };

  const login = async (username, password) => {
    try {
      const response = await api.post('/auth/login', { username, password });
      localStorage.setItem('access_token', response.data.access_token);
      setUser(response.data.user);
      navigate('/');
      return true; // Succès
    } catch (error) {
      console.error('Login error:', error.response || error);

      let errorMessage = 'Identifiants incorrects';
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = "Nom d'utilisateur ou mot de passe incorrect";
        } else if (error.response.status === 403) {
          errorMessage = 'Votre compte est désactivé';
        } else {
          errorMessage = `Erreur serveur: ${error.response.status}`;
        }
      }

      throw new Error(errorMessage); // Propage l'erreur
    }
  };

  // Ajout de la fonction de changement de mot de passe
  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await api.post('/auth/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
      });

      return response.data;
    } catch (error) {
      console.error('Password change error:', error.response || error);

      let errorMessage = 'Échec du changement de mot de passe';
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = 'Mot de passe actuel incorrect';
        } else if (error.response.status === 400) {
          errorMessage =
            'Le nouveau mot de passe ne respecte pas les exigences';
        }
      }

      throw new Error(errorMessage);
    }
  };

  const deleteUser = async (userId) => {
    try {
      await api.delete(`/auth/${userId}`);
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression :', error.response || error);
      throw new Error('Ошибка при удалении пользователя');
    }
  };

  const downloadReport = async () => {
    try {
      const response = await api.post(
        '/task/download',
        {},
        { responseType: 'blob' },
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Reports.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur lors du téléchargement :', error);
      throw new Error('Ошибка при скачивании файла');
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
    navigate('/login');
  };

  const hasPermission = (requiredRoles) => {
    if (!user) return false;
    return requiredRoles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        hasPermission,
        changePassword,
        createUser,
        deleteUser,
        downloadReport,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
