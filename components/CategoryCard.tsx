import {
	Dimensions,
	Image,
	View,
	StyleSheet,
	ImageSourcePropType,
	Text,
} from "react-native";
import { ThemedText } from "./ThemedText";
import { CategoryTextTitle } from "./CategoryTextTitle";
import { Link } from "expo-router";

const { width, height } = Dimensions.get("window");
const cardWidthSize = width * 0.43;
const cardHeightSize = height * 0.16;

interface CategoryCardProps {
	icon: ImageSourcePropType; // Type for the icon prop
	title: any; // Type for the title prop
	subTitle: any;
	backgroundColor: string; // Type for the background color
	shapeIcon?: ImageSourcePropType; // Optional: Type for the shape icon
	shapePosition?: {
		top?: number;
		left?: number;
		right?: number;
		bottom?: number;
	}; // Optional position for the shape icon
	link: string;
}

const CategoryCard = ({
	icon,
	title,
	backgroundColor,
	shapeIcon,
	shapePosition,
	link,
	subTitle,
}: CategoryCardProps) => {
	return (
		<Link href={link}>
			<View>
				<View style={[styles.card, { backgroundColor }]}>
					{shapeIcon && (
						<Image
							source={shapeIcon}
							style={[
								styles.shapeIcon,
								shapePosition, // Apply shapePosition to the style
							]}
						/>
					)}
					<View style={styles.innerContainer}>
						<Image source={icon} style={styles.icon} />
						<CategoryTextTitle type="cardTitle">
							{title}
						</CategoryTextTitle>
						<CategoryTextTitle
							type="cardTitle"
							className="text-[13px]"
						>
							({subTitle})
						</CategoryTextTitle>
					</View>
				</View>
			</View>
		</Link>
	);
};

const styles = StyleSheet.create({
	card: {
		width: cardWidthSize,
		height: cardHeightSize,
		borderRadius: 14,
		justifyContent: "center",
		alignItems: "center",
		padding: 10,
		margin: 3,
	},
	innerContainer: {
		position: "relative",
		justifyContent: "center",
		alignItems: "center",
	},
	icon: {
		width: 70,
		height: 70,
	},
	shapeIcon: {
		position: "absolute",
	},
});

export default CategoryCard;
