export interface MilestoneData {
	ageInMonths: number;
	vaccine: string;
	description: string;
	received: boolean;
	expectedDate: Date;
	updatedAt: Date;
}

export interface Milestone {
	babyId: string;
	parentId: string;
	firstName: string;
	lastName: string;
	createdAt: Date;
	milestone: MilestoneData[];
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
	status: string; // Status of the appointment (e.g., "pending", "history")
	vaccine: string; // Vaccine name
	createdAt: Date; // Creation timestamp
	updatedAt: Date; // Last updated timestamp
}

export interface Baby {
	id: string;
	parentId: string;
	firstName: string;
	lastName: string;
	birthday: Date;
	createdAt: Date;
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
