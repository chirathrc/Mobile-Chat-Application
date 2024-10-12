import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router'; // Import router
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FlashList } from '@shopify/flash-list';

export default function ChatList() {
  const [contacts, setContacts] = useState([]);
  const [currentTab, setCurrentTab] = useState('Chats');
  const [isHaveImage, setIsHaveImage] = useState();

  useEffect(() => {
    async function fetchData() {
      let user = JSON.parse(await AsyncStorage.getItem("user"));
      const response = await fetch(process.env.EXPO_PUBLIC_URL + "/MyChatApp/LoadHomeData?id=" + user.id);

      if (response.ok) {
        let responseData = await response.json();

        if (responseData.status) {
          let chatArray = responseData.jsonChatArray;
          setContacts(chatArray);

          if (responseData.userImageStatus) {
            setIsHaveImage(1);
          } else {
            setIsHaveImage(2);
          }
        }
      }
    }

    fetchData();

    const intervalId = setInterval(() => {
      fetchData(); // Load chat messages every 5 seconrds
    }, 10000);

    // Cleanup function to clear the interval when the component unmounts (e.g., when navigating away)
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  const renderContact = ({ item }) => (
    <TouchableOpacity
      style={styles.contactItem}
      onPress={() => {
        router.push("/chat?other_user_id=" + JSON.stringify(item)); // Navigate to chat page
      }}
    >
      {item.avatar_image_found ? (
        <Image
          source={{ uri: process.env.EXPO_PUBLIC_URL + "/MyChatApp/ProfileImages/" + item.mobile + ".png" }}
          style={[styles.avatar, item.userStatus == 1 && styles.avatarOnline]}
        />
      ) : (
        <Image
          source={require('../assets/user.png')}
          style={[styles.avatar, item.userStatus == 1 && styles.avatarOnline]}
        />
      )}

      <View style={styles.contactInfo}>
        <Text style={styles.contactName}>{item.Name}</Text>
        <Text style={styles.contactMessage} numberOfLines={1} ellipsizeMode="tail">
          {item.msg}
        </Text>
      </View>

      <Text style={styles.contactTime}>{item.datetime}</Text>

      {item.chatStatus == 1 && item.msg != "Say hi!" ? (
        <Ionicons name="checkmark-done" size={20} color="#009432" style={styles.seenIcon} />
      ) : item.chatStatus == 2 ?
        (<Ionicons name="checkmark" size={20} color="#c8d6e5" style={styles.seenIcon} />)
        : ""


      }

      {item.unSeenCount > 0 && item.chatStatus == 3 && (
        <View style={styles.unseenCountContainer}>
          <Text style={styles.unseenCountText}>{item.unSeenCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const handleTabPress = (tab) => {
    setCurrentTab(tab);
    switch (tab) {
      case 'Status':
        router.push("/groupChat");
        break;
      case 'Profile':
        router.push("/profile?isHaveImg=" + isHaveImage);
        break;
      case 'Chats':
      default:
        setCurrentTab('Chats'); // Keep on current tab
    }
  };

  return (
    <LinearGradient colors={['#A8E6CE', '#DCEDC1']} style={styles.container}>
      <StatusBar translucent backgroundColor="#075E54" barStyle="dark-content" />
      <View style={styles.header}>
        <Image source={require('../assets/chat.png')} style={styles.logo} />
        <Text style={styles.appName}>Mingle</Text>
      </View>

      <FlashList
        data={contacts}
        keyExtractor={(item) => item.userId.toString()} // Ensure userId is used and converted to string
        renderItem={renderContact}
        contentContainerStyle={styles.contactList}
        estimatedItemSize={200}
      />

      <View style={styles.bottomMenu}>
        <TouchableOpacity
          style={[styles.menuItem, currentTab === 'Chats' && styles.activeTab]}
          onPress={() => handleTabPress('Chats')}
        >
          <FontAwesome name="comments" size={24} color={currentTab === 'Chats' ? '#fff' : '#009432'} />
          <Text style={[styles.menuText, currentTab === 'Chats' && styles.activeText]}>Chats</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, currentTab === 'Status' && styles.activeTab]}
          onPress={() => handleTabPress('Status')}
        >
          <FontAwesome name="group" size={24} color={currentTab === 'Status' ? '#fff' : '#009432'} />
          <Text style={[styles.menuText, currentTab === 'Status' && styles.activeText]}>Group</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, currentTab === 'Profile' && styles.activeTab]}
          onPress={() => handleTabPress('Profile')}
        >
          <FontAwesome name="user" size={24} color={currentTab === 'Profile' ? '#fff' : '#009432'} />
          <Text style={[styles.menuText, currentTab === 'Profile' && styles.activeText]}>Profile</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#075E54',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    elevation: 4,
  },
  logo: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
    marginRight: 10,
  },
  appName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  contactList: {
    padding: 10,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
    paddingHorizontal: 15,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#fff',
    marginRight: 15,
    borderColor: "#00b894",
  },
  avatarOnline: {
    borderWidth: 3,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2E7D32',
  },
  contactMessage: {
    fontSize: 14,
    color: '#4D6F4D',

  },
  contactTime: {
    fontSize: 12,
    color: '#999',
  },
  seenIcon: {
    marginLeft: 10,
  },
  unseenCountContainer: {
    backgroundColor: '#ff3b30',
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  unseenCountText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  bottomMenu: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#075E54',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingVertical: 10,
  },
  menuItem: {
    alignItems: 'center',
    paddingVertical: 5,
  },
  menuText: {
    color: '#009432',
    fontSize: 12,
    marginTop: 5,
  },
  activeTab: {
    backgroundColor: '#009432',
    borderRadius: 10,
    padding: 10,
  },
  activeText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
