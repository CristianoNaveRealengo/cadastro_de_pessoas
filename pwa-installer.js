// ==============================================
// PWA INSTALLER E GERENCIADOR
// ==============================================

class PWAInstaller {
	constructor() {
		this.deferredPrompt = null;
		this.isInstalled = false;
		this.isStandalone = false;

		this.init();
	}

	init() {
		// Verificar se já está instalado
		this.checkInstallStatus();

		// Configurar event listeners
		this.setupEventListeners();

		// Registrar Service Worker
		this.registerServiceWorker();

		// Configurar UI
		this.setupInstallUI();

		console.log("🚀 PWA Installer inicializado");
	}

	// ==============================================
	// VERIFICAÇÃO DE STATUS
	// ==============================================

	checkInstallStatus() {
		// Verificar se está rodando como PWA
		this.isStandalone =
			window.matchMedia("(display-mode: standalone)").matches ||
			window.navigator.standalone ||
			document.referrer.includes("android-app://");

		// Verificar se está instalado
		this.isInstalled =
			this.isStandalone ||
			localStorage.getItem("pwa-installed") === "true";

		console.log("📱 Status PWA:", {
			isStandalone: this.isStandalone,
			isInstalled: this.isInstalled,
		});
	}

	// ==============================================
	// SERVICE WORKER
	// ==============================================

	async registerServiceWorker() {
		if ("serviceWorker" in navigator) {
			try {
				console.log("🔧 Registrando Service Worker...");

				const registration = await navigator.serviceWorker.register(
					"/sw.js",
					{
						scope: "/",
					}
				);

				console.log(
					"✅ Service Worker registrado:",
					registration.scope
				);

				// Verificar atualizações
				registration.addEventListener("updatefound", () => {
					console.log("🔄 Nova versão do Service Worker encontrada");
					this.handleServiceWorkerUpdate(registration);
				});

				// Escutar mensagens do Service Worker
				navigator.serviceWorker.addEventListener("message", (event) => {
					this.handleServiceWorkerMessage(event);
				});

				return registration;
			} catch (error) {
				console.error("❌ Erro ao registrar Service Worker:", error);
			}
		} else {
			console.warn("⚠️ Service Worker não suportado neste navegador");
		}
	}

	handleServiceWorkerUpdate(registration) {
		const newWorker = registration.installing;

		newWorker.addEventListener("statechange", () => {
			if (
				newWorker.state === "installed" &&
				navigator.serviceWorker.controller
			) {
				// Nova versão disponível
				this.showUpdateAvailable();
			}
		});
	}

	handleServiceWorkerMessage(event) {
		const { type, message } = event.data;

		switch (type) {
			case "SW_ACTIVATED":
				console.log("✅ Service Worker ativado");
				this.showNotification(
					"Sistema atualizado com sucesso!",
					"success"
				);
				break;

			case "BACKGROUND_SYNC":
				console.log("🔄 Sincronização em background:", message);
				this.showNotification(message, "info");
				break;

			default:
				console.log("💬 Mensagem do Service Worker:", event.data);
		}
	}

	// ==============================================
	// INSTALAÇÃO PWA
	// ==============================================

	setupEventListeners() {
		// Capturar evento de instalação
		window.addEventListener("beforeinstallprompt", (e) => {
			console.log("📱 Prompt de instalação disponível");

			// Prevenir o prompt automático
			e.preventDefault();

			// Salvar o evento para uso posterior
			this.deferredPrompt = e;

			// Mostrar botão de instalação customizado
			this.showInstallButton();
		});

		// Detectar quando foi instalado
		window.addEventListener("appinstalled", () => {
			console.log("✅ PWA instalado com sucesso");

			this.isInstalled = true;
			localStorage.setItem("pwa-installed", "true");

			// Esconder botão de instalação
			this.hideInstallButton();

			// Mostrar mensagem de sucesso
			this.showNotification("App instalado com sucesso!", "success");

			// Analytics (opcional)
			this.trackInstallation();
		});
	}

	async installPWA() {
		if (!this.deferredPrompt) {
			console.warn("⚠️ Prompt de instalação não disponível");
			this.showInstallInstructions();
			return;
		}

		try {
			// Mostrar prompt de instalação
			this.deferredPrompt.prompt();

			// Aguardar escolha do usuário
			const { outcome } = await this.deferredPrompt.userChoice;

			console.log("📱 Resultado da instalação:", outcome);

			if (outcome === "accepted") {
				console.log("✅ Usuário aceitou instalar o PWA");
			} else {
				console.log("❌ Usuário recusou instalar o PWA");
			}

			// Limpar o prompt
			this.deferredPrompt = null;
		} catch (error) {
			console.error("❌ Erro na instalação:", error);
			this.showNotification(
				"Erro na instalação. Tente novamente.",
				"error"
			);
		}
	}

