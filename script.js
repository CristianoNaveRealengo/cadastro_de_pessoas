// ==============================================
// INTERFACES E TIPOS
// ==============================================
// ==============================================
// VARIÁVEIS GLOBAIS E CONFIGURAÇÕES INICIAIS
// ==============================================
const appData = {
    records: [],
    neighborhoods: {
        "Rio de Janeiro": [
            "Centro",
            "Cidade Nova",
            "Estácio",
            "Catumbi",
            "Caju",
            "Gamboa",
            "Lapa",
            "Mangueira",
            "Paquetá",
            "Rio Comprido",
            "Santa Teresa",
            "Santo Cristo",
            "Saúde",
            "Vasco da Gama",
            "Botafogo",
            "Catete",
            "Copacabana",
            "Cosme Velho",
            "Flamengo",
            "Gávea",
            "Glória",
            "Humaitá",
            "Ipanema",
            "Jardim Botânico",
            "Lagoa",
            "Laranjeiras",
            "Leblon",
            "Leme",
            "Rocinha",
            "São Conrado",
            "Urca",
            "Vidigal",
            "Abolição",
            "Água Santa",
            "Anchieta",
            "Andaraí",
            "Bancários",
            "Barros Filho",
            "Bento Ribeiro",
            "Bonsucesso",
            "Brás de Pina",
            "Cachambi",
            "Cacuia",
            "Campinho",
            "Cascadura",
            "Cavalcanti",
            "Cidade Universitária",
            "Cocotá",
            "Coelho Neto",
            "Colégio",
            "Complexo do Alemão",
            "Cordovil",
            "Costa Barros",
            "Del Castilho",
            "Encantado",
            "Engenheiro Leal",
            "Engenho da Rainha",
            "Engenho de Dentro",
            "Engenho Novo",
            "Freguesia",
            "Galeão",
            "Grajaú",
            "Guadalupe",
            "Higienópolis",
            "Honório Gurgel",
            "Inhaúma",
            "Irajá",
            "Jacaré",
            "Jacarezinho",
            "Jardim América",
            "Jardim Carioca",
            "Jardim Guanabara",
            "Lins de Vasconcelos",
            "Madureira",
            "Manguinhos",
            "Maracanã",
            "Maré",
            "Marechal Hermes",
            "Maria da Graça",
            "Méier",
            "Moneró",
            "Olaria",
            "Oswaldo Cruz",
            "Parada de Lucas",
            "Parque Anchieta",
            "Parque Colúmbia",
            "Pavuna",
            "Penha",
            "Penha Circular",
            "Piedade",
            "Pilares",
            "Quintino Bocaiúva",
            "Ramos",
            "Riachuelo",
            "Ricardo de Albuquerque",
            "Rocha",
            "Rocha Miranda",
            "Sampaio",
            "São Francisco Xavier",
            "Todos os Santos",
            "Tomás Coelho",
            "Turiaçu",
            "Vaz Lobo",
            "Vicente de Carvalho",
            "Vigário Geral",
            "Vila da Penha",
            "Vila Kosmos",
            "Vista Alegre",
            "Barra de Guaratiba",
            "Campo Grande",
            "Cosmos",
            "Guaratiba",
            "Ilha de Guaratiba",
            "Inhoaíba",
            "Paciência",
            "Pedra de Guaratiba",
            "Santa Cruz",
            "Santíssimo",
            "Senador Vasconcelos",
            "Sepetiba",
            "Bangu",
            "Xerém",
            "Jardim 25 de Agosto",
            "Parque Alegre",
            "Saracuruna",
            "São Bento",
            "Neves",
            "Comendador Soares",
            "Porto da Pedra",
            "Barro Vermelho",
            "Zé Garoto",
            "Jardim Catarina",
            "Boa Esperança",
            "Itaipuaçu",
            "Vila São José",
            "Areal",
            "Peró",
            "São Cristóvão",
            "Palmeiras",
            "Monte Alegre",
            "Parque Leopoldina",
            "Santo Amaro",
            "Guarus",
            "Maria Tereza",
            "Cavaleiros",
            "Retiro",
            "Niterói",
            "Icaraí",
            "São Francisco",
            "Ingá",
            "Charitas",
            "Boa Viagem",
            "Jardim Icaraí",
            "Piabetá",
            "Três Rios",
            "Mauá",
            "Suruí",
            "Santo Aleixo",
            "Boa Sorte",
            "Xavantes",
            "Vila Valqueire",
            "São Vicente",
            "Nova Aurora",
            "Austin",
            "Comendador Soares",
            "Edson Passos",
            "Kamel",
            "Paciência",
            "Parada Independência",
            "Presidente Juscelino",
            "Três Pontes",
            "Santa Sofia",
            "Campo Lindo",
            "Alto",
            "Várzea",
            "São Pedro",
            "Meia Pataca",
            "Fonte Santa",
            "Itaipava",
            "Araras",
            "Cascatinha",
            "Valparaíso",
            "Vista Alegre",
            "Barra Mansa",
            "Paraíso",
            "Vista Alegre",
            "Centro",
            "Caxito",
            "Inoã",
            "São José do Imbassaí",
            "Muriqui",
            "Conceição de Jacareí",
            "Costazul",
            "Cidade Beira Mar",
            "Jardim Mariléa",
            "Nova Cidade",
            "Iguabinha",
            "Barbudo",
            "Salinas",
            "Espírito Santo",
            "Piratininga",
        ],
        "Angra dos Reis": [
            "Centro",
            "Japuíba",
            "Belém",
            "Frade",
            "Parque Mambucaba",
        ],
        Aperibé: ["Centro"],
        Araruama: ["Centro", "Praia Seca", "Iguabinha", "Barbudo", "Salinas"],
        Areal: ["Centro"],
        "Armação dos Búzios": ["Centro"],
        "Arraial do Cabo": ["Centro"],
        "Barra do Piraí": ["Centro"],
        "Barra Mansa": ["Centro", "Paraíso", "Vista Alegre"],
        "Belford Roxo": [
            "Centro",
            "Vila Valqueire",
            "Parque Amorim",
            "Bom Pastor",
            "Xavantes",
            "Sargento Roncalli",
            "São Vicente",
            "Nova Aurora",
        ],
        "Bom Jardim": ["Centro"],
        "Bom Jesus do Itabapoana": ["Centro"],
        "Cabo Frio": [
            "Centro",
            "Peró",
            "São Cristóvão",
            "Braga",
            "Palmeiras",
            "Monte Alegre",
        ],
        "Cachoeiras de Macacu": ["Centro"],
        Cambuci: ["Centro"],
        "Campos dos Goytacazes": [
            "Centro",
            "Jardim Carioca",
            "Parque Leopoldina",
            "Santo Amaro",
            "Guarus",
            "Maria Tereza",
        ],
        Cantagalo: ["Centro"],
        Carapebus: ["Centro"],
        "Cardoso Moreira": ["Centro"],
        Carmo: ["Centro"],
        "Casimiro de Abreu": ["Centro"],
        "Comendador Levy Gasparian": ["Centro"],
        "Conceição de Macabu": ["Centro"],
        Cordeiro: ["Centro"],
        "Duas Barras": ["Centro"],
        "Duque de Caxias": [
            "Centro",
            "Xerém",
            "Jardim 25 de Agosto",
            "Parque Alegre",
            "Campo da Mangueira",
            "Saracuruna",
            "São Bento",
        ],
        "Engenheiro Paulo de Frontin": ["Centro"],
        Guapimirim: ["Centro"],
        "Iguaba Grande": ["Centro"],
        Itaboraí: [
            "Centro",
            "Boa Esperança",
            "Itaipuaçu",
            "Vila São José",
            "Areal",
        ],
        Itaguaí: ["Centro"],
        Italva: ["Centro"],
        Itaocara: ["Centro"],
        Itaperuna: ["Centro"],
        Itatiaia: ["Centro"],
        Japeri: ["Centro"],
        "Laje do Muriaé": ["Centro"],
        Macaé: [
            "Centro",
            "Barra de Macaé",
            "Cavaleiros",
            "Parque Aeroporto",
            "Novo Cavaleiros",
        ],
        Macuco: ["Centro"],
        Magé: [
            "Centro",
            "Piabetá",
            "Três Rios",
            "Mauá",
            "Suruí",
            "Santo Aleixo",
        ],
        Mangaratiba: ["Centro", "Muriqui", "Conceição de Jacareí"],
        Maricá: [
            "Centro",
            "Ponta Negra",
            "Caxito",
            "Inoã",
            "São José do Imbassaí",
        ],
        Mendes: ["Centro"],
        Mesquita: ["Centro"],
        "Miguel Pereira": ["Centro"],
        Miracema: ["Centro"],
        Natividade: ["Centro"],
        Nilópolis: ["Centro"],
        Niterói: [
            "Centro",
            "Icaraí",
            "São Francisco",
            "Ingá",
            "Charitas",
            "Boa Viagem",
            "Jardim Icaraí",
        ],
        "Nova Friburgo": ["Centro"],
        "Nova Iguaçu": [
            "Centro",
            "Austin",
            "Comendador Soares",
            "Edson Passos",
            "Kamel",
            "Paciência",
            "Parada Independência",
            "Presidente Juscelino",
            "Três Pontes",
        ],
        Paracambi: ["Centro"],
        "Paraíba do Sul": ["Centro"],
        Paraty: ["Centro"],
        "Paty do Alferes": ["Centro"],
        Petrópolis: [
            "Centro",
            "Itaipava",
            "Araras",
            "Cascatinha",
            "Valparaíso",
        ],
        Pinheiral: ["Centro"],
        Piraí: ["Centro"],
        Porciúncula: ["Centro"],
        "Porto Real": ["Centro"],
        Quatis: ["Centro"],
        Queimados: ["Centro", "São Jorge", "Fanchem", "Ouro Verde"],
        Quissamã: ["Centro"],
        Resende: ["Centro"],
        "Rio Bonito": ["Centro"],
        "Rio Claro": ["Centro", "Piratininga"],
        "Rio das Flores": ["Centro"],
        "Rio das Ostras": [
            "Centro",
            "Costazul",
            "Cidade Beira Mar",
            "Jardim Mariléa",
            "Nova Cidade",
        ],
        "Santa Maria Madalena": ["Centro"],
        "Santo Antônio de Pádua": ["Centro"],
        "São Fidélis": ["Centro"],
        "São Francisco de Itabapoana": ["Centro"],
        "São Gonçalo": [
            "Centro",
            "Neves",
            "Comendador Soares",
            "Porto da Pedra",
            "Barro Vermelho",
            "Zé Garoto",
            "Jardim Catarina",
        ],
        "São João da Barra": ["Centro"],
        "São João de Meriti": [
            "Centro",
            "Jardim Meriti",
            "Vilar dos Teles",
            "Parque São José",
            "Cova da Onça",
        ],
        "São José de Ubá": ["Centro"],
        "São José do Vale do Rio Preto": ["Centro"],
        "São Pedro da Aldeia": ["Centro"],
        "São Sebastião do Alto": ["Centro"],
        Sapucaia: ["Centro"],
        Saquarema: ["Centro"],
        Seropédica: ["Centro", "Santa Sofia", "Campo Lindo"],
        "Silva Jardim": ["Centro", "Espírito Santo"],
        Sumidouro: ["Centro"],
        Tanguá: ["Centro"],
        Teresópolis: [
            "Alto",
            "Várzea",
            "São Pedro",
            "Meia Pataca",
            "Fonte Santa",
        ],
        "Trajano de Moraes": ["Centro"],
        "Três Rios": ["Centro"],
        Valença: ["Centro"],
        "Varre-Sai": ["Centro"],
        Vassouras: ["Centro"],
        "Volta Redonda": [
            "Centro",
            "Aterrado",
            "Retiro",
            "Volta Grande",
            "Niterói",
            "Jardim Jalisco",
        ],
    },
    currentRecordId: null,
    isEditMode: false,
    currentPage: 1,
    recordsPerPage: 6,
    // Propriedades para sincronização peer-to-peer
    peer: null,
    peerId: null,
    connections: [],
    syncEnabled: false,
    lastSyncTime: null,
};
// ==============================================
// INICIALIZAÇÃO
// ==============================================
document.addEventListener("DOMContentLoaded", function () {
    loadData();
    updateUI();
    updateYearFilterOptions();
    updateForwardingFilterOptions();
    // Configura os dropdowns de bairro
    const citySelect = document.getElementById("city");
    const searchCitySelect = document.getElementById("searchCity");
    if (citySelect) {
        citySelect.addEventListener("change", updateNeighborhoods);
    }
    if (searchCitySelect) {
        searchCitySelect.addEventListener("change", updateSearchNeighborhoods);
    }
    // Configura o cálculo da idade
    const dobInput = document.getElementById("dob");
    if (dobInput) {
        dobInput.addEventListener("change", calculateAge);
    }
    // Configura o formulário
    const registrationForm = document.getElementById("registrationForm");
    const clearFormBtn = document.getElementById("clearFormBtn");
    if (registrationForm) {
        registrationForm.addEventListener("submit", handleFormSubmit);
    }
    if (clearFormBtn) {
        clearFormBtn.addEventListener("click", clearForm);
    }
    // Configura a busca
    const searchBtn = document.getElementById("searchBtn");
    const clearSearchBtn = document.getElementById("clearSearchBtn");
    if (searchBtn) {
        searchBtn.addEventListener("click", applyFilters);
    }
    if (clearSearchBtn) {
        clearSearchBtn.addEventListener("click", clearSearchFilters);
    }
    // Configura as abas
    const searchTabBtn = document.getElementById("searchTabBtn");
    const statsTabBtn = document.getElementById("statsTabBtn");
    if (searchTabBtn) {
        searchTabBtn.addEventListener("click", showSearchTab);
    }
    if (statsTabBtn) {
        statsTabBtn.addEventListener("click", showStatsTab);
    }
    // Configura exportação e importação
    const exportBtn = document.getElementById("exportBtn");
    const importInput = document.getElementById("importInput");
    if (exportBtn) {
        exportBtn.addEventListener("click", exportData);
    }
    if (importInput) {
        importInput.addEventListener("change", importData);
    }
    // Configura paginação
    const prevPageBtn = document.getElementById("prevPage");
    const nextPageBtn = document.getElementById("nextPage");
    if (prevPageBtn) {
        prevPageBtn.addEventListener("click", goToPrevPage);
    }
    if (nextPageBtn) {
        nextPageBtn.addEventListener("click", goToNextPage);
    }
    // Configura sincronização
    const syncBtn = document.getElementById("syncBtn");
    const connectBtn = document.getElementById("connectBtn");
    const disconnectAllBtn = document.getElementById("disconnectAllBtn");
    if (syncBtn) {
        syncBtn.addEventListener("click", toggleSyncPanel);
    }
    if (connectBtn) {
        connectBtn.addEventListener("click", connectToPeer);
    }
    if (disconnectAllBtn) {
        disconnectAllBtn.addEventListener("click", disconnectFromPeers);
    }
});
// ==============================================
// FUNÇÕES DE DADOS
// ==============================================
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
    updateStatsByYear();
}
function updateTotalRecords() {
    const total = appData.records.length;
    const totalRecordsElement = document.getElementById("totalRecords");
    const statsTotalRecordsElement = document.getElementById("statsTotalRecords");
    if (totalRecordsElement) {
        totalRecordsElement.textContent = total.toString();
    }
    if (statsTotalRecordsElement) {
        statsTotalRecordsElement.textContent = total.toString();
    }
}
// ==============================================
// FUNÇÕES DE EXPORTAÇÃO/IMPORTAÇÃO
// ==============================================
function exportData() {
    if (appData.records.length === 0) {
        alert("Não há dados para exportar.");
        return;
    }
    const dataStr = JSON.stringify(appData.records, null, 2);
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    const exportFileDefaultName = `cadastro-pessoal-${new Date()
        .toISOString()
        .slice(0, 10)}.json`;
    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
    // Feedback visual
    const exportBtn = document.getElementById("exportBtn");
    if (exportBtn) {
        exportBtn.innerHTML = '<i class="fas fa-check mr-2"></i> Exportado!';
        exportBtn.classList.remove("bg-green-600");
        exportBtn.classList.add("bg-green-700");
        exportBtn.classList.add("animate-pulse");
        setTimeout(() => {
            exportBtn.innerHTML =
                '<i class="fas fa-file-export mr-2"></i> Exportar';
            exportBtn.classList.remove("bg-green-700", "animate-pulse");
            exportBtn.classList.add("bg-green-600");
        }, 2000);
    }
}
function importData(event) {
    var _a;
    const target = event.target;
    const file = (_a = target.files) === null || _a === void 0 ? void 0 : _a[0];
    if (!file)
        return;
    const reader = new FileReader();
    reader.onload = function (e) {
        var _a;
        try {
            const result = (_a = e.target) === null || _a === void 0 ? void 0 : _a.result;
            const importedData = JSON.parse(result);
            if (!Array.isArray(importedData)) {
                throw new Error("O arquivo não contém um array de registros válido.");
            }
            // Verifica a estrutura básica dos dados
            const sampleRecord = importedData[0];
            if (!sampleRecord || !sampleRecord.fullName || !sampleRecord.dob) {
                throw new Error("O arquivo não contém registros no formato esperado.");
            }
            if (confirm(`Deseja importar ${importedData.length} registros? Os dados atuais serão substituídos.`)) {
                appData.records = importedData;
                saveDataWithSync();
                updateUI();
                // Feedback visual
                const importBtn = document.querySelector('label[for="importInput"]');
                if (importBtn) {
                    importBtn.innerHTML =
                        '<i class="fas fa-check mr-2"></i> Importado!';
                    importBtn.classList.remove("bg-blue-600");
                    importBtn.classList.add("bg-blue-700");
                    importBtn.classList.add("animate-pulse");
                    setTimeout(() => {
                        importBtn.innerHTML =
                            '<i class="fas fa-file-import mr-2"></i> Importar';
                        importBtn.classList.remove("bg-blue-700", "animate-pulse");
                        importBtn.classList.add("bg-blue-600");
                    }, 2000);
                }
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
            alert("Erro ao importar dados: " + errorMessage);
            console.error(error);
        }
        // Limpa o input para permitir nova importação do mesmo arquivo
        target.value = "";
    };
    reader.readAsText(file);
}
// ==============================================
// FUNÇÕES DO FORMULÁRIO
// ==============================================
function handleFormSubmit(e) {
    e.preventDefault();
    const fullNameInput = document.getElementById("fullName");
    const originSelect = document.getElementById("origin");
    const dobInput = document.getElementById("dob");
    const ageInput = document.getElementById("age");
    const citySelect = document.getElementById("city");
    const neighborhoodSelect = document.getElementById("neighborhood");
    const educationSelect = document.getElementById("education");
    const statusSelect = document.getElementById("status");
    const referenceNameInput = document.getElementById("referenceName");
    const forwardingInput = document.getElementById("forwarding");
    const observationTextarea = document.getElementById("observation");
    const formData = {
        id: Date.now().toString(),
        fullName: (fullNameInput === null || fullNameInput === void 0 ? void 0 : fullNameInput.value.trim()) || "",
        origin: (originSelect === null || originSelect === void 0 ? void 0 : originSelect.value) || "",
        dob: (dobInput === null || dobInput === void 0 ? void 0 : dobInput.value) || "",
        age: parseInt((ageInput === null || ageInput === void 0 ? void 0 : ageInput.value) || "0") || 0,
        city: (citySelect === null || citySelect === void 0 ? void 0 : citySelect.value) || "",
        neighborhood: (neighborhoodSelect === null || neighborhoodSelect === void 0 ? void 0 : neighborhoodSelect.value) || "",
        education: (educationSelect === null || educationSelect === void 0 ? void 0 : educationSelect.value) || "",
        status: (statusSelect === null || statusSelect === void 0 ? void 0 : statusSelect.value) || "",
        referenceName: (referenceNameInput === null || referenceNameInput === void 0 ? void 0 : referenceNameInput.value.trim()) || "",
        forwarding: (forwardingInput === null || forwardingInput === void 0 ? void 0 : forwardingInput.value.trim()) || "",
        observation: (observationTextarea === null || observationTextarea === void 0 ? void 0 : observationTextarea.value.trim()) || "",
        createdAt: new Date().toISOString(),
        timestamp: new Date().toISOString(),
    };
    // Validação básica
    if (!formData.fullName ||
        !formData.origin ||
        !formData.dob ||
        !formData.city ||
        !formData.neighborhood) {
        alert("Por favor, preencha todos os campos obrigatórios.");
        return;
    }
    // Verifica por duplicatas
    const isDuplicate = appData.records.some((record) => {
        return (record.fullName.toLowerCase() === formData.fullName.toLowerCase() &&
            record.dob === formData.dob);
    });
    if (isDuplicate) {
        alert("Já existe um registro com este nome e data de nascimento.");
        return;
    }
    // Adiciona o novo registro
    appData.records.unshift(formData);
    saveDataWithSync();
    updateUI();
    clearForm();
    // Feedback visual
    const submitBtn = document.querySelector('#registrationForm button[type="submit"]');
    if (submitBtn) {
        submitBtn.innerHTML = '<i class="fas fa-check mr-2"></i> Salvo!';
        submitBtn.classList.remove("bg-blue-600");
        submitBtn.classList.add("bg-green-600");
        setTimeout(() => {
            submitBtn.innerHTML = '<i class="fas fa-save mr-2"></i> Salvar';
            submitBtn.classList.remove("bg-green-600");
            submitBtn.classList.add("bg-blue-600");
        }, 2000);
    }
}
function clearForm() {
    const registrationForm = document.getElementById("registrationForm");
    const ageInput = document.getElementById("age");
    const neighborhoodSelect = document.getElementById("neighborhood");
    if (registrationForm) {
        registrationForm.reset();
    }
    if (ageInput) {
        ageInput.value = "";
    }
    if (neighborhoodSelect) {
        neighborhoodSelect.innerHTML =
            '<option value="">Selecione a cidade primeiro</option>';
    }
}
function calculateAge() {
    const dobInput = document.getElementById("dob");
    const ageInput = document.getElementById("age");
    if (!dobInput || !ageInput)
        return;
    const dob = dobInput.value;
    if (!dob)
        return;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    ageInput.value = age.toString();
}
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
function updateYearFilterOptions() {
    const yearSelect = document.getElementById("searchYear");
    if (!yearSelect)
        return;
    const years = new Set(appData.records.map((record) => new Date(record.createdAt).getFullYear()));
    yearSelect.innerHTML = '<option value="">Todos</option>';
    Array.from(years)
        .sort((a, b) => b - a)
        .forEach((year) => {
        const option = document.createElement("option");
        option.value = year.toString();
        option.textContent = year.toString();
        yearSelect.appendChild(option);
    });
}
function updateForwardingFilterOptions() {
    const forwardingSelect = document.getElementById("searchForwarding");
    if (!forwardingSelect)
        return;
    const forwardings = new Set(appData.records.map((record) => record.forwarding).filter((f) => f));
    forwardingSelect.innerHTML = '<option value="">Todos</option>';
    Array.from(forwardings)
        .sort()
        .forEach((forwarding) => {
        const option = document.createElement("option");
        option.value = forwarding;
        option.textContent = forwarding;
        forwardingSelect.appendChild(option);
    });
}
// ==============================================
// FUNÇÕES DE BUSCA
// ==============================================
function applyFilters() {
    appData.currentPage = 1;
    updateUI();
}
function clearSearchFilters() {
    const searchNameInput = document.getElementById("searchName");
    const searchCitySelect = document.getElementById("searchCity");
    const searchNeighborhoodSelect = document.getElementById("searchNeighborhood");
    const searchOriginSelect = document.getElementById("searchOrigin");
    const searchStatusSelect = document.getElementById("searchStatus");
    if (searchNameInput)
        searchNameInput.value = "";
    if (searchCitySelect)
        searchCitySelect.value = "";
    if (searchNeighborhoodSelect)
        searchNeighborhoodSelect.value = "";
    if (searchOriginSelect)
        searchOriginSelect.value = "";
    if (searchStatusSelect)
        searchStatusSelect.value = "";
    updateSearchNeighborhoods();
    appData.currentPage = 1;
    updateUI();
}
function getFilteredRecords() {
    const searchNameInput = document.getElementById("searchName");
    const searchCitySelect = document.getElementById("searchCity");
    const searchNeighborhoodSelect = document.getElementById("searchNeighborhood");
    const searchOriginSelect = document.getElementById("searchOrigin");
    const searchStatusSelect = document.getElementById("searchStatus");
    const searchEducationSelect = document.getElementById("searchEducation");
    const searchYearSelect = document.getElementById("searchYear");
    const searchForwardingSelect = document.getElementById("searchForwarding");
    const nameFilter = (searchNameInput === null || searchNameInput === void 0 ? void 0 : searchNameInput.value.toLowerCase()) || "";
    const cityFilter = (searchCitySelect === null || searchCitySelect === void 0 ? void 0 : searchCitySelect.value) || "";
    const neighborhoodFilter = (searchNeighborhoodSelect === null || searchNeighborhoodSelect === void 0 ? void 0 : searchNeighborhoodSelect.value) || "";
    const originFilter = (searchOriginSelect === null || searchOriginSelect === void 0 ? void 0 : searchOriginSelect.value) || "";
    const statusFilter = (searchStatusSelect === null || searchStatusSelect === void 0 ? void 0 : searchStatusSelect.value) || "";
    const educationFilter = (searchEducationSelect === null || searchEducationSelect === void 0 ? void 0 : searchEducationSelect.value) || "";
    const yearFilter = (searchYearSelect === null || searchYearSelect === void 0 ? void 0 : searchYearSelect.value) || "";
    const forwardingFilter = (searchForwardingSelect === null || searchForwardingSelect === void 0 ? void 0 : searchForwardingSelect.value) || "";
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
        if (educationFilter && record.education !== educationFilter)
            return false;
        if (yearFilter &&
            new Date(record.createdAt).getFullYear().toString() !== yearFilter)
            return false;
        if (forwardingFilter && record.forwarding !== forwardingFilter)
            return false;
        return true;
    });
}
// ==============================================
// FUNÇÕES DE PAGINAÇÃO
// ==============================================
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
function updatePagination(filteredRecords) {
    const paginationElement = document.getElementById("pagination");
    if (!paginationElement)
        return;
    const totalRecords = filteredRecords.length;
    const totalPages = Math.ceil(totalRecords / appData.recordsPerPage);
    if (totalRecords <= appData.recordsPerPage) {
        paginationElement.classList.add("hidden");
        return;
    }
    paginationElement.classList.remove("hidden");
    // Botão anterior
    const prevPageElement = document.getElementById("prevPage");
    if (prevPageElement) {
        if (appData.currentPage === 1) {
            prevPageElement.classList.add("disabled");
        }
        else {
            prevPageElement.classList.remove("disabled");
        }
    }
    // Próximo botão
    const nextPageElement = document.getElementById("nextPage");
    if (nextPageElement) {
        if (appData.currentPage === totalPages) {
            nextPageElement.classList.add("disabled");
        }
        else {
            nextPageElement.classList.remove("disabled");
        }
    }
    // Atualizar números de página
    const paginationList = paginationElement.querySelector("ul");
    if (!paginationList)
        return;
    const existingPageItems = paginationList.querySelectorAll(".page-item:not(#prevPage):not(#nextPage)");
    existingPageItems.forEach((item) => item.remove());
    // Adicionar números de página
    const startPage = Math.max(1, appData.currentPage - 2);
    const endPage = Math.min(totalPages, appData.currentPage + 2);
    for (let i = startPage; i <= endPage; i++) {
        const pageItem = document.createElement("li");
        pageItem.className = `page-item ${i === appData.currentPage ? "active" : ""}`;
        const pageLink = document.createElement("a");
        pageLink.className = "page-link";
        pageLink.href = "#";
        pageLink.textContent = i.toString();
        pageLink.addEventListener("click", () => {
            appData.currentPage = i;
            updateUI();
        });
        pageItem.appendChild(pageLink);
        if (nextPageElement) {
            paginationList.insertBefore(pageItem, nextPageElement);
        }
    }
}
// ==============================================
// FUNÇÕES DE INTERFACE
// ==============================================
function updateUI() {
    const filteredRecords = getFilteredRecords();
    updateRecordsTable(filteredRecords);
    updatePagination(filteredRecords);
}
function updateRecordsTable(records) {
    const tableBody = document.getElementById("recordsTableBody");
    if (!tableBody)
        return;
    const totalRecords = records.length;
    if (totalRecords === 0) {
        tableBody.innerHTML = `
                    <tr>
                        <td colspan="4" class="text-center text-gray-500 py-10">
                            <i class="fas fa-database text-4xl mb-2"></i>
                            <p>Nenhum registro encontrado</p>
                        </td>
                    </tr>
                `;
        return;
    }
    // Calculate pagination
    const startIndex = (appData.currentPage - 1) * appData.recordsPerPage;
    const endIndex = Math.min(startIndex + appData.recordsPerPage, totalRecords);
    const paginatedRecords = records.slice(startIndex, endIndex);
    let html = "";
    paginatedRecords.forEach((record) => {
        // Pega a primeira letra do nome para o avatar
        const initials = record.fullName.charAt(0).toUpperCase();
        html += `
                    <tr class="hover:bg-gray-50 transition-colors">
                        <!-- Coluna Nome -->
                        <td class="py-3 px-4">
                            <div class="flex items-center">
                                <div class="avatar mr-3">
                                    ${initials}
                                </div>
                                <div>
                                    <div class="font-medium text-gray-800">${record.fullName}</div>
                                    <div class="text-xs text-gray-500">${record.origin}</div>
                                </div>
                            </div>
                        </td>
                        
                        <!-- Coluna Município -->
                        <td class="py-3 px-4">
                            <div class="text-gray-700">${record.city}</div>
                        </td>
                        
                        <!-- Coluna Status -->
                        <td class="py-3 px-4">
                            <span class="text-xs px-2 py-1 rounded-full ${getStatusColorClass(record.status)}">
                                ${record.status}
                            </span>
                        </td>
                        
                        <!-- Coluna Ações -->
                        <td class="py-3 px-4">
                            <div class="flex justify-end">
                                <button onclick="viewRecord('${record.id}')" class="action-btn text-blue-600 hover:bg-blue-200">
                                    <i class="fas fa-eye"></i>
                                    
                                </button>
                                <button onclick="editRecordFromTable('${record.id}')" class="action-btn text-yellow-600 hover:bg-yellow-200">
                                    <i class="fas fa-edit"></i>
                                    
                                </button>
                                <button onclick="deleteRecordFromTable('${record.id}')" class="action-btn text-red-600 hover:bg-red-200">
                                    <i class="fas fa-trash"></i>
                                    
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
    });
    tableBody.innerHTML = html;
}
function editRecordFromTable(id) {
    viewRecord(id);
    setTimeout(() => {
        enableEditMode();
    }, 300);
}
function deleteRecordFromTable(id) {
    appData.currentRecordId = id;
    deleteRecord();
}
function getStatusColorClass(status) {
    switch (status) {
        case "Contratado":
            return "bg-green-100 text-green-800";
        case "Não Contratado":
            return "bg-red-100 text-red-800";
        default:
            return "bg-yellow-100 text-yellow-800";
    }
}
function updateStatistics() {
    updateTotalRecords();
    updateStatsByCity();
    updateStatsByOrigin();
    updateStatsByStatus();
    updateAverageAge();
    updateStatsByEducation();
    updateStatsByYear();
    updateStatsByForwarding();
}
function updateAverageAge() {
    const statsAvgAgeElement = document.getElementById("statsAvgAge");
    if (!statsAvgAgeElement)
        return;
    if (appData.records.length === 0) {
        statsAvgAgeElement.textContent = "0";
        return;
    }
    const totalAge = appData.records.reduce((sum, record) => sum + (record.age || 0), 0);
    const avgAge = Math.round(totalAge / appData.records.length);
    statsAvgAgeElement.textContent = avgAge.toString();
}
function updateStatsByCity() {
    const statsElement = document.getElementById("statsByCity");
    if (!statsElement)
        return;
    const cities = {};
    appData.records.forEach((record) => {
        cities[record.city] = (cities[record.city] || 0) + 1;
    });
    if (Object.keys(cities).length === 0) {
        statsElement.innerHTML =
            '<div class="text-center text-gray-500 py-4">Nenhum dado disponível</div>';
        return;
    }
    let html = "";
    for (const city in cities) {
        const count = cities[city];
        const percentage = ((count / appData.records.length) * 100).toFixed(1);
        html += `
                    <div>
                        <div class="flex justify-between text-sm mb-1">
                            <span class="truncate">${city}</span>
                            <span>${count} (${percentage}%)</span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-2">
                            <div class="bg-green-500 h-2 rounded-full" style="width: ${percentage}%"></div>
                        </div>
                    </div>
                `;
    }
    statsElement.innerHTML = html;
}
function updateStatsByOrigin() {
    const statsElement = document.getElementById("statsByOrigin");
    if (!statsElement)
        return;
    const origins = {};
    appData.records.forEach((record) => {
        origins[record.origin] = (origins[record.origin] || 0) + 1;
    });
    if (Object.keys(origins).length === 0) {
        statsElement.innerHTML =
            '<div class="text-center text-gray-500 py-4">Nenhum dado disponível</div>';
        return;
    }
    let html = "";
    for (const origin in origins) {
        const count = origins[origin];
        const percentage = ((count / appData.records.length) * 100).toFixed(1);
        html += `
                    <div>
                        <div class="flex justify-between text-sm mb-1">
                            <span class="truncate">${origin}</span>
                            <span>${count} (${percentage}%)</span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-2">
                            <div class="bg-blue-500 h-2 rounded-full" style="width: ${percentage}%"></div>
                        </div>
                    </div>
                `;
    }
    statsElement.innerHTML = html;
}
function updateStatsByEducation() {
    const statsElement = document.getElementById("statsByEducation");
    if (!statsElement)
        return;
    const educations = {};
    appData.records.forEach((record) => {
        educations[record.education] = (educations[record.education] || 0) + 1;
    });
    if (Object.keys(educations).length === 0) {
        statsElement.innerHTML =
            '<div class="text-center text-gray-500 py-4">Nenhum dado disponível</div>';
        return;
    }
    let html = "";
    for (const education in educations) {
        const count = educations[education];
        const percentage = ((count / appData.records.length) * 100).toFixed(1);
        html += `
                    <div>
                        <div class="flex justify-between text-sm mb-1">
                            <span class="truncate">${education}</span>
                            <span>${count} (${percentage}%)</span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-2">
                            <div class="bg-blue-500 h-2 rounded-full" style="width: ${percentage}%"></div>
                        </div>
                    </div>
                `;
    }
    statsElement.innerHTML = html;
}
function updateStatsByStatus() {
    const statsElement = document.getElementById("statsByStatus");
    if (!statsElement)
        return;
    const statuses = {};
    appData.records.forEach((record) => {
        statuses[record.status] = (statuses[record.status] || 0) + 1;
    });
    if (Object.keys(statuses).length === 0) {
        statsElement.innerHTML =
            '<div class="text-center text-gray-500 py-4">Nenhum dado disponível</div>';
        return;
    }
    let html = "";
    for (const status in statuses) {
        const count = statuses[status];
        const percentage = ((count / appData.records.length) * 100).toFixed(1);
        html += `
                    <div>
                        <div class="flex justify-between text-sm mb-1">
                            <span class="truncate">${status}</span>
                            <span>${count} (${percentage}%)</span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-2">
                            <div class="${getStatusBarColorClass(status)} h-2 rounded-full" style="width: ${percentage}%"></div>
                        </div>
                    </div>
                `;
    }
    statsElement.innerHTML = html;
}
function updateStatsByYear() {
    const statsElement = document.getElementById("statsByYear");
    if (!statsElement)
        return;
    const years = {};
    appData.records.forEach((record) => {
        const year = new Date(record.createdAt).getFullYear();
        years[year] = (years[year] || 0) + 1;
    });
    if (Object.keys(years).length === 0) {
        statsElement.innerHTML =
            '<div class="text-center text-gray-500 py-4">Nenhum dado disponível</div>';
        return;
    }
    let html = "";
    for (const year in years) {
        const count = years[year];
        const percentage = ((count / appData.records.length) * 100).toFixed(1);
        html += `
            <div>
                <div class="flex justify-between text-sm mb-1">
                    <span class="truncate">${year}</span>
                    <span>${count} (${percentage}%)</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                    <div class="bg-purple-500 h-2 rounded-full" style="width: ${percentage}%"></div>
                </div>
            </div>
        `;
    }
    statsElement.innerHTML = html;
}
function updateStatsByForwarding() {
    const statsElement = document.getElementById("statsByForwarding");
    if (!statsElement)
        return;
    const forwardings = {};
    appData.records.forEach((record) => {
        const forwarding = record.forwarding || "Não informado";
        forwardings[forwarding] = (forwardings[forwarding] || 0) + 1;
    });
    if (Object.keys(forwardings).length === 0) {
        statsElement.innerHTML =
            '<div class="text-center text-gray-500 py-4">Nenhum dado disponível</div>';
        return;
    }
    let html = "";
    for (const forwarding in forwardings) {
        const count = forwardings[forwarding];
        const percentage = ((count / appData.records.length) * 100).toFixed(1);
        html += `
            <div>
                <div class="flex justify-between text-sm mb-1">
                    <span class="truncate">${forwarding}</span>
                    <span>${count} (${percentage}%)</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                    <div class="bg-blue-500 h-2 rounded-full" style="width: ${percentage}%"></div>
                </div>
            </div>
        `;
    }
    statsElement.innerHTML = html;
}
function getStatusBarColorClass(status) {
    switch (status) {
        case "Contratado":
            return "bg-green-500";
        case "Não Contratado":
            return "bg-red-500";
        default:
            return "bg-yellow-500";
    }
}
// ==============================================
// FUNÇÕES DAS ABAS
// ==============================================
function showSearchTab() {
    const searchContent = document.getElementById("searchContent");
    const statsContent = document.getElementById("statsContent");
    const searchTabBtn = document.getElementById("searchTabBtn");
    const statsTabBtn = document.getElementById("statsTabBtn");
    if (searchContent)
        searchContent.classList.remove("hidden");
    if (statsContent)
        statsContent.classList.add("hidden");
    if (searchTabBtn)
        searchTabBtn.classList.add("tab-active");
    if (statsTabBtn)
        statsTabBtn.classList.remove("tab-active");
}
function showStatsTab() {
    const searchContent = document.getElementById("searchContent");
    const statsContent = document.getElementById("statsContent");
    const searchTabBtn = document.getElementById("searchTabBtn");
    const statsTabBtn = document.getElementById("statsTabBtn");
    if (searchContent)
        searchContent.classList.add("hidden");
    if (statsContent)
        statsContent.classList.remove("hidden");
    if (searchTabBtn)
        searchTabBtn.classList.remove("tab-active");
    if (statsTabBtn)
        statsTabBtn.classList.add("tab-active");
    updateStatistics();
}
// ==============================================
// FUNÇÕES DO MODAL DE REGISTRO
// ==============================================
function viewRecord(id) {
    const record = appData.records.find((r) => r.id === id);
    if (!record)
        return;
    appData.currentRecordId = id;
    appData.isEditMode = false;
    // Preenche os dados no modal
    const modalElements = {
        modalFullName: document.getElementById("modalFullName"),
        modalOrigin: document.getElementById("modalOrigin"),
        modalDob: document.getElementById("modalDob"),
        modalAge: document.getElementById("modalAge"),
        modalCity: document.getElementById("modalCity"),
        modalNeighborhood: document.getElementById("modalNeighborhood"),
        modalEducation: document.getElementById("modalEducation"),
        modalStatus: document.getElementById("modalStatus"),
        modalReferenceName: document.getElementById("modalReferenceName"),
        modalForwarding: document.getElementById("modalForwarding"),
        modalObservation: document.getElementById("modalObservation"),
        modalCreatedAt: document.getElementById("modalCreatedAt"),
        printDate: document.getElementById("printDate")
    };
    if (modalElements.modalFullName)
        modalElements.modalFullName.textContent = record.fullName;
    if (modalElements.modalOrigin)
        modalElements.modalOrigin.textContent = record.origin;
    if (modalElements.modalDob)
        modalElements.modalDob.textContent = formatDate(record.dob);
    if (modalElements.modalAge)
        modalElements.modalAge.textContent = record.age.toString();
    if (modalElements.modalCity)
        modalElements.modalCity.textContent = record.city;
    if (modalElements.modalNeighborhood)
        modalElements.modalNeighborhood.textContent = record.neighborhood;
    if (modalElements.modalEducation)
        modalElements.modalEducation.textContent = record.education || "-";
    if (modalElements.modalStatus)
        modalElements.modalStatus.textContent = record.status;
    if (modalElements.modalReferenceName)
        modalElements.modalReferenceName.textContent = record.referenceName || "-";
    if (modalElements.modalForwarding)
        modalElements.modalForwarding.textContent = record.forwarding || "-";
    if (modalElements.modalObservation)
        modalElements.modalObservation.textContent = record.observation || "-";
    if (modalElements.modalCreatedAt)
        modalElements.modalCreatedAt.textContent = formatDateTime(record.createdAt);
    if (modalElements.printDate)
        modalElements.printDate.textContent = formatDateTime(new Date().toISOString());
    // Mostra o modal
    const recordModal = document.getElementById("recordModal");
    const editBtn = document.getElementById("editBtn");
    const saveBtn = document.getElementById("saveBtn");
    if (recordModal)
        recordModal.classList.remove("hidden");
    if (editBtn)
        editBtn.classList.remove("hidden");
    if (saveBtn)
        saveBtn.classList.add("hidden");
}
function enableEditMode() {
    if (!appData.currentRecordId)
        return;
    const record = appData.records.find((r) => r.id === appData.currentRecordId);
    if (!record)
        return;
    appData.isEditMode = true;
    // Transforma os campos em editáveis
    const modalFullName = document.getElementById("modalFullName");
    if (modalFullName) {
        modalFullName.innerHTML = `<input type="text" id="editFullName" value="${record.fullName}" class="w-full px-2 py-1 border rounded">`;
    }
    const modalOrigin = document.getElementById("modalOrigin");
    if (modalOrigin) {
        modalOrigin.innerHTML = `
                <select id="editOrigin" class="w-full px-2 py-1 border rounded">
                    <option value="MSE" ${record.origin === "MSE" ? "selected" : ""}>MSE</option>
                    <option value="MP" ${record.origin === "MP" ? "selected" : ""}>MP</option>
                    <option value="EP" ${record.origin === "EP" ? "selected" : ""}>EP</option>
                    <option value="EPT" ${record.origin === "EPT" ? "selected" : ""}>EPT</option>
                </select>
            `;
    }
    const modalDob = document.getElementById("modalDob");
    if (modalDob) {
        modalDob.innerHTML = `<input type="date" id="editDob" value="${record.dob}" class="w-full px-2 py-1 border rounded">`;
    }
    const modalCity = document.getElementById("modalCity");
    if (modalCity) {
        modalCity.innerHTML = `
                <select id="editCity" class="w-full px-2 py-1 border rounded">
                    ${Object.keys(appData.neighborhoods).map(city => `<option value="${city}" ${record.city === city ? "selected" : ""}>${city}</option>`).join("")}
                </select>
            `;
    }
    const modalNeighborhood = document.getElementById("modalNeighborhood");
    if (modalNeighborhood && appData.neighborhoods[record.city]) {
        modalNeighborhood.innerHTML = `
                <select id="editNeighborhood" class="w-full px-2 py-1 border rounded">
                    ${appData.neighborhoods[record.city]
            .map((n) => `<option value="${n}" ${record.neighborhood === n ? "selected" : ""}>${n}</option>`)
            .join("")}
                </select>
            `;
    }
    const modalEducation = document.getElementById("modalEducation");
    if (modalEducation) {
        const educationOptions = [
            "", "1ª série EF", "2ª série EF", "3ª série EF", "4ª série EF", "5ª série EF",
            "6ª série EF", "7ª série EF", "8ª série EF", "9ª série EF", "Fundamental Completo",
            "1º ano EM", "2º ano EM", "3º ano EM", "Médio Completo"
        ];
        modalEducation.innerHTML = `<select id="editEducation" class="w-full px-2 py-1 border rounded">
					${educationOptions.map(option => `<option value="${option}" ${record.education === option ? "selected" : ""}>${option || "Selecione..."}</option>`).join("")}
				</select>`;
    }
    const modalStatus = document.getElementById("modalStatus");
    if (modalStatus) {
        modalStatus.innerHTML = `
                <select id="editStatus" class="w-full px-2 py-1 border rounded">
                    <option value="Em Análise" ${record.status === "Em Análise" ? "selected" : ""}>Em Análise</option>
                    <option value="Contratado" ${record.status === "Contratado" ? "selected" : ""}>Contratado</option>
                    <option value="Não Contratado" ${record.status === "Não Contratado" ? "selected" : ""}>Não Contratado</option>
                </select>
            `;
    }
    const modalReferenceName = document.getElementById("modalReferenceName");
    if (modalReferenceName) {
        modalReferenceName.innerHTML = `<input type="text" id="editReferenceName" value="${record.referenceName || ""}" class="w-full px-2 py-1 border rounded">`;
    }
    const modalForwarding = document.getElementById("modalForwarding");
    if (modalForwarding) {
        modalForwarding.innerHTML = `<input type="text" id="editForwarding" value="${record.forwarding || ""}" class="w-full px-2 py-1 border rounded">`;
    }
    const modalObservation = document.getElementById("modalObservation");
    if (modalObservation) {
        modalObservation.innerHTML = `<textarea id="editObservation" class="w-full px-2 py-1 border rounded">${record.observation || ""}</textarea>`;
    }
    // Atualiza os botões
    const editBtn = document.getElementById("editBtn");
    const saveBtn = document.getElementById("saveBtn");
    if (editBtn)
        editBtn.classList.add("hidden");
    if (saveBtn)
        saveBtn.classList.remove("hidden");
}
function saveChanges() {
    if (!appData.currentRecordId || !appData.isEditMode)
        return;
    const recordIndex = appData.records.findIndex((r) => r.id === appData.currentRecordId);
    if (recordIndex === -1)
        return;
    // Calcula a nova idade se a data de nascimento mudou
    let newAge = appData.records[recordIndex].age;
    const dobInput = document.getElementById("editDob");
    if (dobInput) {
        const birthDate = new Date(dobInput.value);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 ||
            (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        newAge = age;
    }
    // Obtém os valores dos campos editáveis
    const editFullName = document.getElementById("editFullName");
    const editOrigin = document.getElementById("editOrigin");
    const editCity = document.getElementById("editCity");
    const editNeighborhood = document.getElementById("editNeighborhood");
    const editEducation = document.getElementById("editEducation");
    const editStatus = document.getElementById("editStatus");
    const editReferenceName = document.getElementById("editReferenceName");
    const editForwarding = document.getElementById("editForwarding");
    const editObservation = document.getElementById("editObservation");
    // Atualiza o registro
    appData.records[recordIndex] = Object.assign(Object.assign({}, appData.records[recordIndex]), { fullName: (editFullName === null || editFullName === void 0 ? void 0 : editFullName.value) || "", origin: (editOrigin === null || editOrigin === void 0 ? void 0 : editOrigin.value) || "", dob: (dobInput === null || dobInput === void 0 ? void 0 : dobInput.value) || "", age: newAge, city: (editCity === null || editCity === void 0 ? void 0 : editCity.value) || "", neighborhood: (editNeighborhood === null || editNeighborhood === void 0 ? void 0 : editNeighborhood.value) || "", education: (editEducation === null || editEducation === void 0 ? void 0 : editEducation.value) || "", status: (editStatus === null || editStatus === void 0 ? void 0 : editStatus.value) || "", referenceName: (editReferenceName === null || editReferenceName === void 0 ? void 0 : editReferenceName.value.trim()) || "", forwarding: (editForwarding === null || editForwarding === void 0 ? void 0 : editForwarding.value.trim()) || "", observation: (editObservation === null || editObservation === void 0 ? void 0 : editObservation.value.trim()) || "", timestamp: new Date().toISOString() });
    // Salva as alterações
    saveDataWithSync();
    updateUI();
    // Sai do modo de edição
    appData.isEditMode = false;
    closeModal();
}
function deleteRecord() {
    if (!appData.currentRecordId)
        return;
    if (confirm("Tem certeza que deseja excluir este registro? Esta ação não pode ser desfeita.")) {
        appData.records = appData.records.filter((r) => r.id !== appData.currentRecordId);
        saveDataWithSync();
        updateUI();
        closeModal();
    }
}
function printRecord() {
    const printDateElement = document.getElementById("printDate");
    if (printDateElement) {
        printDateElement.textContent = new Date().toLocaleString();
    }
    // A modal precisa estar aberta (sem class="hidden")
    const modal = document.getElementById("recordModal");
    if (modal === null || modal === void 0 ? void 0 : modal.classList.contains("hidden")) {
        alert("Abra o registro antes de imprimir.");
        return;
    }
    setTimeout(() => {
        window.print();
    }, 100);
}
function closeModal() {
    const recordModal = document.getElementById("recordModal");
    if (recordModal) {
        recordModal.classList.add("hidden");
    }
    appData.currentRecordId = null;
    appData.isEditMode = false;
}
// ==============================================
// FUNÇÕES AUXILIARES
// ==============================================
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR");
}
function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString("pt-BR");
}
function initSyncSystem() {
    try {
        // Gera um ID único para este peer
        const peerId = "cadastro-" + Math.random().toString(36).substr(2, 9);
        // Inicializa o peer
        appData.peer = new Peer(peerId);
        appData.peerId = peerId;
        // Eventos do peer
        appData.peer.on("open", function (id) {
            console.log("Peer conectado com ID:", id);
            const myPeerIdInput = document.getElementById("myPeerId");
            if (myPeerIdInput) {
                myPeerIdInput.value = id;
            }
            updateSyncStatus("Pronto para conectar");
        });
        appData.peer.on("connection", function (conn) {
            console.log("Nova conexão recebida:", conn.peer);
            setupConnection(conn);
        });
        appData.peer.on("error", function (err) {
            console.error("Erro no peer:", err);
            updateSyncStatus("Erro na conexão");
        });
        // Configura botão de copiar ID
        const copyPeerIdBtn = document.getElementById("copyPeerIdBtn");
        if (copyPeerIdBtn) {
            copyPeerIdBtn.addEventListener("click", copyPeerId);
        }
    }
    catch (error) {
        console.error("Erro ao inicializar sistema de sincronização:", error);
    }
}
function toggleSyncPanel() {
    const syncPanel = document.getElementById("syncPanel");
    if (!syncPanel)
        return;
    if (syncPanel.style.display === "none" || syncPanel.style.display === "") {
        syncPanel.style.display = "block";
        if (!appData.peer) {
            initSyncSystem();
        }
    }
    else {
        syncPanel.style.display = "none";
    }
}
function connectToPeer() {
    const targetPeerIdInput = document.getElementById("targetPeerId");
    if (!targetPeerIdInput || !appData.peer)
        return;
    const targetPeerId = targetPeerIdInput.value.trim();
    if (!targetPeerId) {
        alert("Digite o ID do usuário para conectar");
        return;
    }
    try {
        const conn = appData.peer.connect(targetPeerId);
        setupConnection(conn);
        targetPeerIdInput.value = "";
    }
    catch (error) {
        console.error("Erro ao conectar:", error);
        alert("Erro ao conectar com o usuário");
    }
}
function setupConnection(conn) {
    conn.on("open", function () {
        console.log("Conexão estabelecida com:", conn.peer);
        appData.connections.push(conn);
        updateConnectionsList();
        // Envia dados atuais para o novo peer
        sendDataToPeer(conn, {
            type: "data_sync",
            data: appData.records,
            timestamp: new Date().toISOString(),
        });
    });
    conn.on("data", function (data) {
        console.log("Dados recebidos:", data);
        handleSyncMessage(data);
    });
    conn.on("close", function () {
        console.log("Conexão fechada com:", conn.peer);
        appData.connections = appData.connections.filter((c) => c !== conn);
        updateConnectionsList();
    });
    conn.on("error", function (err) {
        console.error("Erro na conexão:", err);
        appData.connections = appData.connections.filter((c) => c !== conn);
        updateConnectionsList();
    });
}
function handleSyncMessage(message) {
    switch (message.type) {
        case "data_sync":
        case "data_update":
            if (message.data) {
                mergeRecords(message.data);
                appData.lastSyncTime = new Date().toISOString();
                updateLastSyncTime();
            }
            break;
        default:
            console.log("Tipo de mensagem desconhecido:", message.type);
    }
}
function updateSyncStatus(status) {
    const syncStatusElement = document.getElementById("syncStatus");
    if (syncStatusElement) {
        syncStatusElement.textContent = status;
    }
}
function updateLastSyncTime() {
    const lastSyncTimeElement = document.getElementById("lastSyncTime");
    if (lastSyncTimeElement && appData.lastSyncTime) {
        lastSyncTimeElement.textContent = `Última sincronização: ${formatDateTime(appData.lastSyncTime)}`;
    }
}
function copyPeerId() {
    const myPeerIdInput = document.getElementById("myPeerId");
    if (!myPeerIdInput)
        return;
    myPeerIdInput.select();
    document.execCommand("copy");
    const copyBtn = document.getElementById("copyPeerIdBtn");
    if (copyBtn) {
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fas fa-check"></i>';
        setTimeout(() => {
            copyBtn.innerHTML = originalText;
        }, 1000);
    }
}
function updateConnectionsList() {
    const connectionsList = document.getElementById("connectionsList");
    const disconnectBtn = document.getElementById("disconnectAllBtn");
    const syncStatus = document.getElementById("syncStatus");
    if (!connectionsList)
        return;
    if (appData.connections.length === 0) {
        connectionsList.innerHTML =
            '<p class="text-sm text-gray-500">Nenhuma conexão ativa</p>';
        if (disconnectBtn)
            disconnectBtn.style.display = "none";
        if (syncStatus) {
            syncStatus.textContent = "Pronto para conectar";
            syncStatus.className = "text-sm px-2 py-1 rounded-full bg-green-100 text-green-600";
        }
    }
    else {
        connectionsList.innerHTML = appData.connections
            .map((conn) => `<div class="flex items-center justify-between bg-gray-50 p-2 rounded">
							<span class="text-sm font-medium">${conn.peer}</span>
							<span class="text-xs text-green-600">Conectado</span>
						</div>`)
            .join("");
        if (disconnectBtn)
            disconnectBtn.style.display = "block";
        if (syncStatus) {
            syncStatus.textContent = `${appData.connections.length} conexão(ões) ativa(s)`;
            syncStatus.className = "text-sm px-2 py-1 rounded-full bg-blue-100 text-blue-600";
        }
    }
}
function sendDataToPeer(conn, data) {
    try {
        if (conn.open) {
            conn.send(data);
        }
    }
    catch (error) {
        console.error("Erro ao enviar dados:", error);
    }
}
function sendDataToAllPeers(data) {
    appData.connections.forEach((conn) => {
        sendDataToPeer(conn, data);
    });
}
function mergeRecords(receivedRecords) {
    let hasChanges = false;
    receivedRecords.forEach((receivedRecord) => {
        const existingIndex = appData.records.findIndex((r) => r.id === receivedRecord.id);
        if (existingIndex === -1) {
            // Novo registro
            appData.records.push(receivedRecord);
            hasChanges = true;
        }
        else {
            // Verifica se o registro recebido é mais recente
            const existingRecord = appData.records[existingIndex];
            const receivedTime = new Date(receivedRecord.timestamp || 0);
            const existingTime = new Date(existingRecord.timestamp || 0);
            if (receivedTime > existingTime) {
                appData.records[existingIndex] = receivedRecord;
                hasChanges = true;
            }
        }
    });
    if (hasChanges) {
        saveDataWithSync();
        updateUI();
        updateStatistics();
        console.log("Dados sincronizados e atualizados");
    }
}
function disconnectFromPeers() {
    appData.connections.forEach((conn) => {
        try {
            conn.close();
        }
        catch (error) {
            console.error("Erro ao fechar conexão:", error);
        }
    });
    appData.connections = [];
    updateConnectionsList();
}
// Função para salvar dados com sincronização
function saveDataWithSync() {
    localStorage.setItem("personalRecords", JSON.stringify(appData.records));
    updateTotalRecords();
    updateStatistics();
    updateYearFilterOptions();
    updateForwardingFilterOptions();
    updateStatsByYear();
    // Envia atualização para peers conectados
    if (appData.connections.length > 0) {
        sendDataToAllPeers({
            type: "data_update",
            data: appData.records,
            timestamp: new Date().toISOString(),
        });
    }
}
// ==============================================
// FUNÇÕES GLOBAIS PARA ONCLICK
// ==============================================
// Torna as funções globais para que possam ser chamadas pelos eventos onclick no HTML
window.viewRecord = viewRecord;
window.editRecordFromTable = editRecordFromTable;
window.deleteRecordFromTable = deleteRecordFromTable;
window.enableEditMode = enableEditMode;
window.saveChanges = saveChanges;
window.deleteRecord = deleteRecord;
window.printRecord = printRecord;
window.closeModal = closeModal;
