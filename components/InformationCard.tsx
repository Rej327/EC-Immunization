import { View, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import React, { useCallback, useMemo, useRef, useState } from "react";

import { ThemedText } from "@/components/ThemedText";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";

const InformationCard = () => {
	const bottomSheetRef = useRef<BottomSheet>(null);
	const snapPoints = useMemo(() => ["20%", "50%", "90%"], []);
	const [isOpen, setIsOpen] = useState(false);

	const handleViewAllPress = useCallback(() => {
		setIsOpen(true);
	}, []);

	const handleCloseSheet = useCallback(() => {
		if (bottomSheetRef.current) {
			bottomSheetRef.current.close();
		}
		setIsOpen(false);
	}, []);

	const handleSheetChange = useCallback((index: number) => {
		if (index === -1) {
			setIsOpen(false);
		}
	}, []);

	return (
		<View>
			{/* MILESTONE SECTION */}
			<View>
				<View style={styles.header}>
					<ThemedText type="header">Milestone</ThemedText>
					<TouchableOpacity onPress={handleViewAllPress}>
						<ThemedText type="link">View all</ThemedText>
					</TouchableOpacity>
				</View>
				<View style={styles.card}>
					<ThemedText type="cardHeader">Lorem, ipsum.</ThemedText>
					<ThemedText type="default">
						Lorem ipsum dolor sit amet consectetur adipisicing elit.
						Perspiciatis, commodi.
					</ThemedText>
					<ThemedText type="date" style={styles.date}>
						01/25/2024
					</ThemedText>
				</View>
			</View>

			<BottomSheet
				ref={bottomSheetRef}
				snapPoints={snapPoints}
				index={isOpen ? 0 : -1}
				onClose={handleCloseSheet}
				onChange={handleSheetChange}
				backgroundStyle={{ backgroundColor: "#fff" }}
			>
				<BottomSheetView style={styles.contentContainer}>
					<TouchableOpacity
						onPress={handleCloseSheet}
						style={styles.closeButton}
					>
						<ThemedText type="link">Close</ThemedText>
					</TouchableOpacity>
					<ScrollView>
						<View style={styles.card}>
							<ThemedText type="cardHeader">
								Lorem, ipsum.
							</ThemedText>
							<ThemedText type="default">
								Lorem ipsum dolor sit amet consectetur
								adipisicing elit. Perspiciatis, commodi.
							</ThemedText>
							<ThemedText type="date" style={styles.date}>
								01/25/2024
							</ThemedText>
						</View>
					</ScrollView>
				</BottomSheetView>
			</BottomSheet>
		</View>
	);
};

export default InformationCard;

const styles = StyleSheet.create({
	imageContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 2,
	},
	image: {
		width: "100%",
		height: 200,
		borderRadius: 10,
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	categoryContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "center",
	},
	card: {
		backgroundColor: "white",
		padding: 16,
		borderBottomWidth: 1,
		borderColor: "#d6d6d6",
		marginBottom: 8,
	},
	date: {
		marginTop: 8,
	},
	contentContainer: {
		padding: 16,
	},
	closeButton: {
		alignItems: "flex-end",
		marginBottom: 8,
	},
});
