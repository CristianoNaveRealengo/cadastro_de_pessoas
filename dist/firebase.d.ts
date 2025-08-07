import { User } from 'firebase/auth';
import { Unsubscribe } from 'firebase/firestore';
import { FirebaseConfig, PersonRecord } from './types.js';
export declare class FirebaseService {
    private app;
    private db;
    private auth;
    private currentUser;
    private isOnline;
    private unsubscribeSnapshot;
    constructor(config: FirebaseConfig);
    private setupAuth;
    private setupOnlineListener;
    private updateConnectionStatus;
    saveRecord(record: PersonRecord): Promise<string | null>;
    updateRecord(record: PersonRecord): Promise<void>;
    deleteRecord(recordId: string, firebaseId?: string): Promise<void>;
    loadRecords(): Promise<PersonRecord[]>;
    setupRealtimeSync(callback: (records: PersonRecord[]) => void): Unsubscribe | null;
    private syncPendingData;
    private saveToLocalStorage;
    private loadFromLocalStorage;
    private removeFromLocalStorage;
    destroy(): void;
    get user(): User | null;
    get online(): boolean;
}
//# sourceMappingURL=firebase.d.ts.map