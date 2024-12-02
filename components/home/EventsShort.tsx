import React, { useEffect, useState } from "react";
import {
	View,
	FlatList,
	StyleSheet,
	Image,
	ActivityIndicator,
	TouchableOpacity,
} from "react-native";
import { db } from "@/db/firebaseConfig";
import { collection, query, onSnapshot } from "firebase/firestore";
import { ThemedText } from "@/components/ThemedText";
import { announcementPost, noData, noticePost, tipsPost } from "@/assets";
import { format, formatDistanceToNow } from "date-fns";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage
import { useRouter } from "expo-router";

type Post = {
	id: string;
	type: "announcement" | "notice" | "tips";
	subject: string;
	description: string;
	date: Date | null;
	createdAt: Date;
};

export default function EventsShort() {
	const [posts, setPosts] = useState<Post[]>([]);
	const [loading, setLoading] = useState(false);
	const route = useRouter();

	useEffect(() => {
		setLoading(true);
		const fetchPosts = () => {
			try {
				const q = query(collection(db, "feeds"));
				const unsubscribe = onSnapshot(
					q,
					(snapshot) => {
						const postData = snapshot.docs.map((doc) => ({
							id: doc.id,
							...doc.data(),
							date: doc.data().date?.toDate(),
							createdAt: doc.data().createdAt.toDate(),
						})) as Post[];

						const sortedPosts = postData.sort(
							(a, b) =>
								b.createdAt.getTime() - a.createdAt.getTime()
						);
						setPosts(sortedPosts);
					},
					(error) => {
						console.error("Error fetching posts:", error);
					}
				);
				return unsubscribe;
			} catch (error) {
				console.error("Error setting up snapshot listener:", error);
			} finally {
				setLoading(false);
			}
		};

		const unsubscribe = fetchPosts();

		return () => {
			if (unsubscribe) unsubscribe();
		};
	}, []);

	const formatCreatedAt = (date: Date) => {
		if (!date) return "Unknown Date";
		const now = new Date();
		const secondsDiff = Math.floor((now.getTime() - date.getTime()) / 1000);

		if (secondsDiff < 604800) {
			return formatDistanceToNow(date, { addSuffix: true });
		}

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
				route.push("/online/(category)/appointment");
			}
		}
	};

	if (loading) {
		return (
			<View
				style={{
					flex: 1,
					justifyContent: "center",
					alignItems: "center",
					marginTop: 30,
				}}
			>
				<ActivityIndicator
					size="large"
					color="#456B72"
					className="mt-4"
				/>
			</View>
		);
	}

	const renderItem = (item: Post) => {
		const typeImage = getImageForType(item.type);

		return (
			<TouchableOpacity
				key={item.id}
				style={styles.postContainer}
				onPress={() => handleAction(item)} // Handle post press
			>
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
					<View
						style={{
							flexDirection: "row",
							justifyContent: "flex-end",
							alignItems: "center",
							marginTop: 8,
						}}
					>
						<Ionicons name="calendar" color="#888" />
						<ThemedText type="date" style={styles.date}>
							{formatCreatedAt(item.createdAt)}
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
