// ==============================================
// CONFIGURAÇÕES DO FIREBASE
// ==============================================
// SUBSTITUA ESTAS CONFIGURAÇÕES PELAS SUAS DO FIREBASE CONSOLE
export const firebaseConfig = {
	apiKey: "AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
	authDomain: "seu-projeto.firebaseapp.com",
	projectId: "seu-projeto-id",
	storageBucket: "seu-projeto.appspot.com",
	messagingSenderId: "123456789012",
	appId: "1:123456789012:web:xxxxxxxxxxxxxxxx",
};
// Configurações da aplicação
export const appConfig = {
    recordsPerPage: 6,
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedFileTypes: ['application/json'],
    syncInterval: 30000, // 30 segundos
};
// Dados estáticos
export const neighborhoods = {
    "Rio de Janeiro": [
        "Centro", "Cidade Nova", "Estácio", "Catumbi", "Caju", "Gamboa", "Lapa",
        "Mangueira", "Paquetá", "Rio Comprido", "Santa Teresa", "Santo Cristo",
        "Saúde", "Vasco da Gama", "Botafogo", "Catete", "Copacabana", "Cosme Velho",
        "Flamengo", "Gávea", "Glória", "Humaitá", "Ipanema", "Jardim Botânico",
        "Lagoa", "Laranjeiras", "Leblon", "Leme", "Rocinha", "São Conrado", "Urca", "Vidigal"
        // ... adicione todos os bairros aqui
    ],
    "Niterói": [
        "Centro", "Icaraí", "São Francisco", "Ingá", "Charitas", "Boa Viagem", "Jardim Icaraí"
    ],
    "São Gonçalo": [
        "Centro", "Neves", "Comendador Soares", "Porto da Pedra", "Barro Vermelho",
        "Zé Garoto", "Jardim Catarina"
    ]
    // ... adicione todas as cidades e bairros aqui
};
export const educationLevels = [
    "", "1ª série EF", "2ª série EF", "3ª série EF", "4ª série EF", "5ª série EF",
    "6ª série EF", "7ª série EF", "8ª série EF", "9ª série EF", "Fundamental Completo",
    "1º ano EM", "2º ano EM", "3º ano EM", "Médio Completo"
];
export const origins = ['MSE', 'MP', 'EP', 'EPT'];
export const statuses = ['Em Análise', 'Contratado', 'Não Contratado'];
//# sourceMappingURL=config.js.map