	// ==============================================
	// INTERFACE DE INSTALAÇÃO
	// ==============================================

	setupInstallUI() {
		// Criar botão de instalação se não existir
		if (!document.getElementById("pwa-install-button")) {
			this.createInstallButton();
		}

		// Criar banner de instalação se não estiver instalado
		if (!this.isInstalled && !this.isStandalone) {
			this.createInstallBanner();
		}

		// Criar botão de atualização
		this.createUpdateButton();
	}

	createInstallButton() {
		const button = document.createElement("button");
		button.id = "pwa-install-button";
		button.className =
			"fixed bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full shadow-lg z-50 hidden transition-all duration-300";
		button.innerHTML = '<i class="fas fa-download mr-2"></i>Instalar App';
		button.onclick = () => this.installPWA();

		document.body.appendChild(button);
	}

	createInstallBanner() {
		// Verificar se banner já foi dispensado
		if (localStorage.getItem("pwa-banner-dismissed") === "true") {
			return;
		}

		const banner = document.createElement("div");
		banner.id = "pwa-install-banner";
		banner.className =
			"fixed top-0 left-0 right-0 bg-blue-600 text-white p-4 z-50 transform -translate-y-full transition-transform duration-300";
		banner.innerHTML = `
            <div class="flex items-center justify-between max-w-4xl mx-auto">
                <div class="flex items-center">
                    <i class="fas fa-mobile-alt mr-3 text-xl"></i>
                    <div>
                        <div class="font-medium">Instale nosso app!</div>
                        <div class="text-sm opacity-90">Acesso rápido e funciona offline</div>
                    </div>
                </div>
                <div class="flex items-center space-x-2">
                    <button onclick="pwaInstaller.installPWA()" class="bg-white text-blue-600 px-4 py-2 rounded font-medium hover:bg-gray-100 transition-colors">
                        Instalar
                    </button>
                    <button onclick="pwaInstaller.dismissBanner()" class="text-white hover:text-gray-200 p-2">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `;

		document.body.appendChild(banner);

		// Mostrar banner após um delay
		setTimeout(() => {
			banner.classList.remove("-translate-y-full");
		}, 2000);
	}

	createUpdateButton() {
		const button = document.createElement("button");
		button.id = "pwa-update-button";
		button.className =
			"fixed bottom-4 left-4 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full shadow-lg z-50 hidden transition-all duration-300";
		button.innerHTML = '<i class="fas fa-sync-alt mr-2"></i>Atualizar';
		button.onclick = () => this.updatePWA();

		document.body.appendChild(button);
	}

	showInstallButton() {
		const button = document.getElementById("pwa-install-button");
		if (button && !this.isInstalled) {
			button.classList.remove("hidden");
		}
	}

	hideInstallButton() {
		const button = document.getElementById("pwa-install-button");
		if (button) {
			button.classList.add("hidden");
		}
	}

	dismissBanner() {
		const banner = document.getElementById("pwa-install-banner");
		if (banner) {
			banner.classList.add("-translate-y-full");
			setTimeout(() => {
				banner.remove();
			}, 300);
		}

		localStorage.setItem("pwa-banner-dismissed", "true");
	}

	// ==============================================
	// ATUALIZAÇÕES
	// ==============================================

	showUpdateAvailable() {
		const button = document.getElementById("pwa-update-button");
		if (button) {
			button.classList.remove("hidden");
		}

		this.showNotification("Nova versão disponível!", "info", {
			action: "Atualizar",
			callback: () => this.updatePWA(),
		});
	}

	async updatePWA() {
		try {
			const registration =
				await navigator.serviceWorker.getRegistration();

			if (registration && registration.waiting) {
				// Enviar mensagem para o service worker ativar
				registration.waiting.postMessage({ type: "SKIP_WAITING" });

				// Recarregar página após ativação
				navigator.serviceWorker.addEventListener(
					"controllerchange",
					() => {
						window.location.reload();
					}
				);
			}
		} catch (error) {
			console.error("❌ Erro na atualização:", error);
		}
	}

