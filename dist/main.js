// ==============================================
// APLICAÇÃO PRINCIPAL - TYPESCRIPT + FIREBASE
// ==============================================
import { firebaseConfig, neighborhoods } from './config.js';
import { FirebaseService } from './firebase.js';
// ==============================================
// VARIÁVEIS GLOBAIS
// ==============================================
let firebaseService;
const appData = {
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
document.addEventListener("DOMContentLoaded", async () => {
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
    }
    catch (error) {
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
function setupEventListeners() {
    // Dropdowns de bairro
    const citySelect = document.getElementById("city");
    const searchCitySelect = document.getElementById("searchCity");
    citySelect?.addEventListener("change", updateNeighborhoods);
    searchCitySelect?.addEventListener("change", updateSearchNeighborhoods);
    // Cálculo da idade
    const dobInput = document.getElementById("dob");
    dobInput?.addEventListener("change", calculateAge);
    // Formulário
    const registrationForm = document.getElementById("registrationForm");
    const clearFormBtn = document.getElementById("clearFormBtn");
    registrationForm?.addEventListener("submit", handleFormSubmit);
    clearFormBtn?.addEventListener("click", clearForm);
    // Busca
    const searchBtn = document.getElementById("searchBtn");
    const clearSearchBtn = document.getElementById("clearSearchBtn");
    searchBtn?.addEventListener("click", applyFilters);
    clearSearchBtn?.addEventListener("click", clearSearchFilters);
    // Abas
    const searchTabBtn = document.getElementById("searchTabBtn");
    const statsTabBtn = document.getElementById("statsTabBtn");
    searchTabBtn?.addEventListener("click", showSearchTab);
    statsTabBtn?.addEventListener("click", showStatsTab);
    // Exportação e importação
    const exportBtn = document.getElementById("exportBtn");
    const importInput = document.getElementById("importInput");
    exportBtn?.addEventListener("click", exportData);
    importInput?.addEventListener("change", importData);
    // Paginação
    const prevPageBtn = document.getElementById("prevPage");
    const nextPageBtn = document.getElementById("nextPage");
    prevPageBtn?.addEventListener("click", goToPrevPage);
    nextPageBtn?.addEventListener("click", goToNextPage);
}
// ==============================================
// FUNÇÕES DE DADOS COM FIREBASE
// ==============================================
async function loadDataFromFirebase() {
    try {
        const records = await firebaseService.loadRecords();
        appData.records = records;
        updateTotalRecords();
        console.log(`${records.length} registros carregados do Firebase`);
    }
    catch (error) {
        console.error('Erro ao carregar do Firebase:', error);
        loadData(); // Fallback
    }
}
function setupRealtimeSync() {
    firebaseService.setupRealtimeSync((records) => {
        appData.records = records;
        updateTotalRecords();
        updateUI();
        updateStatistics();
    });
}
function loadData() {
    const savedData = localStorage.getItem("personalRecords");
    if (savedData) {
        appData.records = JSON.parse(savedData);
        updateTotalRecords();
    }
}
function saveData() {
    localStorage.setItem("personalRecords", JSON.stringify(appData.records));
    updateTotalRecords();
    updateStatistics();
    updateYearFilterOptions();
    updateForwardingFilterOptions();
}
function updateTotalRecords() {
    const total = appData.records.length;
    const totalRecordsElement = document.getElementById("totalRecords");
    const statsTotalRecordsElement = document.getElementById("statsTotalRecords");
    if (totalRecordsElement)
        totalRecordsElement.textContent = total.toString();
    if (statsTotalRecordsElement)
        statsTotalRecordsElement.textContent = total.toString();
}
// ==============================================
// FUNÇÕES DO FORMULÁRIO
// ==============================================
async function handleFormSubmit(e) {
    e.preventDefault();
    const formData = {
        id: Date.now().toString(),
        fullName: document.getElementById("fullName")?.value.trim() || "",
        origin: document.getElementById("origin")?.value || "MSE",
        dob: document.getElementById("dob")?.value || "",
        age: parseInt(document.getElementById("age")?.value || "0") || 0,
        city: document.getElementById("city")?.value || "",
        neighborhood: document.getElementById("neighborhood")?.value || "",
        education: document.getElementById("education")?.value || "",
        status: document.getElementById("status")?.value || "Em Análise",
        referenceName: document.getElementById("referenceName")?.value.trim() || "",
        forwarding: document.getElementById("forwarding")?.value.trim() || "",
        observation: document.getElementById("observation")?.value.trim() || "",
        createdAt: new Date().toISOString(),
        timestamp: new Date().toISOString(),
    };
    // Validação
    if (!formData.fullName || !formData.origin || !formData.dob || !formData.city || !formData.neighborhood) {
        alert("Por favor, preencha todos os campos obrigatórios.");
        return;
    }
    // Verificar duplicatas
    const isDuplicate = appData.records.some((record) => record.fullName.toLowerCase() === formData.fullName.toLowerCase() && record.dob === formData.dob);
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
    }
    catch (error) {
        console.error('Erro ao salvar no Firebase:', error);
    }
    updateUI();
    clearForm();
    showSuccessMessage("Registro salvo com sucesso!");
}
function clearForm() {
    const form = document.getElementById("registrationForm");
    const ageInput = document.getElementById("age");
    const neighborhoodSelect = document.getElementById("neighborhood");
    form?.reset();
    if (ageInput)
        ageInput.value = "";
    if (neighborhoodSelect) {
        neighborhoodSelect.innerHTML = '<option value="">Selecione a cidade primeiro</option>';
    }
}
function calculateAge() {
    const dobInput = document.getElementById("dob");
    const ageInput = document.getElementById("age");
    if (!dobInput?.value || !ageInput)
        return;
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
function updateNeighborhoods() {
    const citySelect = document.getElementById("city");
    const neighborhoodSelect = document.getElementById("neighborhood");
    if (!citySelect || !neighborhoodSelect)
        return;
    const selectedCity = citySelect.value;
    neighborhoodSelect.innerHTML = '<option value="">Selecione...</option>';
    if (selectedCity && appData.neighborhoods[selectedCity]) {
        appData.neighborhoods[selectedCity].forEach((neighborhood) => {
            const option = document.createElement("option");
            option.value = neighborhood;
            option.textContent = neighborhood;
            neighborhoodSelect.appendChild(option);
        });
    }
}
function updateSearchNeighborhoods() {
    const citySelect = document.getElementById("searchCity");
    const neighborhoodSelect = document.getElementById("searchNeighborhood");
    if (!citySelect || !neighborhoodSelect)
        return;
    const selectedCity = citySelect.value;
    neighborhoodSelect.innerHTML = '<option value="">Todos</option>';
    if (selectedCity && appData.neighborhoods[selectedCity]) {
        appData.neighborhoods[selectedCity].forEach((neighborhood) => {
            const option = document.createElement("option");
            option.value = neighborhood;
            option.textContent = neighborhood;
            neighborhoodSelect.appendChild(option);
        });
    }
}
function updateUI() {
    const filteredRecords = getFilteredRecords();
    updateRecordsTable(filteredRecords);
    updatePagination(filteredRecords);
}
function getFilteredRecords() {
    const nameFilter = document.getElementById("searchName")?.value.toLowerCase() || "";
    const cityFilter = document.getElementById("searchCity")?.value || "";
    const neighborhoodFilter = document.getElementById("searchNeighborhood")?.value || "";
    const originFilter = document.getElementById("searchOrigin")?.value || "";
    const statusFilter = document.getElementById("searchStatus")?.value || "";
    return appData.records.filter((record) => {
        if (nameFilter && !record.fullName.toLowerCase().includes(nameFilter))
            return false;
        if (cityFilter && record.city !== cityFilter)
            return false;
        if (neighborhoodFilter && record.neighborhood !== neighborhoodFilter)
            return false;
        if (originFilter && record.origin !== originFilter)
            return false;
        if (statusFilter && record.status !== statusFilter)
            return false;
        return true;
    });
}
// ==============================================
// FUNÇÕES AUXILIARES
// ==============================================
function showSuccessMessage(message) {
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
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString("pt-BR");
}
function formatDateTime(dateString) {
    return new Date(dateString).toLocaleString("pt-BR");
}
// ==============================================
// FUNÇÕES GLOBAIS (para onclick no HTML)
// ==============================================
// Tornar funções disponíveis globalmente
window.viewRecord = (id) => console.log('View record:', id);
window.editRecordFromTable = (id) => console.log('Edit record:', id);
window.deleteRecordFromTable = async (id) => {
    const record = appData.records.find(r => r.id === id);
    if (record && confirm('Tem certeza que deseja excluir este registro?')) {
        appData.records = appData.records.filter(r => r.id !== id);
        saveData();
        try {
            await firebaseService.deleteRecord(id, record.firebaseId);
        }
        catch (error) {
            console.error('Erro ao deletar do Firebase:', error);
        }
        updateUI();
        showSuccessMessage('Registro excluído com sucesso!');
    }
};
// Implementar outras funções conforme necessário...
function updateRecordsTable(records) {
    // Implementação da tabela
    console.log('Updating table with', records.length, 'records');
}
function updatePagination(records) {
    // Implementação da paginação
    console.log('Updating pagination for', records.length, 'records');
}
function updateYearFilterOptions() {
    // Implementação dos filtros de ano
}
function updateForwardingFilterOptions() {
    // Implementação dos filtros de encaminhamento
}
function updateStatistics() {
    // Implementação das estatísticas
}
function applyFilters() {
    appData.currentPage = 1;
    updateUI();
}
function clearSearchFilters() {
    // Limpar filtros
    updateUI();
}
function showSearchTab() {
    // Mostrar aba de busca
}
function showStatsTab() {
    // Mostrar aba de estatísticas
}
function exportData() {
    // Exportar dados
}
function importData(event) {
    // Importar dados
}
function goToPrevPage() {
    if (appData.currentPage > 1) {
        appData.currentPage--;
        updateUI();
    }
}
function goToNextPage() {
    const filteredRecords = getFilteredRecords();
    const totalPages = Math.ceil(filteredRecords.length / appData.recordsPerPage);
    if (appData.currentPage < totalPages) {
        appData.currentPage++;
        updateUI();
    }
}
//# sourceMappingURL=main.js.map