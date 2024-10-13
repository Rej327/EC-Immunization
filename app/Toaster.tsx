import { View, Text } from "react-native";
import Toast, {
	BaseToast,
	ErrorToast,
	ToastConfigParams,
} from "react-native-toast-message";

const toastConfig = {
	success: (props: ToastConfigParams<any>) => (
		<BaseToast
			{...props}
			style={{ borderLeftColor: "green" }}
			contentContainerStyle={{ paddingHorizontal: 15, }}
			text1Style={{
				fontSize: 16,
			}}
			text2Style={{
				fontSize: 14,
			}}
		/>
	),

	error: (props: ToastConfigParams<any>) => (
		<ErrorToast
			{...props}
			style={{ borderLeftColor: "red" }}
			contentContainerStyle={{ paddingHorizontal: 15 }}
			text1Style={{
				fontSize: 16,
			}}
			text2Style={{
				fontSize: 14,
			}}
		/>
	),

	tomatoToast: ({ text1, props }: ToastConfigParams<{ uuid: string }>) => (
		<View style={{ height: 60, width: "100%", backgroundColor: "tomato" }}>
			<Text>{text1}</Text>
			<Text>{props?.uuid}</Text>
		</View>
	),
};

// Component for rendering Toast notifications
export function Toaster() {
	return <Toast config={toastConfig} />;
}
