// ==============================================
// FIREBASE SERVICE COM TYPESCRIPT
// ==============================================
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { addDoc, collection, deleteDoc, doc, getDocs, getFirestore, onSnapshot, orderBy, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';
export class FirebaseService {
    constructor(config) {
        this.currentUser = null;
        this.isOnline = navigator.onLine;
        this.unsubscribeSnapshot = null;
        this.app = initializeApp(config);
        this.db = getFirestore(this.app);
        this.auth = getAuth(this.app);
        this.setupAuth();
        this.setupOnlineListener();
    }
    // Configurar autenticação anônima
    async setupAuth() {
        try {
            await signInAnonymously(this.auth);
            onAuthStateChanged(this.auth, (user) => {
                this.currentUser = user;
                if (user) {
                    console.log('Usuário autenticado:', user.uid);
                    this.syncPendingData();
                }
            });
        }
        catch (error) {
            console.error('Erro na autenticação:', error);
        }
    }
    // Monitorar status online/offline
    setupOnlineListener() {
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
    updateConnectionStatus(status) {
        const statusElement = document.getElementById('connectionStatus');
        if (statusElement) {
            if (status === 'online') {
                statusElement.innerHTML = '<i class="fas fa-cloud text-green-500"></i> Online';
                statusElement.className = 'text-sm text-green-600';
            }
            else {
                statusElement.innerHTML = '<i class="fas fa-cloud-slash text-red-500"></i> Offline';
                statusElement.className = 'text-sm text-red-600';
            }
        }
    }
    // Salvar registro no Firebase
    async saveRecord(record) {
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
        }
        catch (error) {
            console.error('Erro ao salvar no Firebase:', error);
            this.saveToLocalStorage(record);
            return null;
        }
    }
    // Atualizar registro no Firebase
    async updateRecord(record) {
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
        }
        catch (error) {
            console.error('Erro ao atualizar no Firebase:', error);
            this.saveToLocalStorage(record);
        }
    }
    // Deletar registro do Firebase
    async deleteRecord(recordId, firebaseId) {
        if (this.isOnline && this.currentUser && firebaseId) {
            try {
                await deleteDoc(doc(this.db, 'records', firebaseId));
                console.log('Registro deletado do Firebase:', firebaseId);
            }
            catch (error) {
                console.error('Erro ao deletar do Firebase:', error);
            }
        }
        this.removeFromLocalStorage(recordId);
    }
    // Carregar registros do Firebase
    async loadRecords() {
        if (!this.isOnline || !this.currentUser) {
            return this.loadFromLocalStorage();
        }
        try {
            const q = query(collection(this.db, 'records'), where('userId', '==', this.currentUser.uid), orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);
            const records = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                records.push({
                    ...data,
                    firebaseId: doc.id,
                    createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
                    updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt
                });
            });
            // Salvar no localStorage como backup
            localStorage.setItem('personalRecords', JSON.stringify(records));
            return records;
        }
        catch (error) {
            console.error('Erro ao carregar do Firebase:', error);
            return this.loadFromLocalStorage();
        }
    }
    // Sincronizar dados em tempo real
    setupRealtimeSync(callback) {
        if (!this.currentUser)
            return null;
        const q = query(collection(this.db, 'records'), where('userId', '==', this.currentUser.uid), orderBy('createdAt', 'desc'));
        this.unsubscribeSnapshot = onSnapshot(q, (querySnapshot) => {
            const records = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                records.push({
                    ...data,
                    firebaseId: doc.id,
                    createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
                    updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt
                });
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
    async syncPendingData() {
        if (!this.isOnline || !this.currentUser)
            return;
        const localRecords = this.loadFromLocalStorage();
        const pendingSync = localRecords.filter(record => !record.firebaseId);
        for (const record of pendingSync) {
            await this.saveRecord(record);
        }
        console.log(`${pendingSync.length} registros sincronizados`);
    }
    // Funções auxiliares para localStorage
    saveToLocalStorage(record) {
        const records = this.loadFromLocalStorage();
        const existingIndex = records.findIndex(r => r.id === record.id);
        if (existingIndex >= 0) {
            records[existingIndex] = record;
        }
        else {
            records.unshift(record);
        }
        localStorage.setItem('personalRecords', JSON.stringify(records));
    }
    loadFromLocalStorage() {
        const savedData = localStorage.getItem('personalRecords');
        return savedData ? JSON.parse(savedData) : [];
    }
    removeFromLocalStorage(recordId) {
        const records = this.loadFromLocalStorage();
        const filteredRecords = records.filter(r => r.id !== recordId);
        localStorage.setItem('personalRecords', JSON.stringify(filteredRecords));
    }
    // Limpar listeners
    destroy() {
        if (this.unsubscribeSnapshot) {
            this.unsubscribeSnapshot();
        }
    }
    // Getters
    get user() {
        return this.currentUser;
    }
    get online() {
        return this.isOnline;
    }
}
//# sourceMappingURL=firebase.js.map