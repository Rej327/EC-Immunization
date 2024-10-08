import { Slot, useRouter } from "expo-router";
import { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Toaster } from "../Toaster";

interface UserData {
	email: string;
	id: string;
	firstName: string;
	lastName: string;
	isActive: boolean;
}

const InitialLayout = () => {
	const router = useRouter();

	useEffect(() => {
		const checkUserStatus = async () => {
			try {
				// Retrieve user data from AsyncStorage
				const userDataJson = await AsyncStorage.getItem("userData");

				// Parse user data (if exists)
				if (userDataJson) {
					const userData: UserData = JSON.parse(userDataJson);

					// Check if the user is active (signed in)
					if (userData.isActive) {
						router.replace("/offline/(auth)/home"); // Redirect to authenticated home
					} else {
						router.replace("/offline/(public)/main"); // Redirect to public main
					}
				} else {
					// If no user data, redirect to public main
					router.replace("/offline/(public)/main");
				}
			} catch (error) {
				console.error("Error checking user status:", error);
				router.replace("/offline/(public)/main"); // Fallback in case of error
			}
		};

		checkUserStatus(); // Call the function to check user status
	}, [router]); // Add router to the dependency array

	return <Slot />; // Render child routes
};

const RootLayout = () => {
	return (
		<>
			<InitialLayout />
			<Toaster />
		</>
	);
};
export default RootLayout;
