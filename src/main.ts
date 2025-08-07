// ==============================================
// APLICAÇÃO PRINCIPAL - TYPESCRIPT + FIREBASE
// ==============================================

import { firebaseConfig, neighborhoods } from './config.js';
import { FirebaseService } from './firebase.js';
import { AppData, PersonRecord } from './types.js';

// ==============================================
// VARIÁVEIS GLOBAIS
// ==============================================

let firebaseService: FirebaseService;

const appData: AppData = {
	records: [],
	neighborhoods,
	currentRecordId: null,
	isEditMode: false,
	currentPage: 1,
	recordsPerPage: 6,
	peer: null,
	peerId: null,
	connections: [],
	syncEnabled: false,
	lastSyncTime: null,
};

// ==============================================
// INICIALIZAÇÃO
// ==============================================

document.addEventListener("DOMContentLoaded", async (): Promise<void> => {
	try {
		// Inicializar Firebase
		firebaseService = new FirebaseService(firebaseConfig);
		
		// Aguardar um pouco para autenticação
		await new Promise(resolve => setTimeout(resolve, 2000));
		
		// Carregar dados
		await loadDataFromFirebase();
		
		// Configurar sincronização em tempo real
		setupRealtimeSync();
		
		// Configurar interface
		setupEventListeners();
		updateUI();
		updateYearFilterOptions();
		updateForwardingFilterOptions();
		
		console.log('Aplicação inicializada com sucesso!');
	} catch (error) {
		console.error('Erro na inicialização:', error);
		// Fallback para modo offline
		loadData();
		setupEventListeners();
		updateUI();
	}
});

// ==============================================
// CONFIGURAÇÃO DE EVENTOS
// ==============================================

function setupEventListeners(): void {
	// Dropdowns de bairro
	const citySelect = document.getElementById("city") as HTMLSelectElement;
	const searchCitySelect = document.getElementById("searchCity") as HTMLSelectElement;
	
	citySelect?.addEventListener("change", updateNeighborhoods);
	searchCitySelect?.addEventListener("change", updateSearchNeighborhoods);

	// Cálculo da idade
	const dobInput = document.getElementById("dob") as HTMLInputElement;
	dobInput?.addEventListener("change", calculateAge);

	// Formulário
	const registrationForm = document.getElementById("registrationForm") as HTMLFormElement;
	const clearFormBtn = document.getElementById("clearFormBtn") as HTMLButtonElement;
	
	registrationForm?.addEventListener("submit", handleFormSubmit);
	clearFormBtn?.addEventListener("click", clearForm);

	// Busca
	const searchBtn = document.getElementById("searchBtn") as HTMLButtonElement;
	const clearSearchBtn = document.getElementById("clearSearchBtn") as HTMLButtonElement;
	
	searchBtn?.addEventListener("click", applyFilters);
	clearSearchBtn?.addEventListener("click", clearSearchFilters);

	// Abas
	const searchTabBtn = document.getElementById("searchTabBtn") as HTMLButtonElement;
	const statsTabBtn = document.getElementById("statsTabBtn") as HTMLButtonElement;
	
	searchTabBtn?.addEventListener("click", showSearchTab);
	statsTabBtn?.addEventListener("click", showStatsTab);

	// Exportação e importação
	const exportBtn = document.getElementById("exportBtn") as HTMLButtonElement;
	const importInput = document.getElementById("importInput") as HTMLInputElement;
	
	exportBtn?.addEventListener("click", exportData);
	importInput?.addEventListener("change", importData);

	// Paginação
	const prevPageBtn = document.getElementById("prevPage") as HTMLButtonElement;
	const nextPageBtn = document.getElementById("nextPage") as HTMLButtonElement;
	
	prevPageBtn?.addEventListener("click", goToPrevPage);
	nextPageBtn?.addEventListener("click", goToNextPage);
}

// ==============================================
// FUNÇÕES DE DADOS COM FIREBASE
// ==============================================

async function loadDataFromFirebase(): Promise<void> {
	try {
		const records = await firebaseService.loadRecords();
		appData.records = records;
		updateTotalRecords();
		console.log(`${records.length} registros carregados do Firebase`);
	} catch (error) {
		console.error('Erro ao carregar do Firebase:', error);
		loadData(); // Fallback
	}
}

function setupRealtimeSync(): void {
	firebaseService.setupRealtimeSync((records: PersonRecord[]) => {
		appData.records = records;
		updateTotalRecords();
		updateUI();
		updateStatistics();
	});
}

function loadData(): void {
	const savedData = localStorage.getItem("personalRecords");
	if (savedData) {
		appData.records = JSON.parse(savedData) as PersonRecord[];
		updateTotalRecords();
	}
}

