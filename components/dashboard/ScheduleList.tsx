import { View, Text, Image, TouchableOpacity } from "react-native";
import React from "react";
import { ThemedText } from "../ThemedText";
import { history, pending, upcoming } from "@/assets";
import { useRouter } from "expo-router";

export default function ScheduleList() {
	const route = useRouter();

	const handleRoute = (status: string) => {
		route.push({
			pathname: "/online/(dashboard)/scheduleByStatus",
			params: { scheduleByStats: status },
		});
	};

	return (
		<View className="mb-2 pb-2 mx-[20px]">
			<View className="flex flex-row gap-2 justify-between ">
				<View className="border-b-[1px] border-[#d6d6d6] shadow-xl w-[32%] mb-2"></View>
				<ThemedText type="cardHeader">Appointments</ThemedText>
				<View className="border-b-[1px] border-[#d6d6d6] shadow-xl w-[32%] mb-2"></View>
			</View>
			<View className="flex flex-row justify-between items-center mt-4">
				<TouchableOpacity onPress={() => handleRoute("pending")}>
					<Image source={pending} className="w-20 h-20" />
					<ThemedText
						type="default"
						className="text-center text-[#456B72] font-bold"
					>
						Pendings
					</ThemedText>
				</TouchableOpacity>
				<TouchableOpacity onPress={() => handleRoute("upcoming")}>
					<Image source={upcoming} className="w-20 h-20" />
					<ThemedText
						type="default"
						className="text-center text-[#456B72] font-bold"
					>
						Upcomings
					</ThemedText>
				</TouchableOpacity>
				<TouchableOpacity onPress={() => handleRoute("history")}>
					<Image source={history} className="w-20 h-20" />
					<ThemedText
						type="default"
						className="text-center text-[#456B72] font-bold"
					>
						Histories
					</ThemedText>
				</TouchableOpacity>
			</View>
		</View>
	);
}
