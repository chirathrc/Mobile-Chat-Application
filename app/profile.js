import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';

export default function UserProfile() {
    const parameters = useLocalSearchParams();
    const isHave = parameters.isHaveImg;  // 1- have img , 2 - not have

    const [newName, setNewName] = useState('');
    const [profileImage, setProfileImage] = useState(null);
    const [getMobile, setMobile] = useState('');
    const [registerDate, setRegisterDate] = useState(''); // Register date field
    const [isLoading, setIsLoading] = useState(true);
    const [successMessage, setSuccessMessage] = useState(''); // Success message

    useEffect(() => {
        loadUserData();
    }, []);

    async function loadUserData() {
        try {
            let user = JSON.parse(await AsyncStorage.getItem('user'));
            console.log(user);
            setNewName(user.first_name);
            setMobile(user.mobile);
            setRegisterDate(user.registeredDate); // Assuming registerDate is stored in user object
        } catch (error) {
            Alert.alert('Error', 'Failed to load user data');
        } finally {
            setIsLoading(false);
        }
    }

    const handleSave = async () => {

        if (newName.length == 0) {
            setSuccessMessage("You Can't Update Empty Name");
        } else {

            let user = JSON.parse(await AsyncStorage.getItem("user"));

            let formData = new FormData();
            formData.append("id", user.id);
            formData.append("name", newName);

            if (profileImage != null) {

                formData.append("image", {
                    name: "avatar.png",
                    type: "image/png",
                    uri: profileImage
                });

            }

            let response = await fetch(process.env.EXPO_PUBLIC_URL + "/MyChatApp/UpdateUserData", {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                let responseData = await response.json();

                if (responseData.Success) {
                    await AsyncStorage.setItem("user", JSON.stringify(responseData.user));
                     setSuccessMessage("User Updated Succesfully");

                    setTimeout(() => {
                        setSuccessMessage("");
                    }, 4000);

                   
                } else {
                    setSuccessMessage(responseData.message);
                }
            }


        }


    };

    const handleImagePick = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permissionResult.granted) {
            Alert.alert('Permission required', 'Permission to access camera roll is required!');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setProfileImage(result.assets[0].uri);
        }
    };

    const handleLogout = async () => {
        await AsyncStorage.removeItem('user');
        router.replace('/');  // Navigate back to login screen
    };

    if (isLoading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#009432" />
            </View>
        );
    }

    return (
        <LinearGradient colors={['#A8E6CE', '#DCEDC1']} style={styles.container}>
            <StatusBar translucent backgroundColor="#075E54" barStyle="dark-content" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.replace('/chatHome')}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerText}>Profile</Text>
            </View>

            {/* Profile Picture */}
            <View style={styles.profilePictureContainer}>
                <Image
                    source={profileImage
                        ? { uri: profileImage }
                        : isHave == 1
                            ? { uri: process.env.EXPO_PUBLIC_URL + "/MyChatApp/ProfileImages/" + getMobile + ".png" }
                            : require('../assets/user.png')
                    }
                    style={styles.profilePicture}
                />
                <TouchableOpacity style={styles.editIcon} onPress={handleImagePick}>
                    <FontAwesome name="camera" size={20} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* User Name */}
            <View style={styles.inputRow}>
                <MaterialIcons name="person-outline" size={24} color="#075E54" style={styles.inputIcon} />
                <TextInput
                    style={styles.input}
                    value={newName}
                    onChangeText={(text) => { setNewName(text) }}
                    placeholder="Enter your name"
                    placeholderTextColor="#4A4A4A"
                />
            </View>

            {/* Mobile Number - Non-editable */}
            <View style={styles.inputRow}>
                <MaterialIcons name="phone-iphone" size={24} color="#075E54" style={styles.inputIcon} />
                <Text style={styles.nonEditableField}>{getMobile}</Text>
            </View>

            {/* Register Date */}
            <View style={styles.infoContainer}>
                <Text style={styles.infoText}>Registered On: {registerDate || 'N/A'}</Text>
                <MaterialIcons name="date-range" size={24} color="#075E54" />
            </View>

            {/* Success Message */}
            {successMessage ? (
                <View style={styles.successMessageContainer}>
                    <Text style={styles.successMessageText}>{successMessage}</Text>
                </View>
            ) : null}

            {/* Update Button */}
            <TouchableOpacity style={styles.updateButton} onPress={handleSave}>
                <LinearGradient colors={['#009432', '#0B845B']} style={styles.buttonGradient}>
                    <Text style={styles.updateButtonText}>Update Details</Text>
                    <MaterialIcons name="update" size={24} color="#fff" />
                </LinearGradient>
            </TouchableOpacity>

            {/* Logout Button */}
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <LinearGradient colors={['#EA2027', '#FF5733']} style={styles.buttonGradient}>
                    <Text style={styles.logoutButtonText}>Logout</Text>
                    <Ionicons name="log-out-outline" size={24} color="#fff" />
                </LinearGradient>
            </TouchableOpacity>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    headerText: {
        fontSize: 28,
        color: '#fff',
        fontWeight: 'bold',
        marginLeft: 15,
    },
    profilePictureContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    profilePicture: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 4,
        borderColor: '#fff',
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 5,
    },
    editIcon: {
        position: 'absolute',
        bottom: -10,
        right: -10,
        backgroundColor: '#009432',
        borderRadius: 25,
        padding: 10,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: '#009432',
        marginBottom: 20,
        paddingVertical: 5,
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        fontSize: 24,
        fontWeight: '600',
        color: '#075E54',
        width: '85%',
    },
    nonEditableField: {
        fontSize: 24,
        fontWeight: '600',
        color: '#4A4A4A',
        width: '85%',
        paddingVertical: 5,
    },
    infoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
    },
    infoText: {
        fontSize: 16,
        color: '#075E54',
    },
    successMessageContainer: {
        alignItems: 'center',
        marginVertical: 10,
    },
    successMessageText: {
        color: '#009432',
        fontWeight: 'bold',
        fontSize: 16,
    },
    updateButton: {
        marginTop: 20,
    },
    buttonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 15,
        borderRadius: 10,
    },
    updateButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 18,
        marginRight: 10,
    },
    logoutButton: {
        marginTop: 30,
    },
    logoutButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 18,
        marginRight: 10,
    },
});
