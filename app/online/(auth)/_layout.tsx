import { Drawer } from "expo-router/drawer";
import { Ionicons } from "@expo/vector-icons";
import { Pressable } from "react-native";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { StatusBar } from "expo-status-bar";
import { HomeRightHeader } from "@/components/HomeRightHeader";
import Logout from "@/app/LogOut";
import { DrawerActions } from "@react-navigation/native";
import { useNavigation } from "expo-router";
import CustomDrawerContent from "@/components/drawer/CustomDrawerContent";

const DrawerPage = () => {
	const { isSignedIn } = useAuth();
	const { user } = useUser(); // Get current user data
	const adminUserId = "user_2mW7YxivRkryvJ3m0kEYqWDLRPb"; // Admin user ID

	const navigation = useNavigation();

	const openDrawer = () => {
		navigation.dispatch(DrawerActions.openDrawer()); // Function to open the drawer
	};

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
					},
				}}
				drawerContent={(props) => <CustomDrawerContent {...props} />}
			>
				{/* Dashboard - Admin Only */}
				{user?.id === adminUserId && (
					<Drawer.Screen
						name="dashboard"
						options={{
							headerTitle: "Dashboard",
						}}
					/>
				)}

				{/* Home */}
				<Drawer.Screen
					name="home"
					options={{
						headerTitle: "VacApp",
						headerLeft: () => (
							<Pressable onPress={openDrawer}>
								<Ionicons
									name="menu"
									size={24}
									color="#456B72"
									style={{ marginLeft: 16 }}
								/>
							</Pressable>
						),
						headerRight: () => <HomeRightHeader />,
					}}
					redirect={!isSignedIn}
				/>

				{/* Profile */}
				<Drawer.Screen
					name="profile"
					options={{
						headerTitle: "My Profile",
					}}
					redirect={!isSignedIn}
				/>
				<Drawer.Screen
					name="registerchild"
					options={{
						headerTitle: "Register Children",
					}}
					redirect={!isSignedIn}
				/>
				<Drawer.Screen
					name="successpage"
					options={{
						headerShown: false,
					}}
					redirect={!isSignedIn}
				/>
			</Drawer>
		</>
	);
};

export default DrawerPage;
