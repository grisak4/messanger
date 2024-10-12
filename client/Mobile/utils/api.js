import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Конфигурация API
const API_URL = 'http://192.168.152.216:8080/api/v1';

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
    const response = await axios.get(`${API_URL}/chats/${chatId}/messages`);
    return response.data; // Ensure this structure matches your API response
  } catch (error) {
    console.error('Ошибка получения сообщений:', error);
    throw error; // Rethrow to handle in ChatScreen
  }
};

export const getUserById = async (userId) => {
  const response = await axios.get(`${API_URL}/users/${userId}`);
  return response.data; // Assuming response.data contains the user object
};