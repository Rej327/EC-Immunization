import Ionicons from "@expo/vector-icons/Ionicons";
import { PropsWithChildren, useState } from "react";
import {
	Image,
	StyleSheet,
	Text,
	TouchableOpacity,
	useColorScheme,
	View,
} from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { growth } from "@/assets";

export function Collapsible({
	children,
	title,
	icon,
	isLast = false, // New prop to indicate if it's the last item
}: PropsWithChildren & { title: string; icon: string; isLast?: boolean }) {
	const [isOpen, setIsOpen] = useState(false);
	const theme = useColorScheme() ?? "light";

	return (
		<View style={[styles.container, isLast && styles.noBorder]}>
			<TouchableOpacity
				style={styles.heading}
				onPress={() => setIsOpen((value) => !value)}
				activeOpacity={0.8}
			>
				<Ionicons
					name={isOpen ? "chevron-down" : "chevron-forward-outline"}
					size={18}
					color={theme === "light" ? Colors.light.icon : Colors.dark.icon}
				/>
				<View style={styles.row}>
					{/* <Image source={icon} style={styles.icon} /> */}
					<Text className="mr-2">{icon}</Text>
					<ThemedText type="cardHeader">{title}</ThemedText>
				</View>
			</TouchableOpacity>
			{isOpen && <View style={styles.content}>{children}</View>}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: "white",
		borderBottomWidth: 1,
		borderColor: "#d6d6d6",
	},
	noBorder: {
		borderBottomWidth: 0, // No border for the last item
	},
	heading: {
		flexDirection: "row-reverse",
		alignItems: "center",
		justifyContent: "space-between",
		gap: 6,
		padding: 20,
	},
	content: {
		marginLeft: 24,
		marginBottom: 10,
	},
	row: {
		flexDirection: "row",
		gap: 2,
		justifyContent: "center",
		alignItems: "center",
	},
	icon: {
		width: 32,
		height: 32,
	}, // Adjusted icon style if needed
});
