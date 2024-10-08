export const healthTipsData = [
	{
		category: "Nutrition",
		icon: "🥗",
		tips: [
			"Exclusive breastfeeding is recommended for the first six months. It provides essential nutrients and antibodies.",
			"Start with single-grain cereals, pureed fruits, and vegetables after six months. Introduce one new food at a time.",
			"Ensure adequate hydration, especially in hot weather. Offer small amounts of water after six months.",
		],
	},
	{
		category: "Sleep",
		icon: "🛏️",
		tips: [
			"Always place babies on their backs to sleep to reduce the risk of Sudden Infant Death Syndrome (SIDS). Use a firm mattress with no loose bedding.",
			"Establish a consistent bedtime routine to help your baby recognize when it's time to sleep.",
		],
	},
	{
		category: "Development",
		icon: "🧸",
		tips: [
			"Encourage tummy time when your baby is awake to strengthen neck and shoulder muscles and promote motor skills.",
			"Be aware of developmental milestones and consult your pediatrician if you have concerns about your baby's progress.",
		],
	},
	{
		category: "Vaccinations",
		icon: "💉",
		tips: [
			"Follow the recommended vaccination schedule to protect against serious diseases. Keep track of your baby's immunizations.",
			"Talk to your healthcare provider about any concerns you may have regarding vaccinations.",
		],
	},
	{
		category: "Hygiene",
		icon: "🧼",
		tips: [
			"Teach family members to wash their hands before handling the baby to prevent the spread of germs.",
			"Bathtub your baby regularly but not too frequently. Sponge baths are recommended until the umbilical cord stump falls off.",
		],
	},
	{
		category: "Physical Activity",
		icon: "🏃‍♂️",
		tips: [
			"Engage your baby in activities like gentle play, crawling, and reaching to promote physical development.",
			"Create a safe play area free of hazards to allow your baby to explore and move freely.",
		],
	},
	{
		category: "Emotional Well-being",
		icon: "❤️",
		tips: [
			"Spend quality time cuddling and talking to your baby to build a strong emotional bond.",
			"Learn to recognize your baby's cues for hunger, sleep, and comfort to foster a sense of security.",
		],
	},
	{
		category: "Regular Check-ups",
		icon: "🩺",
		tips: [
			"Schedule regular check-ups with a pediatrician to monitor growth and development and discuss any health concerns.",
			"Keep track of your baby's growth patterns, including weight and height, and discuss them during visits.",
		],
	},
];

export const vaccinationTips = [
	{
		title: "Why do children need vaccination?",
		content: `Children are more prone to acquiring infectious diseases since their immune systems are still developing. While their bodies can naturally develop the antibodies that they need to fight off common illnesses, vaccinations can prevent these diseases, along with its complications, from happening in the first place.`,
	},
	{
		title: "Common vaccination concerns",
		content: `Parents may have several concerns about their child’s immunization schedules. The top concern being the frequency of these shots which may give them the notion that their child is getting too many at the same time. Vaccines do not overload a child’s immune system and can help protect your child from as many as 14 different childhood diseases. Getting your child vaccinated will not cause autism.`,
	},
	{
		title: "Immunization schedules",
		content: `Vaccinations are scheduled and should be strictly implemented by both the doctors and parents. You should always do your best to show up at your child’s vaccine appointments and never alter his/her immunization records to avoid confusion. Remember, vaccines can help protect your child, your family, and community from many infectious diseases like hepatitis, measles, and the common flu.`,
	},
	{
		title: "Initial vaccinations for your child",
		content: `You can expect to encounter these vaccines during the first months of your child’s life (based on the 2018 Recommended Immunizations For Infants and Children guide from the Centers for Disease Control and Prevention (CDC).`,
	},
];

