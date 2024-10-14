import React, { useState, useEffect } from 'react';
import { View, FlatList, Text, TouchableOpacity, StyleSheet, Alert, Image, TouchableWithoutFeedback } from 'react-native';
import { getChats } from '../utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

export default function MessagesScreen({ navigation }) {
  const [chats, setChats] = useState([]);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const userId = await AsyncStorage.getItem('user_id');
        if (!userId) {
          Alert.alert('Error', 'Unable to fetch user ID');
          return;
        }

        const response = await getChats(userId);
        setChats(response.chats);
      } catch (error) {
        Alert.alert('Error', 'Unable to load chats');
      }
    };

    fetchChats();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() => navigation.navigate('Chat', { chatId: item.ChatID, chatName: item.ChatName })}
    >
      <View style={styles.avatarContainer}>
        <Image
          source={{ uri: item.avatarUrl || 'https://placehold.co/50' }}
          style={styles.avatar}
        />
      </View>
      <View style={styles.chatDetails}>
        <Text style={styles.chatName}>{item.ChatName}</Text>
        <Text style={styles.lastMessage} numberOfLines={1}>{item.lastMessage}</Text>
      </View>
      <View style={styles.chatMeta}>
        <Text style={styles.time}>{item.time}</Text>
        {item.unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadCount}>{item.unreadCount}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const openProfile = () => {
    // Переход на экран профиля или открытие боковой панели
    navigation.navigate('Profile');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableWithoutFeedback onPress={openProfile}>
          <Ionicons name="person-circle-outline" size={30} color="#1e90ff" />
        </TouchableWithoutFeedback>
        <Text style={styles.headerTitle}>Messages</Text>
        <TouchableWithoutFeedback onPress={() => Alert.alert('Search clicked')}>
          <Ionicons name="search-outline" size={30} color="#1e90ff" />
        </TouchableWithoutFeedback>
      </View>

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
    backgroundColor: '#f9f9f9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
    elevation: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  chatItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 15,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ccc',
  },
  chatDetails: {
    flex: 1,
  },
  chatName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  lastMessage: {
    fontSize: 14,
    color: '#777',
    marginTop: 4,
  },
  chatMeta: {
    alignItems: 'flex-end',
  },
  time: {
    fontSize: 12,
    color: '#aaa',
  },
  unreadBadge: {
    backgroundColor: '#1e90ff',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 5,
  },
  unreadCount: {
    color: '#fff',
    fontSize: 12,
  },
});
