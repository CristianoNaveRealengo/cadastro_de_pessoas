// ==============================================
// CONTROLE DE ACESSO BASEADO EM FUNÇÕES (RBAC)
// ==============================================

/**
 * Sistema de controle de acesso que define:
 * - Funções (roles) disponíveis no sistema
 * - Permissões específicas para cada função
 * - Usuários autorizados e suas funções
 * - Validação de acesso para operações
 */

// ==============================================
// DEFINIÇÃO DE PERMISSÕES
// ==============================================

export const PERMISSIONS = {
	// Operações básicas de dados
	CREATE_RECORD: "create_record",
	READ_RECORD: "read_record",
	UPDATE_RECORD: "update_record",
	DELETE_RECORD: "delete_record",

	// Operações de busca e filtros
	SEARCH_RECORDS: "search_records",
	VIEW_STATISTICS: "view_statistics",

	// Operações de importação/exportação
	EXPORT_DATA: "export_data",
	IMPORT_DATA: "import_data",

	// Operações administrativas
	MANAGE_USERS: "manage_users",
	VIEW_AUDIT_LOG: "view_audit_log",
	MANAGE_SYSTEM: "manage_system",

	// Operações de sessão
	EXTEND_SESSION: "extend_session",
	FORCE_LOGOUT: "force_logout",
};

// ==============================================
// DEFINIÇÃO DE FUNÇÕES
// ==============================================

export const ROLES = {
	// Administrador - Acesso total
	ADMIN: {
		name: "Administrador",
		description: "Acesso completo ao sistema",
		permissions: [
			PERMISSIONS.CREATE_RECORD,
			PERMISSIONS.READ_RECORD,
			PERMISSIONS.UPDATE_RECORD,
			PERMISSIONS.DELETE_RECORD,
			PERMISSIONS.SEARCH_RECORDS,
			PERMISSIONS.VIEW_STATISTICS,
			PERMISSIONS.EXPORT_DATA,
			PERMISSIONS.IMPORT_DATA,
			PERMISSIONS.MANAGE_USERS,
			PERMISSIONS.VIEW_AUDIT_LOG,
			PERMISSIONS.MANAGE_SYSTEM,
			PERMISSIONS.EXTEND_SESSION,
			PERMISSIONS.FORCE_LOGOUT,
		],
		color: "red",
		icon: "fa-crown",
	},

	// Editor - Pode criar, editar e visualizar
	EDITOR: {
		name: "Editor",
		description: "Pode criar, editar e visualizar registros",
		permissions: [
			PERMISSIONS.CREATE_RECORD,
			PERMISSIONS.READ_RECORD,
			PERMISSIONS.UPDATE_RECORD,
			PERMISSIONS.SEARCH_RECORDS,
			PERMISSIONS.VIEW_STATISTICS,
			PERMISSIONS.EXPORT_DATA,
			PERMISSIONS.EXTEND_SESSION,
		],
		color: "blue",
		icon: "fa-edit",
	},

	// Visualizador - Apenas leitura
	VIEWER: {
		name: "Visualizador",
		description: "Apenas visualização e busca",
		permissions: [
			PERMISSIONS.READ_RECORD,
			PERMISSIONS.SEARCH_RECORDS,
			PERMISSIONS.VIEW_STATISTICS,
			PERMISSIONS.EXTEND_SESSION,
		],
		color: "green",
		icon: "fa-eye",
	},

	// Auditor - Visualização e relatórios
	AUDITOR: {
		name: "Auditor",
		description: "Visualização, relatórios e auditoria",
		permissions: [
			PERMISSIONS.READ_RECORD,
			PERMISSIONS.SEARCH_RECORDS,
			PERMISSIONS.VIEW_STATISTICS,
			PERMISSIONS.EXPORT_DATA,
			PERMISSIONS.VIEW_AUDIT_LOG,
			PERMISSIONS.EXTEND_SESSION,
		],
		color: "purple",
		icon: "fa-search",
	},

	// Operador - Operações básicas
	OPERATOR: {
		name: "Operador",
		description: "Operações básicas de cadastro",
		permissions: [
			PERMISSIONS.CREATE_RECORD,
			PERMISSIONS.READ_RECORD,
			PERMISSIONS.UPDATE_RECORD,
			PERMISSIONS.SEARCH_RECORDS,
			PERMISSIONS.EXTEND_SESSION,
		],
		color: "yellow",
		icon: "fa-user-cog",
	},
};

