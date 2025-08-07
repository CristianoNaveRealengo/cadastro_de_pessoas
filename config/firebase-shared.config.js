// ==============================================
// CONFIGURAÇÃO DO FIREBASE - DADOS COMPARTILHADOS
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

// Configuração do Firebase
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
// FIREBASE SERVICE - DADOS COMPARTILHADOS
// ==============================================

class FirebaseService {
	constructor() {
		this.db = db;
		this.auth = auth;
		this.currentUser = null;
		this.isOnline = navigator.onLine;
		this.isConnected = false;
		this.setupAuth();
		this.setupOnlineListener();
		this.initializeStatus();
	}

	// Inicializar status de conexão
	initializeStatus() {
		this.updateConnectionStatus(this.isOnline ? "connecting" : "offline");

		setTimeout(() => {
			if (!this.isConnected && this.isOnline) {
				console.log("⚠️ Timeout de conexão - verificando status");
				this.updateConnectionStatus("offline");
			}
		}, 10000);
	}

	// Configurar autenticação anônima
	async setupAuth() {
		try {
			await signInAnonymously(this.auth);
			onAuthStateChanged(this.auth, (user) => {
				this.currentUser = user;
				if (user) {
					console.log(
						"🔥 Firebase conectado - Dados COMPARTILHADOS habilitados"
					);
					this.isConnected = true;
					this.updateConnectionStatus("online");
					this.syncData();
				} else {
					console.log("❌ Firebase desconectado");
					this.isConnected = false;
					this.updateConnectionStatus("offline");
				}
			});
		} catch (error) {
			console.error("❌ Erro na autenticação Firebase:", error);
			this.isConnected = false;
			this.updateConnectionStatus("offline");
		}
	}

	// Monitorar status online/offline
	setupOnlineListener() {
		window.addEventListener("online", () => {
			this.isOnline = true;
			console.log("🌐 Conexão de internet restaurada");

			if (this.currentUser) {
				this.updateConnectionStatus("online");
				setTimeout(() => {
					this.syncData();
				}, 1000);
			} else {
				this.updateConnectionStatus("connecting");
				this.setupAuth();
			}
		});

		window.addEventListener("offline", () => {
			this.isOnline = false;
			this.updateConnectionStatus("offline");
			console.log("📱 Modo offline - dados salvos localmente");
		});

		// Sincronização periódica (a cada 5 minutos se online)
		setInterval(() => {
			if (this.isOnline && this.currentUser) {
				const pendingCount = this.getPendingSyncCount();
				if (pendingCount > 0) {
					console.log(
						`🔄 Sincronização automática: ${pendingCount} registros pendentes`
					);
					this.syncData();
				}
			}
		}, 5 * 60 * 1000);
	}

	// Atualizar status de conexão na interface
	updateConnectionStatus(status) {
		const statusElement = document.getElementById("connectionStatus");
		if (statusElement) {
			const pendingCount = this.getPendingSyncCount();

			switch (status) {
				case "connecting":
					statusElement.innerHTML = `
						<span class="flex items-center">
							<span class="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
							<i class="fas fa-spinner text-blue-500 animate-spin mr-1"></i>
							Conectando...
						</span>
					`;
					statusElement.className = "text-sm text-blue-600";
					break;

				case "online":
					if (pendingCount > 0) {
						statusElement.innerHTML = `
							<span class="flex items-center">
								<span class="w-2 h-2 bg-yellow-500 rounded-full mr-2 animate-pulse"></span>
								<i class="fas fa-sync-alt text-yellow-500 animate-spin mr-1"></i>
								Sincronizando (${pendingCount})
							</span>
						`;
						statusElement.className = "text-sm text-yellow-600";
					} else {
						statusElement.innerHTML = `
							<span class="flex items-center">
								<span class="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
								<i class="fas fa-users text-green-500 mr-1"></i>
								Online - Dados Compartilhados
							</span>
						`;
						statusElement.className = "text-sm text-green-600";
					}
					break;

				case "offline":
				default:
					const offlineText =
						pendingCount > 0 ? ` (${pendingCount} pendentes)` : "";
					statusElement.innerHTML = `
						<span class="flex items-center">
							<span class="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
							<i class="fas fa-cloud-slash text-red-500 mr-1"></i>
							Offline${offlineText}
						</span>
					`;
					statusElement.className = "text-sm text-red-600";
					break;
			}
		}
	}

