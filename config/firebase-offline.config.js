// ==============================================
// CONFIGURAÇÃO FIREBASE - MODO OFFLINE PRIMEIRO
// ==============================================

// Esta versão prioriza o funcionamento offline e tenta sincronizar quando possível
// Ideal para ambientes com bloqueadores ou problemas de rede

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

// Importar configuração segura
import { firebaseConfig } from "./firebase-secure.config.js";

// Verificar se a configuração foi carregada
if (!firebaseConfig.apiKey) {
	console.error("❌ Configuração Firebase não encontrada no modo offline!");
	throw new Error("Configuração Firebase não encontrada");
}

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// ==============================================
// FIREBASE SERVICE - OFFLINE PRIMEIRO
// ==============================================

class OfflineFirstFirebaseService {
	constructor() {
		this.db = db;
		this.auth = auth;
		this.currentUser = null;
		this.isOnline = navigator.onLine;
		this.isConnected = false;
		this.firebaseAvailable = false;
		this.syncQueue = [];

		this.initializeOfflineFirst();
		this.setupOnlineListener();
		this.startPeriodicSync();
	}

	// Inicializar em modo offline primeiro
	async initializeOfflineFirst() {
		console.log("📱 Iniciando em modo offline-first");
		this.updateConnectionStatus("offline");

		// Tentar conectar ao Firebase em background (não bloquear)
		this.tryFirebaseConnection();
	}

	// Tentar conexão com Firebase (não bloquear se falhar)
	async tryFirebaseConnection() {
		try {
			console.log(
				"🔄 Tentando conectar ao Firebase com acesso anônimo..."
			);

			// Configurar listener primeiro
			onAuthStateChanged(this.auth, (user) => {
				if (user) {
					this.currentUser = user;
					this.isConnected = true;
					this.firebaseAvailable = true;
					console.log(
						"🔥 Firebase conectado - Usuário anônimo:",
						user.uid.substring(0, 8)
					);
					this.updateConnectionStatus("online");

					// Aguardar um pouco antes de processar fila
					setTimeout(() => {
						this.processSyncQueue();
					}, 2000);
				} else {
					console.log("👤 Usuário desconectado");
					this.currentUser = null;
					this.isConnected = false;
					this.firebaseAvailable = false;
					this.updateConnectionStatus("offline");
				}
			});

			// Tentar autenticação anônima com retry
			let retryCount = 0;
			const maxRetries = 3;

			while (retryCount < maxRetries && !this.firebaseAvailable) {
				try {
					console.log(
						`🔄 Tentativa ${
							retryCount + 1
						}/${maxRetries} de autenticação anônima`
					);
					await signInAnonymously(this.auth);
					break; // Sucesso, sair do loop
				} catch (authError) {
					retryCount++;
					console.log(
						`❌ Tentativa ${retryCount} falhou:`,
						authError.code
					);

					if (retryCount < maxRetries) {
						// Aguardar antes de tentar novamente (backoff exponencial)
						await new Promise((resolve) =>
							setTimeout(resolve, 1000 * retryCount)
						);
					}
				}
			}
		} catch (error) {
			console.log(
				"📱 Firebase não disponível, continuando offline:",
				error.message
			);
			this.firebaseAvailable = false;
			this.updateConnectionStatus("offline");
		}
	}

	// Monitorar status online/offline
	setupOnlineListener() {
		window.addEventListener("online", () => {
			this.isOnline = true;
			console.log("🌐 Conexão de internet restaurada");

			if (!this.firebaseAvailable) {
				this.tryFirebaseConnection();
			} else {
				this.processSyncQueue();
			}
		});

		window.addEventListener("offline", () => {
			this.isOnline = false;
			this.updateConnectionStatus("offline");
			console.log("📱 Modo offline");
		});
	}

	// Sincronização periódica (a cada 2 minutos)
	startPeriodicSync() {
		setInterval(() => {
			if (
				this.isOnline &&
				this.firebaseAvailable &&
				this.syncQueue.length > 0
			) {
				console.log(
					`🔄 Sincronização automática: ${this.syncQueue.length} itens na fila`
				);
				this.processSyncQueue();
			}
		}, 2 * 60 * 1000); // 2 minutos
	}

