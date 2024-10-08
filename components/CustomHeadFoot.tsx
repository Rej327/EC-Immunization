import { View, Text, Image } from "react-native";
import React from "react";
import { topField } from "@/assets";

export default function CustomHeadFoot() {
	return (
		<>
			<View className="absolute top-[-10] bg-[#86b3bc] h-[70px] w-full rounded-b-full"></View>
			<View className="absolute bottom-0 bg-[#456B72] h-[70px] w-full rounded-t-full"></View>
		</>
	);
}
