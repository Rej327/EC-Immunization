import React, { useState, useEffect } from "react";
import { View, Image, RefreshControl, ActivityIndicator } from "react-native";
import { useUser } from "@clerk/clerk-expo";
import { ScrollView } from "react-native-gesture-handler";
import ProfileInformation from "@/components/profile/ProfileInformation";
import MyBaby from "@/components/profile/MyBaby";
import Notification from "@/components/profile/Notification";
import Milestones from "@/components/profile/Milestones";
import Logout from "@/app/LogOut";

const Profile = () => {
	const [refreshing, setRefreshing] = useState(false);
	const [loading, setLoading] = useState(true); // Loading state for first load
	const { user } = useUser();

	// Simulate first load with a 2-second delay
	useEffect(() => {
		const timer = setTimeout(() => {
			setLoading(false); // Hide loading after 2 seconds
		}, 2000);

		return () => clearTimeout(timer); // Cleanup timer on unmount
	}, []);

	// Simulate refreshing with a 2-second delay
	const onRefresh = async () => {
		setRefreshing(true);
		setLoading(true); // Set loading true on refresh

		const timer = setTimeout(() => {
			setRefreshing(false); // Hide refreshing after 2 seconds
			setLoading(false); // Hide loading after refresh
		}, 2000);

		return () => clearTimeout(timer); // Cleanup timer on unmount
	};

	// Show loading indicator during the first load or while refreshing
	if (loading) {
		return (
			<View
				style={{
					flex: 1,
					justifyContent: "center",
					alignItems: "center",
				}}
			>
				<ActivityIndicator size="large" color="#456B72" />
			</View>
		);
	}

	// Main content after the initial load
	return (
		<ScrollView
			refreshControl={
				<RefreshControl
					refreshing={refreshing}
					onRefresh={onRefresh}
					colors={["#456B72"]}
				/>
			}
			keyboardDismissMode="on-drag"
			className="bg-[#f5f4f7]"
		>
			<View className="bg-[#86b3bc] w-auto h-10" />

			{user && (
				<Image
					source={{ uri: user?.imageUrl }} // Use Clerk's profile image URL
					className="relative mx-auto border-2 -mt-6 mb-4 w-12 h-12 rounded-full"
				/>
			)}
			<View className="px-4">
				<ProfileInformation />
				<MyBaby />
				<Notification />
				<Milestones />
				<Logout />
			</View>
		</ScrollView>
	);
};

export default Profile;
