import {
	View,
	Text,
	FlatList,
	StyleSheet,
	TouchableOpacity,
	ActivityIndicator,
	Modal,
	TextInput,
	Button,
} from "react-native";
import React, { useEffect, useState } from "react";
import { db } from "@/db/firebaseConfig"; // Your Firestore config
import { collection, getDocs, query, where } from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";
import StyledButton from "@/components/StyledButton";

export default function Dashboard() {
	const [parents, setParents] = useState<any[]>([]); // State to store parents data
	const [loading, setLoading] = useState(true); // State to manage loading state
	const [modalVisible, setModalVisible] = useState(false); // State for modal visibility
	const [selectedUser, setSelectedUser] = useState<any>(null); // Store selected user for messaging
	const [subject, setSubject] = useState(""); // State for subject input
	const [message, setMessage] = useState(""); // State for message input

	useEffect(() => {
		const fetchParents = async () => {
			try {
				// Create a query to exclude a specific user ID
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
			} catch (error) {
				console.error("Error fetching parents data: ", error);
			} finally {
				setLoading(false); // Set loading to false after fetching data
			}
		};

		fetchParents();
	}, []);

	const handleMessageUser = (user: any) => {
		setSelectedUser(user);
		setModalVisible(true);
	};

	const handleSendMessage = () => {
		// Implement your logic to send the message here
		console.log("Message sent to:", selectedUser.firstName);
		console.log("Subject:", subject);
		console.log("Message:", message);

		// Reset the fields and close the modal
		setSubject("");
		setMessage("");
		setModalVisible(false);
	};

  const handleCancelModal = () => {
    setSubject("");
		setMessage("");
    setModalVisible(false);
  }

	if (loading) {
		return (
			<View className="flex mt-[50%] items-center justify-center">
				<ActivityIndicator size="large" color="#456B72" />
			</View>
		); // Display a loading message while fetching data
	}

	return (
		<View style={styles.container}>
			<FlatList
				data={parents}
				keyExtractor={(item) => item.id}
				renderItem={({ item }) => (
					<View style={styles.item}>
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
							<TouchableOpacity>
								<Ionicons
									name="people"
									color="#456B72"
									size={20}
								/>
							</TouchableOpacity>
						</View>
					</View>
				)}
			/>

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
							style={styles.textarea} // Changed to textarea style
							placeholder="Message"
							value={message}
							onChangeText={setMessage}
							multiline
							numberOfLines={4} // Allows multiple lines
						/>

						<StyledButton
							title="Send Message"
							onPress={handleSendMessage}
							borderRadius={5}
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
							borderRadius={5}
							textColor="#456B72"
						/>
					</View>
				</View>
			</Modal>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 20,
		backgroundColor: "#f9f9f9",
	},
	item: {
		display: "flex",
		justifyContent: "space-between",
		flexDirection: "row",
		backgroundColor: "white",
		padding: 16,
		borderWidth: 1,
		borderRadius: 10,
		borderColor: "#d6d6d6",
		marginBottom: 8,
	},
	itemText: {
		fontSize: 16,
	},
	modalContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "rgba(0, 0, 0, 0.5)",
	},
	modalContent: {
		width: "80%",
		backgroundColor: "white",
		padding: 20,
		borderRadius: 10,
		elevation: 5,
	},
	modalTitle: {
		fontSize: 18,
		marginBottom: 10,
	},
	input: {
		height: 40,
		borderColor: "#ccc",
		borderWidth: 1,
		marginBottom: 10,
		paddingHorizontal: 10,
		borderRadius: 5,
	},
	textarea: {
		height: 100, // Set height for textarea
		borderColor: "#ccc",
		borderWidth: 1,
		marginBottom: 10,
		paddingHorizontal: 10,
		borderRadius: 5,
	},
});