function saveData(): void {
	localStorage.setItem("personalRecords", JSON.stringify(appData.records));
	updateTotalRecords();
	updateStatistics();
	updateYearFilterOptions();
	updateForwardingFilterOptions();
}

function updateTotalRecords(): void {
	const total = appData.records.length;
	const totalRecordsElement = document.getElementById("totalRecords");
	const statsTotalRecordsElement = document.getElementById("statsTotalRecords");
	
	if (totalRecordsElement) totalRecordsElement.textContent = total.toString();
	if (statsTotalRecordsElement) statsTotalRecordsElement.textContent = total.toString();
}

// ==============================================
// FUNÇÕES DO FORMULÁRIO
// ==============================================

async function handleFormSubmit(e: Event): Promise<void> {
	e.preventDefault();

	const formData: PersonRecord = {
		id: Date.now().toString(),
		fullName: (document.getElementById("fullName") as HTMLInputElement)?.value.trim() || "",
		origin: (document.getElementById("origin") as HTMLSelectElement)?.value as PersonRecord['origin'] || "MSE",
		dob: (document.getElementById("dob") as HTMLInputElement)?.value || "",
		age: parseInt((document.getElementById("age") as HTMLInputElement)?.value || "0") || 0,
		city: (document.getElementById("city") as HTMLSelectElement)?.value || "",
		neighborhood: (document.getElementById("neighborhood") as HTMLSelectElement)?.value || "",
		education: (document.getElementById("education") as HTMLSelectElement)?.value || "",
		status: (document.getElementById("status") as HTMLSelectElement)?.value as PersonRecord['status'] || "Em Análise",
		referenceName: (document.getElementById("referenceName") as HTMLInputElement)?.value.trim() || "",
		forwarding: (document.getElementById("forwarding") as HTMLInputElement)?.value.trim() || "",
		observation: (document.getElementById("observation") as HTMLTextAreaElement)?.value.trim() || "",
		createdAt: new Date().toISOString(),
		timestamp: new Date().toISOString(),
	};

	// Validação
	if (!formData.fullName || !formData.origin || !formData.dob || !formData.city || !formData.neighborhood) {
		alert("Por favor, preencha todos os campos obrigatórios.");
		return;
	}

	// Verificar duplicatas
	const isDuplicate = appData.records.some((record: PersonRecord) => 
		record.fullName.toLowerCase() === formData.fullName.toLowerCase() && record.dob === formData.dob
	);

	if (isDuplicate) {
		alert("Já existe um registro com este nome e data de nascimento.");
		return;
	}

	// Adicionar registro
	appData.records.unshift(formData);
	saveData();
	
	// Salvar no Firebase
	try {
		await firebaseService.saveRecord(formData);
	} catch (error) {
		console.error('Erro ao salvar no Firebase:', error);
	}
	
	updateUI();
	clearForm();
	showSuccessMessage("Registro salvo com sucesso!");
}

function clearForm(): void {
	const form = document.getElementById("registrationForm") as HTMLFormElement;
	const ageInput = document.getElementById("age") as HTMLInputElement;
	const neighborhoodSelect = document.getElementById("neighborhood") as HTMLSelectElement;
	
	form?.reset();
	if (ageInput) ageInput.value = "";
	if (neighborhoodSelect) {
		neighborhoodSelect.innerHTML = '<option value="">Selecione a cidade primeiro</option>';
	}
}

function calculateAge(): void {
	const dobInput = document.getElementById("dob") as HTMLInputElement;
	const ageInput = document.getElementById("age") as HTMLInputElement;
	
	if (!dobInput?.value || !ageInput) return;

	const birthDate = new Date(dobInput.value);
	const today = new Date();
	let age = today.getFullYear() - birthDate.getFullYear();
	const monthDiff = today.getMonth() - birthDate.getMonth();

	if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
		age--;
	}

	ageInput.value = age.toString();
}

// ==============================================
// FUNÇÕES DE INTERFACE
// ==============================================

function updateNeighborhoods(): void {
	const citySelect = document.getElementById("city") as HTMLSelectElement;
	const neighborhoodSelect = document.getElementById("neighborhood") as HTMLSelectElement;
	
	if (!citySelect || !neighborhoodSelect) return;
	
	const selectedCity = citySelect.value;
	neighborhoodSelect.innerHTML = '<option value="">Selecione...</option>';

	if (selectedCity && appData.neighborhoods[selectedCity]) {
		appData.neighborhoods[selectedCity].forEach((neighborhood: string) => {
			const option = document.createElement("option");
			option.value = neighborhood;
			option.textContent = neighborhood;
			neighborhoodSelect.appendChild(option);
		});
	}
}

