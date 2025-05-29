// C:\Users\Rodrigo Ramos SSD\Desktop\ARK\sistema-ark-frontend\src\api\api.js
import axios from 'axios';
const API_BASE_URL = 'http://localhost:3001';

// --- Funções da API REAL (Para interagir com o Backend) ---
// Função para obter a lista de clientes do backend
export const getClientes = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/clientes`);
        return response.data || [];
    } catch (error) {
        console.error('Erro ao buscar clientes:', error.response ? error.response.data : error.message);
        throw error.response ? error.response.data : new Error('Erro ao buscar clientes');
    }
};

// Função para cadastrar um novo cliente
export const createCliente = async (clienteData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/api/clientes`, clienteData);
        return response.data;
    } catch (error) {
        console.error('Erro ao cadastrar cliente:', error.response ? error.response.data : error.message);
        throw error.response ? error.response.data : new Error('Erro ao cadastrar cliente');
    }
};

// Função para atualizar um cliente existente
export const updateCliente = async (id, clienteData) => {
    try {
        const response = await axios.put(`${API_BASE_URL}/api/clientes/${id}`, clienteData);
        return response.data;
    } catch (error) {
        console.error(`Erro ao atualizar cliente ${id}:`, error.response ? error.response.data : error.message);
        throw error.response ? error.response.data : new Error('Erro ao atualizar cliente');
    }
};

// Função para excluir um cliente
export const deleteCliente = async (id) => {
    try {
        await axios.delete(`${API_BASE_URL}/api/clientes/${id}`);
        return { message: 'Cliente excluído com sucesso!' };
    } catch (error) {
        console.error(`Erro ao excluir cliente ${id}:`, error.response ? error.response.data : error.message);
        throw error.response ? error.response.data : new Error('Erro ao excluir cliente');
    }
};


// --- Funções Mockadas Antigas (algumas permanecerão, outras serão removidas/movidas) ---
// REMOVIDA: A função mockada getProdutos foi removida daqui.
// A função getFornecedores (mockada) permanece aqui por enquanto, pois o modulo Fornecedores usa fornecedores-api.js
// A função getCaminhoes (mockada) permanece aqui por enquanto, pois o modulo Caminhoes usa caminhoes-api.js
// A função getPedidos (mockada) e addPedido (mockada) permanecem aqui, pois o modulo PedidosCliente usa.


export const getFornecedores = async () => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({
                data: [
                    { id: 'forn001', nome: 'Fornecedor Alpha', contato: 'forn@alpha.com', telefone: '1130304040' },
                    { id: 'forn002', nome: 'Fornecedor Beta', contato: 'forn@beta.com', telefone: '2190908080' }
                ]
            });
        }, 500);
    });
};

export const getCaminhoes = async () => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({
                data: [
                    { id: 'cam001', placa: 'ABC-1234', modelo: 'Caminhão Grande', capacidade: 10000 },
                    { id: 'cam002', placa: 'DEF-5678', modelo: 'Vuc', capacidade: 3000 }
                ]
            });
        }, 500);
    });
};

export const getPedidos = async (role) => {
    const mockPedidos = [
        {
            id: 'ped001',
            cliente: 'João Silva',
            produto: 'Produto A',
            quantidade: 2,
            data: '2024-05-20',
            status: 'Pendente',
            valorTotal: 200.00,
            clienteId: 'cli001'
        },
        {
            id: 'ped002',
            cliente: 'Maria Souza',
            produto: 'Produto B',
            quantidade: 1,
            data: '2024-05-21',
            status: 'Processando',
            valorTotal: 50.00,
            clienteId: 'cli002'
        },
        {
            id: 'ped003',
            cliente: 'João Silva',
            produto: 'Produto C',
            quantidade: 3,
            data: '2024-05-25',
            status: 'Entregue',
            valorTotal: 150.00,
            clienteId: 'cli001'
        }
    ];
    return new Promise(resolve => {
        setTimeout(() => {
            if (role === 'admin') {
                resolve({ data: mockPedidos });
            } else {
                resolve({ data: mockPedidos.filter(p => p.clienteId === 'cli001') });
            }
        }, 500);
    });
};

export const addPedido = async (pedidoData) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const newPedido = {
                id: `ped${Math.random().toString(16).slice(2, 8)}`,
                data: new Date().toISOString().split('T')[0],
                status: 'Pendente',
                ...pedidoData
            };
            console.log("Pedido mockado adicionado:", newPedido);
            resolve({ data: newPedido });
        }, 500);
    });
};