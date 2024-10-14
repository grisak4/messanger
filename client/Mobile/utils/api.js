import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Конфигурация API
const API_URL = 'http://192.168.1.38:8080/api/v1';

const api = axios.create({
  baseURL: API_URL,
});

// Интерцептор для добавления JWT токена в заголовки запросов
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Авторизация пользователя
export const login = async (email, password) => {
  const response = await api.post('/login', { email, password });
  if (response.data.token) {
    await AsyncStorage.setItem('token', response.data.token);
    await AsyncStorage.setItem('user_id', response.data.user_id.toString());
  }
  return response.data;
};

// Регистрация пользователя
export const register = async (email, password) => {
  const response = await api.post('/regin', { email, password });
  console.log('Register response:', response.data);
  return response.data;
};

// Выход из системы
export const logout = async () => {
  await AsyncStorage.removeItem('token');
  await AsyncStorage.removeItem('user_id');
};

// Получение списка чатов пользователя
export const getChats = async (userId) => {
  try {
    const response = await api.get(`/chats?user_id=${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching chats:', error);
    throw error;
  }
};

// Получение сообщений по чату
export const getMessages = async (chatId) => {
  try {
    const response = await api.get(`/chats/${chatId}/messages`);
    return response.data; // Убедитесь, что эта структура соответствует вашему API
  } catch (error) {
    console.error('Ошибка получения сообщений:', error);
    throw error;
  }
};

// Получение информации о пользователе по ID
export const getUserById = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data; // Предполагается, что в response.data содержится объект пользователя
  } catch (error) {
    console.error('Ошибка получения информации о пользователе:', error);
    throw error;
  }
};
