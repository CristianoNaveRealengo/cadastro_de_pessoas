// ==============================================
// EXEMPLOS DE NÍVEIS DE SEGURANÇA
// ==============================================

/**
 * Este arquivo demonstra diferentes implementações de segurança
 * para o Firestore, desde a mais restritiva até a mais flexível
 */

// ==============================================
// NÍVEL 1: MÁXIMA SEGURANÇA (Whitelist Rígida)
// ==============================================

/*
Firestore Rules:
```
function isAllowedUser() {
  return request.auth.uid in ["UID1", "UID2", "UID3"];
}

match /records/{document} {
  allow read, write: if isAllowedUser();
}
```

Características:
- Apenas usuários específicos podem acessar
- Controle total sobre quem acessa
- Ideal para dados muito sensíveis
- Requer manutenção manual da lista
*/

class MaxSecurityService extends FirebaseService {
	async saveRecord(record) {
		// Verificação adicional no cliente (opcional)
		const allowedUIDs = ["UID1", "UID2", "UID3"];
		if (!allowedUIDs.includes(this.currentUser.uid)) {
			throw new Error("Usuário não autorizado");
		}

		return super.saveRecord(record);
	}
}

// ==============================================
// NÍVEL 2: SEGURANÇA BASEADA EM PROPRIEDADE
// ==============================================

/*
Firestore Rules:
```
allow create: if request.auth != null &&
                 request.resource.data.createdBy == request.auth.uid;

allow read: if request.auth != null && 
               (resource.data.createdBy == request.auth.uid ||
                resource.data.updatedBy == request.auth.uid);

allow update: if request.auth != null &&
                 request.resource.data.updatedBy == request.auth.uid &&
                 (resource.data.createdBy == request.auth.uid ||
                  resource.data.updatedBy == request.auth.uid);

allow delete: if request.auth != null &&
                 resource.data.createdBy == request.auth.uid;
```

Características:
- Usuários veem apenas seus próprios dados
- Permite colaboração (updatedBy)
- Escalável automaticamente
- Mais flexível para crescimento
*/

class PropertyBasedSecurityService extends FirebaseService {
	async shareRecord(recordId, targetUserUID) {
		// Permitir que outro usuário edite o registro
		const record = await this.getRecord(recordId);
		if (record.createdBy === this.currentUser.uid) {
			record.sharedWith = record.sharedWith || [];
			if (!record.sharedWith.includes(targetUserUID)) {
				record.sharedWith.push(targetUserUID);
				await this.updateRecord(record);
			}
		}
	}

	async loadRecords() {
		// Carregar registros que o usuário criou ou pode editar
		const q = query(
			collection(this.db, "records"),
			where("createdBy", "==", this.currentUser.uid)
		);

		// Também buscar registros compartilhados
		const sharedQuery = query(
			collection(this.db, "records"),
			where("sharedWith", "array-contains", this.currentUser.uid)
		);

		// Combinar resultados...
	}
}

// ==============================================
// NÍVEL 3: SEGURANÇA HÍBRIDA (Recomendada)
// ==============================================

/*
Firestore Rules:
```
function isAllowedUser() {
  return request.auth.uid in ["UID1", "UID2", "UID3"];
}

allow create: if isAllowedUser() &&
                 request.resource.data.createdBy == request.auth.uid;

allow read: if isAllowedUser() && 
               (resource.data.createdBy == request.auth.uid ||
                resource.data.updatedBy == request.auth.uid);
```

Características:
- Combina whitelist com propriedade
- Controle de acesso + isolamento de dados
- Ideal para a maioria dos casos
- Balanceio entre segurança e flexibilidade
*/

class HybridSecurityService extends FirebaseService {
	constructor() {
		super();
		this.authorizedUIDs = ["UID1", "UID2", "UID3"];
	}

	isUserAuthorized(uid = null) {
		const userUID = uid || this.currentUser?.uid;
		return userUID && this.authorizedUIDs.includes(userUID);
	}

	async saveRecord(record) {
		// Verificação dupla: whitelist + propriedade
		if (!this.isUserAuthorized()) {
			throw new Error("Usuário não está na whitelist");
		}

		// Garantir que createdBy seja o usuário atual
		record.createdBy = this.currentUser.uid;
		record.updatedBy = this.currentUser.uid;

		return super.saveRecord(record);
	}

	async updateRecord(record) {
		if (!this.isUserAuthorized()) {
			throw new Error("Usuário não autorizado");
		}

		// Verificar se pode editar (criador ou último atualizador)
		if (
			record.createdBy !== this.currentUser.uid &&
			record.updatedBy !== this.currentUser.uid
		) {
			throw new Error("Sem permissão para editar este registro");
		}

		record.updatedBy = this.currentUser.uid;
		return super.updateRecord(record);
	}
}

// ==============================================
// NÍVEL 4: SEGURANÇA COM ROLES
// ==============================================

/*
Firestore Rules:
```
function getUserRole() {
  return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role;
}

allow read: if request.auth != null && 
               getUserRole() in ['admin', 'editor', 'viewer'];

allow write: if request.auth != null && 
                getUserRole() in ['admin', 'editor'];

allow delete: if request.auth != null && 
                 getUserRole() == 'admin';
```

Características:
- Sistema de roles/permissões
- Muito flexível e escalável
- Requer coleção adicional de usuários
- Ideal para sistemas complexos
*/

class RoleBasedSecurityService extends FirebaseService {
	constructor() {
		super();
		this.userRole = null;
	}

	async setupAuth() {
		await super.setupAuth();
		if (this.currentUser) {
			await this.loadUserRole();
		}
	}

	async loadUserRole() {
		try {
			const userDoc = await getDoc(
				doc(this.db, "users", this.currentUser.uid)
			);
			this.userRole = userDoc.data()?.role || "viewer";
			console.log(`👤 Role do usuário: ${this.userRole}`);
		} catch (error) {
			console.error("Erro ao carregar role:", error);
			this.userRole = "viewer";
		}
	}

	canRead() {
		return ["admin", "editor", "viewer"].includes(this.userRole);
	}

	canWrite() {
		return ["admin", "editor"].includes(this.userRole);
	}

	canDelete() {
		return this.userRole === "admin";
	}

	async saveRecord(record) {
		if (!this.canWrite()) {
			throw new Error("Sem permissão para criar registros");
		}
		return super.saveRecord(record);
	}

	async deleteRecord(recordId, firebaseId) {
		if (!this.canDelete()) {
			throw new Error("Sem permissão para deletar registros");
		}
		return super.deleteRecord(recordId, firebaseId);
	}
}

// ==============================================
// EXEMPLO DE USO
// ==============================================

// Escolher o nível de segurança apropriado
const securityLevel = "hybrid"; // "max", "property", "hybrid", "role"

let firebaseService;

switch (securityLevel) {
	case "max":
		firebaseService = new MaxSecurityService();
		break;
	case "property":
		firebaseService = new PropertyBasedSecurityService();
		break;
	case "hybrid":
		firebaseService = new HybridSecurityService();
		break;
	case "role":
		firebaseService = new RoleBasedSecurityService();
		break;
	default:
		firebaseService = new FirebaseService();
}

// Disponibilizar globalmente
window.firebaseService = firebaseService;

export {
	HybridSecurityService,
	MaxSecurityService,
	PropertyBasedSecurityService,
	RoleBasedSecurityService,
};