export const vaccinationGuide = [
	{
		ageRange: "At Birth",
		vaccines: [
			{
				name: "BCG (1st dose)",
				details: "Administer within 24 hours of birth.",
				description:
					"Bacillus Calmette-Guérin (BCG) vaccine protects against tuberculosis (TB), particularly severe forms in children like TB meningitis.",
			},
			{
				name: "Hepatitis B (1st dose)",
				details: "Administer within 24 hours of birth.",
				description:
					"Prevents Hepatitis B virus (HBV) infection, which can cause chronic liver disease and liver cancer.",
			},
		],
	},
	{
		ageRange: "1 Month",
		vaccines: [
			{
				name: "Hepatitis B (2nd dose)",
				details: "Administer 1–2 months after the 1st dose.",
				description:
					"Second dose to strengthen immunity against Hepatitis B infection.",
			},
		],
	},
	{
		ageRange: "2 Months",
		vaccines: [
			{
				name: "Pentavalent Vaccine (1st dose)",
				details: "Administer at 2 months.",
				description:
					"Combines protection against 5 diseases: diphtheria (D), pertussis (P), tetanus (T), hepatitis B (HB), and Haemophilus influenzae type B (Hib).",
			},
			{
				name: "Oral Polio Vaccine (1st dose)",
				details: "Administer at 2 months.",
				description:
					"Oral Polio Vaccine (OPV) protects against poliovirus, which can lead to paralysis.",
			},
			{
				name: "Pneumococcal Conjugate Vaccine (1st dose)",
				details: "Administer at 2 months.",
				description:
					"PCV protects against infections caused by Streptococcus pneumoniae, such as pneumonia, meningitis, and sepsis.",
			},
		],
	},
	{
		ageRange: "4 Months",
		vaccines: [
			{
				name: "Pentavalent Vaccine (2nd dose)",
				details: "Administer at 4 months.",
				description:
					"Second dose of DPT-HepB-Hib combination vaccine to maintain immunity.",
			},
			{
				name: "Oral Polio Vaccine (2nd dose)",
				details: "Administer at 4 months.",
				description:
					"Second dose of OPV to reinforce protection against polio.",
			},
			{
				name: "Pneumococcal Conjugate Vaccine (2nd dose)",
				details: "Administer at 4 months.",
				description:
					"Second dose of PCV for additional protection against pneumococcal diseases.",
			},
		],
	},
	{
		ageRange: "6 Months",
		vaccines: [
			{
				name: "Pentavalent Vaccine (3rd dose)",
				details: "Administer at 6 months.",
				description:
					"Third and final dose of DPT-HepB-Hib for complete protection.",
			},
			{
				name: "Oral Polio Vaccine (3rd dose)",
				details: "Administer at 6 months.",
				description:
					"Third and final OPV dose for full immunity against poliovirus.",
			},
			{
				name: "Inactivated Polio Vaccine (IPV)",
				details: "Administer at 6 months.",
				description:
					"IPV is an injected polio vaccine that boosts immunity against poliovirus, complementing the oral vaccine.",
			},
			{
				name: "Pneumococcal Conjugate Vaccine (3rd dose)",
				details: "Administer at 6 months.",
				description:
					"Third and final dose of PCV for complete protection against pneumococcal diseases.",
			},
		],
	},
	{
		ageRange: "9 Months",
		vaccines: [
			{
				name: "Measles-Rubella (1st dose)",
				details: "Administer at 9 months.",
				description:
					"MR vaccine protects against measles and rubella, two viral infections that can lead to serious complications.",
			},
			{
				name: "Japanese Encephalitis (1st dose)",
				details: "Administer at 9 months.",
				description:
					"JE vaccine prevents Japanese Encephalitis, a viral brain infection transmitted by mosquitoes.",
			},
		],
	},
	{
		ageRange: "12 Months",
		vaccines: [
			{
				name: "Measles-Rubella (2nd dose)",
				details: "Administer at 12 months.",
				description:
					"Second dose of MR vaccine ensures long-lasting protection against measles and rubella.",
			},
		],
	},
];



//mockdata
export const milestones = [
	{
		header: "Lorem, ipsum.",
		description:
			"Lorem ipsum dolor sit amet consectetur adipisicing elit. Perspiciatis, commodi.",
		date: "01/25/2024",
	},
	{
		header: "Another Milestone",
		description: "Details about another milestone.",
		date: "02/01/2024",
	},
];

export const events = [
	{
		header: "Lorem, ipsum.",
		description:
			"Lorem ipsum dolor sit amet consectetur adipisicing elit. Perspiciatis, commodi.",
		date: "01/25/2024",
	},
	{
		header: "Another Events",
		description: "Details about another Events.",
		date: "02/01/2024",
	},
];
