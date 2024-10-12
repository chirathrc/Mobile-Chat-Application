import { FontAwesome } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, Image, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient'; // Import LinearGradient from expo
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';

export default function Index() {
    const [mobileNumber, setMobileNumber] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(
        () => {

            async function Function() {
                try {
                    let userJsonData = await AsyncStorage.getItem("user");
                    if (userJsonData != null) {
                        router.replace("/chatHome");
                    }
                } catch (error) {
                    console.log(error);
                }
            }

            Function();

        }
    ), [];

    return (
        <LinearGradient
            colors={['#075E54', '#004d40']} // Gradient colors
            style={styles.container}
        >

            <StatusBar hidden={true} />
            {/* Logo Area */}
            <Image source={require('../assets/chat.png')} style={styles.logo} />

            <Text style={styles.title}>Welcome to</Text>
            <Text style={styles.mainLogoName}>Mingle</Text>

            <Text style={styles.label}>Mobile Number</Text>
            <TextInput
                style={styles.input}
                placeholder="Enter your mobile number"
                keyboardType="phone-pad"
                onChangeText={newText => setMobileNumber(newText)}
                autoCapitalize="none"
                maxLength={10}
                cursorColor={"#009432"}
                placeholderTextColor={"#b0b0b0"} // Lighter placeholder color for better contrast
                accessible={true} // Accessibility feature
                accessibilityLabel="Mobile number input"
            />

            {errorMessage !== "" && <Text style={styles.errorText}>{errorMessage}</Text>}

            <Pressable
                style={({ pressed }) => [
                    styles.button,
                    pressed && styles.buttonPressed
                ]}
                onPress={handlePress}
                accessible={true} // Accessibility feature
                accessibilityLabel="Continue to next step"
            >
                <View style={styles.buttonContent}>
                    <Text style={styles.buttonText}>Go Ahead</Text>
                    <FontAwesome name="arrow-right" size={20} color="#fff" style={styles.icon} />
                </View>
            </Pressable>
        </LinearGradient>
    );

    async function handlePress() {
        const response = await fetch(
            process.env.EXPO_PUBLIC_URL + "/MyChatApp/Start",
            {
                method: "POST",
                body: JSON.stringify({ mobile: mobileNumber }),
                headers: { "Content-Type": "application/json" }
            }
        );

        if (response.ok) {
            const data = await response.json();
            if (data.msg === "Register") {
                // await AsyncStorage.setItem('mobile', mobileNumber);
                router.replace("/signUp?mobile=" + mobileNumber);

            } else if (data.msg === "Success") {
                // await AsyncStorage.setItem('mobile', mobileNumber);
                // await AsyncStorage.setItem('username', data.userName);
                router.replace("/signIn?mobile=" + mobileNumber + "&userName=" + data.userName);
            }

            else {
                setErrorMessage(data.msg);
            }
        } else {
            alert("Error during the request");
        }
    }
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    logo: {
        width: 80,
        height: 80,
        resizeMode: 'contain',
        alignSelf: 'center',
        marginBottom: 30,
    },
    title: {
        fontSize: 26,
        fontWeight: '400',
        textAlign: 'center',
        color: '#fff',
        marginBottom: 5,
    },
    mainLogoName: {
        fontSize: 32,
        fontWeight: '700',
        textAlign: 'center',
        color: '#fff',
        marginBottom: 30,
    },
    label: {
        color: '#fff',
        fontSize: 18,
        marginBottom: 8,
    },
    input: {
        height: 55,
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
    button: {
        height: 55,
        borderRadius: 10,
        backgroundColor: '#009432',  // WhatsApp green
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3.84,
        elevation: 5,
        marginTop: 20, // Adds some space above the button
    },
    buttonPressed: {
        opacity: 0.7, // Feedback on button press
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 10,
    },
    buttonText: {
        color: '#fff', // White text for button
        fontSize: 18,
        fontWeight: 'bold',
        flex: 1, // This allows the text to take all available space
    },
    icon: {
        marginLeft: 10, // Adds some space between the text and the icon
    },
    errorText: {
        color: '#ff6b6b', // Error text color
        marginBottom: 10,
        textAlign: 'center', // Center align the error message
    },
});
