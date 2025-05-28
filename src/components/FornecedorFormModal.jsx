// C:\Users\Rodrigo Ramos
// SSD\Desktop\ARK\sistema-ark-frontend\src\components\FornecedorFormModal.jsx
import React, { useState, useEffect } from 'react';
import { createFornecedor, updateFornecedor } from '../api/fornecedores-api';
import '../styles/common-modal.css'; // Reutiliza o CSS comum para modais

function FornecedorFormModal({ isOpen, onClose, onFornecedorSaved, fornecedorToEdit }) {
    const [fornecedorData, setFornecedorData] = useState({
        nome: '', // Nome / Razão Social
        cpf_cnpj: '', // CPF/CNPJ
        email: '',
        telefone: '', // Será o telefone com máscara
        endereco: '',
        numero_endereco: '', // Número do Endereço
        bairro: '',
        cidade: '',
        uf: '',
        cep: '',
        complemento: ''
    });
    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(false);
    const isEditing = !!fornecedorToEdit;

    const ufsBrasil = [
        'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
        'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
    ];

    useEffect(() => {
        if (isOpen) {
            if (isEditing) {
                setFornecedorData({
                    nome: fornecedorToEdit.nome || '',
                    cpf_cnpj: fornecedorToEdit.cpf_cnpj || '',
                    email: fornecedorToEdit.email || '',
                    telefone: fornecedorToEdit.telefone || '', // Carrega o telefone
                    endereco: fornecedorToEdit.endereco || '',
                    numero_endereco: fornecedorToEdit.numero_endereco || '',
                    bairro: fornecedorToEdit.bairro || '',
                    cidade: fornecedorToEdit.cidade || '',
                    uf: fornecedorToEdit.uf || '',
                    cep: fornecedorToEdit.cep || '',
                    complemento: fornecedorToEdit.complemento || ''
                });
            } else {
                setFornecedorData({
                    nome: '', cpf_cnpj: '', email: '', telefone: '', endereco: '',
                    numero_endereco: '', bairro: '', cidade: '', uf: '', cep: '', complemento: ''
                });
            }
            setMessage(null);
        }
    }, [isOpen, isEditing, fornecedorToEdit]);

    // Função para aplicar máscara de telefone (xx) xxxxx-xxxx
    const maskPhoneNumber = (value) => {
        if (!value) return "";
        value = value.replace(/\D/g, ""); // Remove tudo que não for dígito
        if (value.length > 11) value = value.slice(0, 11); // Limita a 11 dígitos
        value = value.replace(/^(\d{2})(\d)/g, "($1) $2");
        value = value.replace(/(\d)(\d{4})$/, "$1-$2");
        return value;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "telefone") {
            setFornecedorData(prevData => ({
                ...prevData,
                [name]: maskPhoneNumber(value) // Aplica a máscara ao telefone
            }));
        } else {
            setFornecedorData(prevData => ({
                ...prevData,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(null);
        setLoading(true);
        try {
            // Ao enviar, remove a máscara do telefone
            const dataToSend = {
                ...fornecedorData,
                telefone: fornecedorData.telefone.replace(/\D/g, "") // Envia apenas dígitos para o backend
            };

            let savedFornecedor;
            if (isEditing) {
                savedFornecedor = await updateFornecedor(fornecedorToEdit.id, dataToSend);
                setMessage(`Fornecedor "${savedFornecedor.nome}" (ID: ${savedFornecedor.id}) atualizado com sucesso!`);
            } else {
                savedFornecedor = await createFornecedor(dataToSend);
                setMessage(`Fornecedor "${savedFornecedor.nome}" (ID: ${savedFornecedor.id}) cadastrado com sucesso!`);
                setFornecedorData({
                    nome: '', cpf_cnpj: '', email: '', telefone: '', endereco: '',
                    numero_endereco: '', bairro: '', cidade: '', uf: '', cep: '', complemento: ''
                });
            }
            if (onFornecedorSaved) {
                onFornecedorSaved();
            }
        } catch (err) {
            console.error('Erro ao salvar fornecedor:', err);
            const errorMessage = (err.error && (err.error.includes('CPF/CNPJ já cadastrado') || err.error.includes('duplicate key')))
                ? 'Erro: CPF/CNPJ já cadastrado.' : (err.error || err.message || 'Erro desconhecido.');
            setMessage(`Erro ao salvar fornecedor. Detalhes: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{isEditing ? 'Editar Fornecedor' : 'Cadastrar Novo Fornecedor'}</h2>
                    <button className="close-button" onClick={onClose}>&times;</button>
                </div>
                <div className="modal-body">
                    {message && (
                        <div className={`message-box ${message.includes('sucesso') ? 'success' : 'error'}`}>
                            {message}
                        </div>
                    )}
                    <form onSubmit={handleSubmit}>
                        <h3>Dados Cadastrais</h3>
                        <div className="section-container">
                            <div className="form-group">
                                <label htmlFor="nome">Nome/Razão Social:</label>
                                <input
                                    type="text"
                                    id="nome"
                                    name="nome"
                                    value={fornecedorData.nome}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="cpf_cnpj">CPF/CNPJ:</label>
                                <input
                                    type="text"
                                    id="cpf_cnpj"
                                    name="cpf_cnpj"
                                    value={fornecedorData.cpf_cnpj}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>
                        <h3>Contato</h3>
                        <div className="section-container">
                            <div className="form-group">
                                <label htmlFor="email">E-mail:</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={fornecedorData.email}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="telefone">Telefone:</label>
                                <input
                                    type="text"
                                    id="telefone"
                                    name="telefone"
                                    value={fornecedorData.telefone}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                        <h3>Endereço</h3>
                        <div className="section-container">
                            <div className="form-group">
                                <label htmlFor="endereco">Logradouro:</label>
                                <input
                                    type="text"
                                    id="endereco"
                                    name="endereco"
                                    value={fornecedorData.endereco}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group small-input">
                                <label htmlFor="numero_endereco">Número:</label>
                                <input
                                    type="text"
                                    id="numero_endereco"
                                    name="numero_endereco"
                                    value={fornecedorData.numero_endereco}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="bairro">Bairro:</label>
                                <input
                                    type="text"
                                    id="bairro"
                                    name="bairro"
                                    value={fornecedorData.bairro}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="cidade">Cidade:</label>
                                <input
                                    type="text"
                                    id="cidade"
                                    name="cidade"
                                    value={fornecedorData.cidade}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group uf-select">
                                <label htmlFor="uf">UF:</label>
                                <select
                                    id="uf"
                                    name="uf"
                                    value={fornecedorData.uf}
                                    onChange={handleChange}
                                >
                                    <option value="">Selecione</option>
                                    {ufsBrasil.map(uf => (
                                        <option key={uf} value={uf}>{uf}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="cep">CEP:</label>
                                <input
                                    type="text"
                                    id="cep"
                                    name="cep"
                                    value={fornecedorData.cep}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="complemento">Complemento:</label>
                                <input
                                    type="text"
                                    id="complemento"
                                    name="complemento"
                                    value={fornecedorData.complemento}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button type="submit" disabled={loading}>
                                {loading ? (isEditing ? 'Atualizando...' : 'Cadastrando...') : (isEditing ? 'Salvar Alterações' : 'Cadastrar Fornecedor')}
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

export default FornecedorFormModal;