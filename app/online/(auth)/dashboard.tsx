import {
	View,
	Text,
	FlatList,
	StyleSheet,
	TouchableOpacity,
	ActivityIndicator,
	Modal,
	TextInput,
	Image,
	ScrollView,
} from "react-native";
import React, { useEffect, useState } from "react";
import { db } from "@/db/firebaseConfig"; // Your Firestore config
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";
import StyledButton from "@/components/StyledButton";
import { useRouter } from "expo-router";
import { ThemedText } from "@/components/ThemedText";
import { countBaby, countParent, noData } from "@/assets";
import ScheduleList from "@/components/dashboard/ScheduleList";

export default function Dashboard() {
	const [parents, setParents] = useState<any[]>([]); // State to store parents data
	const [loading, setLoading] = useState(true); // State to manage loading state
	const [modalVisible, setModalVisible] = useState(false); // State for modal visibility
	const [selectedUser, setSelectedUser] = useState<any>(null); // Store selected user for messaging
	const [subject, setSubject] = useState(""); // State for subject input
	const [message, setMessage] = useState(""); // State for message input
	const [searchQuery, setSearchQuery] = useState(""); // State for search input
	const [babyCount, setBabyCount] = useState(0); // State to store the count of babies
	const [parentCount, setParentCount] = useState(0); // State to store the count of parents

	const route = useRouter();

	useEffect(() => {
		const fetchParents = async () => {
			try {
				const parentsQuery = query(
					collection(db, "parents"),
					where("username", "!=", "admin") // Exclude admin users
				);

				const querySnapshot = await getDocs(parentsQuery);
				const parentsData: any[] = [];

				querySnapshot.forEach((doc) => {
					// Push each document data into the parentsData array
					parentsData.push({ id: doc.id, ...doc.data() });
				});

				setParents(parentsData); // Update the state with the fetched data
				setParentCount(parentsData.length); // Update the parent count
			} catch (error) {
				console.error("Error fetching parents data: ", error);
			} finally {
				setLoading(false); // Set loading to false after fetching data
			}
		};

		const fetchBabiesCount = async () => {
			try {
				const babiesQuery = query(collection(db, "babies")); // Adjust the collection name if necessary
				const querySnapshot = await getDocs(babiesQuery);
				setBabyCount(querySnapshot.size); // Set the count of babies
			} catch (error) {
				console.error("Error fetching babies data: ", error);
			}
		};

		fetchParents();
		fetchBabiesCount();
	}, []);

	// Handle user selection to send message
	const handleMessageUser = (user: any) => {
		setSelectedUser(user);
		setModalVisible(true);
	};

	// Handle sending the message
	const handleSendMessage = async () => {
		try {
			// Add the message to the 'messages' collection in Firestore
			await addDoc(collection(db, "messages"), {
				receiverId: selectedUser.id, // Add sender ID
				firstName: selectedUser.firstName,
				lastName: selectedUser.lastName,
				subject: subject,
				message: message,
				createdAt: new Date(), // Add a timestamp
			});

			console.log("Message Sent");
		} catch (error) {
			console.error("Error sending message: ", error);
		}

		// Reset the fields and close the modal
		setSubject("");
		setMessage("");
		setModalVisible(false);
	};

	// Handle cancelling the modal
	const handleCancelModal = () => {
		setSubject("");
		setMessage("");
		setModalVisible(false);
	};

	// Handle routing to the parent by ID screen
	const handleRoute = (id: any) => {
		route.push({
			pathname: "/online/(dashboard)/parentById",
			params: { parentIdFromDashboard: id },
		});
	};

	// Filter parents based on search query
	const filteredParents =
		searchQuery.length >= 1
			? parents.filter((parent) =>
					`${parent.firstName} ${parent.lastName}`
						.toLowerCase()
						.includes(searchQuery.toLowerCase())
			  )
			: parents;

	// If loading, show a loading indicator
	if (loading) {
		return (
			<View style={styles.loadingContainer}>
				<ActivityIndicator size="large" color="#456B72" />
			</View>
		);
	}

	return (
		<ScrollView style={styles.container} keyboardDismissMode="on-drag" stickyHeaderIndices={[0]}>
			{/* Search Input (sticky at the top) */}
			<View style={styles.searchInputContainer}>
				{/* Sticky container */}
				<TextInput
					style={styles.searchInput}
					placeholder="🔍 Search"
					value={searchQuery}
					onChangeText={setSearchQuery}
				/>
			</View>
			{/* Counts Card */}
			<View style={styles.countsContainer}>
				<View style={styles.countCard} className="relative">
					<ThemedText
						className="absolute top-1 left-[5%] text-sm font-bold"
						type="default"
					>
						Users
					</ThemedText>
					<View style={styles.countLabelImageContainer}>
						<Image source={countParent} style={styles.countImage} />
						<ThemedText
							className="ml-[17%] text-2xl font-semibold -mt-1"
							type="cardTitle"
						>
							{parentCount}
						</ThemedText>
					</View>
				</View>
				<View style={styles.countCard} className="relative">
					<ThemedText
						className="absolute top-1 left-[5%] text-sm font-bold"
						type="default"
					>
						Childrens
					</ThemedText>
					<View style={styles.countLabelImageContainer}>
						<Image source={countBaby} style={styles.countImage} />
						<ThemedText
							className="ml-[17%] text-2xl font-semibold -mt-1"
							type="cardTitle"
						>
							{babyCount}
						</ThemedText>
					</View>
				</View>
			</View>

			{/* Schedule section */}
			<ScheduleList />

			{/* List for accounts */}
			<View className="mx-[20px]">
				<View className="flex flex-row gap-2 justify-between mb-4">
					<View className="border-b-[1px] border-[#d6d6d6] shadow-xl w-[32%] mb-2"></View>
					<ThemedText type="cardHeader">Accounts</ThemedText>
					<View className="border-b-[1px] border-[#d6d6d6] shadow-xl w-[32%] mb-2"></View>
				</View>
				{filteredParents.length > 0 ? (
					filteredParents.map((item) => (
						<View style={styles.item} key={item.id}>
							<Text style={styles.itemText}>
								{item.firstName} {item.lastName}
							</Text>
							<View className="flex flex-row gap-5 items-center">
								<TouchableOpacity
									onPress={() => handleMessageUser(item)}
								>
									<Ionicons
										name="chatbox"
										color="#456B72"
										size={20}
									/>
								</TouchableOpacity>
								<TouchableOpacity
									onPress={() => handleRoute(item.id)}
								>
									<Ionicons
										name="people"
										color="#456B72"
										size={20}
									/>
								</TouchableOpacity>
							</View>
						</View>
					))
				) : (
					// Display this when no people match the search query
					<View style={styles.noResultsContainer}>
						<Image
							source={noData}
							className="w-20 mx-auto h-24 opacity-40"
						/>
						<Text style={styles.noResultsText}>
							Users not found
						</Text>
					</View>
				)}
			</View>
			{/* Message Modal */}
			<Modal
				animationType="fade"
				transparent={true}
				visible={modalVisible}
				onRequestClose={() => setModalVisible(false)}
			>
				<View style={styles.modalContainer}>
					<View style={styles.modalContent}>
						<Text style={styles.modalTitle}>
							Message {selectedUser?.firstName}
						</Text>
						<TextInput
							style={styles.input}
							placeholder="Subject"
							value={subject}
							onChangeText={setSubject}
						/>
						<TextInput
							style={styles.textarea}
							placeholder="Message"
							value={message}
							onChangeText={setMessage}
							multiline
							numberOfLines={4}
						/>
						<StyledButton
							title="Send Message"
							onPress={handleSendMessage}
							borderRadius={12}
							paddingVertical={8}
							fontSize={14}
						/>
						<StyledButton
							title="Cancel"
							onPress={handleCancelModal}
							bgColor="#d6d6d6"
							customWeight="500"
							fontSize={14}
							paddingVertical={8}
							borderRadius={12}
							textColor="#456B72"
						/>
					</View>
				</View>
			</Modal>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#f5f4f7",
	},
	countsContainer: {
		paddingHorizontal: 20,
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 20,
	},
	countCard: {
		position: "relative",
		flex: 1,
		backgroundColor: "#fff",
		overflow: "hidden",
		borderRadius: 14,
		borderWidth: 1,
		borderColor: "#d6d6d6",
		alignItems: "center",
		marginHorizontal: 4,
	},
	countLabelImageContainer: {
		display: "flex",
		flexDirection: "row-reverse",
		justifyContent: "space-between",
		alignItems: "center",
		width: "100%",
		marginTop: 30,
	},
	countImage: {
		width: 110,
		height: 90,
		objectFit: "contain",
	},
	searchInputContainer: {
		backgroundColor: "#f9f9f9",
		paddingHorizontal: 20,
		paddingTop: 10,
	},
	searchInput: {
		height: 46,
		borderColor: "#d6d6d6",
		borderWidth: 1,
		marginBottom: 10,
		paddingHorizontal: 10,
		paddingVertical: 10,
		borderRadius: 10,
		backgroundColor: "#fff",
	},
	item: {
		flexDirection: "row",
		justifyContent: "space-between",
		paddingHorizontal: 10,
		paddingVertical: 14,
		marginBottom: 10,
		backgroundColor: "#fff",
		borderRadius: 10,
		borderWidth: 1,
		borderColor: "#d6d6d6",
	},
	itemText: {
		fontSize: 16,
	},
	noResultsContainer: {
		padding: 20,
		alignItems: "center",
	},
	noResultsText: {
		fontSize: 14,
		marginTop: 10,
		color: "#999",
	},
	modalContainer: {
		paddingHorizontal: 20,
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "rgba(0, 0, 0, 0.8)",
	},
	modalContent: {
		width: "80%",
		padding: 20,
		backgroundColor: "#fff",
		borderRadius: 10,
	},
	modalTitle: {
		fontSize: 20,
		fontWeight: "bold",
		marginBottom: 10,
	},
	input: {
		height: 40,
		borderColor: "#ccc",
		borderWidth: 1,
		marginBottom: 10,
		paddingHorizontal: 10,
		borderRadius: 10,
	},
	textarea: {
		height: 80,
		borderColor: "#ccc",
		borderWidth: 1,
		marginBottom: 10,
		paddingHorizontal: 10,
		borderRadius: 10,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
});
