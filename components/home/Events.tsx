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

const PAGE_SIZE = 5;

export default function Events() {
	const [posts, setPosts] = useState<Post[]>([]);
	const [visiblePosts, setVisiblePosts] = useState<Post[]>([]);
	const [currentPage, setCurrentPage] = useState(1);

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

				const sortedPosts = postData.sort(
					(a, b) => b.createdAt.getTime() - a.createdAt.getTime()
				);
				setPosts(sortedPosts);
				setVisiblePosts(sortedPosts.slice(0, PAGE_SIZE));
			});
			return unsubscribe;
		};

		fetchPosts();
	}, []);

	const loadMorePosts = () => {
		const nextPage = currentPage + 1;
		const newVisiblePosts = posts.slice(0, nextPage * PAGE_SIZE);
		setVisiblePosts(newVisiblePosts);
		setCurrentPage(nextPage);
	};

	const formatCreatedAt = (date: Date) => {
		if (!date) return "Unknown Date";
		const now = new Date();
		const secondsDiff = Math.floor((now.getTime() - date.getTime()) / 1000);
		return secondsDiff < 604800
			? formatDistanceToNow(date, { addSuffix: true })
			: format(date, "PPPP");
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
					{item.date ? (
						<ThemedText type="default" style={styles.date}>
							When: {formatDate(item.date)}
						</ThemedText>
					) : null}
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
			data={visiblePosts}
			renderItem={renderItem}
			keyExtractor={(item) => item.id}
			onEndReached={loadMorePosts}
			onEndReachedThreshold={0.5}
			scrollEnabled={false}
			contentContainerStyle={{ paddingBottom: 16 }}
		/>
	);
}

const styles = StyleSheet.create({
	postContainer: {
		flexDirection: "row",
		marginVertical: 8,
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
