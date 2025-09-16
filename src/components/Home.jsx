import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Add from './Add';
import Download from './Download';
import Delete from './Delete';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import 'dayjs/locale/ru';
import {
  FaUserShield,
  FaSignOutAlt,
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
  FaUser,
  FaLeaf,
  FaTree,
} from 'react-icons/fa';
import { Button } from './Button';
import { useAuth } from '../context/authContext';
import api from '../api';

dayjs.extend(customParseFormat);
dayjs.locale('ru');

const Home = () => {
  const { user, hasPermission, logout } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [meters, setMeters] = useState([]);
  const [totalMeters, setTotalMeters] = useState(0);
  const [filteredMeters, setFilteredMeters] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [metersPerPage, setMetersPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchMetersWithReadings = async () => {
    try {
      setLoading(true);
      const response = await api.get(
        `/meters/with-readings?skip=${(currentPage - 1) * metersPerPage}&limit=${metersPerPage}`,
      );
      setMeters(response.data.data || []);
      setTotalMeters(response.data.total || 0);
      setFilteredMeters(response.data.data || []);
    } catch (error) {
      console.error('Ошибка при получении счетчиков:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('/user/');
        const fetchedUsers = response.data;
        if (!Array.isArray(fetchedUsers)) {
          throw new Error('Expected an array of users');
        }
        setUsers(fetchedUsers.filter((u) => u && u.username));
      } catch (error) {
        console.error('Ошибка при загрузке пользователей:', error);
      }
    };

    if (user) {
      fetchMetersWithReadings();
      fetchUsers();
    }
  }, [user, currentPage, metersPerPage]);

  const getFullName = (username) => {
    const user = users.find((u) => u.username === username);
    return user ? user.full_name : username;
  };

  useEffect(() => {
    if (searchTerm === '') {
      setFilteredMeters(meters);
    } else {
      const filtered = meters.filter(
        (meter) =>
          meter.meter_id_code
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          meter.location_address
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          meter.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          meter.readings?.notes
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()),
      );
      setFilteredMeters(filtered);
    }
  }, [searchTerm, meters]);

  const totalPages = Math.ceil(totalMeters / metersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleDeleteSuccess = () => {
    setCurrentPage(1); // Reset to first page
    fetchMetersWithReadings(); // Refresh meters
  };

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
              <h1 className="text-2xl md:text-3xl font-bold">КАСПЭНЕРГОСБЫТ</h1>
              <p className="text-green-100 flex items-center">
                {user
                  ? `Привет, ${getFullName(user.username)}`
                  : 'Система управления счетчиками'}
                <FaLeaf className="ml-2 text-green-200" />
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            {hasPermission(['admin']) && (
              <Button
                onClick={() => navigate('/dashboard')}
                className="bg-white text-green-800 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-100 transition-colors shadow-md border border-green-200"
              >
                <FaUserShield className="text-green-800" />
                <span className="inline md:inline text-green-800">
                  Управление пользователями
                </span>
              </Button>
            )}
            <button
              onClick={logout}
              className="bg-white text-red-600 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-50 transition-colors shadow-md border border-red-200"
            >
              <FaSignOutAlt />
              <span className="hidden md:inline">Выход</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8">
        <div className="w-full mx-auto bg-white rounded-xl shadow-md p-4 md:p-6 mb-6 border border-green-100">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-wrap gap-3">
              {hasPermission(['admin', 'user']) && (
                <Add
                  onUnauthorized={() =>
                    alert('У вас нет разрешения на загрузку')
                  }
                />
              )}
              <Download />
              {hasPermission(['admin']) && (
                <Delete onDeleteSuccess={handleDeleteSuccess} />
              )}
              <div className="flex items-center gap-2">
                <label
                  htmlFor="itemsPerPage"
                  className="text-sm text-green-700"
                >
                  Счетчиков на страницу:
                </label>
                <select
                  id="itemsPerPage"
                  value={metersPerPage}
                  onChange={(e) => {
                    setMetersPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="border border-green-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 transition-all bg-white text-green-800"
                >
                  {[5, 10, 25, 50, 100].map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="relative w-full md:w-80">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <FaSearch className="text-green-400" />
              </div>
              <input
                type="text"
                placeholder="Поиск счетчиков..."
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-green-300 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-500 transition-all bg-white text-green-800"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="w-full mx-auto bg-white rounded-xl shadow-md overflow-hidden border border-green-100">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">
                    Код счетчика
                  </th>
                  <th className="px-4 py-3 text-left font-semibold">Клиент</th>
                  <th className="px-4 py-3 text-left font-semibold">Адрес</th>
                  <th className="px-4 py-3 text-left font-semibold">
                    Тип счетчика
                  </th>
                  <th className="px-4 py-3 text-left font-semibold">
                    Показания
                  </th>
                  <th className="px-4 py-3 text-left font-semibold">
                    Дата показаний
                  </th>
                  <th className="px-4 py-3 text-left font-semibold">Фото</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-green-100">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
                      </div>
                    </td>
                  </tr>
                ) : filteredMeters.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-8 text-center text-green-600"
                    >
                      <div className="flex flex-col items-center justify-center">
                        <FaLeaf className="text-4xl text-green-300 mb-2" />
                        <p className="text-lg">Нет данных о счетчиках</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredMeters.map((meter) => (
                    <tr
                      key={meter.meter_id_code}
                      className="hover:bg-green-50 transition-colors"
                    >
                      <td className="px-4 py-3 text-green-700">
                        {meter.meter_id_code}
                      </td>
                      <td className="px-4 py-3 text-green-700">
                        {meter.client_name}
                      </td>
                      <td className="px-4 py-3 text-green-700">
                        {meter.location_address}
                      </td>
                      <td className="px-4 py-3">
                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                          {meter.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-green-700">
                        {meter.readings?.reading_value || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-green-700">
                        {meter.readings?.reading_date
                          ? dayjs(meter.readings.reading_date).format(
                              'DD MMM YYYY',
                            )
                          : 'N/A'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {meter.readings?.photos?.map((url, index) => (
                            <a
                              key={index}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-white bg-green-500 hover:bg-green-600 text-sm px-2 py-1 rounded flex items-center transition-colors"
                            >
                              <span>{index + 1}</span>
                            </a>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalMeters > metersPerPage && (
            <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t border-green-200 bg-green-50">
              <div className="text-sm text-green-700 mb-2 sm:mb-0">
                Показано{' '}
                <span className="font-medium">
                  {Math.min((currentPage - 1) * metersPerPage + 1, totalMeters)}
                </span>{' '}
                -
                <span className="font-medium">
                  {' '}
                  {Math.min(currentPage * metersPerPage, totalMeters)}
                </span>{' '}
                из
                <span className="font-medium"> {totalMeters}</span> счетчиков
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  className={`flex items-center px-3 py-1 rounded ${
                    currentPage === 1
                      ? 'text-green-300 cursor-not-allowed'
                      : 'text-green-700 hover:bg-green-100'
                  }`}
                >
                  <FaChevronLeft className="mr-1" /> Назад
                </button>

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
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        currentPage === pageNum
                          ? 'bg-green-500 text-white'
                          : 'text-green-700 hover:bg-green-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                  className={`flex items-center px-3 py-1 rounded ${
                    currentPage === totalPages
                      ? 'text-green-300 cursor-not-allowed'
                      : 'text-green-700 hover:bg-green-100'
                  }`}
                >
                  Вперед <FaChevronRight className="ml-1" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-green-600 to-emerald-700 text-white py-4 shadow-inner">
        <div className="w-full mx-auto text-center">
          <p className="flex items-center justify-center">
            <FaLeaf className="mr-2 text-green-200" />© 2025 КАСПЭНЕРГОСБЫТ.
            СЧЕТ-УЧЕТ
          </p>
          <p className="text-green-200 text-sm mt-1">Версия 1.0.1</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
