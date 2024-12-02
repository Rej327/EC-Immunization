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
	RefreshControl,
} from "react-native";
import { db } from "@/db/firebaseConfig";
import { collection, query, onSnapshot } from "firebase/firestore";
import { ThemedText } from "@/components/ThemedText";
import { announcementPost, noData, noticePost, tipsPost } from "@/assets";
import { format, formatDistanceToNow } from "date-fns";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { Timestamp, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { Picker } from "@react-native-picker/picker"; // Import Picker
import DateTimePicker from "@react-native-community/datetimepicker";
import { ScrollView } from "react-native-gesture-handler";

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
	const [type, setType] = useState<"announcement" | "notice" | "tips">(
		"announcement"
	); // Add type state
	const [loading, setLoading] = useState(false);
	const [loadingDelete, setLoadingDelete] = useState(false);
	const [date, setDate] = useState<Date | null>(null);
	const [showDatePicker, setShowDatePicker] = useState(false);
	const [refreshing, setRefreshing] = useState(false);

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
		setDate(post.date);
		setType(post.type); // Set the selected type
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

			await updateDoc(postRef, {
				subject,
				description,
				type, // Update the type
				date: date, // Only update the date if it's valid
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

	const handleDateChange = (event: any, selectedDate?: Date) => {
		setShowDatePicker(false);
		if (selectedDate) {
			setDate(selectedDate);
		}
	};

	const handleRefresh = async () => {
		setRefreshing(true);
		await fetchPosts();
		setRefreshing(false);
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
			<View className="flex flex-row gap-2 justify-between mb-2">
				<View className="border-b-[1px] border-[#d6d6d6] shadow-xl w-[40%] mb-2"></View>
				<ThemedText
					type="cardHeader"
					className="first-letter:capitalize"
				>
					Events
				</ThemedText>
				<View className="border-b-[1px] border-[#d6d6d6] shadow-xl w-[40%] mb-2"></View>
			</View>

			<FlatList
				data={posts}
				renderItem={renderItem}
				keyExtractor={(item) =>
					item.id || `${item.createdAt.getTime()}`
				}
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={handleRefresh}
					/>
				}
				ListEmptyComponent={() => (
					<View style={styles.emptyContainer}>
						<Image source={noData} className="w-16 h-20 mb-2" />
						<ThemedText type="default" style={styles.emptyText}>
							No Data Available
						</ThemedText>
					</View>
				)}
			/>

			<Modal
				visible={modalVisible}
				animationType="fade"
				transparent={true}
				onRequestClose={closeModal}
			>
				<View style={styles.modalContainer}>
					<View style={styles.modalContent}>
						<ThemedText type="subtitle">Modify Data</ThemedText>
						<ThemedText style={styles.label}>Subject</ThemedText>
						<TextInput
							style={styles.inputField}
							value={subject}
							onChangeText={setSubject}
							placeholder="Subject"
							placeholderTextColor="#888"
							multiline
						/>
						<ThemedText style={styles.label}>
							Description
						</ThemedText>
						<TextInput
							style={styles.inputField}
							value={description}
							onChangeText={setDescription}
							placeholder="Description"
							placeholderTextColor="#888"
							multiline
						/>

						<ThemedText style={styles.label}>
							Date (optional)
						</ThemedText>
						<TouchableOpacity
							onPress={() => setShowDatePicker(true)}
							style={styles.dateButton}
						>
							<ThemedText style={styles.dateText}>
								{/* {date ? date.toLocaleDateString() : "Select Date"} */}
								{date ? formatDate(date) : "Select Date"}
							</ThemedText>
						</TouchableOpacity>
						{showDatePicker && (
							<DateTimePicker
								value={date || new Date()}
								mode="date"
								display="default"
								onChange={handleDateChange}
							/>
						)}

						{/* Add Picker for type */}
						<Picker
							selectedValue={type}
							onValueChange={(itemValue) =>
								setType(
									itemValue as
										| "announcement"
										| "notice"
										| "tips"
								)
							}
							style={styles.inputField}
						>
							<Picker.Item
								label="Announcement"
								value="announcement"
							/>
							<Picker.Item label="Notice" value="notice" />
							<Picker.Item label="Tips" value="tips" />
						</Picker>

						<View style={styles.buttonContainer}>
							<TouchableOpacity
								style={styles.updateButton}
								onPress={handleUpdate}
							>
								{loading ? (
									<ActivityIndicator color="#fff" />
								) : (
									<ThemedText
										type="default"
										style={styles.buttonText}
									>
										Update Post
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
									<ThemedText
										type="default"
										style={styles.buttonText}
									>
										Delete Post
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
				</View>
			</Modal>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingTop: 10,
		paddingHorizontal: 16,
	},
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
	modalContainer: {
		display: 'flex',
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "rgba(0, 0, 0, 0.5)",
	},
	modalContent: {
		backgroundColor: "white",
		padding: 20,
		borderRadius: 8,
		width: "90%",
	},
	input: {
		width: 300,
		height: 40,
		borderColor: "#ccc",
		borderWidth: 1,
		marginBottom: 10,
		padding: 8,
	},
	inputField: {
		borderColor: "#ccc",
		borderWidth: 1,
		padding: 8,
		borderRadius: 5,
		marginTop: 8,
	},
	buttonContainer: {
		display: "flex",
		gap: 10,
		marginTop: 12,
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
	label: {
		fontSize: 16,
		fontWeight: "bold",
		marginTop: 16,
	},
	dateText: {
		color: "#555",
	},
	dateButton: {
		borderColor: "#ccc",
		borderWidth: 1,
		padding: 10,
		borderRadius: 5,
		marginVertical: 8,
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
