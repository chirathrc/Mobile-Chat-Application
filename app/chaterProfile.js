import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { router, useLocalSearchParams } from 'expo-router';

export default function ChatterProfile() {
    const parameters = useLocalSearchParams();
    const otherUserId = JSON.parse(parameters.data);

    // Sample data
    const sampleData = {
        name: otherUserId.Name,
        profileImage: otherUserId.avatar_image_found
            ? { uri: process.env.EXPO_PUBLIC_URL +"/MyChatApp/ProfileImages/" + otherUserId.mobile + ".png" }
            : require('../assets/user.png'),
        mobile: otherUserId.mobile,
        onlineStatus: otherUserId.userStatus == 1 ? true : false, // true for online, false for offline
    };

    // Animated value for online status
    const animatedValue = React.useRef(new Animated.Value(1)).current;

    // Start the pulse animation
    React.useEffect(() => {
        if (sampleData.onlineStatus) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(animatedValue, {
                        toValue: 1.2,
                        duration: 500,
                        useNativeDriver: true,
                    }),
                    Animated.timing(animatedValue, {
                        toValue: 1,
                        duration: 500,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        }
    }, [animatedValue, sampleData.onlineStatus]);

    return (
        <LinearGradient colors={['#A8E6CE', '#DCEDC1']} style={styles.container}>
            <StatusBar hidden={true} />

            {/* Back Button */}
            <TouchableOpacity style={styles.backButton} onPress={() => {
                router.push("/chat?other_user_id=" + JSON.stringify(otherUserId));
            }}>
                <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>

            {/* Profile Picture */}
            <View style={styles.profilePictureContainer}>
                <Image
                    source={sampleData.profileImage}
                    style={styles.profilePicture}
                />
                {sampleData.onlineStatus && (
                    <Animated.View
                        style={[
                            styles.statusIndicator,
                            { backgroundColor: 'green', transform: [{ scale: animatedValue }] },
                        ]}
                    />
                )}
            </View>

            {/* User Name */}
            <View style={styles.nameContainer}>
                <Text style={styles.nameText}>{sampleData.name}</Text>
                <Text style={styles.mobileText}>{sampleData.mobile}</Text>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    backButton: {
        position: 'absolute',
        top: 40,
        left: 20,
        zIndex: 1,
    },
    profilePictureContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
        marginTop: 40,
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
    statusIndicator: {
        width: 16,
        height: 16,
        borderRadius: 8,
        position: 'absolute',
        bottom: 10,
        right: 10,
        borderWidth: 2,
        borderColor: '#fff',
    },
    nameContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    nameText: {
        fontSize: 26,
        fontWeight: '600',
        color: '#075E54',
        marginVertical: 5,
    },
    mobileText: {
        fontSize: 18,
        color: '#4A4A4A',
        marginTop: 5,
    },
});
