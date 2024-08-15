import React, { useState, useEffect, useRef } from 'react';
import { View, FlatList, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getMessages, getUserById } from '../utils/api';

const ChatScreen = ({ route }) => {
  const { chatId, chatName } = route.params;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [userSenderId, setUserSenderId] = useState(null);
  const [userCache, setUserCache] = useState({}); // Кэш для данных пользователей
  
  const ws = useRef(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await getMessages(chatId);
        setMessages(response.messages || []); 
      } catch (error) {
        Alert.alert('Ошибка', 'Не удалось загрузить сообщения');
      }
    };

    const fetchUserId = async () => {
      try {
        const userId = await AsyncStorage.getItem('user_id');
        setUserSenderId(userId);
        return userId;
      } catch (error) {
        console.error('Error fetching user ID:', error);
      }
    };

    const setupWebSocket = async () => {
      const userId = await fetchUserId();
      if (userId) {
        ws.current = new WebSocket(`ws://192.168.1.33:8080/api/v1/ws/chats/${chatId}/users/${userId}`);
        
        ws.current.onopen = () => {
          console.log('WebSocket connection opened');
        };

        ws.current.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            setMessages((prevMessages) => [...prevMessages, message]);
          } catch (error) {
            console.error('Error parsing message:', error);
          }
        };

        ws.current.onclose = () => {
          console.log('WebSocket connection closed');
        };

        ws.current.onerror = (error) => {
          console.error('WebSocket error:', error.message || 'Unknown error');
        };
      }
    };

    // Функция для загрузки почтовых адресов всех отправителей сообщений
    const fetchUserEmails = async (messages) => {
      const newCache = { ...userCache };

      for (const msg of messages) {
        if (!newCache[msg.UserSenderID]) {
          try {
            const user = await getUserById(msg.UserSenderID);
            newCache[msg.UserSenderID] = user.email;
          } catch (error) {
            console.error(`Error fetching user email for user ID ${msg.UserSenderID}:`, error);
            newCache[msg.UserSenderID] = 'Unknown User';
          }
        }
      }

      setUserCache(newCache);
    };

    fetchMessages().then((msgs) => fetchUserEmails(msgs));
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

    if (ws.current) {
      ws.current.send(JSON.stringify(message));
      setNewMessage('');
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.messageItem}>
      <Text style={styles.sender}>{userCache[item.UserSenderID] || 'Loading...'}</Text>
      <Text style={styles.message}>{item.MessageContent || 'No message content'}</Text>
      <Text style={styles.time}>{item.TimeSent ? item.TimeSent : 'No time'}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.chatTitle}>{chatName}</Text>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.MessageID.toString()}
        renderItem={renderItem}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message"
        />
        <Button title="Send" onPress={handleSendMessage} />
      </View>
    </View>
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
  },
  messageItem: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  sender: {
    fontWeight: 'bold',
  },
  message: {
    fontSize: 16,
    marginVertical: 4,
  },
  time: {
    fontSize: 12,
    color: '#aaa',
    alignSelf: 'flex-end',
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