// ==============================================
// USUÁRIOS AUTORIZADOS E SUAS FUNÇÕES
// ==============================================

export const USER_ROLES = {
	// Administrador principal
	"cristianonaverealengo@gmail.com": ["ADMIN"],

	// Exemplos de outros usuários (configurar conforme necessário)
	"editor@exemplo.com": ["EDITOR"],
	"viewer@exemplo.com": ["VIEWER"],
	"auditor@exemplo.com": ["AUDITOR"],
	"operador@exemplo.com": ["OPERATOR"],

	// Usuários com múltiplas funções
	"supervisor@exemplo.com": ["EDITOR", "AUDITOR"],
};

// ==============================================
// CLASSE DE CONTROLE DE ACESSO
// ==============================================

export class AccessControl {
	constructor() {
		this.currentUser = null;
		this.userRoles = [];
		this.userPermissions = new Set();
		this.auditLog = [];
	}

	// Definir usuário atual e carregar suas permissões
	setCurrentUser(user) {
		this.currentUser = user;
		this.loadUserRoles();
		this.loadUserPermissions();
		this.logAccess("USER_LOGIN", `Usuário ${user.email} fez login`);

		console.log(`🔐 Usuário autenticado: ${user.email}`);
		console.log(`👤 Funções: ${this.userRoles.join(", ")}`);
		console.log(`🔑 Permissões: ${this.userPermissions.size} carregadas`);
	}

	// Carregar funções do usuário
	loadUserRoles() {
		if (!this.currentUser) {
			this.userRoles = [];
			return;
		}

		const email = this.currentUser.email;
		this.userRoles = USER_ROLES[email] || [];

		if (this.userRoles.length === 0) {
			console.warn(`⚠️ Usuário ${email} não possui funções definidas`);
			this.logAccess("ACCESS_DENIED", `Usuário sem funções: ${email}`);
		}
	}

	// Carregar permissões baseadas nas funções
	loadUserPermissions() {
		this.userPermissions.clear();

		this.userRoles.forEach((roleName) => {
			const role = ROLES[roleName];
			if (role) {
				role.permissions.forEach((permission) => {
					this.userPermissions.add(permission);
				});
			}
		});
	}

	// Verificar se usuário tem permissão específica
	hasPermission(permission) {
		const hasAccess = this.userPermissions.has(permission);

		if (!hasAccess) {
			this.logAccess("ACCESS_DENIED", `Permissão negada: ${permission}`);
			console.warn(`🚫 Acesso negado para: ${permission}`);
		}

		return hasAccess;
	}

	// Verificar se usuário tem uma das permissões da lista
	hasAnyPermission(permissions) {
		return permissions.some((permission) => this.hasPermission(permission));
	}

	// Verificar se usuário tem todas as permissões da lista
	hasAllPermissions(permissions) {
		return permissions.every((permission) =>
			this.hasPermission(permission)
		);
	}

	// Verificar se usuário tem função específica
	hasRole(roleName) {
		return this.userRoles.includes(roleName);
	}

	// Obter informações do usuário atual
	getCurrentUserInfo() {
		if (!this.currentUser) {
			return null;
		}

		return {
			email: this.currentUser.email,
			uid: this.currentUser.uid,
			roles: this.userRoles.map((roleName) => ({
				name: roleName,
				displayName: ROLES[roleName]?.name || roleName,
				color: ROLES[roleName]?.color || "gray",
				icon: ROLES[roleName]?.icon || "fa-user",
			})),
			permissions: Array.from(this.userPermissions),
			isAdmin: this.hasRole("ADMIN"),
		};
	}

	// Executar ação com verificação de permissão
	executeWithPermission(permission, action, errorMessage = null) {
		if (this.hasPermission(permission)) {
			this.logAccess("ACTION_EXECUTED", `Ação executada: ${permission}`);
			return action();
		} else {
			const message =
				errorMessage || `Você não tem permissão para: ${permission}`;
			this.showAccessDeniedMessage(message);
			throw new Error(`Acesso negado: ${permission}`);
		}
	}

