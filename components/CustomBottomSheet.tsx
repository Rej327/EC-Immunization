import React, { useCallback, useMemo, useRef, useState } from "react";
import {
	View,
	TouchableOpacity,
	StyleSheet,
	ActivityIndicator,
} from "react-native";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { ThemedText } from "@/components/ThemedText";
import { Ionicons } from "@expo/vector-icons";

interface CustomBottomSheetProps {
	isOpen: boolean;
	onClose: () => void;
	title: string;
	children: React.ReactNode;
	download?: () => void | undefined;
	onCloseSubmit?: () => Promise<void> | void;
}

const CustomBottomSheet: React.FC<CustomBottomSheetProps> = ({
	isOpen,
	onClose,
	title,
	children,
	download,
	onCloseSubmit,
}) => {
	const bottomSheetRef = useRef<BottomSheet>(null);
	const snapPoints = useMemo(() => ["50%", "80%"], []);
	const [loading, setLoading] = useState(false); // Loading state

	const handleClose = useCallback(() => {
		if (bottomSheetRef.current) {
			bottomSheetRef.current.close();
		}
		onClose();
	}, [onClose]);

	const handleDownload = useCallback(() => {
		if (download) {
			download();
		}
	}, [download]);

	const handleSubmit = useCallback(async () => {
		if (onCloseSubmit) {
			setLoading(true); // Start loading
			await onCloseSubmit(); // Wait for form submission to complete
			setLoading(false); // End loading
		}
		handleClose(); // Close the sheet after submission
	}, [onCloseSubmit, handleClose]);

	return (
		<BottomSheet
			ref={bottomSheetRef}
			index={isOpen ? 0 : -1}
			snapPoints={snapPoints}
			onClose={handleClose}
			handleIndicatorStyle={{ backgroundColor: "#456B72" }}
		>
			<BottomSheetScrollView
				style={styles.contentContainer}
				stickyHeaderIndices={[0]}
				stickyHeaderHiddenOnScroll
			>
				<View className="bg-white pb-4">
					<TouchableOpacity onPress={handleClose} className="w-10">
					<Ionicons
							name="return-down-back-outline"
							size={24}
							color={"#456B72"}
						/>
							{/* <Ionicons
							name="chevron-down-outline"
							size={24}
							color={"#456B72"}
						/> */}
					</TouchableOpacity>
				</View>
				<View style={styles.header}>
					<ThemedText type="header">{title}</ThemedText>
					{download && (
						<TouchableOpacity onPress={handleDownload}>
							<ThemedText type="link">Download</ThemedText>
						</TouchableOpacity>
					)}
				</View>
				{children}
				{onCloseSubmit && (
					<TouchableOpacity
						style={styles.button}
						onPress={handleSubmit}
						disabled={loading} // Disable button while loading
					>
						{loading ? (
							<ActivityIndicator color="#fff" />
						) : (
							<ThemedText style={styles.buttonText}>
								Set Schedule
							</ThemedText>
						)}
					</TouchableOpacity>
				)}
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
		marginBottom: 1,
	},
	button: {
		backgroundColor: "#456B72",
		padding: 12,
		borderRadius: 5,
		alignItems: "center",
		marginBottom: 10,
		marginTop: 5,
	},
	buttonText: {
		color: "#fff",
		fontWeight: "bold",
	},
});
