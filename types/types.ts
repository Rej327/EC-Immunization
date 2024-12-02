import { Timestamp } from "firebase/firestore";

export interface MilestoneData {
	ageInMonths: number;
	vaccine: string;
	description: string;
	received: boolean;
	expectedDate: Timestamp | Date | string;
	updatedAt: Date;
}

export interface Milestone {
	babyId: string; // Ensure you have this property as well
	parentId: string;
	firstName: string;
	lastName: string;
	createdAt: Date; // or Timestamp if you prefer
	milestoneData: MilestoneData[]; // If you have an array of milestone data
}

export interface UserData {
	id: string;
	firstName: string;
	lastName: string;
	username: string;
	email: string;
	isActive: boolean;
}

export interface Appointment {
	id: string; // Document ID
	babyFirstName: string; // First name of the baby
	babyLastName: string; // Last name of the baby
	parentId: string; // ID of the parent
	parentName: string; // Name of the parent
	scheduleDate: Date; // Scheduled date for the appointment
	address: string;
	status: string; // Status of the appointment (e.g., "pending", "history")
	vaccine: string; // Vaccine name
	createdAt: Date; // Creation timestamp
	updatedAt: Date; // Last updated timestamp
}

export interface AppointmentsByStatus {
	upcoming: Appointment[];
	history: Appointment[];
}
export interface Card {
	id: string;
	vaccineName: string;
	date: string[];
	doses: string;
	remarks: string[];
}

export interface Baby {
	parentId: string;
	id: string;
	firstName: string;
	lastName: string;
	gender: string;
	birthday: Date; // Update to Timestamp
	birthPlace: string;
	height: string;
	weight: string;
	motherName: string;
	fatherName: string;
	contact: string;
	address: string;
	addressInfo: string;
	card: Card[];
}

export interface Notification {
	id: string;
	receiverId: string;
	firstName: string;
	lastName: string;
	subject: string;
	message: string;
	isRead: boolean;
	createdAt: Date;
	formattedCreatedAt: string;
}

export interface Feed {
	id: string;
	type: "announcement" | "notice" | "tips";
	subject: string;
	description: string;
	date: Date | null;
	offlineCreatedAt: string;
	createdAt: Date;
}

export interface VaccineSchedule {
	count: number; // Total doses required
	description: string; // Description of the vaccine
	id: string; // Unique identifier for the vaccine
	name: string; // Name of the vaccine
	taken: number; // Number of doses taken
}

// Main structure for the schedule
export interface Schedules {
	address: string; // Location or address
	completed: boolean; // Whether the schedule is completed
	createdAt: Date; // Timestamp when the schedule was created
	updatedAt: Date; // Timestamp when the schedule was last updated
	when: Date;
	vaccines: VaccineSchedule[]; // List of vaccines in the schedule
}
