// C:\Users\Rodrigo Ramos
// SSD\Desktop\ARK\sistema-ark-frontend\src\api\produtos-api.js
import axios from 'axios';
const API_BASE_URL = 'http://localhost:3001'; // URL do seu backend

// Função para obter a lista de produtos do backend
export const getProdutos = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/produtos`);
        return response.data; // Retorna os dados
    } catch (error) {
        console.error('Erro ao buscar produtos:', error.response ? error.response.data :
            error.message);
        throw error.response ? error.response.data : new Error('Erro ao buscar produtos');
    }
};

// Função para cadastrar um novo produto
export const createProduto = async (produtoData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/api/produtos`,
            produtoData);
        return response.data;
    } catch (error) {
        console.error('Erro ao cadastrar produto:', error.response ? error.response.data :
            error.message);
        throw error.response ? error.response.data : new Error('Erro ao cadastrar produto');
    }
};

// Função para atualizar um produto existente
export const updateProduto = async (id, produtoData) => {
    try {
        const response = await axios.put(`${API_BASE_URL}/api/produtos/${id}`,
            produtoData);
        return response.data;
    } catch (error) {
        console.error(`Erro ao atualizar produto ${id}:`, error.response ? error.response.data
            : error.message);
        throw error.response ? error.response.data : new Error('Erro ao atualizar produto');
    }
};

// Função para excluir um produto
export const deleteProduto = async (id) => {
    try {
        await axios.delete(`${API_BASE_URL}/api/produtos/${id}`);
        return { message: 'Produto excluído com sucesso!' };
    } catch (error) {
        console.error(`Erro ao excluir produto ${id}:`, error.response ? error.response.data :
            error.message);
        throw error.response ? error.response.data : new Error('Erro ao excluir produto');
    }
};