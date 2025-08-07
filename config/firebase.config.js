// ==============================================
// CONFIGURAÇÃO DO FIREBASE
// ==============================================

// Importe as funções necessárias do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
	getAuth,
	onAuthStateChanged,
	signInAnonymously,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
	addDoc,
	collection,
	deleteDoc,
	doc,
	getDocs,
	getFirestore,
	onSnapshot,
	orderBy,
	query,
	serverTimestamp,
	updateDoc,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// SUBSTITUA ESTAS CONFIGURAÇÕES PELAS SUAS DO FIREBASE
const firebaseConfig = {
	apiKey: "AIzaSyA9kLichJN3xSUBPUyaVDH_hJUwn2SL4GM",
	authDomain: "appcadastrodepessoas-2c20b.firebaseapp.com",
	projectId: "appcadastrodepessoas-2c20b",
	storageBucket: "appcadastrodepessoas-2c20b.firebasestorage.app",
	messagingSenderId: "789674139888",
	appId: "1:789674139888:web:0e21d7ba75c10bd6086235",
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// ==============================================
// FUNÇÕES DO FIREBASE
// ==============================================

class FirebaseService {
	constructor() {
		this.db = db;
		this.auth = auth;
		this.currentUser = null;
		this.isOnline = navigator.onLine;
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
					console.log("Usuário autenticado:", user.uid);
					this.syncData();
				}
			});
		} catch (error) {
			console.error("Erro na autenticação:", error);
		}
	}

	// Monitorar status online/offline
	setupOnlineListener() {
		window.addEventListener("online", () => {
			this.isOnline = true;
			this.updateConnectionStatus("online");
			this.syncData();
		});

		window.addEventListener("offline", () => {
			this.isOnline = false;
			this.updateConnectionStatus("offline");
		});
	}

	// Atualizar status de conexão na interface
	updateConnectionStatus(status) {
		const statusElement = document.getElementById("connectionStatus");
		if (statusElement) {
			if (status === "online") {
				statusElement.innerHTML =
					'<i class="fas fa-cloud text-green-500"></i> Online';
				statusElement.className = "text-sm text-green-600";
			} else {
				statusElement.innerHTML =
					'<i class="fas fa-cloud-slash text-red-500"></i> Offline';
				statusElement.className = "text-sm text-red-600";
			}
		}
	}

	// Salvar registro no Firebase
	async saveRecord(record) {
		if (!this.isOnline || !this.currentUser) {
			// Salvar localmente se offline
			this.saveToLocalStorage(record);
			return;
		}

		try {
			const docRef = await addDoc(collection(this.db, "records"), {
				...record,
				userId: this.currentUser.uid,
				createdAt: serverTimestamp(),
				updatedAt: serverTimestamp(),
			});

			console.log("Registro salvo no Firebase:", docRef.id);

			// Atualizar o ID local com o ID do Firebase
			record.firebaseId = docRef.id;
			this.saveToLocalStorage(record);

			return docRef.id;
		} catch (error) {
			console.error("Erro ao salvar no Firebase:", error);
			// Fallback para localStorage
			this.saveToLocalStorage(record);
		}
	}

	// Atualizar registro no Firebase
	async updateRecord(record) {
		if (!this.isOnline || !this.currentUser || !record.firebaseId) {
			this.saveToLocalStorage(record);
			return;
		}

		try {
			const docRef = doc(this.db, "records", record.firebaseId);
			await updateDoc(docRef, {
				...record,
				updatedAt: serverTimestamp(),
			});

			console.log("Registro atualizado no Firebase:", record.firebaseId);
			this.saveToLocalStorage(record);
		} catch (error) {
			console.error("Erro ao atualizar no Firebase:", error);
			this.saveToLocalStorage(record);
		}
	}

	// Deletar registro do Firebase
	async deleteRecord(recordId, firebaseId) {
		if (this.isOnline && this.currentUser && firebaseId) {
			try {
				await deleteDoc(doc(this.db, "records", firebaseId));
				console.log("Registro deletado do Firebase:", firebaseId);
			} catch (error) {
				console.error("Erro ao deletar do Firebase:", error);
			}
		}

		// Remover do localStorage também
		this.removeFromLocalStorage(recordId);
	}

	// Carregar registros do Firebase
	async loadRecords() {
		if (!this.isOnline || !this.currentUser) {
			return this.loadFromLocalStorage();
		}

		try {
			const q = query(
				collection(this.db, "records"),
				orderBy("createdAt", "desc")
			);

			const querySnapshot = await getDocs(q);
			const records = [];

			querySnapshot.forEach((doc) => {
				const data = doc.data();
				if (data.userId === this.currentUser.uid) {
					records.push({
						...data,
						firebaseId: doc.id,
						createdAt:
							data.createdAt?.toDate?.()?.toISOString() ||
							data.createdAt,
						updatedAt:
							data.updatedAt?.toDate?.()?.toISOString() ||
							data.updatedAt,
					});
				}
			});

			// Salvar no localStorage como backup
			localStorage.setItem("personalRecords", JSON.stringify(records));

			return records;
		} catch (error) {
			console.error("Erro ao carregar do Firebase:", error);
			return this.loadFromLocalStorage();
		}
	}

	// Sincronizar dados em tempo real
	setupRealtimeSync() {
		if (!this.currentUser) return;

		const q = query(
			collection(this.db, "records"),
			orderBy("createdAt", "desc")
		);

		return onSnapshot(q, (querySnapshot) => {
			const records = [];
			querySnapshot.forEach((doc) => {
				const data = doc.data();
				if (data.userId === this.currentUser.uid) {
					records.push({
						...data,
						firebaseId: doc.id,
						createdAt:
							data.createdAt?.toDate?.()?.toISOString() ||
							data.createdAt,
						updatedAt:
							data.updatedAt?.toDate?.()?.toISOString() ||
							data.updatedAt,
					});
				}
			});

			// Atualizar dados locais
			appData.records = records;
			localStorage.setItem("personalRecords", JSON.stringify(records));

			// Atualizar interface
			if (typeof updateUI === "function") {
				updateUI();
			}

			console.log("Dados sincronizados em tempo real");
		});
	}

	// Sincronizar dados pendentes
	async syncData() {
		if (!this.isOnline || !this.currentUser) return;

		const localRecords = this.loadFromLocalStorage();
		const pendingSync = localRecords.filter((record) => !record.firebaseId);

		for (const record of pendingSync) {
			await this.saveRecord(record);
		}

		console.log(`${pendingSync.length} registros sincronizados`);
	}

	// Funções auxiliares para localStorage
	saveToLocalStorage(record) {
		const records = this.loadFromLocalStorage();
		const existingIndex = records.findIndex((r) => r.id === record.id);

		if (existingIndex >= 0) {
			records[existingIndex] = record;
		} else {
			records.unshift(record);
		}

		localStorage.setItem("personalRecords", JSON.stringify(records));
	}

	loadFromLocalStorage() {
		const savedData = localStorage.getItem("personalRecords");
		return savedData ? JSON.parse(savedData) : [];
	}

	removeFromLocalStorage(recordId) {
		const records = this.loadFromLocalStorage();
		const filteredRecords = records.filter((r) => r.id !== recordId);
		localStorage.setItem(
			"personalRecords",
			JSON.stringify(filteredRecords)
		);
	}
}

// Criar instância global do serviço Firebase
window.firebaseService = new FirebaseService();

export default FirebaseService;
