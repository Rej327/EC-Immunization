import { Slot, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Toaster } from "../Toaster";
import { ActivityIndicator, View } from "react-native";
import StartPage from "..";

interface UserData {
	email: string;
	id: string;
	firstName: string;
	lastName: string;
	isActive: boolean;
}

const InitialLayout = () => {
	const router = useRouter();
	const [loading, setLoading] = useState(true);
	const [isActive, setIsActive] = useState<boolean | null>(null); // Manage user activity state

	useEffect(() => {
		const checkUserStatus = async () => {
			try {
				const userDataJson = await AsyncStorage.getItem("users");

				if (userDataJson) {
					const userData: UserData = JSON.parse(userDataJson);
					console.log("Route", userData.isActive);
					setIsActive(userData.isActive); // Set user active state
				} else {
					setIsActive(false); // No user data found
				}
			} catch (error) {
				console.error("Error checking user status:", error);
				setIsActive(false); // Fallback in case of error
			} finally {
				setLoading(false); // End loading state
			}
		};

		checkUserStatus();
	}, []);

	useEffect(() => {
		if (!loading) {
			if (isActive === true) {
				router.replace("/offline/(auth)/home");
			} else {
				router.replace("/offline/(public)/main");
			}
		}
	}, [loading, isActive]); // Only run when loading is false or isActive changes

	if (loading) {
		return <StartPage />
	}

	return <Slot />;
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
