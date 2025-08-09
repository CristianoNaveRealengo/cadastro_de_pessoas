// ==============================================
// CONFIGURAÇÃO DO FIREBASE
// ==============================================

// Importe as funções necessárias do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
	browserLocalPersistence,
	createUserWithEmailAndPassword,
	getAuth,
	onAuthStateChanged,
	setPersistence,
	signInWithEmailAndPassword,
	signOut,
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
		this.isConnected = false;
		this.setupAuth();
		this.setupOnlineListener();
		this.initializeStatus();
	}

	// Inicializar status de conexão
	initializeStatus() {
		// Mostrar status inicial
		this.updateConnectionStatus(this.isOnline ? "connecting" : "offline");

		// Timeout para evitar "Conectando..." infinito
		setTimeout(() => {
			if (!this.isConnected && this.isOnline) {
				console.log("⚠️ Timeout de conexão - verificando status");
				this.updateConnectionStatus("offline");
			}
		}, 10000); // 10 segundos timeout
	}

	// Configurar autenticação com email/senha
	async setupAuth() {
		try {
			// Configurar persistência de autenticação
			await setPersistence(this.auth, browserLocalPersistence);

			// Monitorar mudanças de autenticação
			onAuthStateChanged(this.auth, (user) => {
				this.currentUser = user;
				if (user) {
					console.log(
						"🔥 Firebase conectado - Usuário:",
						user.email || user.uid
					);
					this.isConnected = true;
					this.updateConnectionStatus("online");
					this.syncData();
				} else {
					console.log(
						"❌ Firebase desconectado - usuário precisa fazer login"
					);
					this.isConnected = false;
					this.updateConnectionStatus("offline");
				}
			});
		} catch (error) {
			console.error("❌ Erro na configuração de autenticação:", error);
			this.isConnected = false;
			this.updateConnectionStatus("offline");
		}
	}

	// Monitorar status online/offline
	setupOnlineListener() {
		window.addEventListener("online", () => {
			this.isOnline = true;
			console.log("🌐 Conexão de internet restaurada");

			// Mostrar conectando enquanto tenta reconectar ao Firebase
			if (this.currentUser) {
				this.updateConnectionStatus("online");
				// Aguardar um pouco para garantir conexão estável
				setTimeout(() => {
					this.syncData();
				}, 1000);
			} else {
				this.updateConnectionStatus("connecting");
				// Tentar reconectar ao Firebase
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
		}, 5 * 60 * 1000); // 5 minutos
	}

	// Atualizar status de conexão na interface
	updateConnectionStatus(status) {
		const statusElement = document.getElementById("connectionStatus");
		if (statusElement) {
			const pendingCount = this.getPendingSyncCount();

			switch (status) {
				case "connecting":
					// Conectando - bolinha azul pulsando
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
						// Sincronizando - bolinha amarela pulsando
						statusElement.innerHTML = `
							<span class="flex items-center">
								<span class="w-2 h-2 bg-yellow-500 rounded-full mr-2 animate-pulse"></span>
								<i class="fas fa-sync-alt text-yellow-500 animate-spin mr-1"></i>
								Sincronizando (${pendingCount})
							</span>
						`;
						statusElement.className = "text-sm text-yellow-600";
					} else {
						// Online - bolinha verde
						statusElement.innerHTML = `
							<span class="flex items-center">
								<span class="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
								<i class="fas fa-cloud text-green-500 mr-1"></i>
								Online
							</span>
						`;
						statusElement.className = "text-sm text-green-600";
					}
					break;

				case "offline":
				default:
					// Offline - bolinha vermelha
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

	// Salvar registro no Firebase
	async saveRecord(record) {
		// SEMPRE salva localmente primeiro (UX instantânea)
		this.saveToLocalStorage(record);

		if (!this.isOnline || !this.currentUser) {
			console.log("📱 Registro salvo localmente (offline)");
			this.updateConnectionStatus("offline");
			return;
		}

		try {
			// Marcar como "sincronizando"
			this.updateConnectionStatus("online");

			const userId = this.currentUser.uid;
			const docRef = await addDoc(collection(this.db, "records"), {
				...record,
				createdBy: userId,
				updatedBy: userId,
				createdAt: serverTimestamp(),
				updatedAt: serverTimestamp(),
			});

			console.log("☁️ Registro sincronizado no Firebase:", docRef.id);

			// Atualizar o ID local com o ID do Firebase
			record.firebaseId = docRef.id;
			record.createdBy = userId;
			record.updatedBy = userId;
			this.saveToLocalStorage(record);

			// Atualizar status
			this.updateConnectionStatus("online");

			return docRef.id;
		} catch (error) {
			console.error("❌ Erro ao sincronizar no Firebase:", error);
			console.log(
				"📱 Registro mantido localmente para sincronização posterior"
			);

			// Não é erro crítico - dados estão seguros localmente
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
			const userId = this.currentUser.uid;
			const docRef = doc(this.db, "records", record.firebaseId);
			await updateDoc(docRef, {
				...record,
				updatedBy: userId,
				updatedAt: serverTimestamp(),
			});

			console.log("Registro atualizado no Firebase:", record.firebaseId);

			// Atualizar também localmente
			record.updatedBy = userId;
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
				// Filtrar por createdBy ou updatedBy (usuário pode ver registros que criou ou editou)
				if (
					data.createdBy === this.currentUser.uid ||
					data.updatedBy === this.currentUser.uid ||
					data.userId === this.currentUser.uid
				) {
					// Compatibilidade com registros antigos
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
				// Filtrar por createdBy ou updatedBy (usuário pode ver registros que criou ou editou)
				if (
					data.createdBy === this.currentUser.uid ||
					data.updatedBy === this.currentUser.uid ||
					data.userId === this.currentUser.uid
				) {
					// Compatibilidade com registros antigos
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
			if (typeof appData !== "undefined") {
				appData.records = records;
			}
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

		if (pendingSync.length === 0) {
			console.log("✅ Todos os dados já estão sincronizados");
			return;
		}

		console.log(`🔄 Sincronizando ${pendingSync.length} registros...`);

		// Sincronizar em paralelo para melhor performance
		const syncPromises = pendingSync.map((record) =>
			this.saveRecord(record)
		);

		try {
			await Promise.all(syncPromises);
			console.log(
				`✅ ${pendingSync.length} registros sincronizados com sucesso`
			);

			// Notificar usuário
			if (typeof UIUtils !== "undefined") {
				UIUtils.showToast(
					`${pendingSync.length} registros sincronizados na nuvem`,
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

	// Fazer login com email e senha
	async signIn(email, password) {
		try {
			const result = await signInWithEmailAndPassword(
				this.auth,
				email,
				password
			);
			console.log("✅ Login realizado com sucesso:", result.user.email);

			if (typeof UIUtils !== "undefined") {
				UIUtils.showToast("Login realizado com sucesso!", "success");
			}

			return result.user;
		} catch (error) {
			console.error("❌ Erro no login:", error);

			let errorMessage = "Erro no login";
			if (error.code === "auth/user-not-found") {
				errorMessage = "Usuário não encontrado";
			} else if (error.code === "auth/wrong-password") {
				errorMessage = "Senha incorreta";
			} else if (error.code === "auth/invalid-email") {
				errorMessage = "Email inválido";
			} else if (error.code === "auth/too-many-requests") {
				errorMessage = "Muitas tentativas. Tente novamente mais tarde";
			}

			if (typeof UIUtils !== "undefined") {
				UIUtils.showToast(errorMessage, "error");
			}

			throw error;
		}
	}

	// Criar conta com email e senha
	async signUp(email, password) {
		try {
			const result = await createUserWithEmailAndPassword(
				this.auth,
				email,
				password
			);
			console.log("✅ Conta criada com sucesso:", result.user.email);

			if (typeof UIUtils !== "undefined") {
				UIUtils.showToast("Conta criada com sucesso!", "success");
			}

			return result.user;
		} catch (error) {
			console.error("❌ Erro ao criar conta:", error);

			let errorMessage = "Erro ao criar conta";
			if (error.code === "auth/email-already-in-use") {
				errorMessage = "Este email já está em uso";
			} else if (error.code === "auth/weak-password") {
				errorMessage = "Senha muito fraca (mínimo 6 caracteres)";
			} else if (error.code === "auth/invalid-email") {
				errorMessage = "Email inválido";
			}

			if (typeof UIUtils !== "undefined") {
				UIUtils.showToast(errorMessage, "error");
			}

			throw error;
		}
	}

	// Fazer logout
	async signOutUser() {
		try {
			await signOut(this.auth);
			console.log("✅ Logout realizado com sucesso");

			if (typeof UIUtils !== "undefined") {
				UIUtils.showToast("Logout realizado com sucesso!", "success");
			}
		} catch (error) {
			console.error("❌ Erro no logout:", error);

			if (typeof UIUtils !== "undefined") {
				UIUtils.showToast("Erro no logout", "error");
			}

			throw error;
		}
	}

	// Verificar se usuário está logado
	isUserLoggedIn() {
		return this.currentUser !== null;
	}

	// Obter email do usuário atual
	getCurrentUserEmail() {
		return this.currentUser?.email || null;
	}
}

// Criar instância global do serviço Firebase
window.firebaseService = new FirebaseService();

export default FirebaseService;
