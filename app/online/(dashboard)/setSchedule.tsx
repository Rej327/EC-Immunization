import { View, Text, StyleSheet } from "react-native";
import React, { useCallback, useState } from "react";
import { ThemedText } from "@/components/ThemedText";
import StyledButton from "@/components/StyledButton";
import CustomBottomSheet from "@/components/CustomBottomSheet";
import SetScheduleForm from "@/components/dashboard/SetScheduleForm";

const setSchedule = () => {
	const [openBottomSheet, setOpenBottomSheet] = useState<string | null>(null);

	const openBottomSheetHandler = (type: string) => {
		setOpenBottomSheet(type);
	};

	const closeBottomSheetHandler = useCallback(() => {
		setOpenBottomSheet(null);
	}, []);

	const handleSetAppointment = async () => {
		console.log("Set");
	};
	return (
		<View style={styles.container}>
			<View className="flex flex-row gap-2 justify-between mt-2">
				<View className="border-b-[1px] border-[#d6d6d6] shadow-xl w-[25%] mb-2"></View>
				<ThemedText
					type="cardHeader"
					className="first-letter:capitalize"
				>
					Vaccine Schedules
				</ThemedText>
				<View className="border-b-[1px] border-[#d6d6d6] shadow-xl w-[25%] mb-2"></View>
			</View>
			<StyledButton
				title="Set Schedule"
				onPress={() => openBottomSheetHandler("setup")}
				borderRadius={12}
				fontSize={14}
			/>
			{openBottomSheet && <View style={styles.overlay} />}
			<CustomBottomSheet
				isOpen={openBottomSheet === "setup"}
				onClose={closeBottomSheetHandler}
				title="Set Schedule"
				// onCloseSubmit={handleSetAppointment}
			>
				<SetScheduleForm />
			</CustomBottomSheet>
		</View>
	);
};

export default setSchedule;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingHorizontal: 16,
	},
	overlay: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: "rgba(0, 0, 0, 0.8)",
	},
});