	// Mostrar mensagem de acesso negado
	showAccessDeniedMessage(message) {
		// Criar toast de erro
		const toast = document.createElement("div");
		toast.className =
			"fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300";
		toast.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-ban mr-2"></i>
                <span>${message}</span>
            </div>
        `;

		document.body.appendChild(toast);

		// Remover após 5 segundos
		setTimeout(() => {
			if (document.body.contains(toast)) {
				document.body.removeChild(toast);
			}
		}, 5000);
	}

	// Log de auditoria
	logAccess(action, details) {
		const logEntry = {
			timestamp: new Date().toISOString(),
			user: this.currentUser?.email || "anonymous",
			action,
			details,
			ip: this.getClientIP(),
			userAgent: navigator.userAgent,
		};

		this.auditLog.push(logEntry);

		// Manter apenas os últimos 1000 logs
		if (this.auditLog.length > 1000) {
			this.auditLog = this.auditLog.slice(-1000);
		}

		// Salvar no localStorage para persistência
		try {
			localStorage.setItem("audit_log", JSON.stringify(this.auditLog));
		} catch (error) {
			console.warn("Erro ao salvar log de auditoria:", error);
		}
	}

	// Obter IP do cliente (aproximado)
	getClientIP() {
		// Em produção, isso deveria vir do servidor
		return "client-ip";
	}

	// Obter logs de auditoria
	getAuditLog(limit = 100) {
		if (!this.hasPermission(PERMISSIONS.VIEW_AUDIT_LOG)) {
			throw new Error("Sem permissão para visualizar logs de auditoria");
		}

		return this.auditLog.slice(-limit).reverse();
	}

	// Limpar usuário atual
	clearCurrentUser() {
		if (this.currentUser) {
			this.logAccess(
				"USER_LOGOUT",
				`Usuário ${this.currentUser.email} fez logout`
			);
		}

		this.currentUser = null;
		this.userRoles = [];
		this.userPermissions.clear();
	}

	// Verificar se sistema tem usuários configurados
	hasConfiguredUsers() {
		return Object.keys(USER_ROLES).length > 0;
	}

	// Obter estatísticas de acesso
	getAccessStats() {
		if (!this.hasPermission(PERMISSIONS.VIEW_AUDIT_LOG)) {
			throw new Error("Sem permissão para visualizar estatísticas");
		}

		const stats = {
			totalLogs: this.auditLog.length,
			uniqueUsers: new Set(this.auditLog.map((log) => log.user)).size,
			loginCount: this.auditLog.filter(
				(log) => log.action === "USER_LOGIN"
			).length,
			deniedCount: this.auditLog.filter(
				(log) => log.action === "ACCESS_DENIED"
			).length,
			lastActivity:
				this.auditLog.length > 0
					? this.auditLog[this.auditLog.length - 1].timestamp
					: null,
		};

		return stats;
	}
}

// ==============================================
// INSTÂNCIA GLOBAL
// ==============================================

export const accessControl = new AccessControl();

// Disponibilizar globalmente para debug (apenas em desenvolvimento)
if (typeof window !== "undefined") {
	window.accessControl = accessControl;

	// Comandos úteis para desenvolvimento
	window.rbacDebug = {
		// Ver informações do usuário atual
		userInfo: () => accessControl.getCurrentUserInfo(),

		// Verificar permissão
		checkPermission: (permission) =>
			accessControl.hasPermission(permission),

		// Ver todas as permissões
		listPermissions: () => Array.from(accessControl.userPermissions),

		// Ver logs de auditoria
		auditLog: (limit = 10) => {
			try {
				return accessControl.getAuditLog(limit);
			} catch (error) {
				console.error("Erro ao acessar logs:", error.message);
				return [];
			}
		},

		// Simular usuário (apenas desenvolvimento)
		simulateUser: (email) => {
			if (
				window.location.hostname === "localhost" ||
				window.location.hostname === "127.0.0.1"
			) {
				accessControl.setCurrentUser({ email, uid: "simulated" });
				console.log(`🧪 Simulando usuário: ${email}`);
			} else {
				console.warn("Simulação disponível apenas em desenvolvimento");
			}
		},
	};

	console.log("🔐 Sistema RBAC carregado");
	console.log("💡 Use rbacDebug.userInfo() para ver informações do usuário");
	console.log(
		'💡 Use rbacDebug.checkPermission("create_record") para testar permissões'
	);
}

export default accessControl;
