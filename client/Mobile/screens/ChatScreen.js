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
        setLoading(false); // Set loading to false after messages are fetched
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
        ws.current = new WebSocket(`ws://192.168.152.216:8080/api/v1/ws/chats/${chatId}/users/${userId}`);

        ws.current.onopen = () => {
          console.log('WebSocket соединение открыто');
        };

        ws.current.onmessage = async (event) => {
          try {
            const message = JSON.parse(event.data);
            const userName = await fetchUserName(message.UserID);
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
          setTimeout(setupWebSocket, 1000); // Attempt to reconnect after 1 second
        };

        ws.current.onerror = (error) => {
          console.error('WebSocket ошибка:', error.message || 'Неизвестная ошибка');
        };
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
      message: newMessage,
      senderId: userSenderId,
    };

    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
      setNewMessage('');
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
