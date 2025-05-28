// C:\Users\Rodrigo Ramos
// SSD\Desktop\ARK\sistema-ark-frontend\src\api\fornecedores-api.js
import axios from 'axios';
const API_BASE_URL = 'http://localhost:3001'; // URL do seu backend

// Função para obter a lista de fornecedores do backend
export const getFornecedores = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/fornecedores`);
        return response.data; // Retorna os dados
    } catch (error) {
        console.error('Erro ao buscar fornecedores:', error.response ? error.response.data :
            error.message);
        throw error.response ? error.response.data : new Error('Erro ao buscar fornecedores');
    }
};

// Função para cadastrar um novo fornecedor
export const createFornecedor = async (fornecedorData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/api/fornecedores`,
            fornecedorData);
        return response.data;
    } catch (error) {
        console.error('Erro ao cadastrar fornecedor:', error.response ? error.response.data :
            error.message);
        throw error.response ? error.response.data : new Error('Erro ao cadastrar fornecedor');
    }
};

// Função para atualizar um fornecedor existente
export const updateFornecedor = async (id, fornecedorData) => {
    try {
        const response = await axios.put(`${API_BASE_URL}/api/fornecedores/${id}`,
            fornecedorData);
        return response.data;
    } catch (error) {
        console.error(`Erro ao atualizar fornecedor ${id}:`, error.response ? error.response.data
            : error.message);
        throw error.response ? error.response.data : new Error('Erro ao atualizar fornecedor');
    }
};

// Função para excluir um fornecedor
export const deleteFornecedor = async (id) => {
    try {
        await axios.delete(`${API_BASE_URL}/api/fornecedores/${id}`);
        return { message: 'Fornecedor excluído com sucesso!' };
    } catch (error) {
        console.error(`Erro ao excluir fornecedor ${id}:`, error.response ? error.response.data :
            error.message);
        throw error.response ? error.response.data : new Error('Erro ao excluir fornecedor');
    }
};