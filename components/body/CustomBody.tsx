import {
	View,
	Text,
	TouchableOpacity,
	Image,
	Alert,
	StyleSheet,
} from "react-native";
import React, { ReactNode, useCallback, useMemo, useRef } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { circleBg, healthTips } from "@/assets";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import BottomSheet, {
	BottomSheetScrollView,
	BottomSheetView,
} from "@gorhom/bottom-sheet";

interface CustomBodyProps {
	children: ReactNode;
	title: string;
	backRoute: string;
	url?: string;
	fileName: string;
	headerImage: object;
	headerImageStyle: string;
	onDownloadFunction?: any;
}

const CustomBody: React.FC<CustomBodyProps> = ({
	children,
	title,
	backRoute,
	url,
	fileName,
	headerImage,
	headerImageStyle,
	onDownloadFunction,
}) => {
	const router = useRouter();

	const handleBackPress = () => {
		router.push(backRoute); // Navigate to the route passed as a prop
	};

	// Function to download PDF from Google Drive or other sources
	const downloadPdf = async () => {
		try {
			// Get file download path in the device
			const fileUri = FileSystem.documentDirectory + fileName;

			// Download file
			const { uri } = await FileSystem.downloadAsync(url || "", fileUri);

			// Check if the file can be opened or shared
			if (await Sharing.isAvailableAsync()) {
				await Sharing.shareAsync(uri);
			} else {
				Alert.alert(
					"Downloaded",
					"File downloaded but sharing is unavailable."
				);
			}
		} catch (error) {
			console.error("Error downloading file", error);
			Alert.alert("Error", "There was an error downloading the file.");
		}
	};

	const bottomSheetRef = useRef<BottomSheet>(null);

	// Define snap points using useMemo
	const snapPoints = useMemo(() => ["65%", "90%"], []);

	// Callbacks
	// const handleSheetChanges = useCallback((index: number) => {
	// 	console.log("handleSheetChanges", index);
	// }, []);

	const onDownload = () => {
		onDownloadFunction();
	};

	return (
		<View className="relative bg-[#86b3bc] h-full">
			{/* Back Button */}
			<View className="absolute z-10 top-2 flex flex-row justify-between w-full px-2">
				<TouchableOpacity onPress={handleBackPress}>
					<View className="flex flex-row items-center gap-2">
						<Ionicons name="arrow-back" size={24} color="#456B72" />
						<ThemedText
							type="navigation"
							className="text-[#456B72]"
						>
							{title}
						</ThemedText>
					</View>
				</TouchableOpacity>
				{url ? (
					<TouchableOpacity onPress={() => downloadPdf()}>
						<View className="flex flex-row items-center gap-2">
							<Ionicons
								name="cloud-download"
								size={24}
								color="#456B72"
							/>
							<ThemedText>Download</ThemedText>
						</View>
					</TouchableOpacity>
				) : (
					<TouchableOpacity onPress={onDownload}>
						<View className="flex flex-row items-center gap-2">
							<Ionicons
								name="cloud-download"
								size={24}
								color="#456B72"
							/>
							<ThemedText>Download</ThemedText>
						</View>
					</TouchableOpacity>
				)}
			</View>

			{/* Background Graphics */}
			<Image
				source={circleBg}
				className="absolute top-0 -right-10 h-52 w-52"
			/>
			<Image
				source={circleBg}
				className="absolute top-40 -left-5 h-32 w-32"
			/>
			<Image
				source={circleBg}
				className="absolute top-56 right-0 h-20 w-20"
			/>
			<Image
				source={circleBg}
				className="absolute top-72 -left-5 h-44 w-44"
			/>

			<Image
				source={headerImage}
				className={`top-10 ${headerImageStyle}`}
			/>

			{/* Screen Content */}
			<View style={styles.container}>
				<BottomSheet
					ref={bottomSheetRef}
					// onChange={handleSheetChanges}
					snapPoints={snapPoints}
					handleStyle={{
						backgroundColor: "#f5f4f7",
						borderTopEndRadius: 10,
						borderTopStartRadius: 10,
					}}
					backgroundStyle={{ backgroundColor: "#f5f4f7" }}
					handleIndicatorStyle={{ backgroundColor: "#456B72" }}
				>
					<BottomSheetScrollView
						contentContainerStyle={styles.contentContainer}
					>
						{children}
					</BottomSheetScrollView>
				</BottomSheet>
			</View>
		</View>
	);
};

export default CustomBody;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 24,
	},
	contentContainer: {
		backgroundColor: "#f5f4f7",
	},
});
