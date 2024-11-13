import { useEffect, useState } from "react";
import NetInfo from "@react-native-community/netinfo";
import { useRouter, Slot } from "expo-router";
import * as Font from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Toast from "react-native-toast-message";
import { Toaster } from "./Toaster";
import CheckLocalData from "./CheckLocalData";
import { View } from "react-native";
import ClearData from "./ClearData";
import { ThemedText } from "@/components/ThemedText";

const RootLayout = () => {
	const [isOffline, setIsOffline] = useState(false);
	const [fontsLoaded, setFontsLoaded] = useState(false);
	const router = useRouter();

	// Load fonts and manage splash screen
	useEffect(() => {
		const loadFonts = async () => {
			await SplashScreen.preventAutoHideAsync();

			try {
				await Font.loadAsync({
					Roboto: require("../assets/fonts/Roboto-Regular.ttf"),
					RobotoBold: require("../assets/fonts/Roboto-Bold.ttf"),
					Oswald: require("../assets/fonts/Oswald-Regular.ttf"),
				});
				setFontsLoaded(true);
			} catch (error) {
				console.error("Error loading fonts:", error);
			} finally {
				await SplashScreen.hideAsync();
			}
		};

		loadFonts();
	}, []);

	// Check network status
	useEffect(() => {
		const loadFonts = async () => {
			await SplashScreen.preventAutoHideAsync();

			try {
				await Font.loadAsync({
					Roboto: require("../assets/fonts/Roboto-Regular.ttf"),
					RobotoBold: require("../assets/fonts/Roboto-Bold.ttf"),
					Oswald: require("../assets/fonts/Oswald-Regular.ttf"),
				});
				setFontsLoaded(true);
			} catch (error) {
				console.error("Error loading fonts:", error);
			} finally {
				await SplashScreen.hideAsync();
			}
		};

		const checkNetworkStatus = async () => {
			try {
				const { isConnected } = await NetInfo.fetch();
				setIsOffline(!isConnected);
				router.replace(isConnected ? "/offline" : "/offline");
			} catch (error) {
				console.error("Error checking network status:", error);
			}
		};

		// Initial check
		checkNetworkStatus();

		// Subscribe to network changes
		const unsubscribe = NetInfo.addEventListener(({ isConnected }) => {
			setIsOffline(!isConnected);
			router.replace(isConnected ? "/offline" : "/offline");
		});

		// Cleanup listener on unmount
		return unsubscribe;
	}, []);

	return (
		<GestureHandlerRootView style={{ flex: 1 }}>
			<Slot />
			<Toaster />
			{/* <View className="flex flex-row justify-around">
        <CheckLocalData />
        <ClearData />
      </View> */}
			<View className="p-4 bg-[#790e0e]">
				<ThemedText type="default" className="text-white text-center text-2xl font-bold ">
					TEST APPLICATION
				</ThemedText>
			</View>
		</GestureHandlerRootView>
	);
};

export default RootLayout;
