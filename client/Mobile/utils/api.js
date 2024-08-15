import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Конфигурация API
const API_URL = 'http://192.168.1.33:8080/api/v1';

const api = axios.create({
  baseURL: API_URL,
});

// JWT токен
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

// Авторизация / регистрация
export const login = async (email, password) => {
  const response = await api.post('/login', { email, password });
  if (response.data.token) {
    await AsyncStorage.setItem('token', response.data.token);
    await AsyncStorage.setItem('user_id', response.data.user_id.toString());
  }
  return response.data;
};

export const register = async (email, password) => {
  const response = await api.post('/regin', { email, password }); // Исправлено 'regin' на 'register'
  console.log('Register response:', response.data); // Логирование ответа
  return response.data;
};

export const logout = async () => {
  await AsyncStorage.removeItem('token');
};

// Чаты
export const getChats = async (userId) => {
  try {
    const response = await api.get(`/chats?user_id=${userId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching chats:', error);
    throw error;
  }
};

// Получение сообщений чата
export const getMessages = async (chatId) => {
  try {
    if (!chatId) {
      throw new Error('chatId is undefined');
    }
    const response = await api.get(`/chats/${chatId}/messages`);
    if (!response.data) {
      throw new Error('No data received from the server');
    }
    return response.data;
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
};