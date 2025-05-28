// C:\Users\Rodrigo Ramos
// SSD\Desktop\ARK\sistema-ark-frontend\src\api\pedidos-fornecedor-api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001'; // URL do seu backend

// Função para obter a lista de pedidos de fornecedor (com itens e relações)
export const getPedidosFornecedor = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/pedidos-fornecedor`);
        return response.data; // Retorna os dados
    } catch (error) {
        console.error('Erro ao buscar pedidos de fornecedor:', error.response ? error.response.data : error.message);
        throw error.response ? error.response.data : new Error('Erro ao buscar pedidos de fornecedor');
    }
};

// Função para obter um único pedido de fornecedor por ID (com itens e relações)
export const getPedidoFornecedorById = async (id) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/pedidos-fornecedor/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Erro ao buscar pedido de fornecedor ${id}:`, error.response ? error.response.data : error.message);
        throw error.response ? error.response.data : new Error('Erro ao buscar pedido de fornecedor por ID');
    }
};

// Função para cadastrar um novo pedido de fornecedor (com seus itens)
export const createPedidoFornecedor = async (pedidoData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/api/pedidos-fornecedor`, pedidoData);
        return response.data;
    } catch (error) {
        console.error('Erro ao cadastrar pedido de fornecedor:', error.response ? error.response.data : error.message);
        throw error.response ? error.response.data : new Error('Erro ao cadastrar pedido de fornecedor');
    }
};

// Função para atualizar um pedido de fornecedor existente (com seus itens)
export const updatePedidoFornecedor = async (id, pedidoData) => {
    try {
        const response = await axios.put(`${API_BASE_URL}/api/pedidos-fornecedor/${id}`, pedidoData);
        return response.data;
    } catch (error) {
        console.error(`Erro ao atualizar pedido de fornecedor ${id}:`, error.response ? error.response.data : error.message);
        throw error.response ? error.response.data : new Error('Erro ao atualizar pedido de fornecedor');
    }
};

// Função para excluir um pedido de fornecedor
export const deletePedidoFornecedor = async (id) => {
    try {
        await axios.delete(`${API_BASE_URL}/api/pedidos-fornecedor/${id}`);
        return { message: 'Pedido de fornecedor excluído com sucesso!' };
    } catch (error) {
        console.error(`Erro ao excluir pedido de fornecedor ${id}:`, error.response ? error.response.data : error.message);
        throw error.response ? error.response.data : new Error('Erro ao excluir pedido de fornecedor');
    }
};