import React, { useState } from 'react';
import { FaDownload } from 'react-icons/fa6';
import { Button } from './Button';
import { useAuth } from '../context/authContext';
import api from '../api';
import toast from 'react-hot-toast';

const Download = () => {
  const { hasPermission } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = async () => {
    if (!hasPermission(['admin', 'user'])) {
      toast.error('У вас нет разрешения на скачивание');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.get('/export/readings/excel/all', {
        responseType: 'blob',
      });

      if (!(response.data instanceof Blob)) {
        throw new Error('Неверный формат ответа от сервера');
      }

      const today = new Date().toISOString().split('T')[0];
      const fileName = `Reports_${today}.xlsx`;

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Файл успешно скачан!');
    } catch (error) {
      console.error('Error downloading file:', error);
      const errorMessage =
        error.response?.status === 403
          ? 'Доступ запрещен: проверьте ваши разрешения'
          : error.response?.status === 404
            ? 'Данные для скачивания не найдены'
            : error.message || 'Ошибка при скачивании файла';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-md transition-all ${
        isLoading
          ? 'bg-green-400 cursor-not-allowed'
          : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white'
      }`}
      onClick={handleDownload}
      disabled={isLoading}
      aria-label="Скачать отчет в формате Excel"
      title="Скачать отчет в формате Excel"
    >
      {isLoading ? (
        <svg
          className="animate-spin h-5 w-5 text-white"
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
        <FaDownload />
      )}
      <span>{isLoading ? 'Скачивание...' : 'Скачать'}</span>
    </Button>
  );
};

export default Download;