function updateSearchNeighborhoods(): void {
	const citySelect = document.getElementById("searchCity") as HTMLSelectElement;
	const neighborhoodSelect = document.getElementById("searchNeighborhood") as HTMLSelectElement;
	
	if (!citySelect || !neighborhoodSelect) return;
	
	const selectedCity = citySelect.value;
	neighborhoodSelect.innerHTML = '<option value="">Todos</option>';

	if (selectedCity && appData.neighborhoods[selectedCity]) {
		appData.neighborhoods[selectedCity].forEach((neighborhood: string) => {
			const option = document.createElement("option");
			option.value = neighborhood;
			option.textContent = neighborhood;
			neighborhoodSelect.appendChild(option);
		});
	}
}

function updateUI(): void {
	const filteredRecords = getFilteredRecords();
	updateRecordsTable(filteredRecords);
	updatePagination(filteredRecords);
}

function getFilteredRecords(): PersonRecord[] {
	const nameFilter = (document.getElementById("searchName") as HTMLInputElement)?.value.toLowerCase() || "";
	const cityFilter = (document.getElementById("searchCity") as HTMLSelectElement)?.value || "";
	const neighborhoodFilter = (document.getElementById("searchNeighborhood") as HTMLSelectElement)?.value || "";
	const originFilter = (document.getElementById("searchOrigin") as HTMLSelectElement)?.value || "";
	const statusFilter = (document.getElementById("searchStatus") as HTMLSelectElement)?.value || "";

	return appData.records.filter((record: PersonRecord) => {
		if (nameFilter && !record.fullName.toLowerCase().includes(nameFilter)) return false;
		if (cityFilter && record.city !== cityFilter) return false;
		if (neighborhoodFilter && record.neighborhood !== neighborhoodFilter) return false;
		if (originFilter && record.origin !== originFilter) return false;
		if (statusFilter && record.status !== statusFilter) return false;
		return true;
	});
}

// ==============================================
// FUNÇÕES AUXILIARES
// ==============================================

function showSuccessMessage(message: string): void {
	// Criar elemento de notificação
	const notification = document.createElement('div');
	notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
	notification.innerHTML = `<i class="fas fa-check mr-2"></i>${message}`;
	
	document.body.appendChild(notification);
	
	// Remover após 3 segundos
	setTimeout(() => {
		notification.remove();
	}, 3000);
}

function formatDate(dateString: string): string {
	return new Date(dateString).toLocaleDateString("pt-BR");
}

function formatDateTime(dateString: string): string {
	return new Date(dateString).toLocaleString("pt-BR");
}

// ==============================================
// FUNÇÕES GLOBAIS (para onclick no HTML)
// ==============================================

// Tornar funções disponíveis globalmente
(window as any).viewRecord = (id: string) => console.log('View record:', id);
(window as any).editRecordFromTable = (id: string) => console.log('Edit record:', id);
(window as any).deleteRecordFromTable = async (id: string) => {
	const record = appData.records.find(r => r.id === id);
	if (record && confirm('Tem certeza que deseja excluir este registro?')) {
		appData.records = appData.records.filter(r => r.id !== id);
		saveData();
		
		try {
			await firebaseService.deleteRecord(id, record.firebaseId);
		} catch (error) {
			console.error('Erro ao deletar do Firebase:', error);
		}
		
		updateUI();
		showSuccessMessage('Registro excluído com sucesso!');
	}
};

// Implementar outras funções conforme necessário...
function updateRecordsTable(records: PersonRecord[]): void {
	// Implementação da tabela
	console.log('Updating table with', records.length, 'records');
}

function updatePagination(records: PersonRecord[]): void {
	// Implementação da paginação
	console.log('Updating pagination for', records.length, 'records');
}

function updateYearFilterOptions(): void {
	// Implementação dos filtros de ano
}

function updateForwardingFilterOptions(): void {
	// Implementação dos filtros de encaminhamento
}

function updateStatistics(): void {
	// Implementação das estatísticas
}

function applyFilters(): void {
	appData.currentPage = 1;
	updateUI();
}

function clearSearchFilters(): void {
	// Limpar filtros
	updateUI();
}

function showSearchTab(): void {
	// Mostrar aba de busca
}

function showStatsTab(): void {
	// Mostrar aba de estatísticas
}

function exportData(): void {
	// Exportar dados
}

function importData(event: Event): void {
	// Importar dados
}

function goToPrevPage(): void {
	if (appData.currentPage > 1) {
		appData.currentPage--;
		updateUI();
	}
}

function goToNextPage(): void {
	const filteredRecords = getFilteredRecords();
	const totalPages = Math.ceil(filteredRecords.length / appData.recordsPerPage);
	
	if (appData.currentPage < totalPages) {
		appData.currentPage++;
		updateUI();
	}
}