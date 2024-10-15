import React, { useState } from "react";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { View, Pressable, Image, StyleSheet, Animated, TouchableOpacity } from "react-native";
import Notification from "./notifacation/Notification";

export const HomeRightHeader = () => {
    const { user } = useUser();
    const [notifications] = useState([
        {
            id: 1,
            title: "New Update",
            description: "App version 1.2 is live",
            date: "2024-09-30",
        },
        {
            id: 2,
            title: "Feature Added",
            description: "Check out the new quiz feature",
            date: "2024-09-29",
        },
    ]);
    const [isOpen, setIsOpen] = useState(false);
    const [slideAnim] = useState(new Animated.Value(300)); // Start off-screen
    const [fadeAnim] = useState(new Animated.Value(0)); // Initial opacity

    const toggleDrawer = () => {
        if (isOpen) {
            // Close the drawer
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: 300, // Slide out
                    duration: 300,
                    useNativeDriver: false,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 0, // Fade out
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start(() => setIsOpen(false));
        } else {
            // Open the drawer
            setIsOpen(true);
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: 0, // Slide in
                    duration: 300,
                    useNativeDriver: false,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 1, // Fade in
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    };

    return (
        <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity style={{ marginRight: 10 }} onPress={toggleDrawer}>
                <View>
                    <Ionicons
                        name="notifications-sharp"
                        size={24}
                        color={"#f7d721"}
                    />
                    {notifications.length > 0 && <View style={styles.redDot} />}
                </View>
            </TouchableOpacity>

            {user && (
                <Image
                    source={{ uri: user.imageUrl }} // Use Clerk's profile image URL
                    style={styles.profileImage}
                />
            )}

            <Notification
                notifications={notifications}
                isOpen={isOpen}
                toggleDrawer={toggleDrawer}
                slideAnim={slideAnim}
                fadeAnim={fadeAnim}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    profileImage: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginLeft: 5,
        marginRight: 14,
    },
    redDot: {
        position: "absolute",
        top: -4,
        right: -4,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "red",
    },
});
