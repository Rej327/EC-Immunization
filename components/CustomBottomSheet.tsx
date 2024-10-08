import React, { useCallback, useMemo, useRef } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { ThemedText } from "@/components/ThemedText";

interface CustomBottomSheetProps {
	isOpen: boolean;
	onClose: () => void;
	title: string;
	children: React.ReactNode;
}

const CustomBottomSheet: React.FC<CustomBottomSheetProps> = ({
	isOpen,
	onClose,
	title,
	children,
}) => {
	const bottomSheetRef = useRef<BottomSheet>(null);
	const snapPoints = useMemo(() => ["50%", "80%"], []);

	const handleClose = useCallback(() => {
		if (bottomSheetRef.current) {
			bottomSheetRef.current.close();
		}
		onClose();
	}, [onClose]);

	return (
		<BottomSheet
			ref={bottomSheetRef}
			index={isOpen ? 0 : -1}
			snapPoints={snapPoints}
			onClose={handleClose}
			handleIndicatorStyle={{ backgroundColor: "#456B72" }}
		>
			<BottomSheetScrollView style={styles.contentContainer}>
				<TouchableOpacity onPress={handleClose}>
					<ThemedText type="link">Close</ThemedText>
				</TouchableOpacity>
				<View style={styles.header}>
					<ThemedText type="header">{title}</ThemedText>
					<TouchableOpacity onPress={handleClose}>
						<ThemedText type="link">Download</ThemedText>
					</TouchableOpacity>
				</View>
				{children}
			</BottomSheetScrollView>
		</BottomSheet>
	);
};

export default CustomBottomSheet;

const styles = StyleSheet.create({
	contentContainer: {
		paddingHorizontal: 16,
    paddingBottom: 16,
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 1, // Add margin for spacing
	},
});
