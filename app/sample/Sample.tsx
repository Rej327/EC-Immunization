import React, { useEffect, useState } from "react";
import { Alert, View, Text, ScrollView } from "react-native";
import { Appointment, Baby, Milestone, Notification } from "@/types/types";
import {
	getAppointmentsData,
	getBabiesData,
	getMilestonesDAta,
	getNotificationsData,
} from "@/middleware/GetFromLocalStorage";

interface GetFromLocalStorageProps {
	userId: any; // Change to 'string' if applicable
}

export const GetFromLocalStorage: React.FC<GetFromLocalStorageProps> = ({
	userId,
}) => {
	const [data, setData] = useState<Milestone[]>([]);
	const [loading, setLoading] = useState<boolean>(true);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const data = await getMilestonesDAta();
				setData(data);
			} catch (error) {
				console.error("Error fetching data: ", error);
				Alert.alert("Error", "Failed to fetch data.");
			} finally {
				setLoading(false); // Set loading to false once data fetching is done
			}
		};

		fetchData();
	}, [userId]);

	return (
		<ScrollView>
			<Text style={{ fontSize: 24, fontWeight: "bold", marginTop: 20 }}>
				Data
			</Text>
			{data.map((data, i) => (
				<View key={i}>
					{/* <Text style={{ fontWeight: "bold" }}>
						{notification.subject}
					</Text>
					<Text>{notification.message}</Text>
					<Text style={{ color: "gray" }}>
						{notification.createdAt.toLocaleString()}
					</Text>
					<Text style={{ fontStyle: "italic" }}>
						{notification.isRead ? "Read" : "Unread"}
					</Text> */}
					{/* <Text>{new Date(data.createdAt).toLocaleDateString()}</Text> */}
					{/* <Text>{new Date(data.updatedAt).toLocaleDateString()}</Text> */}
					{/* <Text>{new Date(data.birthday).toLocaleDateString()}</Text> */}
					<Text>{data.babyId}</Text>
					{data.milestone.map((item, i) => (
						<View>
							<Text>{item.ageInMonths}</Text>
						</View>
					))}
				</View>
			))}
		</ScrollView>
	);
};
