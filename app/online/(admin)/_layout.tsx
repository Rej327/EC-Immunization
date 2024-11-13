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
	const navigation = useNavigation();

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
				<Drawer.Screen
					name="dashboard"
					options={{
						headerTitle: "Dashboard",
					}}
				/>
				<Drawer.Screen
					name="events"
					options={{
						headerTitle: "Events",
					}}
				/>
				<Drawer.Screen
					name="posts"
					options={{
						headerTitle: "Posts",
					}}
				/>
			</Drawer>
		</>
	);
};

export default DrawerPage;
