import React from "react";
import { Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";
import { useRouter } from "expo-router"; // Import useRouter for navigation
import { GestureHandlerRootView } from "react-native-gesture-handler";

const DashboardLayout = () => {
	const router = useRouter(); // Get the router

	const handleBackPress = () => {
		router.push("/online/(admin)/dashboard"); // Navigate to the Home screen
	};

	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<Stack
				screenOptions={{
					headerStyle: {
						backgroundColor: "#87b2bd",
					},
					headerTintColor: "#456B72",
					headerShown: true,
					// headerTintColor: "#456B72", // Set header text color to white
					// headerBackTitle: "Back",
					// headerShown: true, // Show the header for navigation
					headerLeft: () => (
						<TouchableOpacity
							onPress={handleBackPress}
							className="mr-2"
						>
							<Ionicons
								name="arrow-back"
								size={24}
								color="#456B72"
							/>
						</TouchableOpacity>
					),
					statusBarColor: "#87b2bd",
				}}
			>
				<Stack.Screen
					name="parentById" // Route for the Guide page
					options={{
						title: "Parent's Children",
					}}
				/>
				<Stack.Screen
					name="scheduleByStatus" // Route for the Guide page
					options={{
						title: "Appointment Schedules",
					}}
				/>
			</Stack>
		</GestureHandlerRootView>
	);
};

export default DashboardLayout;
