// C:\Users\Rodrigo Ramos
// SSD\Desktop\ARK\sistema-ark-frontend\src\components\CaminhaoFormModal.jsx
import React, { useState, useEffect } from 'react';
import { createCaminhao, updateCaminhao } from '../api/caminhoes-api';
import '../styles/common-modal.css'; // Reutiliza o CSS comum para modais
import '../styles/CaminhaoFormModal.css'; // Importa o CSS específico do formulário de caminhão

function CaminhaoFormModal({ isOpen, onClose, onCaminhaoSaved, caminhaoToEdit }) {
    const [caminhaoData, setCaminhaoData] = useState({
        modelo: '',
        placa: '',
        cor: '',
        capacidade: '', // Valor numérico
        unidade_capacidade: 'KG', // Padrão 'KG' ou 'CX'
        apelido: ''
    });

    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(false);
    const isEditing = !!caminhaoToEdit;

    const unidadesCapacidade = ['KG', 'CX']; // Opções para a unidade de medida

    useEffect(() => {
        if (isOpen) {
            if (isEditing) {
                setCaminhaoData({
                    modelo: caminhaoToEdit.modelo || '',
                    placa: caminhaoToEdit.placa || '',
                    cor: caminhaoToEdit.cor || '',
                    capacidade: caminhaoToEdit.capacidade !== undefined ? parseFloat(caminhaoToEdit.capacidade) : '',
                    unidade_capacidade: caminhaoToEdit.unidade_capacidade || 'KG',
                    apelido: caminhaoToEdit.apelido || ''
                });
            } else {
                setCaminhaoData({
                    modelo: '', placa: '', cor: '', capacidade: '',
                    unidade_capacidade: 'KG', apelido: ''
                });
            }
            setMessage(null);
        }
    }, [isOpen, isEditing, caminhaoToEdit]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCaminhaoData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(null);
        setLoading(true);

        try {
            // Converte valores para o tipo correto ou null se a string for vazia.
            const dataToSend = {
                ...caminhaoData,
                capacidade: parseFloat(caminhaoData.capacidade) || 0, // Capacidade é obrigatória
            };

            let savedCaminhao;
            if (isEditing) {
                savedCaminhao = await updateCaminhao(caminhaoToEdit.id, dataToSend);
                setMessage(`Caminhão "${savedCaminhao.modelo}" (Placa: ${savedCaminhao.placa}) atualizado com sucesso!`);
            } else {
                savedCaminhao = await createCaminhao(dataToSend);
                setMessage(`Caminhão "${savedCaminhao.modelo}" (Placa: ${savedCaminhao.placa}) cadastrado com sucesso!`);
                setCaminhaoData({
                    modelo: '', placa: '', cor: '', capacidade: '',
                    unidade_capacidade: 'KG', apelido: ''
                });
            }

            if (onCaminhaoSaved) {
                onCaminhaoSaved();
            }
        } catch (err) {
            console.error('Erro ao salvar caminhão:', err);
            const errorMessage = (err.response && err.response.data && err.response.data.error)
                                 ? err.response.data.error
                                 : (err.message || 'Erro desconhecido.');

            setMessage(`Erro ao salvar caminhão. Detalhes: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{isEditing ? 'Editar Caminhão' : 'Cadastrar Novo Caminhão'}</h2>
                    <button className="close-button" onClick={onClose}>&times;</button>
                </div>
                <div className="modal-body">
                    {message && (
                        <div className={`message-box ${message.includes('sucesso') ? 'success' : 'error'}`}>
                            {message}
                        </div>
                    )}
                    <form onSubmit={handleSubmit}>
                        <h3>Dados do Caminhão</h3>
                        <div className="section-container caminhao-form-section"> {/* Adicionada classe caminhao-form-section */}
                            <div className="form-group modelo-caminhao"> {/* Adicionada classe modelo-caminhao */}
                                <label htmlFor="modelo">Modelo:</label>
                                <input
                                    type="text"
                                    id="modelo"
                                    name="modelo"
                                    value={caminhaoData.modelo}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="placa">Placa:</label>
                                <input
                                    type="text"
                                    id="placa"
                                    name="placa"
                                    value={caminhaoData.placa}
                                    onChange={handleChange}
                                    required
                                    maxLength="8"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="cor">Cor:</label>
                                <input
                                    type="text"
                                    id="cor"
                                    name="cor"
                                    value={caminhaoData.cor}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="apelido">Apelido:</label>
                                <input
                                    type="text"
                                    id="apelido"
                                    name="apelido"
                                    value={caminhaoData.apelido}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="field-group-row"> {/* Agrupar Capacidade e Unidade */}
                                <div className="form-group">
                                    <label htmlFor="capacidade">Capacidade:</label>
                                    <input
                                        type="number"
                                        id="capacidade"
                                        name="capacidade"
                                        value={caminhaoData.capacidade}
                                        onChange={handleChange}
                                        step="0.01"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="unidade_capacidade">Unidade:</label>
                                    <select
                                        id="unidade_capacidade"
                                        name="unidade_capacidade"
                                        value={caminhaoData.unidade_capacidade}
                                        onChange={handleChange}
                                        required
                                    >
                                        {unidadesCapacidade.map(un => (
                                            <option key={un} value={un}>{un}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="modal-actions">
                            <button type="submit" disabled={loading}>
                                {loading ? (isEditing ? 'Atualizando...' : 'Cadastrando...') : (isEditing ? 'Salvar Alterações' : 'Cadastrar Caminhão')}
                            </button>
                            <button type="button" onClick={onClose} disabled={loading} className="cancel-button">
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default CaminhaoFormModal;