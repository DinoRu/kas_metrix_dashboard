import { useState } from 'react';
import { Button } from './Button';
import { FaUpload } from 'react-icons/fa6';
import Modal from './Modal';
import api from '../api';

const Add = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setError('');
    setSuccess('');
    setSelectedFile(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedFile(null);
    setError('');
    setSuccess('');
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setError('');
    setSuccess('');
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Пожалуйста, выберите файл!');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      const response = await api.post('/meters/import-meters', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Custom-Header': 'value',
        },
      });
      setSuccess('Файл успешно загружен!');
      console.log('File uploaded successfully:', response.data);
      setTimeout(handleCloseModal, 1500);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Ошибка при загрузке файла!';
      setError(errorMessage);
      console.error('Error uploading file:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Button
        onClick={handleOpenModal}
        className="flex items-center bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-2 rounded-lg shadow-md"
      >
        <FaUpload className="mr-2" />
        Загрузить Файл
      </Button>
      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
          <h2 className="text-xl font-semibold text-green-800 mb-4 text-center">
            Загрузить Файл
          </h2>

          {/* File Input */}
          <div className="mb-4">
            <label
              htmlFor="file-upload"
              className="block text-sm font-medium text-green-700 mb-2"
            >
              Выберите файл
            </label>
            <div className="relative">
              <input
                id="file-upload"
                type="file"
                onChange={handleFileChange}
                className="hidden"
                aria-describedby="file-upload-help"
              />
              <label
                htmlFor="file-upload"
                className="flex items-center justify-center w-full px-4 py-3 bg-white border border-green-200 rounded-lg cursor-pointer hover:bg-green-50 transition-all text-green-800"
              >
                <FaUpload className="mr-2 text-green-400" />
                {selectedFile ? selectedFile.name : 'Выберите файл'}
              </label>
              <p id="file-upload-help" className="mt-1 text-xs text-green-600">
                Поддерживаются файлы до 10 МБ
              </p>
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="bg-red-50 p-3 rounded-lg flex items-center text-red-700 border border-red-200 mb-4">
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
          {success && (
            <div className="bg-green-50 p-3 rounded-lg flex items-center text-green-700 border border-green-200 mb-4">
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
              <span>{success}</span>
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-3">
            <Button
              onClick={handleCloseModal}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-all"
            >
              Отмена
            </Button>
            <Button
              onClick={handleUpload}
              disabled={isLoading || !selectedFile}
              className={`px-4 py-2 ${
                isLoading || !selectedFile
                  ? 'bg-green-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
              } text-white rounded-lg flex items-center transition-all`}
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
                <FaUpload className="mr-2" />
              )}
              Загрузить
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Add;
