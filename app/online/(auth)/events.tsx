import React, { useEffect, useState } from "react";
import {
	View,
	FlatList,
	StyleSheet,
	Image,
	Modal,
	TextInput,
	TouchableOpacity,
	Button,
	ActivityIndicator,
} from "react-native";
import { db } from "@/db/firebaseConfig";
import { collection, query, onSnapshot } from "firebase/firestore";
import { ThemedText } from "@/components/ThemedText";
import { announcementPost, noticePost, tipsPost } from "@/assets";
import { format, formatDistanceToNow } from "date-fns";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { Timestamp, updateDoc, deleteDoc, doc } from "firebase/firestore";

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
	const [modalVisible, setModalVisible] = useState(false);
	const [selectedPost, setSelectedPost] = useState<Post | null>(null);
	const [subject, setSubject] = useState("");
	const [description, setDescription] = useState("");
	const [loading, setLoading] = useState(false);
	const [loadingDelete, setLoadingDelete] = useState(false);

	useEffect(() => {
		fetchPosts();
	}, []);

	const fetchPosts = async () => {
		try {
			const q = query(collection(db, "feeds")); // No limit here
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
				setPosts(sortedPosts); // Set all posts directly
			});

			return unsubscribe;
		} catch (error) {
			console.error("Error fetching posts:", error);
			Toast.show({
				type: "error",
				text1: "Error",
				text2: "Failed to load posts.",
			});
		}
	};

	const formatCreatedAt = (date: Date) => {
		if (!date) return "Unknown Date"; // Fallback if date is not valid
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

	const openModal = (post: Post) => {
		setSelectedPost(post);
		setSubject(post.subject);
		setDescription(post.description);
		setModalVisible(true);
	};

	const closeModal = () => {
		setModalVisible(false);
		setSelectedPost(null);
	};

	const handleUpdate = async () => {
		setLoading(true);
		if (!selectedPost || !subject || !description) {
			Toast.show({
				type: "error",
				text1: "Error",
				text2: "Subject and description are required.",
			});
			setLoading(false);
			return;
		}

		try {
			const postRef = doc(db, "feeds", selectedPost.id);

			// Check if the date is valid; if not, set it to null or leave it out of the update
			const dateToUpdate = selectedPost.date
				? Timestamp.fromDate(selectedPost.date)
				: null;

			await updateDoc(postRef, {
				subject,
				description,
				date: dateToUpdate, // Only update the date if it's valid
			});

			Toast.show({
				type: "success",
				text1: "Success",
				text2: "Post updated successfully!",
			});

			closeModal();
		} catch (error) {
			console.error("Error updating post:", error);
			Toast.show({
				type: "error",
				text1: "Error",
				text2: "Failed to update post.",
			});
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async () => {
		setLoadingDelete(true);
		if (!selectedPost) {
			setLoadingDelete(false);
			return;
		}

		try {
			const postRef = doc(db, "feeds", selectedPost.id);
			await deleteDoc(postRef);

			Toast.show({
				type: "success",
				text1: "Success",
				text2: "Post deleted successfully!",
			});

			closeModal();
		} catch (error) {
			console.error("Error deleting post:", error);
			Toast.show({
				type: "error",
				text1: "Error",
				text2: "Failed to delete post.",
			});
		} finally {
			setLoadingDelete(false);
		}
	};

	const renderItem = ({ item }: { item: Post }) => {
		const typeImage = getImageForType(item.type);

		return (
			<TouchableOpacity
				onPress={() => openModal(item)}
				style={styles.postContainer}
			>
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
			</TouchableOpacity>
		);
	};

	return (
		<View style={styles.container}>
			<FlatList
				data={posts}
				renderItem={renderItem}
				keyExtractor={(item) => item.id || item.createdAt.toString()} // Fall back to createdAt if id is not available
			/>

			<Modal
				visible={modalVisible}
				animationType="slide"
				onRequestClose={closeModal}
			>
				<View style={styles.modalContainer}>
					<ThemedText type="subtitle" className="mb-2">
						Modify Data
					</ThemedText>
					<TextInput
						style={[styles.inputModal, styles.inputField]}
						value={subject}
						onChangeText={setSubject}
						placeholder="Subject"
						placeholderTextColor="#888"
					/>
					<TextInput
						style={[styles.inputModal, styles.inputField]}
						value={description}
						onChangeText={setDescription}
						placeholder="Description"
						placeholderTextColor="#888"
					/>
					<View style={styles.buttonContainer}>
						<TouchableOpacity
							style={styles.updateButton}
							onPress={handleUpdate}
						>
							{loading ? (
								<ActivityIndicator color="#fff" />
							) : (
								<ThemedText style={styles.buttonText}>
									Update
								</ThemedText>
							)}
						</TouchableOpacity>
						<TouchableOpacity
							style={styles.deleteButton}
							onPress={handleDelete}
						>
							{loadingDelete ? (
								<ActivityIndicator color="#fff" />
							) : (
								<ThemedText style={styles.buttonText}>
									Delete
								</ThemedText>
							)}
						</TouchableOpacity>
						<TouchableOpacity
							style={styles.closeButton}
							onPress={closeModal}
						>
							<ThemedText style={styles.buttonText}>
								Close
							</ThemedText>
						</TouchableOpacity>
					</View>
				</View>
			</Modal>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingTop: 10,
	},
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
	modalContainer: {
		padding: 20,
		justifyContent: "center",
		marginVertical: "auto",
	},
	input: {
		width: 300,
		height: 40,
		borderColor: "#ccc",
		borderWidth: 1,
		marginBottom: 10,
		padding: 8,
	},

	inputModal: {
		height: 45,
		borderColor: "#ccc", // Lighter border color
		borderWidth: 1,
		marginBottom: 15,
		borderRadius: 8,
		paddingHorizontal: 10,
		backgroundColor: "#fff", // White background for inputs
	},
	inputField: {
		fontSize: 16,
		color: "#333", // Dark text for readability
	},
	buttonContainer: {
		display: "flex",
		gap: 10,
	},
	buttonText: {
		color: "white",
		fontWeight: "bold",
		textAlign: "center",
	},
	updateButton: {
		backgroundColor: "#1f9e34",
		borderRadius: 8,
		padding: 12,
	},
	deleteButton: {
		backgroundColor: "#b92828",
		borderRadius: 8,
		padding: 12,
	},
	closeButton: {
		backgroundColor: "#456B72",
		borderRadius: 8,
		padding: 12,
	},
});
