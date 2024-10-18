import { useEffect, useState } from "react";
import NetInfo from "@react-native-community/netinfo";
import { useRouter, Slot } from "expo-router"; // Import useRouter
import * as Font from "expo-font"; // Import expo-font
import * as SplashScreen from "expo-splash-screen"; // Import SplashScreen
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";
import { Toaster } from "./Toaster";
import CheckLocalData from "./CheckLocalData";
import { View } from "react-native";
import ClearData from "./ClearData";

const RootLayout = () => {
	const [isOffline, setIsOffline] = useState(false);
	const [fontsLoaded, setFontsLoaded] = useState(false); // State to track font loading
	const router = useRouter(); // Initialize router

	useEffect(() => {
		const loadFonts = async () => {
			try {
				// Prevent the splash screen from auto-hiding
				await SplashScreen.preventAutoHideAsync();

				// Load the fonts
				await Font.loadAsync({
					Roboto: require("../assets/fonts/Roboto-Regular.ttf"), // Load the regular font
					RobotoBold: require("../assets/fonts/Roboto-Bold.ttf"), // Load the regular font
					Oswald: require("../assets/fonts/Oswald-Regular.ttf"), // Load the regular font
				});

				setFontsLoaded(true); // Set fonts loaded state
			} catch (error) {
				console.error("Error loading fonts:", error); // Handle font loading errors
			} finally {
				// Hide the splash screen after loading fonts
				await SplashScreen.hideAsync();
			}
		};

		loadFonts();
	}, []);

	useEffect(() => {
		const checkNetworkStatus = async () => {
			try {
				const netInfoState = await NetInfo.fetch();
				const isConnected = netInfoState.isConnected;

				setIsOffline(!isConnected);

				// Use router.replace based on network status
				if (isConnected) {
					router.replace("/online");
				} else {
					router.replace("/offline");
				}
			} catch (error) {
				console.error("Error checking network status:", error); // Handle any errors
			}
		};

		// Initial check
		checkNetworkStatus();

		// Subscribe to network changes
		const unsubscribe = NetInfo.addEventListener((state) => {
			const isConnected = state.isConnected;
			setIsOffline(!isConnected);

			if (!isConnected) {
				router.replace("/online");
			} else {
				router.replace("/offline");
			}
		});

		// Clean up network listener on unmount
		return () => unsubscribe();
	}, []); // No need for 'isOffline' in dependencies

	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<Slot />
			<Toaster />
			<View className="flex flex-row justify-around">
				<CheckLocalData />
				<ClearData />
			</View>
		</GestureHandlerRootView> // Slot will render the appropriate layout from online or offline folders
	);
};

export default RootLayout;
