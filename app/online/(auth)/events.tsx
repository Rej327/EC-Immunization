import React, { useEffect, useState } from "react";
import { View, FlatList, StyleSheet, Image } from "react-native";
import { db } from "@/db/firebaseConfig";
import { collection, query, onSnapshot } from "firebase/firestore";
import { ThemedText } from "@/components/ThemedText";
import { announcementPost, noticePost, tipsPost } from "@/assets";
import { format, formatDistanceToNow } from "date-fns";
import { Ionicons } from "@expo/vector-icons";

type Post = {
	id: string;
	type: "announcement" | "notice" | "tips";
	subject: string;
	description: string;
	date: Date | null;
	createdAt: Date;
};

export default function Events() {
	const [posts, setPosts] = useState<Post[]>([]);

	useEffect(() => {
		const fetchPosts = () => {
			const q = query(collection(db, "feeds"));
			const unsubscribe = onSnapshot(q, (snapshot) => {
				const postData = snapshot.docs.map((doc) => ({
					id: doc.id,
					...doc.data(),
					date: doc.data().date?.toDate(),
					createdAt: doc.data().createdAt.toDate(),
				})) as Post[];

				// Sort by createdAt in descending order
				const sortedPosts = postData.sort(
					(a, b) => b.createdAt.getTime() - a.createdAt.getTime()
				);
				setPosts(sortedPosts);
			});
			return unsubscribe;
		};

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

	const renderItem = ({ item }: { item: Post }) => {
		const typeImage = getImageForType(item.type);

		return (
			<View style={styles.postContainer}>
				{typeImage && <Image source={typeImage} style={styles.img} />}
				<View style={styles.textContainer}>
					<ThemedText type="default" style={styles.subject}>
						{item.subject}
					</ThemedText>
					<ThemedText type="default" style={styles.description}>
						{item.description}
					</ThemedText>
					<ThemedText type="default" style={styles.date}>
						When: {formatDate(item.date)}
					</ThemedText>
					<View className="flex flex-row w-fit justify-end items-center mt-2 gap-1">
						<Ionicons name="calendar" color="#888" />
						<ThemedText type="date" style={styles.date}>
							{formatCreatedAt(item.createdAt)}
						</ThemedText>
					</View>
				</View>
			</View>
		);
	};

	return (
		<FlatList
			data={posts}
			renderItem={renderItem}
			keyExtractor={(item) => item.id}
		/>
	);
}

const styles = StyleSheet.create({
	postContainer: {
		flexDirection: "row",
		marginHorizontal: 16,
		marginTop: 10,
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
});
