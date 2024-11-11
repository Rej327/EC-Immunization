import React, { useState, useEffect } from "react";
import { View, Image, RefreshControl, ActivityIndicator } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import ProfileInformation from "@/components/offlineprofile/ProfileInformation";
import MyBaby from "@/components/offlineprofile/MyBaby";
import Notification from "@/components/offlineprofile/Notification";
import Milestones from "@/components/offlineprofile/Milestones";
import OfflineProfileAvatarSmall from "@/app/OfflineProfileAvatarSmall";

const Profile = () => {
	const [loading, setLoading] = useState(true);

	// Simulate first load with a 2-second delay
	useEffect(() => {
		const timer = setTimeout(() => {
			setLoading(false); // Hide loading after 2 seconds
		}, 2000);

		return () => clearTimeout(timer); // Cleanup timer on unmount
	}, []);

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
			keyboardDismissMode="on-drag"
			className="bg-[#f5f4f7]"
		>
			<View className="bg-[#86b3bc] w-auto h-10" />

			<OfflineProfileAvatarSmall />
			{/* {user && (
				<Image
					source={{ uri: user?.imageUrl }} // Use Clerk's profile image URL
					className="relative mx-auto border-2 -mt-6 mb-4 w-12 h-12 rounded-full"
				/>
			)} */}
			<View className="px-4">
				<ProfileInformation />
				<MyBaby />
				{/* <Notification /> */}
				<Milestones />
			</View>
		</ScrollView>
	);
};

export default Profile;
