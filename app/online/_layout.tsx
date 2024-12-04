import { ClerkProvider, useAuth, useUser } from "@clerk/clerk-expo";
import { Slot, useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import * as SecureStore from "expo-secure-store";
import Constants from "expo-constants"; // Import to access Expo's extra configuration
import PushNotificationFeature from "../PushNotificationFeature";

const InitialLayout = () => {
	const { isLoaded, isSignedIn } = useAuth(); // Accessing the user object
	const { user } = useUser();
	const router = useRouter();

	useEffect(() => {
		const redirectUser = () => {
			if (!isLoaded) return; // Wait until Clerk is loaded

			if (isSignedIn) {
				// Check if the signed-in user is the admin
				if (user?.id === "user_2pjV2DPELrcWut0yUZMDPX1cTf4") {
					// Redirect to admin dashboard
					router.replace("/online/(admin)/dashboard");
				} else {
					// Redirect other users to their relevant screen
					router.replace("/online/(auth)/home");
				}
			} else {
				// Redirect non-signed-in users to the main public page
				router.replace("/online/(public)/main");
			}
		};

		redirectUser();
	}, [isSignedIn, isLoaded, user, router]); // Make sure to include 'user' in the dependency array

	if (!isLoaded) {
		return (
			<View className="flex -mt-10 items-center justify-center h-full">
				<ActivityIndicator size="large" color="#456B72" />
			</View>
		);
	}

	return <Slot />;
};

const tokenCache = {
	async getToken(key: string): Promise<string | null> {
		try {
			return await SecureStore.getItemAsync(key);
		} catch (err) {
			console.error("Error retrieving token:", err);
			return null;
		}
	},
	async saveToken(key: string, value: string): Promise<void> {
		try {
			await SecureStore.setItemAsync(key, value);
		} catch (err) {
			console.error("Error saving token:", err);
		}
	},
};

const RootLayout = () => {
	const CLERK_PUBLISHABLE_KEY =
		Constants?.expoConfig?.extra?.clerkPublishableKey || "Fallback_Key";

	return (
		<ClerkProvider
			publishableKey={CLERK_PUBLISHABLE_KEY}
			tokenCache={tokenCache}
		>
			<InitialLayout />
			<PushNotificationFeature />
		</ClerkProvider>
	);
};

export default RootLayout;
