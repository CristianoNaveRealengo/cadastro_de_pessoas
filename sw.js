// ==============================================
// SERVICE WORKER - PWA CADASTRO PESSOAL
// ==============================================

const CACHE_NAME = "cadastro-pessoal-v1.0.0";
const OFFLINE_URL = "/offline.html";

// Arquivos essenciais para cache
const ESSENTIAL_FILES = [
	"/",
	"/index.html",
	"/login.html",
	"/offline.html",
	"/manifest.json",
	"/assets/css/style.css",
	"/assets/js/app.js",
	"/config/firebase-secure.config.js",
	"/fix-async-listener-error.js",
];

// Recursos externos (CDN)
const EXTERNAL_RESOURCES = [
	"https://cdn.tailwindcss.com",
	"https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",
];

// Recursos do Firebase
const FIREBASE_RESOURCES = [
	"https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js",
	"https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js",
	"https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js",
];

// Todos os recursos para cache
const CACHE_RESOURCES = [
	...ESSENTIAL_FILES,
	...EXTERNAL_RESOURCES,
	...FIREBASE_RESOURCES,
];

// ==============================================
// INSTALAÇÃO DO SERVICE WORKER
// ==============================================

self.addEventListener("install", (event) => {
	console.log("🔧 Service Worker: Instalando...");

	event.waitUntil(
		(async () => {
			try {
				const cache = await caches.open(CACHE_NAME);

				// Cache recursos essenciais primeiro
				console.log("📦 Cacheando recursos essenciais...");
				await cache.addAll(ESSENTIAL_FILES);

				// Cache recursos externos (pode falhar, não é crítico)
				console.log("🌐 Cacheando recursos externos...");
				await Promise.allSettled(
					[...EXTERNAL_RESOURCES, ...FIREBASE_RESOURCES].map(
						async (url) => {
							try {
								const response = await fetch(url, {
									mode: "cors",
								});
								if (response.ok) {
									await cache.put(url, response);
								}
							} catch (error) {
								console.warn(
									`⚠️ Falha ao cachear ${url}:`,
									error
								);
							}
						}
					)
				);

				console.log("✅ Service Worker instalado com sucesso");

				// Forçar ativação imediata
				self.skipWaiting();
			} catch (error) {
				console.error(
					"❌ Erro na instalação do Service Worker:",
					error
				);
			}
		})()
	);
});

// ==============================================
// ATIVAÇÃO DO SERVICE WORKER
// ==============================================

self.addEventListener("activate", (event) => {
	console.log("🚀 Service Worker: Ativando...");

	event.waitUntil(
		(async () => {
			try {
				// Limpar caches antigos
				const cacheNames = await caches.keys();
				await Promise.all(
					cacheNames
						.filter((cacheName) => cacheName !== CACHE_NAME)
						.map((cacheName) => {
							console.log(
								`🗑️ Removendo cache antigo: ${cacheName}`
							);
							return caches.delete(cacheName);
						})
				);

				// Tomar controle de todas as abas
				await self.clients.claim();

				console.log("✅ Service Worker ativado");

				// Notificar clientes sobre a ativação
				const clients = await self.clients.matchAll();
				clients.forEach((client) => {
					client.postMessage({
						type: "SW_ACTIVATED",
						message: "Service Worker ativado com sucesso",
					});
				});
			} catch (error) {
				console.error("❌ Erro na ativação do Service Worker:", error);
			}
		})()
	);
});

// ==============================================
// INTERCEPTAÇÃO DE REQUISIÇÕES
// ==============================================

self.addEventListener("fetch", (event) => {
	// Ignorar requisições não-GET
	if (event.request.method !== "GET") {
		return;
	}

	// Ignorar requisições do Firebase Auth (precisam ser sempre online)
	if (
		event.request.url.includes("identitytoolkit.googleapis.com") ||
		event.request.url.includes("securetoken.googleapis.com")
	) {
		return;
	}

	event.respondWith(handleFetch(event.request));
});

async function handleFetch(request) {
	const url = new URL(request.url);

	try {
		// Estratégia: Cache First para recursos estáticos
		if (isStaticResource(url)) {
			return await cacheFirst(request);
		}

		// Estratégia: Network First para APIs e dados dinâmicos
		if (isApiRequest(url)) {
			return await networkFirst(request);
		}

		// Estratégia: Stale While Revalidate para páginas HTML
		if (isHtmlRequest(url)) {
			return await staleWhileRevalidate(request);
		}

		// Estratégia padrão: Network First
		return await networkFirst(request);
	} catch (error) {
		console.error("❌ Erro no fetch:", error);

		// Fallback para página offline
		if (isHtmlRequest(url)) {
			const cache = await caches.open(CACHE_NAME);
			return (
				(await cache.match(OFFLINE_URL)) ||
				new Response("Offline", { status: 503 })
			);
		}

		return new Response("Recurso não disponível offline", { status: 503 });
	}
}

// ==============================================
// ESTRATÉGIAS DE CACHE
// ==============================================

