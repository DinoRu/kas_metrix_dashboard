import React, { useState } from 'react';
import { FaDeleteLeft, FaSpinner } from 'react-icons/fa6';
import { Button } from './Button';
import { useAuth } from '../context/authContext';
import api from '../api';
import toast from 'react-hot-toast';
const Delete = ({ onDeleteSuccess }) => {
  const { hasPermission } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    // Check permissions
    if (!hasPermission(['admin'])) {
      toast.error('У вас нет разрешения на удаление');
      // Alternatively: alert('У вас нет разрешения на удаление');
      return;
    }

    // Confirm deletion
    if (
      !window.confirm(
        'Вы уверены, что хотите удалить все счетчики? Эта операция необратима.',
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await api.delete('/meters/clear');
      if (response.status === 204) {
        toast.success('Все счетчики успешно удалены');
        // Alternatively: alert('Все счетчики успешно удалены');
        if (onDeleteSuccess) {
          onDeleteSuccess(); // Trigger Home refresh
        }
      } else {
        throw new Error('Неожиданный статус ответа от сервера');
      }
    } catch (error) {
      console.error('Error clearing meters:', error);
      const errorMessage =
        error.response?.status === 403
          ? 'Доступ запрещен: проверьте ваши разрешения'
          : error.response?.status === 500
            ? 'Ошибка сервера при удалении счетчиков'
            : error.message || 'Ошибка при удалении счетчиков';
      toast.error(errorMessage);
      // Alternatively: alert(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Button
      className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-md transition-all ${
        isDeleting
          ? 'bg-red-400 cursor-not-allowed'
          : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white'
      }`}
      onClick={handleDelete}
      disabled={isDeleting}
      aria-label="Удалить все счетчики"
      title="Удалить все счетчики"
    >
      {isDeleting ? (
        <FaSpinner className="animate-spin text-white" size={20} />
      ) : (
        <FaDeleteLeft size={20} />
      )}
      <span>{isDeleting ? 'Удаление...' : 'Удалить'}</span>
    </Button>
  );
};

export default Delete;