	// Contar registros pendentes de sincronização
	getPendingSyncCount() {
		const localRecords = this.loadFromLocalStorage();
		return localRecords.filter((record) => !record.firebaseId).length;
	}

	// Salvar registro no Firebase - COMPARTILHADO
	async saveRecord(record) {
		// SEMPRE salva localmente primeiro (UX instantânea)
		this.saveToLocalStorage(record);

		if (!this.isOnline || !this.currentUser) {
			console.log("📱 Registro salvo localmente (offline)");
			this.updateConnectionStatus("offline");
			return;
		}

		try {
			this.updateConnectionStatus("online");

			const docRef = await addDoc(collection(this.db, "records"), {
				...record,
				// SEM userId - dados compartilhados entre todos os usuários
				createdAt: serverTimestamp(),
				updatedAt: serverTimestamp(),
			});

			console.log(
				"☁️ Registro compartilhado salvo no Firebase:",
				docRef.id
			);

			// Atualizar o ID local com o ID do Firebase
			record.firebaseId = docRef.id;
			this.saveToLocalStorage(record);

			this.updateConnectionStatus("online");
			return docRef.id;
		} catch (error) {
			console.error("❌ Erro ao sincronizar no Firebase:", error);
			console.log(
				"📱 Registro mantido localmente para sincronização posterior"
			);

			if (typeof UIUtils !== "undefined") {
				UIUtils.showToast(
					"Dados salvos localmente. Sincronização pendente.",
					"info"
				);
			}
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

			console.log(
				"☁️ Registro compartilhado atualizado no Firebase:",
				record.firebaseId
			);
			this.saveToLocalStorage(record);
		} catch (error) {
			console.error("❌ Erro ao atualizar no Firebase:", error);
			this.saveToLocalStorage(record);
		}
	}

	// Deletar registro do Firebase
	async deleteRecord(recordId, firebaseId) {
		if (this.isOnline && this.currentUser && firebaseId) {
			try {
				await deleteDoc(doc(this.db, "records", firebaseId));
				console.log(
					"☁️ Registro compartilhado deletado do Firebase:",
					firebaseId
				);
			} catch (error) {
				console.error("❌ Erro ao deletar do Firebase:", error);
			}
		}

		this.removeFromLocalStorage(recordId);
	}

	// Carregar registros do Firebase - TODOS OS REGISTROS COMPARTILHADOS
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
				// TODOS os registros são carregados - dados compartilhados
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
			});

			// Salvar no localStorage como backup
			localStorage.setItem("personalRecords", JSON.stringify(records));

			console.log(
				`☁️ ${records.length} registros COMPARTILHADOS carregados do Firebase`
			);
			return records;
		} catch (error) {
			console.error("❌ Erro ao carregar do Firebase:", error);
			return this.loadFromLocalStorage();
		}
	}

	// Sincronizar dados em tempo real - COMPARTILHADOS
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
				// TODOS os registros em tempo real - dados compartilhados
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
			});

			// Atualizar dados locais
			appData.records = records;
			localStorage.setItem("personalRecords", JSON.stringify(records));

			// Atualizar interface
			if (typeof updateUI === "function") {
				updateUI();
			}

			console.log(
				`🔄 ${records.length} registros COMPARTILHADOS sincronizados em tempo real`
			);
		});
	}

	// Sincronizar dados pendentes
	async syncData() {
		if (!this.isOnline || !this.currentUser) return;

		const localRecords = this.loadFromLocalStorage();
		const pendingSync = localRecords.filter((record) => !record.firebaseId);

		if (pendingSync.length === 0) {
			console.log("✅ Todos os dados já estão sincronizados");
			return;
		}

		console.log(
			`🔄 Sincronizando ${pendingSync.length} registros compartilhados...`
		);

		const syncPromises = pendingSync.map((record) =>
			this.saveRecord(record)
		);

		try {
			await Promise.all(syncPromises);
			console.log(
				`✅ ${pendingSync.length} registros compartilhados sincronizados com sucesso`
			);

			if (typeof UIUtils !== "undefined") {
				UIUtils.showToast(
					`${pendingSync.length} registros sincronizados e compartilhados`,
					"success"
				);
			}
		} catch (error) {
			console.error("❌ Erro na sincronização:", error);
			if (typeof UIUtils !== "undefined") {
				UIUtils.showToast(
					"Erro na sincronização. Tentando novamente...",
					"warning"
				);
			}
		}
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
