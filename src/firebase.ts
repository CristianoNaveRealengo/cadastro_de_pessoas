// ==============================================
// FIREBASE SERVICE COM TYPESCRIPT
// ==============================================

import { FirebaseApp, initializeApp } from 'firebase/app';
import {
    Auth,
    getAuth,
    onAuthStateChanged,
    signInAnonymously,
    User
} from 'firebase/auth';
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    DocumentData,
    Firestore,
    getDocs,
    getFirestore,
    onSnapshot,
    orderBy,
    query,
    QuerySnapshot,
    serverTimestamp,
    Unsubscribe,
    updateDoc,
    where
} from 'firebase/firestore';

import { FirebaseConfig, PersonRecord } from './types.js';

export class FirebaseService {
    private app: FirebaseApp;
    private db: Firestore;
    private auth: Auth;
    private currentUser: User | null = null;
    private isOnline: boolean = navigator.onLine;
    private unsubscribeSnapshot: Unsubscribe | null = null;

    constructor(config: FirebaseConfig) {
        this.app = initializeApp(config);
        this.db = getFirestore(this.app);
        this.auth = getAuth(this.app);
        
        this.setupAuth();
        this.setupOnlineListener();
    }

    // Configurar autenticação anônima
    private async setupAuth(): Promise<void> {
        try {
            await signInAnonymously(this.auth);
            
            onAuthStateChanged(this.auth, (user: User | null) => {
                this.currentUser = user;
                if (user) {
                    console.log('Usuário autenticado:', user.uid);
                    this.syncPendingData();
                }
            });
        } catch (error) {
            console.error('Erro na autenticação:', error);
        }
    }

    // Monitorar status online/offline
    private setupOnlineListener(): void {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.updateConnectionStatus('online');
            this.syncPendingData();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.updateConnectionStatus('offline');
        });
    }

    // Atualizar status de conexão na interface
    private updateConnectionStatus(status: 'online' | 'offline'): void {
        const statusElement = document.getElementById('connectionStatus');
        if (statusElement) {
            if (status === 'online') {
                statusElement.innerHTML = '<i class="fas fa-cloud text-green-500"></i> Online';
                statusElement.className = 'text-sm text-green-600';
            } else {
                statusElement.innerHTML = '<i class="fas fa-cloud-slash text-red-500"></i> Offline';
                statusElement.className = 'text-sm text-red-600';
            }
        }
    }

    // Salvar registro no Firebase
    async saveRecord(record: PersonRecord): Promise<string | null> {
        if (!this.isOnline || !this.currentUser) {
            this.saveToLocalStorage(record);
            return null;
        }

        try {
            const docRef = await addDoc(collection(this.db, 'records'), {
                ...record,
                userId: this.currentUser.uid,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
            
            console.log('Registro salvo no Firebase:', docRef.id);
            
            // Atualizar o ID local com o ID do Firebase
            record.firebaseId = docRef.id;
            this.saveToLocalStorage(record);
            
            return docRef.id;
        } catch (error) {
            console.error('Erro ao salvar no Firebase:', error);
            this.saveToLocalStorage(record);
            return null;
        }
    }

    // Atualizar registro no Firebase
    async updateRecord(record: PersonRecord): Promise<void> {
        if (!this.isOnline || !this.currentUser || !record.firebaseId) {
            this.saveToLocalStorage(record);
            return;
        }

        try {
            const docRef = doc(this.db, 'records', record.firebaseId);
            await updateDoc(docRef, {
                ...record,
                updatedAt: serverTimestamp()
            });
            
            console.log('Registro atualizado no Firebase:', record.firebaseId);
            this.saveToLocalStorage(record);
        } catch (error) {
            console.error('Erro ao atualizar no Firebase:', error);
            this.saveToLocalStorage(record);
        }
    }

    // Deletar registro do Firebase
    async deleteRecord(recordId: string, firebaseId?: string): Promise<void> {
        if (this.isOnline && this.currentUser && firebaseId) {
            try {
                await deleteDoc(doc(this.db, 'records', firebaseId));
                console.log('Registro deletado do Firebase:', firebaseId);
            } catch (error) {
                console.error('Erro ao deletar do Firebase:', error);
            }
        }

        this.removeFromLocalStorage(recordId);
    }

    // Carregar registros do Firebase
    async loadRecords(): Promise<PersonRecord[]> {
        if (!this.isOnline || !this.currentUser) {
            return this.loadFromLocalStorage();
        }

        try {
            const q = query(
                collection(this.db, 'records'),
                where('userId', '==', this.currentUser.uid),
                orderBy('createdAt', 'desc')
            );
            
            const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(q);
            const records: PersonRecord[] = [];
            
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                records.push({
                    ...data,
                    firebaseId: doc.id,
                    createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
                    updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt
                } as PersonRecord);
            });

            // Salvar no localStorage como backup
            localStorage.setItem('personalRecords', JSON.stringify(records));
            
            return records;
        } catch (error) {
            console.error('Erro ao carregar do Firebase:', error);
            return this.loadFromLocalStorage();
        }
    }

    // Sincronizar dados em tempo real
    setupRealtimeSync(callback: (records: PersonRecord[]) => void): Unsubscribe | null {
        if (!this.currentUser) return null;

        const q = query(
            collection(this.db, 'records'),
            where('userId', '==', this.currentUser.uid),
            orderBy('createdAt', 'desc')
        );

        this.unsubscribeSnapshot = onSnapshot(q, (querySnapshot: QuerySnapshot<DocumentData>) => {
            const records: PersonRecord[] = [];
            
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                records.push({
                    ...data,
                    firebaseId: doc.id,
                    createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
                    updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt
                } as PersonRecord);
            });

            // Salvar no localStorage como backup
            localStorage.setItem('personalRecords', JSON.stringify(records));
            
            // Chamar callback para atualizar a interface
            callback(records);
            
            console.log('Dados sincronizados em tempo real');
        });

        return this.unsubscribeSnapshot;
    }

    // Sincronizar dados pendentes
    private async syncPendingData(): Promise<void> {
        if (!this.isOnline || !this.currentUser) return;

        const localRecords = this.loadFromLocalStorage();
        const pendingSync = localRecords.filter(record => !record.firebaseId);

        for (const record of pendingSync) {
            await this.saveRecord(record);
        }

        console.log(`${pendingSync.length} registros sincronizados`);
    }

    // Funções auxiliares para localStorage
    private saveToLocalStorage(record: PersonRecord): void {
        const records = this.loadFromLocalStorage();
        const existingIndex = records.findIndex(r => r.id === record.id);
        
        if (existingIndex >= 0) {
            records[existingIndex] = record;
        } else {
            records.unshift(record);
        }
        
        localStorage.setItem('personalRecords', JSON.stringify(records));
    }

    private loadFromLocalStorage(): PersonRecord[] {
        const savedData = localStorage.getItem('personalRecords');
        return savedData ? JSON.parse(savedData) : [];
    }

    private removeFromLocalStorage(recordId: string): void {
        const records = this.loadFromLocalStorage();
        const filteredRecords = records.filter(r => r.id !== recordId);
        localStorage.setItem('personalRecords', JSON.stringify(filteredRecords));
    }

    // Limpar listeners
    destroy(): void {
        if (this.unsubscribeSnapshot) {
            this.unsubscribeSnapshot();
        }
    }

    // Getters
    get user(): User | null {
        return this.currentUser;
    }

    get online(): boolean {
        return this.isOnline;
    }
}