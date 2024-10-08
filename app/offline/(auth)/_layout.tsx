import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View, Image } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { babyIcon } from "@/assets";
import { HomeRightHeader } from "@/components/HomeRightHeader";

const TabsPage = () => {
    const [isActive, setIsActive] = useState<boolean | null>(null); // State to hold the isActive value

    useEffect(() => {
        const checkUserData = async () => {
            try {
                const userDataJson = await AsyncStorage.getItem("userData");

                if (userDataJson !== null) {
                    const userData = JSON.parse(userDataJson);
                    setIsActive(userData.isActive); // Set the isActive state based on retrieved data
                } else {
                    setIsActive(false); // No user data found
                }
            } catch (error) {
                console.error("Error retrieving user data:", error);
                setIsActive(false); // Handle error
            }
        };

        checkUserData();
    }, []);

    // If isActive is still null, we can show a loading state or return null
    if (isActive === null) {
        return null; // or a loading indicator
    }

    return (
        <Tabs
            screenOptions={{
                headerStyle: {
                    backgroundColor: "#86b3bc",
                },
                tabBarShowLabel: false,
                tabBarActiveTintColor: "#456B72", // Color when tab is selected
                tabBarInactiveTintColor: "#456B72", // Color when tab is not selected
            }}
        >
            {/* HOME */}
            <Tabs.Screen
                name="home"
                options={{
                    headerTitle: "VacApp",
                    headerTitleStyle: {
                        color: "#456B72",
                        fontWeight: "bold",
                        marginLeft: -10,
                    },
                    headerShadowVisible: false,
                    headerLeft: () => (
                        <Image
                            source={babyIcon} // Replace with your logo URL
                            style={{
                                width: 30,
                                height: 30,
                                marginLeft: 10,
                            }}
                        />
                    ),
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons
                            name={focused ? "home" : "home-outline"} // Sharp when selected
                            size={size}
                            color={color}
                        />
                    ),
                }}
                redirect={isActive !== true} // Redirect if isActive is false or null
            />

            {/* QUIZ */}
            <Tabs.Screen
                name="quiz"
                options={{
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons
                            name={focused ? "help-circle" : "help-circle-outline"} // Sharp when selected
                            size={30}
                            color={color}
                        />
                    ),
                }}
                redirect={isActive !== true} // Redirect if isActive is false or null
            />

            {/* PROFILE */}
            <Tabs.Screen
                name="profile"
                options={{
                    headerTitle: "My Profile",
                    tabBarIcon: ({ color, size, focused }) => (
                        <Ionicons
                            name={focused ? "person" : "person-outline"} // Sharp when selected
                            size={size}
                            color={color}
                        />
                    ),
                }}
                redirect={isActive !== true} // Redirect if isActive is false or null
            />
        </Tabs>
    );
};

export default TabsPage;
