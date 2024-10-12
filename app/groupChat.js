import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity, Pressable } from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function GroupChatList() {
    const [sampleGroups, setSampleGroup] = useState([]);

    useEffect(() => {
        async function fetchData() {
            let user = JSON.parse(await AsyncStorage.getItem("user"));
            const response = await fetch(process.env.EXPO_PUBLIC_URL + "/MyChatApp/LoadGroups?id=" + user.id);

            if (response.ok) {
                let responseData = await response.json();
                setSampleGroup(responseData);
            }
        }

        fetchData();

        const intervalId = setInterval(() => {
            fetchData(); // Load chat messages every 5 seconds
        }, 6000);

        // Cleanup function to clear the interval when the component unmounts (e.g., when navigating away)
        return () => {
            clearInterval(intervalId);
        };
    }, []);

    const renderGroup = ({ item }) => (
        <TouchableOpacity style={styles.groupItem} onPress={() => {
            router.push("/groupChatPage?groupData=" + JSON.stringify(item));
        }}>
            <View style={styles.groupAvatarContainer}>
                {item.userImageStatus == 1 ? (
                    <Image source={{ uri: process.env.EXPO_PUBLIC_URL + "/MyChatApp/GroupImages/" + item.groupId + ".png" }} style={styles.groupAvatar} />
                ) : (
                    // <View style={styles.defaultGroupAvatar}>
                    //     <FontAwesome name="users" size={24} color="#fff" />
                    // </View>
                    <Image source={require('../assets/group.png')} style={styles.defaultGroupAvatar} />
                )}
                {item.lastMessageSeenStatus == 3 && item.unSeenCount > 0 && (
                    <View style={styles.unreadCountContainer}>
                        <Text style={styles.unreadCountText}>{item.unSeenCount}</Text>
                    </View>
                )}
            </View>
            <View style={styles.groupInfo}>
                <Text style={styles.groupName}>{item.groupName}</Text>
                <Text style={styles.groupMessage} numberOfLines={1} ellipsizeMode="tail">
                    {item.lastChatMsg}
                </Text>
            </View>
            <Text style={styles.groupTime}>{item.lastChatMsgTime}</Text>
            <Ionicons name="chatbox-ellipses" size={20} color="#34eb77" style={styles.groupIcon} />
        </TouchableOpacity>
    );

    return (
        <LinearGradient colors={['#A8E6CE', '#DCEDC1']} style={styles.container}>
            <StatusBar translucent backgroundColor="#075E54" barStyle="dark-content" />
            <View style={styles.header}>
                <Pressable style={styles.backButton} onPress={() => router.replace("/chatHome")}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </Pressable>
                <Text style={styles.appName}>Group Chats</Text>
                <Pressable style={styles.addGroupButton} onPress={() => router.push("/makeGroup")}>
                    <FontAwesome name="plus" size={20} color="#fff" />
                </Pressable>
            </View>
            <FlatList
                data={sampleGroups}
                keyExtractor={(item) => item.groupId.toString()}
                renderItem={renderGroup}
                contentContainerStyle={styles.groupList}
                estimatedItemSize={200}
            />
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
        position: 'relative',
    },
    backButton: {
        marginRight: 15,
    },
    appName: {
        fontSize: 24,
        fontWeight: '700',
        color: '#fff',
        flex: 1,
        textAlign: 'center',
    },
    addGroupButton: {
        backgroundColor: '#34eb77',
        borderRadius: 20,
        padding: 5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    groupList: {
        padding: 10,
    },
    groupItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        backgroundColor: '#fff',
        borderRadius: 10,
        marginBottom: 10,
        elevation: 3,
        paddingHorizontal: 15,
    },
    groupAvatarContainer: {
        marginRight: 15,
        position: 'relative',
    },
    groupAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    defaultGroupAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#34eb77',
        alignItems: 'center',
        justifyContent: 'center',
    },
    unreadCountContainer: {
        position: 'absolute',
        top: -5,
        right: -5,
        backgroundColor: '#ff4757',
        borderRadius: 10,
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    unreadCountText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 12,
    },
    groupInfo: {
        flex: 1,
    },
    groupName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2E7D32',
    },
    groupMessage: {
        fontSize: 14,
        color: '#4D6F4D',
    },
    groupTime: {
        fontSize: 12,
        color: '#999',
    },
    groupIcon: {
        marginLeft: 10,
    },
});
