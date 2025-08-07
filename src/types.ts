// ==============================================
// INTERFACES E TIPOS
// ==============================================

export interface PersonRecord {
	id: string;
	fullName: string;
	origin: 'MSE' | 'MP' | 'EP' | 'EPT';
	dob: string;
	age: number;
	city: string;
	neighborhood: string;
	education: string;
	status: 'Em Análise' | 'Contratado' | 'Não Contratado';
	referenceName: string;
	forwarding: string;
	observation: string;
	createdAt: string;
	timestamp: string;
	firebaseId?: string;
	userId?: string;
}

export interface AppData {
	records: PersonRecord[];
	neighborhoods: Record<string, string[]>;
	currentRecordId: string | null;
	isEditMode: boolean;
	currentPage: number;
	recordsPerPage: number;
	peer: any | null;
	peerId: string | null;
	connections: any[];
	syncEnabled: boolean;
	lastSyncTime: string | null;
}

export interface SyncMessage {
	type: 'data_sync' | 'data_update';
	data?: PersonRecord[];
	timestamp?: string;
}

export interface FirebaseConfig {
	apiKey: string;
	authDomain: string;
	projectId: string;
	storageBucket: string;
	messagingSenderId: string;
	appId: string;
}

export type StatusColorClass = 'bg-green-100 text-green-800' | 'bg-red-100 text-red-800' | 'bg-yellow-100 text-yellow-800';
export type StatusBarColorClass = 'bg-green-500' | 'bg-red-500' | 'bg-yellow-500';