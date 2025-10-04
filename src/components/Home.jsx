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
  FaLeaf,
  FaCalendarAlt,
  FaTimes,
  FaChartLine,
  FaFilter,
  FaImage,
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
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const fetchMetersWithReadings = async () => {
    try {
      setLoading(true);
      const response = await api.get(
        `/meters/with-readings?skip=${(currentPage - 1) * metersPerPage}&limit=${metersPerPage}`,
      );

      const sortedMeters = (response.data.data || []).sort((a, b) => {
        const dateA = a.readings?.reading_date
          ? dayjs(a.readings.reading_date)
          : dayjs(0);
        const dateB = b.readings?.reading_date
          ? dayjs(b.readings.reading_date)
          : dayjs(0);
        return dateB - dateA;
      });

      setMeters(sortedMeters);
      setTotalMeters(response.data.total || 0);
      setFilteredMeters(sortedMeters);
    } catch (error) {
      console.error('Ошибка при получении счетчиков:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('/user/users');
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
    let filtered = [...meters];

    if (searchTerm !== '') {
      filtered = filtered.filter(
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
    }

    if (dateFrom || dateTo) {
      filtered = filtered.filter((meter) => {
        if (!meter.readings?.reading_date) return false;

        const readingDate = dayjs(meter.readings.reading_date);

        if (dateFrom && dateTo) {
          return (
            readingDate.isAfter(dayjs(dateFrom).subtract(1, 'day')) &&
            readingDate.isBefore(dayjs(dateTo).add(1, 'day'))
          );
        } else if (dateFrom) {
          return readingDate.isAfter(dayjs(dateFrom).subtract(1, 'day'));
        } else if (dateTo) {
          return readingDate.isBefore(dayjs(dateTo).add(1, 'day'));
        }

        return true;
      });
    }

    filtered.sort((a, b) => {
      const dateA = a.readings?.reading_date
        ? dayjs(a.readings.reading_date)
        : dayjs(0);
      const dateB = b.readings?.reading_date
        ? dayjs(b.readings.reading_date)
        : dayjs(0);
      return dateB - dateA;
    });

    setFilteredMeters(filtered);
  }, [searchTerm, dateFrom, dateTo, meters]);

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
    setCurrentPage(1);
    fetchMetersWithReadings();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setDateFrom('');
    setDateTo('');
  };

  const hasActiveFilters =
    searchTerm !== '' || dateFrom !== '' || dateTo !== '';

  // Statistiques
  const metersWithReadings = meters.filter((m) => m.readings?.reading_value);
  const metersWithPhotos = meters.filter(
    (m) => m.readings?.photos && m.readings.photos.length > 0,
  );

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Header Moderne */}
      <header className="bg-white shadow-lg border-b-4 border-green-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 rounded-xl blur opacity-75 animate-pulse"></div>
                <div className="relative bg-gradient-to-r from-green-500 to-emerald-600 p-3 rounded-xl shadow-lg">
                  <FaLeaf className="text-white text-2xl" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent">
                  КАСПЭНЕРГОСБЫТ
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  {user ? (
                    <span className="font-medium">
                      Привет, {getFullName(user.username)} 👋
                    </span>
                  ) : (
                    'Система управления счетчиками'
                  )}
                </p>
              </div>
            </div>

            <div className="flex gap-2 md:gap-3">
              {hasPermission(['admin']) && (
                <Button
                  onClick={() => navigate('/dashboard')}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 hover:from-green-600 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  <FaUserShield />
                  <span className="hidden md:inline font-medium">
                    Управление
                  </span>
                </Button>
              )}
              <button
                onClick={logout}
                className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                <FaSignOutAlt />
                <span className="hidden md:inline font-medium">Выход</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistiques Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500 transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Всего счетчиков
                </p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {totalMeters}
                </p>
              </div>
              <div className="bg-green-100 p-4 rounded-full">
                <FaChartLine className="text-green-600 text-2xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-emerald-500 transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  С показаниями
                </p>
                <p className="text-3xl font-bold text-emerald-600 mt-2">
                  {metersWithReadings.length}
                </p>
              </div>
              <div className="bg-emerald-100 p-4 rounded-full">
                <FaCalendarAlt className="text-emerald-600 text-2xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-teal-500 transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">С фото</p>
                <p className="text-3xl font-bold text-teal-600 mt-2">
                  {metersWithPhotos.length}
                </p>
              </div>
              <div className="bg-teal-100 p-4 rounded-full">
                <FaImage className="text-teal-600 text-2xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Actions et Filtres */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          {/* Actions */}
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
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
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  showFilters
                    ? 'bg-green-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FaFilter />
                <span>Фильтры</span>
              </button>

              <div className="flex items-center gap-2">
                <label
                  htmlFor="itemsPerPage"
                  className="text-sm font-medium text-gray-700 whitespace-nowrap"
                >
                  На странице:
                </label>
                <select
                  id="itemsPerPage"
                  value={metersPerPage}
                  onChange={(e) => {
                    setMetersPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white font-medium"
                >
                  {[5, 10, 25, 50, 100].map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Zone de filtres expansible */}
          {showFilters && (
            <div className="border-t border-gray-200 pt-6 space-y-4">
              {/* Recherche */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Поиск по коду, адресу, клиенту..."
                  className="w-full pl-11 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Indicateur de filtres actifs */}
          {hasActiveFilters && (
            <div className="mt-4 flex flex-wrap gap-2">
              {searchTerm && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  Поиск: &quot;{searchTerm}&quot;
                  <button
                    onClick={() => setSearchTerm('')}
                    className="hover:bg-green-200 rounded-full p-0.5"
                  >
                    <FaTimes className="text-xs" />
                  </button>
                </span>
              )}
              {dateFrom && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  С: {dayjs(dateFrom).format('DD.MM.YYYY')}
                  <button
                    onClick={() => setDateFrom('')}
                    className="hover:bg-green-200 rounded-full p-0.5"
                  >
                    <FaTimes className="text-xs" />
                  </button>
                </span>
              )}
              {dateTo && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                  До: {dayjs(dateTo).format('DD.MM.YYYY')}
                  <button
                    onClick={() => setDateTo('')}
                    className="hover:bg-green-200 rounded-full p-0.5"
                  >
                    <FaTimes className="text-xs" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Table des compteurs */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-green-600 to-emerald-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Код счетчика
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Клиент
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Адрес
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Тип
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Показания
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Дата показаний
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                    Фото
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-500 mb-4"></div>
                        <p className="text-gray-600 font-medium">
                          Загрузка данных...
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : filteredMeters.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="bg-green-100 p-6 rounded-full mb-4">
                          <FaLeaf className="text-6xl text-green-400" />
                        </div>
                        <p className="text-xl font-semibold text-gray-700 mb-2">
                          {hasActiveFilters ? 'Нет результатов' : 'Нет данных'}
                        </p>
                        <p className="text-gray-500">
                          {hasActiveFilters
                            ? 'Попробуйте изменить критерии поиска'
                            : 'Нет счетчиков в системе'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredMeters.map((meter, index) => (
                    <tr
                      key={meter.meter_id_code}
                      className={`hover:bg-green-50 transition-colors ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-green-700">
                          {meter.meter_id_code}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900 font-medium">
                          {meter.client_name}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-700">
                          {meter.location_address}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gradient-to-r from-green-100 to-emerald-100 text-green-800">
                          {meter.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-gray-900">
                          {meter.readings?.reading_value || (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-700">
                          {meter.readings?.reading_date ? (
                            dayjs(meter.readings.reading_date).format(
                              'DD MMM YYYY',
                            )
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-2">
                          {meter.readings?.photos?.map((url, photoIndex) => (
                            <a
                              key={photoIndex}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-sm font-semibold rounded-lg transition-all transform hover:scale-110 shadow-md"
                            >
                              {photoIndex + 1}
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

          {/* Pagination */}
          {totalMeters > metersPerPage && (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-700">
                  Показано{' '}
                  <span className="font-bold text-green-600">
                    {Math.min(
                      (currentPage - 1) * metersPerPage + 1,
                      totalMeters,
                    )}
                  </span>{' '}
                  -{' '}
                  <span className="font-bold text-green-600">
                    {Math.min(currentPage * metersPerPage, totalMeters)}
                  </span>{' '}
                  из{' '}
                  <span className="font-bold text-green-600">
                    {totalMeters}
                  </span>{' '}
                  счетчиков
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={prevPage}
                    disabled={currentPage === 1}
                    className={`flex items-center gap-1 px-4 py-2 rounded-lg font-medium transition-all ${
                      currentPage === 1
                        ? 'text-gray-400 cursor-not-allowed bg-gray-100'
                        : 'text-green-700 bg-white hover:bg-green-50 shadow-sm'
                    }`}
                  >
                    <FaChevronLeft className="text-xs" />
                    <span>Назад</span>
                  </button>

                  <div className="flex gap-1">
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
                          className={`w-10 h-10 rounded-lg font-semibold transition-all ${
                            currentPage === pageNum
                              ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md transform scale-110'
                              : 'bg-white text-gray-700 hover:bg-green-50 shadow-sm'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={nextPage}
                    disabled={currentPage === totalPages}
                    className={`flex items-center gap-1 px-4 py-2 rounded-lg font-medium transition-all ${
                      currentPage === totalPages
                        ? 'text-gray-400 cursor-not-allowed bg-gray-100'
                        : 'text-green-700 bg-white hover:bg-green-50 shadow-sm'
                    }`}
                  >
                    <span>Вперед</span>
                    <FaChevronRight className="text-xs" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer moderne */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-gray-600">
              <FaLeaf className="text-green-500 text-xl" />
              <span className="font-medium">
                © 2025 КАСПЭНЕРГОСБЫТ. СЧЕТ-УЧЕТ
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                Версия 1.0.1
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
