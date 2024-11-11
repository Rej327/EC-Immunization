import React, { useEffect, useState } from "react";
import { View, FlatList, StyleSheet, Image } from "react-native";
import { ThemedText } from "@/components/ThemedText";
import { announcementPost, noData, noticePost, tipsPost } from "@/assets";
import { format, formatDistanceToNow } from "date-fns";
import { Ionicons } from "@expo/vector-icons";
import { Feed } from "@/types/types";
import { getFeedData } from "@/middleware/GetFromLocalStorage";

export default function OfflineEventsShort() {
	const [posts, setPosts] = useState<Feed[]>([]);

	useEffect(() => {
		// Fetch the feed data from AsyncStorage
		const fetchPosts = async () => {
			const feedData = await getFeedData(); // Fetch from AsyncStorage
			setPosts(feedData); // Assuming `getFeedData` returns a single feed
		};
		console.log("Post", posts);

		fetchPosts();
	}, []);

	const formatCreatedAt = (date: Date) => {
		if (!date) return "Unknown Date"; // Fallback if date is not valid
		const now = new Date();
		const secondsDiff = Math.floor((now.getTime() - date.getTime()) / 1000);

		// If less than a week ago, show relative time
		if (secondsDiff < 604800) {
			return formatDistanceToNow(date, { addSuffix: true });
		}

		// If older than a week, show the actual date
		return format(date, "PPPP");
	};

	const formatDate = (date: Date | null) => {
		return date?.toLocaleDateString("en-US", {
			month: "short",
			day: "2-digit",
			year: "numeric",
		});
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
			<View key={item.id} style={styles.postContainer}>
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
			</View>
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
