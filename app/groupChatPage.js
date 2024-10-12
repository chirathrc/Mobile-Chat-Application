import React, { useState, useEffect } from 'react';
import { View, Text, Image, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons'; // For icons
import { StatusBar } from 'expo-status-bar';
import { FlashList } from '@shopify/flash-list';
import { router, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function ChatScreen() {


    //get parameters
    const parameters = useLocalSearchParams();
    const groupData = JSON.parse(parameters.groupData);
    console.log(groupData);

    const [groupMembers, setGroupMembers] = useState([]);
    const [messages, setMessage] = useState([
        // { user: 'Chirath Rothila', text: 'Hello! How are you?', time: '10:48 AM', self: false },
        // { user: 'You', text: "I'm doing great, thank you! How about you?", time: '10:48 AM', self: true, read: true },
        // { user: 'Disandu Damsana', text: 'I’m good as well! Have you finished the project?', time: '10:48 AM', self: false },
        // { user: 'You', text: 'Yes, I submitted it yesterday.', time: '10:48 AM', self: true, read: true },
        // { user: 'Kshithija Tharaka', text: 'What’s the plan for the weekend?', time: '10:48 AM', self: false },
        // { user: 'You', text: 'I think I might go hiking.', time: '10:48 AM', self: true, read: false },
    ]);
    const [newMessage, setNewMessage] = useState('');


    useEffect(
        () => {
            async function loadChatMsg() {

                let id = JSON.parse(await AsyncStorage.getItem("user"));
                let response = await fetch(process.env.EXPO_PUBLIC_URL + "/MyChatApp/LoadGroupChat?id=" + id.id + "&groupId=" + groupData.groupId);

                if (response.ok) {
                    let chatArray = await response.json();


                    setMessage(chatArray.chats);
                    setGroupMembers(chatArray.names);
                    console.log(chatArray);

                }
            }

            loadChatMsg();

            const intervalId = setInterval(() => {
                loadChatMsg(); // Load chat messages every 5 seconds
            }, 3000);

            // Cleanup function to clear the interval when the component unmounts (e.g., when navigating away)
            return () => {
                clearInterval(intervalId);
            };
        }, []
    );


    const MAX_VISIBLE_CHARACTERS = 30; // Set your desired character limit for visible part

    const getHiddenUsernames = () => {
        // Join the usernames with commas
        const allUsernames = groupMembers.join(', ');

        // Check if the total length exceeds the max visible characters
        if (allUsernames.length > MAX_VISIBLE_CHARACTERS) {
            // Cut the visible part and add dots to hide the rest
            return allUsernames.slice(0, MAX_VISIBLE_CHARACTERS) + '......';
        }

        // If it doesn't exceed, just return the usernames
        return allUsernames;
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
        >
            <StatusBar
                translucent
                backgroundColor="#075E54" // Replace with your app's color (e.g., green in RGBA format)
                barStyle="dark-content" // Adjust to 'light-content' or 'dark-content' based on the background color
            />

            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => {
                        router.back();
                    }}>
                        <FontAwesome name="arrow-left" size={24} color="#fff" />
                    </TouchableOpacity>
                    <Image source={groupData.userImageStatus == 1 ?
                        { uri: process.env.EXPO_PUBLIC_URL + "/MyChatApp/GroupImages/" + groupData.groupId + ".png" } :
                        require('../assets/group.png')} style={styles.groupAvatar} />
                    <View style={styles.groupInfo}>
                        <Text style={styles.title}>{groupData.groupName}</Text>
                        <Text style={styles.minimizedUserList}>{getHiddenUsernames()}</Text>
                    </View>
                    <TouchableOpacity>
                        <FontAwesome name="ellipsis-v" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>

                <FlashList
                    data={messages}
                    renderItem={({ item }) => (
                        <View
                            style={[
                                styles.messageBubble,
                                item.senderName == "you" ? styles.selfMessage : styles.otherMessage,
                            ]}
                        >
                            {item.senderName != "you" && (
                                <Text style={styles.userName}>~ {item.senderName}</Text>
                            )}
                            <Text style={styles.messageText}>{item.msg}</Text>
                            <View style={styles.messageFooter}>
                                <Text style={styles.time}>{item.date}</Text>
                                {item.senderName == "you" && (
                                    <Ionicons
                                        name={item.seenStatus == 1 ? "checkmark-done" : "checkmark-done-outline"}
                                        size={16}
                                        color={item.seenStatus == 1 ? "green" : "#A4A4A4"} // WhatsApp-like tick colors
                                        style={styles.checkIcon}
                                    />
                                )}
                            </View>
                        </View>
                    )}
                    keyExtractor={(item, index) => index.toString()}
                    estimatedItemSize={100}
                    contentContainerStyle={styles.messagesContainer}
                />

                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        value={newMessage}
                        onChangeText={(text) => setNewMessage(text)} // Correct prop name
                        placeholder="Type a message"
                    />

                    <TouchableOpacity style={styles.sendButton} onPress={async () => {

                        if (newMessage.length == 0) {


                        } else {
                            let user = JSON.parse(await AsyncStorage.getItem("user"));

                            console.log(newMessage);

                            let response = await fetch(process.env.EXPO_PUBLIC_URL + "/MyChatApp/SendGroupMeesage?user_id=" + user.id + "&group_id=" + groupData.groupId + "&msg=" + newMessage);
                            if (response.ok) {
                                let data = await response.json();

                                if (data.Success) {
                                    console.log(true);
                                    setNewMessage("");
                                } else {
                                    Alert.alert("Error")
                                }

                            }

                        }
                    }}>
                        <FontAwesome name="paper-plane" size={24} color="#fff" />
                    </TouchableOpacity>

                </View>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F1F1F1',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#075E54', // WhatsApp-like header color
        padding: 15,
        paddingTop: 20,
    },
    groupInfo: {
        flex: 1,
        marginLeft: 10,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    minimizedUserList: {
        fontSize: 14,
        color: '#ddd',
        marginTop: 3, // Add spacing below group name
    },
    groupAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10, // To space out from the title
        marginLeft: 10,
    },
    messagesContainer: {
        padding: 15, // Increase padding for spaciousness
    },
    messageBubble: {
        maxWidth: '75%',
        borderRadius: 15,
        padding: 15,
        marginVertical: 10, // Add more vertical space between messages
    },
    otherMessage: {
        alignSelf: 'flex-start',
        backgroundColor: '#fff',
        borderColor: '#E1E1E1',
        borderWidth: 1,
    },
    selfMessage: {
        alignSelf: 'flex-end',
        backgroundColor: '#DCF8C6', // WhatsApp's light green for sent messages
    },
    userName: {
        color: '#34B7F1', // Friendly blue color
        fontWeight: 'bold',
        marginBottom: 5, // Space between username and message
    },
    messageText: {
        fontSize: 16,
    },
    messageFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 5, // Add space above the footer
    },
    time: {
        fontSize: 12,
        color: '#888',
    },
    checkIcon: {
        marginLeft: 10,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 10, // Increased padding for a better feel
        borderTopWidth: 1,
        borderTopColor: '#ddd',
        backgroundColor: '#fff',
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 25,
        paddingHorizontal: 15,
        paddingVertical: 10, // More padding inside the input field
        backgroundColor: '#F1F1F1',
    },
    sendButton: {
        backgroundColor: '#25D366', // Green WhatsApp-like color for the send button
        padding: 12,
        borderRadius: 25,
        marginLeft: 10, // Space between input and send button
    },
});

