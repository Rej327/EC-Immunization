import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View, Image, Pressable, StatusBar } from "react-native";
import { useAuth, useUser } from "@clerk/clerk-expo"; // Import useUser for Clerk user data
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { babyIcon } from "@/assets";
import { HomeRightHeader } from "@/components/HomeRightHeader";
import Logout from "@/app/LogOut";

interface UserData {
	email: string;
	id: string;
	firstName: string;
	lastName: string;
}

const TabsPage = () => {
	const { isSignedIn } = useAuth();

	// useEffect(() => {
	// 	StatusBar.setBarStyle("light-content");
	// 	StatusBar.setBackgroundColor("#86b3bc");
	// }, []);

	return (
		<>
			{/* <StatusBar barStyle="light-content" backgroundColor="#86b3bc" /> */}
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
						headerRight: () => <HomeRightHeader />, // Right header with notification and profile
						tabBarIcon: ({ color, size, focused }) => (
							<Ionicons
								name={focused ? "home" : "home-outline"} // Sharp when selected
								size={size}
								color={color}
							/>
						),
					}}
					redirect={!isSignedIn}
				/>

				{/* QUIZ */}
				<Tabs.Screen
					name="quiz"
					options={{
						tabBarIcon: ({ color, size, focused }) => (
							<Ionicons
								name={
									focused
										? "help-circle"
										: "help-circle-outline"
								} // Sharp when selected
								size={30}
								color={color}
							/>
						),
					}}
					redirect={!isSignedIn}
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
						// headerRight: () => <Logout />,
					}}
					redirect={!isSignedIn}
				/>
			</Tabs>

		</>
	);
};

export default TabsPage;
