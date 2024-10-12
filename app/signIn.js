import { FontAwesome } from '@expo/vector-icons'; // Make sure FontAwesome is installed
import React, { useState, useEffect } from 'react'; // Import useEffect for async operations
import { View, Text, TextInput, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient'; // Import LinearGradient for gradients
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function PasswordPage({ route }) {

    const parameter = useLocalSearchParams();
    const mobile = parameter.mobile;
    const name = parameter.userName;

    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [userName, setUserName] = useState(name); // Default value for username

    // async function loadUser() {

    //     setUserName(await AsyncStorage.getItem("username"));

    // }

    useEffect(() => {
        // Fetch username from AsyncStorage when the component mounts
        const fetchUserName = async () => {
            const storedUserName = await AsyncStorage.getItem("username");
            if (storedUserName) {
                setUserName(storedUserName);
            }
        };

        fetchUserName();
    }, []);

    return (
        <LinearGradient
            colors={['#A8E6CE', '#DCEDC1']} // Light green gradient
            style={styles.container}
        >

            <StatusBar hidden={true} />
            {/* Welcome Message */}
            <Text style={styles.welcomeText}>Hi, {userName}</Text>

            {/* Password Input */}
            <TextInput
                style={styles.input}
                placeholder="Enter your password"
                onChangeText={setPassword}
                secureTextEntry={true}
                autoCapitalize="none"
                placeholderTextColor="#4D6F4D" // Darker placeholder for contrast
                cursorColor="#009432" // Cursor color matches theme
            />

            {/* Error Message */}
            {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

            {/* Button */}
            <Pressable
                style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
                onPress={async () => {

                    const data = {
                        password: password,
                        mobile: mobile,
                    };

                    try {
                        const response = await fetch(process.env.EXPO_PUBLIC_URL + "/MyChatApp/SignIn", {
                            method: "POST",
                            body: JSON.stringify(data),
                            headers: { "Content-Type": "application/json" }
                        });

                        if (response.ok) {

                            const data = await response.json();

                            if (data.Success) {

                                // await AsyncStorage.removeItem("mobile");
                                // await AsyncStorage.removeItem("username");
                                await AsyncStorage.setItem("user", JSON.stringify(data.user));
                                router.replace("/chatHome");

                            } else {

                                setErrorMessage(data.msg);

                            }

                        } else {
                            // Handle successful sign-in logic here
                        }
                    } catch (error) {
                        setErrorMessage("Network error. Please try again.");
                    }
                }}
            >
                <View style={styles.buttonContent}>
                    <Text style={styles.buttonText}>Go Ahead</Text>
                    <FontAwesome name="arrow-right" size={20} color="#fff" style={styles.icon} />
                </View>
            </Pressable>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    welcomeText: {
        fontSize: 28,
        fontWeight: '600',
        textAlign: 'center',
        color: '#2E7D32', // Darker green for better readability
        marginBottom: 40,
    },
    input: {
        height: 55,
        borderColor: '#009432', // Dark green for the input border
        borderWidth: 2, // Slightly thicker border for emphasis
        borderRadius: 10,
        paddingHorizontal: 15,
        backgroundColor: '#FFFFFF', // Clean white background for input
        fontSize: 16,
        marginBottom: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5, // For Android shadow
    },
    button: {
        height: 55,
        borderRadius: 10,
        backgroundColor: '#009432', // Consistent green button
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3.84,
        elevation: 5,
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
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        flex: 1,
        textAlign: 'center',
    },
    icon: {
        marginLeft: 10,
    },
    errorText: {
        color: '#ff6b6b', // Red color for error messages
        textAlign: 'center',
        marginBottom: 10,
    },
});
