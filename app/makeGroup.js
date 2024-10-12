import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, Alert, StyleSheet, ScrollView, Pressable } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons, FontAwesome6 } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AddGroup() {
    const [groupName, setGroupName] = useState('');
    const [groupDescription, setGroupDescription] = useState('');
    const [groupIcon, setGroupIcon] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [groupUsers, setGroupUsers] = useState([]);  // To store added users
    const [allUsers, setAllUsers] = useState([
        // { id: '1', name: 'Alice Johnson', mobile: '0759325835' },
        // { id: '2', name: 'Bob Smith', mobile: '0758326835' },
        // { id: '3', name: 'Charlie Brown', mobile: '078325835' },
        // { id: '4', name: 'David Wilson', mobile: '0758325835' },
        // { id: '5', name: 'Eve Davis', mobile: '0758325855' },
        // { id: '6', name: 'Frank Thompson', mobile: '0754325835' },
        // { id: '7', name: 'Grace Lee', mobile: '0758325735' },
        // { id: '8', name: 'Hank Miller', mobile: '0752325835' },
        // { id: '9', name: 'Ivy Garcia', mobile: '0758365835' },
        // { id: '10', name: 'Chirath Harris', mobile: '0754325835' },
        // { id: '11', name: 'Disandu Thompson', mobile: '0753325835' },
        // { id: '12', name: 'Tharaka Lee', mobile: '0758325535' },
        // { id: '13', name: 'Malith Miller', mobile: '0758375835' },
        // { id: '14', name: 'Dileepa Garcia', mobile: '0758125835' },
        // { id: '15', name: 'Shehan Harris', mobile: '0758320835' },
    ]);  // Initial user list stored in state
    const userLimit = 10;


    useEffect(
        () => {
            async function loadUsers() {

                let id = JSON.parse(await AsyncStorage.getItem("user"));


                let response = await fetch(process.env.EXPO_PUBLIC_URL + "/MyChatApp/LoadAllUsers?id=" + id.id);


                if (response.ok) {
                    let userArray = await response.json();
                    console.log(userArray);
                    setAllUsers(userArray);

                }
            }

            loadUsers();
        }, []
    );

    const pickGroupIcon = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 4],
            quality: 1,
        });

        if (!result.canceled) {
            setGroupIcon(result.assets[0].uri);
        }
    };

    const addUser = (user) => {
        const existingUser = groupUsers.find(u => u.id === user.id);
        if (existingUser) {
            Alert.alert('Error', 'User with this Mobile Number Already Exists.');
            return;
        }

        if (groupUsers.length >= userLimit) {
            Alert.alert('Error', `User Limit Reached ! You Can Only Add Up to ${userLimit} Users.`);
            return;
        }

        setGroupUsers([...groupUsers, user.id]);
        Alert.alert('Success', `${user.name} Added Successfully !`);
    };

    const filteredUsers = allUsers.filter(user => {
        return (
            user.name.toLowerCase().includes(searchText.toLowerCase()) ||
            user.mobile.includes(searchText)
        );
    });

    const clearSearch = () => {
        setSearchText('');
    };

    const removeUser = (id) => {
        const userToRemove = groupUsers.find(groupUsers => groupUsers === id);
        if (userToRemove) {
            setGroupUsers(groupUsers.filter(groupUsers => groupUsers !== id));
            // Alert.alert('Success', `${userToRemove.name} has been Removed Successfully !`);
        }
    };

    const saveGroupInfo = async () => {

        let user = JSON.parse(await AsyncStorage.getItem("user"));

        const formData = new FormData();
        formData.append("groupName", groupName);
        formData.append("groupDesc", groupDescription);
        formData.append("you", user.id);
        console.log(groupUsers);

        // Append group icon

        if (groupIcon != null) {
            formData.append("image", {
                name: "groupAvatar.png",
                type: "image/png",
                uri: groupIcon,
            });
        }

        // Append each user to the form data individually
        formData.append('groupUsers[]', JSON.stringify(groupUsers)); // Append each user data

        // Fetch request to send data to the server
        let response = await fetch(`${process.env.EXPO_PUBLIC_URL}/MyChatApp/MakeGroupChat`, {
            method: "POST",
            body: formData,
        });

        if (response.ok) {
            let data = await response.json();

            if (data.Success) {

                // Alert.alert("SuccesFull", data);
                router.replace("/groupChat");
            } else {
                // Handle server-side error
                Alert.alert("Error", data.msg);
            }
        } else {
            // Handle network or server error
            console.error("Network error:", response.statusText);
        }
    };


    return (
        <ScrollView style={styles.container}>
            <StatusBar
                translucent
                backgroundColor="#075E54"
                barStyle="dark-content"
            />

            <View style={styles.header}>
                <Pressable onPress={() =>
                    router.back()
                }>
                    <FontAwesome6 name={"arrow-left"} size={22} color={"#000"} />
                </Pressable>
                <Text style={styles.view1}>Create New Group</Text>
            </View>

            <View style={styles.iconContainer}>
                <TouchableOpacity onPress={pickGroupIcon}>
                    {groupIcon ? (
                        <Image source={{ uri: groupIcon }} style={styles.groupIcon} />
                    ) : (
                        <View style={styles.iconPlaceholder}>
                            <FontAwesome6 name="image" size={40} color="#ccc" />
                        </View>
                    )}
                </TouchableOpacity>
                <Text style={styles.addImageLabel}>Add Group Image</Text>
            </View>

            <Text style={styles.label}>Group Name</Text>
            <TextInput
                style={styles.input}
                value={groupName}
                onChangeText={setGroupName}
                placeholder="Edit Group Name"
            />

            <Text style={styles.label}>Group Description</Text>
            <TextInput
                style={styles.input}
                value={groupDescription}
                onChangeText={setGroupDescription}
                placeholder="Enter Group Description"
                multiline
                numberOfLines={4}
            />

            <Text style={styles.label}>Search Users</Text>
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.input}
                    value={searchText}
                    onChangeText={setSearchText}
                    placeholder="Search by User Name or Mobile Number"
                />
                <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
                    <FontAwesome6 name="broom" size={21} color="#7f8c8d" />
                </TouchableOpacity>
            </View>

            <Text style={styles.label}>All Contacts</Text>

            <FlashList
                data={filteredUsers}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                    const isAdded = groupUsers.some(id => id === item.id);
                    return (
                        <View style={styles.userContainer}>
                            <Text><Text style={styles.nameStyle}>{item.name}</Text>  ~ <Text style={styles.mobileStyle}>{item.mobile}</Text></Text>
                            {isAdded ? (
                                <TouchableOpacity onPress={() => removeUser(item.id)}>
                                    <Ionicons name="trash" size={24} color="black" />
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity onPress={() => addUser(item)}>
                                    <FontAwesome6 name="circle-plus" size={23} color="green" />
                                </TouchableOpacity>
                            )}
                        </View>
                    );
                }}
                contentContainerStyle={styles.userList}
                estimatedItemSize={50}
            />

            <TouchableOpacity style={styles.saveButtonContainer} onPress={saveGroupInfo}>
                <Text style={styles.saveButtonText}>Create Group</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#e8f5e9',
    },
    header: {
        position: 'absolute',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        zIndex: 10,
    },
    view1: {
        fontSize: 25,
        textAlign: 'center',
        marginLeft: 50,
        color: '#000',
    },
    iconContainer: {
        position: 'relative',
        alignSelf: 'center',
        marginVertical: 50,
        marginTop: 50,
        alignItems: 'center',
    },
    groupIcon: {
        width: 120,
        height: 120,
        borderRadius: 60,
        alignSelf: 'center',
        borderColor: '#1abc9c',
        borderWidth: 2,
    },
    iconPlaceholder: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#d1f2eb',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
    },
    addImageLabel: {
        marginTop: 10,
        textAlign: 'center',
        fontSize: 15,
        color: '#000',
    },
    input: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#1abc9c',
        padding: 10,
        borderRadius: 25,
        marginBottom: 10,
        fontSize: 13,
        backgroundColor: '#f1f8f5',
        color: '#000',
    },
    label: {
        alignSelf: 'flex-start',
        marginBottom: 5,
        marginTop: 5,
        fontSize: 15,
        color: '#000',
    },

    userContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#dfe6e9',
    },
    nameStyle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
    },
    mobileStyle: {
        fontSize: 14,
        color: '#7f8c8d',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    clearButton: {
        marginLeft: 10,
        justifyContent: 'center',
    },
    userList: {
        paddingBottom: 20,
    },
    saveButtonContainer: {
        marginTop: 20,
        backgroundColor: '#1abc9c',
        paddingVertical: 15,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 40,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
