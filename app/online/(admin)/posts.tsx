import React, { useState } from "react";
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	StyleSheet,
	ActivityIndicator,
} from "react-native";
import { db } from "@/db/firebaseConfig";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { ThemedText } from "@/components/ThemedText";
import Toast from "react-native-toast-message"; // Import Toast

export default function CreatePost() {
	const [subject, setSubject] = useState("");
	const [description, setDescription] = useState("");
	const [date, setDate] = useState<Date | null>(null);
	const [showDatePicker, setShowDatePicker] = useState(false);
	const [type, setType] = useState("announcement");
	const [loading, setLoading] = useState(false);

	const handlePost = async () => {
		setLoading(true);
		if (!subject || !description) {
			Toast.show({
				type: "error",
				position: "top",
				text1: "Error",
				text2: "Subject and description are required.",
			});
      setLoading(false)
			return;
		}

		try {
			const newPost = {
				subject,
				description,
				date: date ? Timestamp.fromDate(date) : null,
				createdAt: Timestamp.now(),
				type,
			};

			const formattedDate = date
			? date.toLocaleDateString("en-US", {
					year: "numeric",
					month: "long",
					day: "numeric",
				})
			: null;

			const addInNotifications = {
				receiverId: "all",
				firstName: "All",
				lastName: "Users",
				isRead: false,
				subject: subject,
				message: date
					? `${description} on ${formattedDate}`
					: description,
				createdAt: Timestamp.now(),
			};

			await addDoc(collection(db, "feeds"), newPost);
			await addDoc(collection(db, "notifications"), addInNotifications);

			Toast.show({
				type: "success",
				position: "top",
				text1: "Success",
				text2: "Post created successfully!",
			});

			// Reset form fields after successful post
			setSubject("");
			setDescription("");
			setDate(null);
			setType("announcement");
		} catch (error) {
			console.error("Error posting data:", error);
			Toast.show({
				type: "error",
				position: "top",
				text1: "Error",
				text2: "Failed to create post.",
			});
		} finally {
			setLoading(false);
		}
	};

	const handleDateChange = (event: any, selectedDate?: Date) => {
		setShowDatePicker(false);
		if (selectedDate) {
			setDate(selectedDate);
		}
	};

	return (
		<View style={styles.container}>
			<ThemedText type="subtitle" className="text-center">
				Add Event
			</ThemedText>
			<ThemedText style={styles.label}>Subject *</ThemedText>
			<TextInput
				style={styles.input}
				value={subject}
				onChangeText={setSubject}
				placeholder="Enter subject"
				autoFocus
				multiline
			/>

			<ThemedText style={styles.label}>Description *</ThemedText>
			<TextInput
				style={styles.input}
				value={description}
				onChangeText={setDescription}
				placeholder="Enter description"
				multiline
			/>

			<ThemedText style={styles.label}>Date (optional)</ThemedText>
			<TouchableOpacity
				onPress={() => setShowDatePicker(true)}
				style={styles.dateButton}
			>
				<ThemedText style={styles.dateText}>
					{date ? date.toLocaleDateString() : "Select Date"}
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

			<ThemedText style={styles.label}>Type</ThemedText>
			<Picker
				selectedValue={type}
				onValueChange={(itemValue) => setType(itemValue)}
				style={styles.picker}
			>
				<Picker.Item label="Announcement" value="announcement" />
				<Picker.Item label="Notice" value="notice" />
				<Picker.Item label="Tips" value="tips" />
			</Picker>
			<TouchableOpacity style={styles.button} onPress={handlePost}>
				{loading ? (
					<ActivityIndicator color="#fff" />
				) : (
					<ThemedText style={styles.buttonText}>Post</ThemedText>
				)}
			</TouchableOpacity>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
	},
	label: {
		fontSize: 16,
		fontWeight: "bold",
		marginTop: 16,
	},
	input: {
		borderColor: "#ccc",
		borderWidth: 1,
		padding: 8,
		borderRadius: 5,
		marginTop: 8,
	},
	picker: {
		height: 50,
		width: "100%",
		marginVertical: 8,
	},
	dateButton: {
		borderColor: "#ccc",
		borderWidth: 1,
		padding: 10,
		borderRadius: 5,
		marginVertical: 8,
	},
	button: {
		backgroundColor: "#456B72",
		padding: 12,
		borderRadius: 5,
		alignItems: "center",
	},
	buttonText: {
		color: "white",
		fontWeight: "bold",
	},
	dateText: {
		color: "#555",
	},
});
