import { useEffect, useState } from "react";
import NetInfo from "@react-native-community/netinfo";
import { useRouter, Slot } from "expo-router";
import * as Font from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Toaster } from "./Toaster";

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
				router.replace(isConnected ? "/online" : "/offline");
			} catch (error) {
				console.error("Error checking network status:", error);
			}
		};

		// Initial check
		checkNetworkStatus();

		// Subscribe to network changes
		const unsubscribe = NetInfo.addEventListener(({ isConnected }) => {
			setIsOffline(!isConnected);
			router.replace(isConnected ? "/online" : "/offline");
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
		</GestureHandlerRootView>
	);
};

export default RootLayout;
