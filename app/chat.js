import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Image, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient'; // Import LinearGradient for gradients
import { router, useLocalSearchParams } from 'expo-router';
import { FlashList } from '@shopify/flash-list';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';

export default function Chat() {

    //get parameters
    const parameters = useLocalSearchParams();
    const otherUserId = JSON.parse(parameters.other_user_id);
    console.log(otherUserId);


    const [messages, setMessages] = useState([
        // { id: '1', text: 'Hey! How are you?', time: '12:30 PM', sender: 'John', seen: true },
        // { id: '2', text: 'I’m good, thanks! What about you?', time: '12:32 PM', sender: 'Me', seen: true },
        // { id: '3', text: 'All well here. Did you get the update for tomorrow’s meeting?', time: '12:35 PM', sender: 'John', seen: false },
    ]);

    const [newMessage, setNewMessage] = useState('');
    const [userStatus, setUserStatus] = useState(otherUserId.userStatus == 1 ? "Online" : "Last Seen few minutes ago"); // User's status
    const [checkNewMsg, addCheckNewMsg] = useState("");


    useEffect(() => {
        async function loadChatMsg() {

            let id = JSON.parse(await AsyncStorage.getItem("user"));
            let response = await fetch(process.env.EXPO_PUBLIC_URL + "/MyChatApp/LoadChat?U_id=" + id.id + "&OU_id=" + otherUserId.userId);

            if (response.ok) {
                let chatArray = await response.json();
                setMessages(chatArray);
            }

        }

        loadChatMsg(); // Initial load

        const intervalId = setInterval(() => {
            loadChatMsg(); // Load chat messages every 5 seconds
        }, 3000);

        // Cleanup function to clear the interval when the component unmounts (e.g., when navigating away)
        return () => {
            clearInterval(intervalId);
        };
    }, []); // Empty dependency array means the effect runs once on mount and cleans up on unmount




    const renderMessage = ({ item }) => {
        const isUserMessage = item.side === 'right';
        return (
            <View style={[styles.messageContainer, isUserMessage ? styles.userMessage : styles.otherMessage]}>
                <View style={styles.messageBubble}>
                    <Text style={styles.messageText}>{item.msg}</Text>
                    <View style={styles.messageMeta}>
                        <Text style={styles.messageTime}>{item.dateTime}</Text>
                        {isUserMessage && (
                            item.status == 1 ? (
                                // Show double checkmark for seen messages
                                <Ionicons name="checkmark-done" size={16} color="#009432" style={styles.seenIcon} />
                            ) : (
                                // Show single checkmark for delivered but unseen messages
                                <Ionicons name="checkmark" size={16} color="#808080" style={styles.seenIcon} />
                            )
                        )}

                    </View>
                </View>
            </View>
        );
    };

    const handleSend = () => {
        if (newMessage.trim()) {
            const newMessageData = {
                id: Math.random().toString(),
                text: newMessage,
                time: '12:40 PM',
                sender: 'Me',
                seen: false,
            };
            setMessages([...messages, newMessageData]);
            setNewMessage('');
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
        >
            <LinearGradient
                colors={['#A8E6CE', '#DCEDC1']} // Green gradient background
                style={styles.container}
            >

                <StatusBar
                    translucent
                    backgroundColor="#075E54" // Replace with your app's color (e.g., green in RGBA format)
                    barStyle="dark-content" // Adjust to 'light-content' or 'dark-content' based on the background color
                />

                {/* Chat header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => {
                        router.push("/chatHome")
                    }}>
                        <Ionicons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>

                    {otherUserId.avatar_image_found ?
                        <Image source={{ uri: process.env.EXPO_PUBLIC_URL + "/MyChatApp/ProfileImages/" + otherUserId.mobile + ".png" }}
                            style={[styles.avatar]} /> :
                        <Image source={require('../assets/user.png')}
                            style={[styles.avatar]} />}

                    <View style={styles.userInfo}>
                        <Text style={styles.chatName}>{otherUserId.Name}</Text>
                        <Text style={styles.chatStatus}>{userStatus}</Text>
                    </View>
                    <TouchableOpacity onPress={() => {
                        router.push("/chaterProfile?data=" + JSON.stringify(otherUserId));
                    }}>
                        <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>

                {/* Message list */}
                <FlashList
                    data={messages}
                    renderItem={renderMessage}
                    // keyExtractor={(item) => item.id.toString()} // Ensure 'id' or relevant unique field is used
                    // style={styles.messageList}
                    contentContainerStyle={{ paddingBottom: 20, paddingRight: 4, paddingLeft: 4 }}
                    estimatedItemSize={200}
                />

                {/* Message input */}
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.textInput}
                        placeholder="Type a message"
                        placeholderTextColor="#4D6F4D"
                        value={newMessage}
                        onChangeText={(text) => { setNewMessage(text) }}
                    />
                    <TouchableOpacity style={styles.sendButton} onPress={
                        async () => {
                            if (newMessage.length == 0) {


                            } else {
                                let id = JSON.parse(await AsyncStorage.getItem("user"));


                                let response = await fetch(process.env.EXPO_PUBLIC_URL + "/MyChatApp/SendChat?U_id=" + id.id + "&OU_id=" + otherUserId.userId + "&msg=" + newMessage);


                                if (response.ok) {
                                    let data = await response.json();

                                    if (data.Success) {
                                        console.log(true);
                                        addCheckNewMsg("Added");
                                        setNewMessage("");
                                    } else {
                                        Alert.alert("Error")
                                    }

                                }

                            }

                        }
                    }>
                        <FontAwesome name="send" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 15,
        backgroundColor: '#075E54',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        marginBottom: 10,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginHorizontal: 10,
    },
    userInfo: {
        flex: 1,
    },
    chatName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
    },
    chatStatus: {
        fontSize: 14,
        color: '#34eb77',
    },
    messageList: {
        flex: 1,
        paddingHorizontal: 15,
    },
    messageContainer: {
        marginBottom: 10,
        flexDirection: 'row',
    },
    userMessage: {
        justifyContent: 'flex-end',
        alignSelf: 'flex-end',
    },
    otherMessage: {
        justifyContent: 'flex-start',
        alignSelf: 'flex-start',
    },
    messageBubble: {
        maxWidth: '75%',
        padding: 10,
        borderRadius: 10,
        backgroundColor: '#fff',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
        elevation: 3,
    },
    messageText: {
        fontSize: 16,
        color: '#333',
    },
    messageMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
    },
    messageTime: {
        fontSize: 12,
        color: '#999',
    },
    seenIcon: {
        marginLeft: 5,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderTopWidth: 1,
        borderTopColor: '#ddd',
        backgroundColor: '#fff',
        elevation: 5,
    },
    textInput: {
        flex: 1,
        height: 40,
        borderRadius: 20,
        paddingHorizontal: 15,
        backgroundColor: '#f0f0f0',
        fontSize: 16,
    },
    sendButton: {
        marginLeft: 10,
        backgroundColor: '#009432',
        borderRadius: 20,
        padding: 10,
    },
});
