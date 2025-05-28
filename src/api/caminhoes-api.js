// C:\Users\Rodrigo Ramos SSD\Desktop\ARK\sistema-ark-frontend\src\api\caminhoes-api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001'; // URL do seu backend

// Função para obter a lista de caminhões do backend
export const getCaminhoes = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/caminhoes`);
        return response.data; // Retorna os dados
    } catch (error) {
        console.error('Erro ao buscar caminhões:', error.response ? error.response.data : error.message);
        throw error.response ? error.response.data : new Error('Erro ao buscar caminhões');
    }
};

// Função para cadastrar um novo caminhão
export const createCaminhao = async (caminhaoData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/api/caminhoes`, caminhaoData);
        return response.data;
    } catch (error) {
        console.error('Erro ao cadastrar caminhão:', error.response ? error.response.data : error.message);
        throw error.response ? error.response.data : new Error('Erro ao cadastrar caminhão');
    }
};

// Função para atualizar um caminhão existente
export const updateCaminhao = async (id, caminhaoData) => {
    try {
        const response = await axios.put(`${API_BASE_URL}/api/caminhoes/${id}`, caminhaoData);
        return response.data;
    } catch (error) {
        console.error(`Erro ao atualizar caminhão ${id}:`, error.response ? error.response.data : error.message);
        throw error.response ? error.response.data : new Error('Erro ao atualizar caminhão');
    }
};

// Função para excluir um caminhão
export const deleteCaminhao = async (id) => {
    try {
        await axios.delete(`${API_BASE_URL}/api/caminhoes/${id}`);
        return { message: 'Caminhão excluído com sucesso!' };
    } catch (error) {
        console.error(`Erro ao excluir caminhão ${id}:`, error.response ? error.response.data : error.message);
        throw error.response ? error.response.data : new Error('Erro ao excluir caminhão');
    }
};