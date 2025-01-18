import { View, Text, Image } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { approved } from "@/assets";

export default function ApprovedText() {
	return (
		<View className="my-4 items-center px-4">
			<Image source={approved} className="w-10 h-10" />
			<ThemedText
				type="default"
				className="text-xs font-bold text-center"
			>
				Content approved by the National Immunization Program
				Coordinator (NIP) for accuracy and reliability.
			</ThemedText>
		</View>
	);
}
