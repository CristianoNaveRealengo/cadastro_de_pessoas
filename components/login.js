// ==============================================
// SISTEMA DE LOGIN E CADASTRO
// ==============================================

class LoginManager {
	constructor() {
		this.firebaseService = null;
		this.init();
	}

	async init() {
		// Aguardar o FirebaseService estar disponível
		await this.waitForFirebaseService();
		this.setupEventListeners();
		this.checkAuthState();
	}

	// Aguardar FirebaseService estar disponível
	async waitForFirebaseService() {
		return new Promise((resolve) => {
			const checkService = () => {
				if (window.firebaseService) {
					this.firebaseService = window.firebaseService;
					resolve();
				} else {
					setTimeout(checkService, 100);
				}
			};
			checkService();
		});
	}

	// Configurar event listeners
	setupEventListeners() {
		// Formulário de login
		document.getElementById("loginForm").addEventListener("submit", (e) => {
			e.preventDefault();
			this.handleLogin();
		});

		// Formulário de cadastro
		document
			.getElementById("signupForm")
			.addEventListener("submit", (e) => {
				e.preventDefault();
				this.handleSignup();
			});

		// Botões de navegação
		document
			.getElementById("showSignupBtn")
			.addEventListener("click", () => {
				this.showSignupForm();
			});

		document
			.getElementById("backToLoginBtn")
			.addEventListener("click", () => {
				this.showLoginForm();
			});

		// Toggle senha
		document
			.getElementById("togglePassword")
			.addEventListener("click", () => {
				this.togglePasswordVisibility();
			});

		// Enter para submeter formulários
		document.addEventListener("keypress", (e) => {
			if (e.key === "Enter") {
				const activeForm = document.querySelector("form:not(.hidden)");
				if (activeForm) {
					activeForm.dispatchEvent(new Event("submit"));
				}
			}
		});
	}

	// Verificar estado de autenticação
	checkAuthState() {
		if (this.firebaseService.isUserLoggedIn()) {
			console.log("✅ Usuário já está logado, redirecionando...");
			this.redirectToApp();
		}
	}

	// Fazer login
	async handleLogin() {
		const email = document.getElementById("email").value.trim();
		const password = document.getElementById("password").value;

		if (!email || !password) {
			this.showToast("Preencha todos os campos", "error");
			return;
		}

		const loginBtn = document.getElementById("loginBtn");
		const originalText = loginBtn.innerHTML;

		try {
			// Mostrar loading
			loginBtn.innerHTML =
				'<i class="fas fa-spinner animate-spin mr-2"></i>Entrando...';
			loginBtn.disabled = true;

			await this.firebaseService.signIn(email, password);

			// Sucesso - redirecionar
			this.showToast("Login realizado com sucesso!", "success");
			setTimeout(() => {
				this.redirectToApp();
			}, 1000);
		} catch (error) {
			console.error("Erro no login:", error);
			// Erro já é tratado no FirebaseService
		} finally {
			// Restaurar botão
			loginBtn.innerHTML = originalText;
			loginBtn.disabled = false;
		}
	}

	// Criar conta
	async handleSignup() {
		const email = document.getElementById("signupEmail").value.trim();
		const password = document.getElementById("signupPassword").value;
		const confirmPassword =
			document.getElementById("confirmPassword").value;

		// Validações
		if (!email || !password || !confirmPassword) {
			this.showToast("Preencha todos os campos", "error");
			return;
		}

		if (password !== confirmPassword) {
			this.showToast("As senhas não coincidem", "error");
			return;
		}

		if (password.length < 6) {
			this.showToast("A senha deve ter pelo menos 6 caracteres", "error");
			return;
		}

		const signupBtn = document.getElementById("signupBtn");
		const originalText = signupBtn.innerHTML;

		try {
			// Mostrar loading
			signupBtn.innerHTML =
				'<i class="fas fa-spinner animate-spin mr-2"></i>Criando conta...';
			signupBtn.disabled = true;

			await this.firebaseService.signUp(email, password);

			// Sucesso - redirecionar
			this.showToast("Conta criada com sucesso!", "success");
			setTimeout(() => {
				this.redirectToApp();
			}, 1000);
		} catch (error) {
			console.error("Erro ao criar conta:", error);
			// Erro já é tratado no FirebaseService
		} finally {
			// Restaurar botão
			signupBtn.innerHTML = originalText;
			signupBtn.disabled = false;
		}
	}

	// Mostrar formulário de cadastro
	showSignupForm() {
		document.getElementById("loginForm").classList.add("hidden");
		document.getElementById("showSignupBtn").classList.add("hidden");
		document.getElementById("signupForm").classList.remove("hidden");

		// Limpar campos
		document.getElementById("signupEmail").value = "";
		document.getElementById("signupPassword").value = "";
		document.getElementById("confirmPassword").value = "";

		// Focar no primeiro campo
		document.getElementById("signupEmail").focus();
	}

	// Mostrar formulário de login
	showLoginForm() {
		document.getElementById("signupForm").classList.add("hidden");
		document.getElementById("loginForm").classList.remove("hidden");
		document.getElementById("showSignupBtn").classList.remove("hidden");

		// Focar no primeiro campo
		document.getElementById("email").focus();
	}

	// Toggle visibilidade da senha
	togglePasswordVisibility() {
		const passwordInput = document.getElementById("password");
		const eyeIcon = document.getElementById("eyeIcon");

		if (passwordInput.type === "password") {
			passwordInput.type = "text";
			eyeIcon.classList.remove("fa-eye");
			eyeIcon.classList.add("fa-eye-slash");
		} else {
			passwordInput.type = "password";
			eyeIcon.classList.remove("fa-eye-slash");
			eyeIcon.classList.add("fa-eye");
		}
	}

	// Redirecionar para o app principal
	redirectToApp() {
		// Assumindo que o app principal está em ../index.html
		window.location.href = "../index.html";
	}

	// Mostrar toast de notificação
	showToast(message, type = "info") {
		const toast = document.getElementById("toast");
		const toastIcon = document.getElementById("toastIcon");
		const toastMessage = document.getElementById("toastMessage");

		// Configurar ícone e cor baseado no tipo
		let iconClass = "fas fa-info-circle text-blue-500";
		let borderColor = "border-blue-500";

		switch (type) {
			case "success":
				iconClass = "fas fa-check-circle text-green-500";
				borderColor = "border-green-500";
				break;
			case "error":
				iconClass = "fas fa-exclamation-circle text-red-500";
				borderColor = "border-red-500";
				break;
			case "warning":
				iconClass = "fas fa-exclamation-triangle text-yellow-500";
				borderColor = "border-yellow-500";
				break;
		}

		toastIcon.className = iconClass;
		toast.querySelector(
			"div"
		).className = `bg-white ${borderColor} rounded-lg shadow-lg p-4 max-w-sm`;
		toastMessage.textContent = message;

		// Mostrar toast
		toast.classList.remove("hidden");

		// Ocultar após 3 segundos
		setTimeout(() => {
			toast.classList.add("hidden");
		}, 3000);
	}
}

// Utilitário para mostrar toast (compatibilidade)
window.UIUtils = {
	showToast: (message, type) => {
		if (window.loginManager) {
			window.loginManager.showToast(message, type);
		}
	},
};

// Inicializar quando o DOM estiver carregado
document.addEventListener("DOMContentLoaded", () => {
	window.loginManager = new LoginManager();
});

export default LoginManager;
