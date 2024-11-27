import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, FlatList } from "react-native";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/db/firebaseConfig";

const ScheduleData = () => {
	const [schedules, setSchedules] = useState<any[]>([]); // Store schedules
	const [loading, setLoading] = useState<boolean>(true);

	// Fetch data from Firestore
	useEffect(() => {
		const fetchSchedules = async () => {
			try {
				const scheduleCollection = collection(db, "schedules");
				const scheduleSnapshot = await getDocs(scheduleCollection);
				const scheduleList = scheduleSnapshot.docs.map((doc) => ({
					id: doc.id,
					...doc.data(),
				}));
				setSchedules(scheduleList);
			} catch (error) {
				console.error("Error fetching schedules: ", error);
			} finally {
				setLoading(false);
			}
		};

		fetchSchedules();
	}, []);

	if (loading) {
		return (
			<View style={styles.container}>
				<Text>Loading...</Text>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<Text style={styles.header}>Schedule Data</Text>
			{schedules.length > 0 ? (
				<FlatList
					data={schedules}
					keyExtractor={(item) => item.id}
					renderItem={({ item }) => (
						<View style={styles.scheduleItem}>
							<Text>Address: {item.address}</Text>
							<Text>
								Date: {item.when?.toDate().toLocaleDateString()}
							</Text>
							<Text>
								Status:{" "}
								{item.completed ? "Completed" : "Ongoing"}
							</Text>
						</View>
					)}
				/>
			) : (
				<Text>No schedules available</Text>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
	},
	header: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 16,
	},
	scheduleItem: {
		marginBottom: 12,
		padding: 12,
		backgroundColor: "#f5f5f5",
		borderRadius: 8,
	},
});

export default ScheduleData;
