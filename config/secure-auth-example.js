// ==============================================
// EXEMPLO DE AUTENTICAÇÃO SEGURA
// ==============================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
	getAuth,
	onAuthStateChanged,
	signInWithEmailAndPassword,
	signOut,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
	addDoc,
	collection,
	doc,
	getDoc,
	getFirestore,
	serverTimestamp,
	setDoc,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ⚠️ IMPORTANTE: Em produção, mover para variáveis de ambiente
const firebaseConfig = {
	// Configurações movidas para .env em produção
	apiKey: process.env.FIREBASE_API_KEY,
	authDomain: process.env.FIREBASE_AUTH_DOMAIN,
	projectId: process.env.FIREBASE_PROJECT_ID,
	storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
	messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
	appId: process.env.FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ==============================================
// SISTEMA DE AUTENTICAÇÃO SEGURA
// ==============================================

class SecureAuthService {
	constructor() {
		this.auth = auth;
		this.db = db;
		this.currentUser = null;
		this.userProfile = null;

		// Configurações de segurança
		this.maxLoginAttempts = 5;
		this.lockoutDuration = 15 * 60 * 1000; // 15 minutos
		this.sessionTimeout = 2 * 60 * 60 * 1000; // 2 horas
		this.passwordMinLength = 8;

		// Controle de tentativas de login
		this.loginAttempts = new Map();

		this.setupAuthListener();
		this.startSecurityMonitoring();
	}

	// ==============================================
	// CONTROLE DE ACESSO BASEADO EM FUNÇÕES
	// ==============================================

	getRolePermissions() {
		return {
			super_admin: {
				permissions: ["*"],
				description: "Acesso total ao sistema",
			},
			admin: {
				permissions: [
					"users:create",
					"users:read",
					"users:update",
					"users:delete",
					"records:create",
					"records:read",
					"records:update",
					"records:delete",
					"reports:read",
					"reports:export",
					"audit:read",
					"system:manage",
				],
				description: "Administrador do sistema",
			},
			manager: {
				permissions: [
					"records:create",
					"records:read",
					"records:update",
					"records:delete",
					"reports:read",
					"reports:export",
					"users:read",
				],
				description: "Gerente - acesso completo aos registros",
			},
			operator: {
				permissions: [
					"records:create",
					"records:read",
					"records:update",
					"reports:read",
				],
				description: "Operador - pode criar e editar registros",
			},
			viewer: {
				permissions: ["records:read", "reports:read"],
				description: "Visualizador - apenas leitura",
			},
		};
	}

	hasPermission(action, resource) {
		if (!this.userProfile) return false;

		const rolePermissions = this.getRolePermissions();
		const userRole = rolePermissions[this.userProfile.role];

		if (!userRole) return false;

		const permissions = userRole.permissions;

		// Verificar super admin
		if (permissions.includes("*")) return true;

		// Verificar permissão específica
		if (permissions.includes(`${resource}:${action}`)) return true;

		return false;
	}

	// ==============================================
	// AUTENTICAÇÃO SEGURA
	// ==============================================

	async signIn(email, password) {
		try {
			// Validar entrada
			this.validateEmail(email);
			this.validatePassword(password);

			// Verificar se conta está bloqueada
			if (this.isAccountLocked(email)) {
				const lockTime = this.getLockoutTimeRemaining(email);
				throw new Error(
					`Conta bloqueada. Tente novamente em ${Math.ceil(
						lockTime / 60000
					)} minutos.`
				);
			}

			// Tentar autenticação
			const userCredential = await signInWithEmailAndPassword(
				this.auth,
				email,
				password
			);

			// Verificar se usuário está autorizado
			const userDoc = await getDoc(
				doc(this.db, "users", userCredential.user.uid)
			);
			if (!userDoc.exists()) {
				await this.signOut();
				throw new Error("Usuário não autorizado no sistema.");
			}

			const userData = userDoc.data();
			if (userData.status === "disabled") {
				await this.signOut();
				throw new Error("Conta desabilitada. Contate o administrador.");
			}

			// Login bem-sucedido
			this.clearLoginAttempts(email);
			this.userProfile = userData;

			// Atualizar último login
			await this.updateLastLogin(userCredential.user.uid);

			// Log de segurança
			await this.logSecurityEvent("LOGIN_SUCCESS", {
				userId: userCredential.user.uid,
				email: email,
				role: userData.role,
			});

			// Iniciar timer de sessão
			this.startSessionTimer();

			return userCredential.user;
		} catch (error) {
			// Registrar tentativa falhada
			this.recordFailedLogin(email);

			// Log de segurança
			await this.logSecurityEvent("LOGIN_FAILED", {
				email: email,
				error: error.code || error.message,
				attempts: this.getLoginAttempts(email),
			});

			throw error;
		}
	}

	async signOut() {
		if (this.currentUser) {
			await this.logSecurityEvent("LOGOUT", {
				userId: this.currentUser.uid,
			});
		}

		await signOut(this.auth);
		this.clearSessionTimer();
		this.currentUser = null;
		this.userProfile = null;
	}

	// ==============================================
	// VALIDAÇÃO E SEGURANÇA
	// ==============================================

	validateEmail(email) {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			throw new Error("Email inválido.");
		}
	}

	validatePassword(password) {
		if (password.length < this.passwordMinLength) {
			throw new Error(
				`Senha deve ter pelo menos ${this.passwordMinLength} caracteres.`
			);
		}

		// Verificar complexidade
		const hasUpperCase = /[A-Z]/.test(password);
		const hasLowerCase = /[a-z]/.test(password);
		const hasNumbers = /\d/.test(password);
		const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

		if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
			throw new Error(
				"Senha deve conter maiúsculas, minúsculas, números e caracteres especiais."
			);
		}
	}

	// ==============================================
	// CONTROLE DE TENTATIVAS DE LOGIN
	// ==============================================

	recordFailedLogin(email) {
		const attempts = this.loginAttempts.get(email) || {
			count: 0,
			lastAttempt: Date.now(),
		};
		attempts.count++;
		attempts.lastAttempt = Date.now();
		this.loginAttempts.set(email, attempts);
	}

	clearLoginAttempts(email) {
		this.loginAttempts.delete(email);
	}

	getLoginAttempts(email) {
		const attempts = this.loginAttempts.get(email);
		return attempts ? attempts.count : 0;
	}

	isAccountLocked(email) {
		const attempts = this.loginAttempts.get(email);
		if (!attempts) return false;

		const timeSinceLastAttempt = Date.now() - attempts.lastAttempt;

		// Se passou o tempo de bloqueio, limpar tentativas
		if (timeSinceLastAttempt > this.lockoutDuration) {
			this.clearLoginAttempts(email);
			return false;
		}

		return attempts.count >= this.maxLoginAttempts;
	}

	getLockoutTimeRemaining(email) {
		const attempts = this.loginAttempts.get(email);
		if (!attempts) return 0;

		const timeSinceLastAttempt = Date.now() - attempts.lastAttempt;
		return Math.max(0, this.lockoutDuration - timeSinceLastAttempt);
	}

	// ==============================================
	// GERENCIAMENTO DE SESSÃO
	// ==============================================

	startSessionTimer() {
		this.clearSessionTimer();

		this.sessionTimer = setTimeout(() => {
			this.handleSessionTimeout();
		}, this.sessionTimeout);
	}

	clearSessionTimer() {
		if (this.sessionTimer) {
			clearTimeout(this.sessionTimer);
			this.sessionTimer = null;
		}
	}

	async handleSessionTimeout() {
		await this.logSecurityEvent("SESSION_TIMEOUT", {
			userId: this.currentUser?.uid,
		});

		await this.signOut();

		// Notificar usuário
		if (typeof UIUtils !== "undefined") {
			UIUtils.showToast(
				"Sessão expirada. Faça login novamente.",
				"warning"
			);
		}

		// Redirecionar para login
		window.location.href = "login.html";
	}

	// ==============================================
	// LOGS DE AUDITORIA
	// ==============================================

	async logSecurityEvent(event, details = {}) {
		try {
			const logEntry = {
				event: event,
				timestamp: serverTimestamp(),
				details: details,
				userAgent: navigator.userAgent,
				ip: await this.getUserIP(),
				sessionId: this.getSessionId(),
			};

			await addDoc(collection(this.db, "security_logs"), logEntry);
		} catch (error) {
			console.error("Erro ao registrar log de segurança:", error);
		}
	}

	async getUserIP() {
		try {
			const response = await fetch("https://api.ipify.org?format=json");
			const data = await response.json();
			return data.ip;
		} catch (error) {
			return "unknown";
		}
	}

	getSessionId() {
		if (!this.sessionId) {
			this.sessionId =
				"session_" +
				Date.now() +
				"_" +
				Math.random().toString(36).substr(2, 9);
		}
		return this.sessionId;
	}

	// ==============================================
	// MONITORAMENTO DE SEGURANÇA
	// ==============================================

	startSecurityMonitoring() {
		// Monitorar tentativas de login suspeitas
		setInterval(() => {
			this.checkSuspiciousActivity();
		}, 60000); // A cada minuto

		// Limpar tentativas antigas
		setInterval(() => {
			this.cleanupOldAttempts();
		}, 300000); // A cada 5 minutos
	}

	checkSuspiciousActivity() {
		const now = Date.now();
		const suspiciousThreshold = 10; // 10 tentativas em 5 minutos
		const timeWindow = 5 * 60 * 1000; // 5 minutos

		for (const [email, attempts] of this.loginAttempts.entries()) {
			if (
				attempts.count >= suspiciousThreshold &&
				now - attempts.lastAttempt < timeWindow
			) {
				this.logSecurityEvent("SUSPICIOUS_ACTIVITY", {
					email: email,
					attempts: attempts.count,
					timeWindow: timeWindow,
				});
			}
		}
	}

	cleanupOldAttempts() {
		const now = Date.now();
		const cleanupThreshold = 24 * 60 * 60 * 1000; // 24 horas

		for (const [email, attempts] of this.loginAttempts.entries()) {
			if (now - attempts.lastAttempt > cleanupThreshold) {
				this.loginAttempts.delete(email);
			}
		}
	}

	// ==============================================
	// UTILITÁRIOS
	// ==============================================

	setupAuthListener() {
		onAuthStateChanged(this.auth, async (user) => {
			this.currentUser = user;

			if (user) {
				// Carregar perfil do usuário
				const userDoc = await getDoc(doc(this.db, "users", user.uid));
				if (userDoc.exists()) {
					this.userProfile = userDoc.data();
				}
			} else {
				this.userProfile = null;
			}
		});
	}

	async updateLastLogin(userId) {
		try {
			await setDoc(
				doc(this.db, "users", userId),
				{
					lastLogin: serverTimestamp(),
					lastLoginIP: await this.getUserIP(),
				},
				{ merge: true }
			);
		} catch (error) {
			console.error("Erro ao atualizar último login:", error);
		}
	}

	getCurrentUser() {
		return {
			user: this.currentUser,
			profile: this.userProfile,
			permissions: this.userProfile
				? this.getRolePermissions()[this.userProfile.role]
				: null,
		};
	}
}

// Criar instância global
const secureAuthService = new SecureAuthService();
window.secureAuthService = secureAuthService;

export default SecureAuthService;