// Cache First - Para recursos estáticos
async function cacheFirst(request) {
	const cache = await caches.open(CACHE_NAME);
	const cachedResponse = await cache.match(request);

	if (cachedResponse) {
		return cachedResponse;
	}

	try {
		const networkResponse = await fetch(request);
		if (networkResponse.ok) {
			cache.put(request, networkResponse.clone());
		}
		return networkResponse;
	} catch (error) {
		throw error;
	}
}

// Network First - Para APIs e dados dinâmicos
async function networkFirst(request) {
	try {
		const networkResponse = await fetch(request);

		if (networkResponse.ok) {
			const cache = await caches.open(CACHE_NAME);
			cache.put(request, networkResponse.clone());
		}

		return networkResponse;
	} catch (error) {
		const cache = await caches.open(CACHE_NAME);
		const cachedResponse = await cache.match(request);

		if (cachedResponse) {
			return cachedResponse;
		}

		throw error;
	}
}

// Stale While Revalidate - Para páginas HTML
async function staleWhileRevalidate(request) {
	const cache = await caches.open(CACHE_NAME);
	const cachedResponse = await cache.match(request);

	// Buscar nova versão em background
	const fetchPromise = fetch(request)
		.then((response) => {
			if (response.ok) {
				cache.put(request, response.clone());
			}
			return response;
		})
		.catch(() => {
			// Ignorar erros de rede em background
		});

	// Retornar cache imediatamente se disponível
	if (cachedResponse) {
		return cachedResponse;
	}

	// Se não há cache, aguardar network
	return await fetchPromise;
}

// ==============================================
// UTILITÁRIOS
// ==============================================

function isStaticResource(url) {
	return url.pathname.match(
		/\.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/
	);
}

function isApiRequest(url) {
	return (
		url.pathname.startsWith("/api/") ||
		url.hostname.includes("firestore.googleapis.com") ||
		url.hostname.includes("firebase.googleapis.com")
	);
}

function isHtmlRequest(url) {
	return (
		url.pathname.endsWith(".html") ||
		url.pathname === "/" ||
		!url.pathname.includes(".")
	);
}

// ==============================================
// SINCRONIZAÇÃO EM BACKGROUND
// ==============================================

self.addEventListener("sync", (event) => {
	console.log("🔄 Background Sync:", event.tag);

	if (event.tag === "background-sync-records") {
		event.waitUntil(syncRecords());
	}
});

async function syncRecords() {
	try {
		console.log("🔄 Sincronizando registros em background...");

		// Notificar clientes sobre sincronização
		const clients = await self.clients.matchAll();
		clients.forEach((client) => {
			client.postMessage({
				type: "BACKGROUND_SYNC",
				message: "Sincronizando dados...",
			});
		});

		// Aqui você pode implementar a lógica de sincronização
		// Por exemplo, enviar dados pendentes para o Firebase

		console.log("✅ Sincronização em background concluída");
	} catch (error) {
		console.error("❌ Erro na sincronização em background:", error);
	}
}

// ==============================================
// NOTIFICAÇÕES PUSH
// ==============================================

self.addEventListener("push", (event) => {
	console.log("📱 Push notification recebida:", event);

	const options = {
		body: event.data
			? event.data.text()
			: "Nova notificação do Sistema de Cadastro",
		icon: "/assets/icons/icon-192x192.png",
		badge: "/assets/icons/badge-72x72.png",
		vibrate: [100, 50, 100],
		data: {
			dateOfArrival: Date.now(),
			primaryKey: 1,
		},
		actions: [
			{
				action: "explore",
				title: "Abrir Sistema",
				icon: "/assets/icons/action-explore.png",
			},
			{
				action: "close",
				title: "Fechar",
				icon: "/assets/icons/action-close.png",
			},
		],
	};

	event.waitUntil(
		self.registration.showNotification("Sistema de Cadastro", options)
	);
});

self.addEventListener("notificationclick", (event) => {
	console.log("🔔 Notificação clicada:", event);

	event.notification.close();

	if (event.action === "explore") {
		event.waitUntil(clients.openWindow("/"));
	}
});

// ==============================================
// MENSAGENS DO CLIENTE
// ==============================================

self.addEventListener("message", (event) => {
	console.log("💬 Mensagem recebida:", event.data);

	if (event.data && event.data.type === "SKIP_WAITING") {
		self.skipWaiting();
	}

	if (event.data && event.data.type === "GET_VERSION") {
		event.ports[0].postMessage({
			version: CACHE_NAME,
			timestamp: new Date().toISOString(),
		});
	}
});

// ==============================================
// TRATAMENTO DE ERROS
// ==============================================

self.addEventListener("error", (event) => {
	console.error("❌ Erro no Service Worker:", event.error);
});

self.addEventListener("unhandledrejection", (event) => {
	console.error("❌ Promise rejeitada no Service Worker:", event.reason);
	event.preventDefault();
});

console.log("🚀 Service Worker carregado:", CACHE_NAME);