	// Atualizar status de conexão na interface
	updateConnectionStatus(status) {
		const statusElement = document.getElementById("connectionStatus");
		if (statusElement) {
			const pendingCount = this.syncQueue.length;

			switch (status) {
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
								<i class="fas fa-cloud text-green-500 mr-1"></i>
								Online - Sincronizado
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
							<span class="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
							<i class="fas fa-mobile-alt text-blue-500 mr-1"></i>
							Modo Offline${offlineText}
						</span>
					`;
					statusElement.className = "text-sm text-blue-600";
					break;
			}
		}
	}

	// Salvar registro - SEMPRE funciona (offline-first)
	async saveRecord(record) {
		// SEMPRE salva localmente primeiro
		this.saveToLocalStorage(record);
		console.log("📱 Registro salvo localmente:", record.fullName);

		// Se já tem firebaseId, não precisa sincronizar novamente
		if (record.firebaseId) {
			return record.firebaseId;
		}

		// Adicionar à fila de sincronização
		this.addToSyncQueue("create", record);

		// Tentar sincronizar imediatamente se possível
		if (this.isOnline && this.firebaseAvailable) {
			this.processSyncQueue();
		}

		return record.id; // Retorna o ID local
	}

	// Adicionar item à fila de sincronização
	addToSyncQueue(action, record) {
		const syncItem = {
			id: Date.now() + Math.random(),
			action,
			record: { ...record },
			timestamp: new Date().toISOString(),
			attempts: 0,
		};

		this.syncQueue.push(syncItem);
		this.updateConnectionStatus(
			this.firebaseAvailable ? "online" : "offline"
		);

		console.log(
			`📋 Adicionado à fila de sync: ${action} - ${record.fullName}`
		);
	}

	// Processar fila de sincronização
	async processSyncQueue() {
		if (
			!this.isOnline ||
			!this.firebaseAvailable ||
			this.syncQueue.length === 0
		) {
			return;
		}

		console.log(
			`🔄 Processando ${this.syncQueue.length} itens da fila de sincronização`
		);

		const itemsToProcess = [...this.syncQueue];

		for (const item of itemsToProcess) {
			try {
				item.attempts++;

				if (item.action === "create") {
					await this.syncCreateRecord(item);
				} else if (item.action === "update") {
					await this.syncUpdateRecord(item);
				} else if (item.action === "delete") {
					await this.syncDeleteRecord(item);
				}

				// Remover da fila se sincronizado com sucesso
				this.syncQueue = this.syncQueue.filter(
					(queueItem) => queueItem.id !== item.id
				);
				console.log(`✅ Item sincronizado: ${item.record.fullName}`);
			} catch (error) {
				console.log(
					`❌ Erro ao sincronizar item (tentativa ${item.attempts}):`,
					error.message
				);

				// Remover da fila se muitas tentativas falharam
				if (item.attempts >= 3) {
					this.syncQueue = this.syncQueue.filter(
						(queueItem) => queueItem.id !== item.id
					);
					console.log(
						`🗑️ Item removido da fila após 3 tentativas: ${item.record.fullName}`
					);
				}
			}
		}

		this.updateConnectionStatus("online");

		if (this.syncQueue.length === 0) {
			console.log(
				"✅ Fila de sincronização vazia - todos os dados sincronizados"
			);
		}
	}

	// Sincronizar criação de registro
	async syncCreateRecord(item) {
		try {
			// Preparar dados limpos para o Firebase
			const firebaseData = {
				fullName: item.record.fullName || "",
				origin: item.record.origin || "",
				dob: item.record.dob || "",
				age: item.record.age || 0,
				city: item.record.city || "",
				neighborhood: item.record.neighborhood || "",
				education: item.record.education || "",
				status: item.record.status || "Em Análise",
				referenceName: item.record.referenceName || "",
				forwarding: item.record.forwarding || "",
				observation: item.record.observation || "",
				// Timestamps do Firebase
				createdAt: serverTimestamp(),
				updatedAt: serverTimestamp(),
				// Metadados para identificação
				localId: item.record.id,
				syncedAt: new Date().toISOString(),
			};

			// Timeout de 10 segundos para a operação
			const savePromise = addDoc(
				collection(this.db, "records"),
				firebaseData
			);
			const timeoutPromise = new Promise((_, reject) =>
				setTimeout(
					() => reject(new Error("Timeout na sincronização")),
					10000
				)
			);

			const docRef = await Promise.race([savePromise, timeoutPromise]);

			// Atualizar registro local com ID do Firebase
			item.record.firebaseId = docRef.id;
			this.saveToLocalStorage(item.record);

			console.log(
				`✅ Registro sincronizado: ${item.record.fullName} → ${docRef.id}`
			);
			return docRef.id;
		} catch (error) {
			console.error(
				`❌ Erro ao sincronizar registro ${item.record.fullName}:`,
				error
			);
			throw error; // Re-throw para ser tratado pela função chamadora
		}
	}

	// Sincronizar atualização de registro
	async syncUpdateRecord(item) {
		if (!item.record.firebaseId) {
			throw new Error("Registro não tem firebaseId para atualizar");
		}

		const docRef = doc(this.db, "records", item.record.firebaseId);
		await updateDoc(docRef, {
			...item.record,
			updatedAt: serverTimestamp(),
		});
	}

	// Sincronizar exclusão de registro
	async syncDeleteRecord(item) {
		if (item.record.firebaseId) {
			await deleteDoc(doc(this.db, "records", item.record.firebaseId));
		}
	}

	// Atualizar registro
	async updateRecord(record) {
		this.saveToLocalStorage(record);

		if (record.firebaseId) {
			this.addToSyncQueue("update", record);

			if (this.isOnline && this.firebaseAvailable) {
				this.processSyncQueue();
			}
		}
	}

	// Deletar registro
	async deleteRecord(recordId, firebaseId) {
		this.removeFromLocalStorage(recordId);

		if (firebaseId) {
			this.addToSyncQueue("delete", { id: recordId, firebaseId });

			if (this.isOnline && this.firebaseAvailable) {
				this.processSyncQueue();
			}
		}
	}

	// Carregar registros (sempre do localStorage)
	async loadRecords() {
		const localRecords = this.loadFromLocalStorage();
		console.log(
			`📱 ${localRecords.length} registros carregados do armazenamento local`
		);

		// Tentar carregar do Firebase em background se disponível
		if (this.isOnline && this.firebaseAvailable) {
			this.loadFromFirebaseBackground();
		}

		return localRecords;
	}

	// Carregar do Firebase em background (não bloquear)
	async loadFromFirebaseBackground() {
		try {
			const q = query(
				collection(this.db, "records"),
				orderBy("createdAt", "desc")
			);
			const querySnapshot = await getDocs(q);
			const firebaseRecords = [];

			querySnapshot.forEach((doc) => {
				const data = doc.data();
				firebaseRecords.push({
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

			// Mesclar com dados locais (priorizar dados locais mais recentes)
			this.mergeWithLocalData(firebaseRecords);

			console.log(
				`☁️ ${firebaseRecords.length} registros carregados do Firebase em background`
			);
		} catch (error) {
			console.log(
				"❌ Erro ao carregar do Firebase em background:",
				error.message
			);
		}
	}

	// Mesclar dados do Firebase com dados locais
	mergeWithLocalData(firebaseRecords) {
		const localRecords = this.loadFromLocalStorage();
		const mergedRecords = [...localRecords];

		// Adicionar registros do Firebase que não existem localmente
		firebaseRecords.forEach((firebaseRecord) => {
			const existsLocally = localRecords.some(
				(localRecord) =>
					localRecord.firebaseId === firebaseRecord.firebaseId ||
					(localRecord.fullName === firebaseRecord.fullName &&
						localRecord.dob === firebaseRecord.dob)
			);

			if (!existsLocally) {
				mergedRecords.push(firebaseRecord);
			}
		});

		// Salvar dados mesclados
		localStorage.setItem("personalRecords", JSON.stringify(mergedRecords));

		// Atualizar interface se disponível
		if (typeof appData !== "undefined") {
			appData.records = mergedRecords;
			if (typeof updateUI === "function") {
				updateUI();
			}
		}
	}

	// Configurar sincronização em tempo real (opcional)
	setupRealtimeSync() {
		if (!this.firebaseAvailable) return;

		try {
			const q = query(
				collection(this.db, "records"),
				orderBy("createdAt", "desc")
			);

			return onSnapshot(q, (querySnapshot) => {
				const records = [];
				querySnapshot.forEach((doc) => {
					const data = doc.data();
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

				this.mergeWithLocalData(records);
				console.log("🔄 Dados sincronizados em tempo real");
			});
		} catch (error) {
			console.log(
				"❌ Erro na sincronização em tempo real:",
				error.message
			);
		}
	}

	// Sincronizar dados manualmente
	async syncData() {
		if (this.syncQueue.length > 0) {
			console.log(
				`🔄 Sincronização manual: ${this.syncQueue.length} itens pendentes`
			);
			await this.processSyncQueue();
		} else {
			console.log("✅ Nenhum dado pendente para sincronização");
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

	// Obter estatísticas da fila de sincronização
	getSyncStats() {
		return {
			pendingSync: this.syncQueue.length,
			firebaseAvailable: this.firebaseAvailable,
			isOnline: this.isOnline,
			isConnected: this.isConnected,
		};
	}
}

// Criar instância global do serviço Firebase
window.firebaseService = new OfflineFirstFirebaseService();

export default OfflineFirstFirebaseService;
