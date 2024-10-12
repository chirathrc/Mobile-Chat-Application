import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Image, Pressable, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { FontAwesome } from '@expo/vector-icons';
import { Link, router, useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Route } from 'expo-router/build/Route';
import { StatusBar } from 'expo-status-bar';

export default function SignUp() {

    const parametrs = useLocalSearchParams();
    const mobile = parametrs.mobile;
    console.log(mobile);

    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [image, setImage] = useState(null);
    const [nameError, setNameError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [isDisabled, setIsDisabled] = useState(false);

    // const { mobile } = router.query; // Retrieve the passed mobile number

    const pickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permissionResult.granted) {
            Alert.alert('Permission Denied', 'You need to give permission to access your photos.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],  // Crop as a square
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);  // Set the image URI
        }
    };

    const handleSignUp = () => {
        // Reset errors
        setNameError('');
        setPasswordError('');

        let isValid = true;

        // Validate name
        if (name.trim() === '') {
            setNameError('Name is required');
            isValid = false;
        }

        // Validate password
        if (password.length < 6) {
            setPasswordError('Password must be at least 6 characters');
            isValid = false;
        }

        // Proceed if valid
        if (isValid) {
            Alert.alert('Success', 'Account created successfully!');
            // Further sign-up logic
        }
    };

    return (
        <View style={styles.container}>

            <StatusBar translucent backgroundColor="#075E54" barStyle="dark-content" />

            <Text style={styles.title}>Create Your Account</Text>

            {/* Profile Image Upload */}
            <Pressable style={styles.imageUploadCircle} onPress={pickImage}>
                {image ? (
                    <Image source={{ uri: image }} style={styles.image} />
                ) : (
                    <FontAwesome name="camera" size={30} color="#009432" />
                )}
            </Pressable>

            <Text style={styles.label}>Name</Text>
            <TextInput
                style={[styles.input, nameError && styles.errorInput]}
                placeholder="Enter your name"
                onChangeText={na => setName(na)}
                autoCapitalize="words"
                cursorColor={"#009432"}
                placeholderTextColor={"#009432"}
            />
            {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}

            <Text style={styles.label}>Password</Text>
            <TextInput
                style={[styles.input, passwordError && styles.errorInput]}
                placeholder="Enter your password"
                onChangeText={pas => setPassword(pas)}
                secureTextEntry
                autoCapitalize="none"
                cursorColor={"#009432"}
                placeholderTextColor={"#009432"}
            />
            {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

            <Pressable disabled={isDisabled} style={[styles.button, isDisabled && styles.disabledButton]} onPress={
                async () => {

                    setIsDisabled(true);
                    let formData = new FormData();
                    formData.append("name", name);
                    formData.append("password", password);

                    if (image != null) {

                        formData.append("image", {
                            name: "avatar.png",
                            type: "image/png",
                            uri: image
                        });

                    }

                    formData.append("mobile", mobile);

                    const response = await fetch(
                        process.env.EXPO_PUBLIC_URL + "/MyChatApp/SignUp",
                        {
                            method: "POST",
                            body: formData,
                        }
                    );

                    if (response.ok) {

                        let data = await response.json();

                        if (data.Success) {

                            // await AsyncStorage.removeItem("mobile");
                            router.replace("/signIn?mobile=" + mobile + "&userName=" + data.userName);

                        } else {

                            if (data.msg == "Your Name Filed is Empty") {
                                setNameError("Your Name Filed is Empty");
                                setPasswordError("");
                                setIsDisabled(false);
                            } else {
                                setNameError("");
                                setPasswordError(data.msg);
                                setIsDisabled(false);
                            }
                        }

                    } else {
                        Alert.alert("Error", "Something Went Wrong");
                    }
                }
            }>
                <Text style={styles.buttonText}>Sign Up</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#075E54',
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        textAlign: 'center',
        color: '#fff',
        marginBottom: 30,
    },
    disabledButton: {
        backgroundColor: '#2a522c', // A different color for the disabled state
    },
    imageUploadCircle: {
        width: 120,
        height: 120,
        backgroundColor: '#c8d6e5',
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        marginBottom: 30,
    },
    image: {
        width: 120,
        height: 120,
        borderRadius: 60,
    },
    label: {
        color: '#fff',
        fontSize: 18,
        marginBottom: 8,
    },
    input: {
        height: 50,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 15,
        backgroundColor: '#fff',
        fontSize: 16,
        marginBottom: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    errorInput: {
        borderColor: '#ff6b6b',
    },
    errorText: {
        color: '#ff6b6b',
        marginBottom: 10,
    },
    button: {
        height: 50,
        borderRadius: 10,
        backgroundColor: '#009432',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3.84,
        elevation: 5,
        marginTop: 20,
    },
    buttonText: {
        color: '#c8d6e5',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
