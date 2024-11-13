// healthPdfDownload.ts
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Alert } from "react-native";

// Define HealthTip type if needed
interface HealthTip {
	category: string;
	icon: string;
	tips: string[];
}

export async function healthPdfDownload(
	healthTips: HealthTip[],
	filename: string
) {
	try {
		// Generate HTML content for the PDF
		const htmlContent = `
            <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        h2 { color: #456B72; text-align: center; }
                        .category { font-weight: bold; font-size: 18px; margin-top: 20px; }
                        .tip { margin-top: 10px; }
                        .tip-content { margin-left: 10px; }
                    </style>
                </head>
                <body>
                    <h2>Health Tips Guide</h2>
                    ${healthTips
						.map(
							(tip) => `
                                <div class="category">${tip.category}</div>
                                ${tip.tips
									.map(
										(content) => `
                                            <div class="tip">
                                                <div class="tip-content">${content}</div>
                                            </div>
                                        `
									)
									.join("")}
                            `
						)
						.join("")}
                </body>
            </html>
        `;

		// Print to PDF and get URI
		const { uri } = await Print.printToFileAsync({ html: htmlContent });

		// Share the generated PDF if available
		if (await Sharing.isAvailableAsync()) {
			await Sharing.shareAsync(uri, {
				mimeType: "application/pdf",
				dialogTitle: `${filename}.pdf`,
			});
		} else {
			Alert.alert(
				"Sharing not available",
				"The PDF was saved at: " + uri
			);
		}
	} catch (error) {
		console.error("Error generating PDF:", error);
		Alert.alert(
			"PDF Generation Failed",
			"An error occurred while generating the PDF."
		);
	}
}
