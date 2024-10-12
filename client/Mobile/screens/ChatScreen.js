import React, { useState, useEffect, useRef, memo } from 'react';
import { View, FlatList, Text, TextInput, Button, StyleSheet, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getMessages, getUserById } from '../utils/api';
import moment from 'moment';

const ChatScreen = ({ route }) => {
  const { chatId, chatName } = route.params;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [userSenderId, setUserSenderId] = useState(null);
  const [userCache, setUserCache] = useState({});
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef(null);
  const ws = useRef(null);
  const reconnectAttempts = useRef(0); // Счётчик попыток переподключения

  const fetchUserName = async (userId) => {
    if (userCache[userId]) {
      return userCache[userId];
    }
    try {
      const user = await getUserById(userId);
      setUserCache((prevCache) => ({
        ...prevCache,
        [userId]: user.name,
      }));
      return user.name;
    } catch (error) {
      console.error('Ошибка получения имени пользователя:', error);
      return 'Неизвестный';
    }
  };

  const scrollToBottom = () => {
    flatListRef.current?.scrollToEnd({ animated: true });
  };

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await getMessages(chatId);
        setMessages(response.messages || []);
        scrollToBottom();
      } catch (error) {
        Alert.alert('Ошибка', 'Не удалось загрузить сообщения');
      } finally {
        setLoading(false); // Отключаем индикатор загрузки
      }
    };

    const fetchUserId = async () => {
      try {
        const userId = await AsyncStorage.getItem('user_id');
        setUserSenderId(userId);
        return userId;
      } catch (error) {
        console.error('Ошибка получения ID пользователя:', error);
      }
    };

    const setupWebSocket = async () => {
      const userId = await fetchUserId();
      if (userId) {
        ws.current = new WebSocket(`ws://192.168.1.37:8080/api/v1/ws/chats/${chatId}/users/${userId}`);

        ws.current.onopen = () => {
          console.log('WebSocket соединение открыто');
          reconnectAttempts.current = 0; // Сброс счётчика при успешном подключении
        };

        ws.current.onmessage = async (event) => {
          try {
            const message = JSON.parse(event.data);
            const userName = userCache[message.UserID] || await fetchUserName(message.UserID);

            setMessages((prevMessages) => [
              ...prevMessages,
              { ...message, UserName: userName },
            ]);

            scrollToBottom();
          } catch (error) {
            console.error('Ошибка разбора сообщения:', error);
          }
        };

        ws.current.onclose = () => {
          console.log('WebSocket соединение закрыто');
          attemptReconnect(); // Попытка переподключения
        };

        ws.current.onerror = (error) => {
          console.error('WebSocket ошибка:', error.message || 'Неизвестная ошибка');
        };
      }
    };

    const attemptReconnect = () => {
      if (reconnectAttempts.current < 5) { // Ограничение на количество попыток
        reconnectAttempts.current += 1;
        setTimeout(() => {
          console.log(`Попытка переподключения ${reconnectAttempts.current}`);
          setupWebSocket();
        }, 2000 * reconnectAttempts.current); // Увеличиваем интервал между попытками переподключения
      } else {
        Alert.alert('Ошибка', 'Не удалось подключиться к WebSocket после нескольких попыток. Пожалуйста, перезагрузите чат.');
      }
    };

    fetchMessages();
    setupWebSocket();

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [chatId]);

  const handleSendMessage = () => {
    if (newMessage.trim() === '' || !userSenderId) return;

    const message = {
      chatId,
      MessageContent: newMessage, // Отправляем только текст сообщения
      UserID: userSenderId,
    };

    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
      setNewMessage(''); // Очищаем поле ввода
    } else {
      console.error('WebSocket не открыт. Текущее состояние:', ws.current.readyState);
    }
  };

  const MessageItem = memo(({ item, userSenderId }) => (
    <View style={[styles.messageItem, userSenderId == item.UserID ? styles.ownMessage : styles.otherMessage]}>
      <Text style={styles.sender}>{item.UserName || 'Загрузка...'}</Text>
      <Text style={styles.message}>{item.MessageContent || 'Нет содержимого сообщения'}</Text>
      <Text style={styles.time}>{moment(item.TimeSent).format('HH:mm DD/MM/YYYY') || 'Без времени'}</Text>
    </View>
  ));

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.chatTitle}>{chatName}</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.MessageID.toString()}
          renderItem={({ item }) => <MessageItem item={item} userSenderId={userSenderId} />}
          onContentSizeChange={scrollToBottom}
          onLayout={scrollToBottom}
          initialNumToRender={10}
          maxToRenderPerBatch={5}
          windowSize={5}
        />
      )}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Введите сообщение"
        />
        <Button title="Отправить" onPress={handleSendMessage} />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  chatTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  messageItem: {
    padding: 10,
    marginVertical: 5,
    borderRadius: 8,
    maxWidth: '80%',
    alignSelf: 'flex-start',
  },
  ownMessage: {
    backgroundColor: '#DCF8C6',
    alignSelf: 'flex-end',
  },
  otherMessage: {
    backgroundColor: '#F1F0F0',
  },
  sender: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  message: {
    fontSize: 16,
    marginBottom: 4,
  },
  time: {
    fontSize: 12,
    color: '#aaa',
    textAlign: 'right',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
});

export default ChatScreen;
