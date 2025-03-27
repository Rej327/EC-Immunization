import { View, Text, StyleSheet, ScrollView, Image } from "react-native";
import React, { useState, useEffect } from "react";
import { ThemedText } from "@/components/ThemedText";
import {
	collection,
	query,
	where,
	getDocs,
	Query,
	DocumentData,
} from "firebase/firestore";
import { barangays } from "../../../assets/data/data";
import { Picker } from "@react-native-picker/picker";
import { db } from "@/db/firebaseConfig";
import { noData } from "@/assets";
import { ActivityIndicator } from "react-native-paper";

interface ChildData {
	motherName: string;
	firstName: string;
	lastName: string;
	address: string;
	addressInfo: string;
}

export default function Childrens() {
	const [selectedBarangay, setSelectedBarangay] = useState<string>("Select");
	const [childrenData, setChildrenData] = useState<ChildData[]>([]);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			try {
				const babiesRef = collection(db, "babies");
				let q: Query<DocumentData> = babiesRef;

				if (selectedBarangay !== "Select") {
					q = query(
						babiesRef,
						where("address", "==", selectedBarangay)
					);
				}

				const querySnapshot = await getDocs(q);
				const data = querySnapshot.docs.map(
					(doc) => doc.data() as ChildData
				);
				setChildrenData(data);
			} catch (error) {
				setLoading(true);
			} finally {
				setLoading(false);
			}
		};
		fetchData();
	}, [selectedBarangay]);

	return (
		<ScrollView
			style={styles.mainContainer}
			stickyHeaderIndices={[1]}
			stickyHeaderHiddenOnScroll
		>
			<View className="flex flex-row gap-2 justify-between bg-[#f9f9f9] mt-2">
				<View className="border-b-[1px] border-[#d6d6d6] shadow-xl w-[35%] mb-2"></View>
				<ThemedText
					type="cardHeader"
					className="first-letter:capitalize"
				>
					Childrens
				</ThemedText>
				<View className="border-b-[1px] border-[#d6d6d6] shadow-xl w-[35%] mb-2"></View>
			</View>
			<View style={styles.sortContainer}>
				<View style={styles.sortContent}>
					<ThemedText type="default" className="font-bold">
						Select Barangay:{" "}
					</ThemedText>
					<Picker
						selectedValue={selectedBarangay}
						onValueChange={(itemValue) =>
							setSelectedBarangay(itemValue)
						}
						style={styles.picker}
					>
						<Picker.Item label="All" value="Select" />
						{barangays.map((barangay: any, index: any) => (
							<Picker.Item
								key={index}
								label={barangay}
								value={barangay}
							/>
						))}
					</Picker>
				</View>
			</View>
			<View style={styles.childContainer}>
				{loading ? (
					<View style={styles.loadingContainer}>
						<ActivityIndicator size="large" color="#456B72" />
					</View>
				) : childrenData.length > 0 ? (
					childrenData.map((child, index) => (
						<View key={index} style={styles.childBody}>
							<ThemedText type="default">
								Parent: {child.motherName}
							</ThemedText>
							<ThemedText type="default">
								Baby: {child.firstName} {child.lastName}
							</ThemedText>
							<ThemedText type="default">
								Address: {child.addressInfo}, {child.address}
							</ThemedText>
						</View>
					))
				) : (
					<View style={styles.emptyContainer}>
						<Image source={noData} className="w-16 h-20 mb-2" />
						<ThemedText type="default" style={styles.emptyText}>
							No Data Available
						</ThemedText>
					</View>
				)}
			</View>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	mainContainer: {
		flex: 1,
		backgroundColor: "#f9f9f9",
	},
	sortContainer: {
		paddingHorizontal: 20,
		marginVertical: 10,
		width: "auto",
		backgroundColor: "#f9f9f9",
	},
	sortContent: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#fff",
		padding: 10,
		borderRadius: 10,
	},
	picker: {
		flex: 1,
	},
	childContainer: {
		paddingHorizontal: 20,
	},
	childBody: {
		backgroundColor: "#fff",
		padding: 16,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: "#d6d6d6",
		marginBottom: 10,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		height: 120,
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
