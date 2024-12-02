import React, { useEffect, useState } from "react";
import { View, FlatList, StyleSheet, Image } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { announcementPost, noData, noticePost, tipsPost } from "@/assets";
import { format, formatDistanceToNow } from "date-fns";
import { Ionicons } from "@expo/vector-icons";
import { Feed } from "@/types/types";
import { getFeedData } from "@/middleware/GetFromLocalStorage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { TouchableOpacity } from "react-native-gesture-handler";

type Post = {
	id: string;
	type: "announcement" | "notice" | "tips";
	subject: string;
	description: string;
	date: Date | null;
	createdAt: Date;
};

export default function OfflineEventsShort() {
	const [posts, setPosts] = useState<Feed[]>([]);
	const route = useRouter();

	useEffect(() => {
		// Fetch the feed data from AsyncStorage
		const fetchPosts = async () => {
			const feedData = await getFeedData(); // Fetch from AsyncStorage
			setPosts(feedData); // Assuming `getFeedData` returns a single feed
		};
		console.log("Post", posts);

		fetchPosts();
	}, []);
	// Extract last sentence after 'in' from subject
	const extractBrgy = (subject: string) => {
		const prefix = "Babies Vaccination in "; // The string we want to find
		const indexOfPrefix = subject.indexOf(prefix);

		if (indexOfPrefix !== -1) {
			// Extract everything after the "Babies Vaccination in" part
			const extractedText = subject
				.slice(indexOfPrefix + prefix.length)
				.trim();
			return extractedText; // Return the extracted part
		}

		return ""; // If the prefix is not found, return an empty string
	};

	// Handle action when a post is pressed
	const handleAction = async (item: Post) => {
		if (
			item.type === "announcement" &&
			item.subject === "Vaccination Schedule"
		) {
			const selectedBrgy = extractBrgy(item.description);

			if (selectedBrgy) {
				// Save the extracted sentence into AsyncStorage
				await AsyncStorage.setItem("selectedBrgy", selectedBrgy);
				console.log("Last Sentence", selectedBrgy);

				// Navigate to the appropriate route
				route.push("/offline/(category)/appointment");
			}
		}
	};

	const getImageForType = (type: string) => {
		switch (type) {
			case "announcement":
				return announcementPost;
			case "notice":
				return noticePost;
			case "tips":
				return tipsPost;
			default:
				return null;
		}
	};

	const renderItem = (item: Feed) => {
		const typeImage = getImageForType(item.type);

		return (
			<TouchableOpacity onPress={() => handleAction(item)} key={item.id} style={styles.postContainer}>
				{typeImage && <Image source={typeImage} style={styles.img} />}
				<View style={styles.textContainer}>
					<ThemedText type="default" style={styles.subject}>
						{item.subject}
					</ThemedText>
					<ThemedText type="default" style={styles.description}>
						{item.description}
					</ThemedText>
					{item.date ? (
						<ThemedText type="default" style={styles.date}>
							When:{" "}
							{new Date(item.date).toLocaleDateString("en-US", {
								month: "short",
								day: "2-digit",
								year: "numeric",
							})}
						</ThemedText>
					) : null}
					<View className="flex flex-row w-fit justify-end items-center mt-2 gap-1">
						<Ionicons name="calendar" color="#888" />
						<ThemedText type="date" style={styles.date}>
							{item.offlineCreatedAt}
						</ThemedText>
					</View>
				</View>
			</TouchableOpacity>
		);
	};

	return (
		<View>
			{posts.length > 0 ? (
				<>{posts.slice(0, 3).map((item) => renderItem(item))}</>
			) : (
				<View style={styles.emptyContainer}>
					<Image source={noData} className="w-16 h-20 mb-2" />
					<ThemedText type="default" style={styles.emptyText}>
						No Data Available
					</ThemedText>
				</View>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	postContainer: {
		flexDirection: "row",
		marginBottom: 10,
		padding: 12,
		backgroundColor: "#fff",
		borderRadius: 8,
		borderWidth: 1,
		borderColor: "#ddd",
		alignItems: "center",
	},
	img: {
		width: 50,
		height: 50,
		marginRight: 12,
	},
	textContainer: {
		flex: 1,
	},
	subject: {
		fontWeight: "bold",
		fontSize: 16,
	},
	description: {
		color: "#555",
		marginTop: 4,
	},
	date: {
		color: "#888",
		fontSize: 12,
	},
	emptyContainer: {
		alignItems: "center",
		justifyContent: "center",
		marginTop: 20,
	},
	emptyText: {
		color: "#888",
		fontSize: 16,
	},
});
