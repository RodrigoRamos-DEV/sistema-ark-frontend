// C:\Users\Rodrigo Ramos
// SSD\Desktop\ARK\sistema-ark-frontend\src\api\pedidos-cliente-api.js
import axios from 'axios';
const API_BASE_URL = 'http://localhost:3001'; // URL do seu backend

// Função para obter a lista de pedidos de cliente (com itens e relações)
export const getPedidosCliente = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/pedidos-cliente`);
        return response.data; // Retorna os dados
    } catch (error) {
        console.error('Erro ao buscar pedidos de cliente:', error.response ? error.response.data : error.message);
        throw error.response ? error.response.data : new Error('Erro ao buscar pedidos de cliente');
    }
};

// Função para obter um único pedido de cliente por ID (com itens e relações)
export const getPedidoClienteById = async (id) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/pedidos-cliente/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Erro ao buscar pedido de cliente ${id}:`, error.response ? error.response.data : error.message);
        throw error.response ? error.response.data : new Error('Erro ao buscar pedido de cliente por ID');
    }
};

// Função para cadastrar um novo pedido de cliente (com seus itens)
export const createPedidoCliente = async (pedidoData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/api/pedidos-cliente`, pedidoData);
        return response.data;
    } catch (error) {
        console.error('Erro ao cadastrar pedido de cliente:', error.response ? error.response.data : error.message);
        throw error.response ? error.response.data : new Error('Erro ao cadastrar pedido de cliente');
    }
};

// Função para atualizar um pedido de cliente existente (com seus itens)
export const updatePedidoCliente = async (id, pedidoData) => {
    try {
        const response = await axios.put(`${API_BASE_URL}/api/pedidos-cliente/${id}`, pedidoData);
        return response.data;
    } catch (error) {
        console.error(`Erro ao atualizar pedido de cliente ${id}:`, error.response ? error.response.data : error.message);
        throw error.response ? error.response.data : new Error('Erro ao atualizar pedido de cliente');
    }
};

// Função para excluir um pedido de cliente
export const deletePedidoCliente = async (id) => {
    try {
        await axios.delete(`${API_BASE_URL}/api/pedidos-cliente/${id}`);
        return { message: 'Pedido de cliente excluído com sucesso!' };
    } catch (error) {
        console.error(`Erro ao excluir pedido de cliente ${id}:`, error.response ? error.response.data : error.message);
        throw error.response ? error.response.data : new Error('Erro ao excluir pedido de cliente');
    }
};