import { Tabs, useNavigation } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View, Image, Pressable } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { babyIcon } from "@/assets";
import { HomeRightHeader } from "@/components/HomeRightHeader";
import { OfflineHomeRightHeader } from "@/components/OfflineHomeRightHeader";
import { StatusBar } from "expo-status-bar";
import Drawer from "expo-router/drawer";
import { DrawerActions } from "@react-navigation/native";
import OfflineCustomDrawerContent from "@/components/drawer/OfflineCustomDrawerContent";
import { getUserData } from "@/middleware/GetFromLocalStorage";
import { UserData } from "@/types/types";

const TabsPage = () => {
	const [isActive, setIsActive] = useState<boolean | null>(null); // Use null to indicate loading state

	const navigation = useNavigation();

	const openDrawer = () => {
		navigation.dispatch(DrawerActions.openDrawer()); // Function to open the drawer
	};

	useEffect(() => {
		const fetchData = async () => {
			try {
				const userData = await getUserData();
				const status = userData?.isActive ?? false; // Fallback to false if undefined
				setIsActive(status);
			} catch (error) {
				console.error("Error fetching data: ", error);
			}
		};

		fetchData();
	}, []);

	// Show a loading indicator or return null if isActive is still null
	if (isActive === null) {
		return null; // or replace with a loading indicator component
	}

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
				drawerContent={(props) => (
					<OfflineCustomDrawerContent {...props} />
				)}
			>
				{/* Home */}
				<Drawer.Screen
					name="home"
					options={{
						headerTitle: "E.C. Immunization",
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
						headerRight: () => <OfflineHomeRightHeader />,
					}}
					redirect={!isActive}
				/>

				{/* Profile */}
				<Drawer.Screen
					name="profile"
					options={{
						headerTitle: "My Profile",
					}}
					redirect={!isActive}
				/>
			</Drawer>
		</>
	);
};

export default TabsPage;
