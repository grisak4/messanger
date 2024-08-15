// screens/MessagesScreen.js
import React, { useState, useEffect } from 'react';
import { View, FlatList, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { getChats } from '../utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function MessagesScreen({ navigation }) {
  const [chats, setChats] = useState([]);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const userId = await AsyncStorage.getItem('user_id');
        if (!userId) {
          Alert.alert('Ошибка', 'Не удалось получить идентификатор пользователя');
          return;
        }

        const response = await getChats(userId);
        setChats(response.chats);
      } catch (error) {
        Alert.alert('Ошибка', 'Не удалось загрузить чаты');
      }
    };

    fetchChats();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() => navigation.navigate('Chat', { chatId: item.ChatID, chatName: item.ChatName })}
    >
      <Text style={styles.chatName}>{item.ChatName}</Text>
      <Text style={styles.lastMessage}>{item.lastMessage}</Text>
      <Text style={styles.time}>{item.time}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={chats}
        keyExtractor={(item) => item.ChatID.toString()}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  chatItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  chatName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  lastMessage: {
    fontSize: 16,
    color: '#777',
  },
  time: {
    fontSize: 14,
    color: '#aaa',
    alignSelf: 'flex-end',
  },
});