	// ==============================================
	// INSTRUÇÕES MANUAIS
	// ==============================================

	showInstallInstructions() {
		const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
		const isAndroid = /Android/.test(navigator.userAgent);

		let instructions = "";

		if (isIOS) {
			instructions = `
                <div class="text-center">
                    <h3 class="font-bold mb-4">Como instalar no iOS:</h3>
                    <ol class="text-left space-y-2">
                        <li>1. Toque no botão <i class="fas fa-share"></i> (Compartilhar)</li>
                        <li>2. Role para baixo e toque em "Adicionar à Tela de Início"</li>
                        <li>3. Toque em "Adicionar" no canto superior direito</li>
                    </ol>
                </div>
            `;
		} else if (isAndroid) {
			instructions = `
                <div class="text-center">
                    <h3 class="font-bold mb-4">Como instalar no Android:</h3>
                    <ol class="text-left space-y-2">
                        <li>1. Toque no menu <i class="fas fa-ellipsis-v"></i> do navegador</li>
                        <li>2. Selecione "Adicionar à tela inicial"</li>
                        <li>3. Toque em "Adicionar"</li>
                    </ol>
                </div>
            `;
		} else {
			instructions = `
                <div class="text-center">
                    <h3 class="font-bold mb-4">Como instalar no Desktop:</h3>
                    <ol class="text-left space-y-2">
                        <li>1. Clique no ícone <i class="fas fa-download"></i> na barra de endereços</li>
                        <li>2. Ou use Ctrl+Shift+A (Chrome)</li>
                        <li>3. Clique em "Instalar"</li>
                    </ol>
                </div>
            `;
		}

		this.showModal("Instalar App", instructions);
	}

	// ==============================================
	// UTILITÁRIOS
	// ==============================================

	showNotification(message, type = "info", options = {}) {
		// Criar notificação toast
		const toast = document.createElement("div");
		toast.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 transition-all duration-300 transform translate-x-full`;

		const colors = {
			success: "bg-green-500 text-white",
			error: "bg-red-500 text-white",
			warning: "bg-yellow-500 text-black",
			info: "bg-blue-500 text-white",
		};

		toast.className += ` ${colors[type]}`;

		let content = `<div class="flex items-center">${message}</div>`;

		if (options.action) {
			content += `
                <button onclick="this.parentElement.remove(); (${options.callback})()" 
                        class="ml-4 underline hover:no-underline">
                    ${options.action}
                </button>
            `;
		}

		toast.innerHTML = content;
		document.body.appendChild(toast);

		// Mostrar toast
		setTimeout(() => {
			toast.classList.remove("translate-x-full");
		}, 100);

		// Remover toast após 5 segundos
		setTimeout(() => {
			toast.classList.add("translate-x-full");
			setTimeout(() => {
				toast.remove();
			}, 300);
		}, 5000);
	}

	showModal(title, content) {
		const modal = document.createElement("div");
		modal.className =
			"fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";
		modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 max-w-md mx-4">
                <h3 class="text-xl font-bold mb-4">${title}</h3>
                <div class="mb-6">${content}</div>
                <button onclick="this.closest('.fixed').remove()" 
                        class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded">
                    Entendi
                </button>
            </div>
        `;

		document.body.appendChild(modal);
	}

	trackInstallation() {
		// Analytics de instalação (implementar conforme necessário)
		console.log("📊 PWA instalado - enviando analytics");

		// Exemplo com Google Analytics
		if (typeof gtag !== "undefined") {
			gtag("event", "pwa_install", {
				event_category: "PWA",
				event_label: "Installation",
			});
		}
	}

	// ==============================================
	// API PÚBLICA
	// ==============================================

	getStatus() {
		return {
			isInstalled: this.isInstalled,
			isStandalone: this.isStandalone,
			canInstall: !!this.deferredPrompt,
			serviceWorkerSupported: "serviceWorker" in navigator,
		};
	}

	async checkForUpdates() {
		if ("serviceWorker" in navigator) {
			const registration =
				await navigator.serviceWorker.getRegistration();
			if (registration) {
				await registration.update();
			}
		}
	}
}

// Inicializar PWA Installer
const pwaInstaller = new PWAInstaller();

// Tornar disponível globalmente
window.pwaInstaller = pwaInstaller;

// Exportar para módulos
if (typeof module !== "undefined" && module.exports) {
	module.exports = PWAInstaller;
}
