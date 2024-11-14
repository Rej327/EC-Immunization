import { Drawer } from "expo-router/drawer";
import { Ionicons } from "@expo/vector-icons";
import { Pressable } from "react-native";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { StatusBar } from "expo-status-bar";
import { HomeRightHeader } from "@/components/HomeRightHeader";
import Logout from "@/app/LogOut";
import { DrawerActions } from "@react-navigation/native";
import { useNavigation, useRouter } from "expo-router";
import CustomDrawerContent from "@/components/drawer/CustomDrawerContent";
import { useEffect } from "react";

const DrawerPage = () => {
	const { isSignedIn } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (!isSignedIn) {
			// Redirect to the sign-in page if the user is not signed in
			router.replace("/online/(public)/login");
		}
	}, [isSignedIn]);

	return (
		<>
			<StatusBar style="light" backgroundColor="#86b3bc" />

			<Drawer
				screenOptions={{
					headerStyle: {
						backgroundColor: "#86b3bc",
					},
					headerTintColor: "#456B72",
					headerTitleStyle: {
						color: "#456B72",
						fontWeight: "bold",
						marginLeft: -15,
					},
				}}
				drawerContent={(props) => <CustomDrawerContent {...props} />}
			>
				{/* Home */}
				<Drawer.Screen
					name="home"
					options={{
						headerTitle: "E.C. Immunization",
						headerRight: () => <HomeRightHeader />,
					}}
				/>

				{/* Profile */}
				<Drawer.Screen
					name="profile"
					options={{
						headerTitle: "My Profile",
					}}
				/>
				<Drawer.Screen
					name="registerchild"
					options={{
						headerTitle: "Register Children",
					}}
				/>
				<Drawer.Screen
					name="successpage"
					options={{
						headerShown: false,
					}}
				/>
			</Drawer>
		</>
	);
};

export default DrawerPage;
