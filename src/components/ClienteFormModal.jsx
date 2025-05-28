// C:\Users\Rodrigo Ramos
// SSD\Desktop\ARK\sistema-ark-frontend\src\components\ClienteFormModal.jsx
import React, { useState, useEffect } from 'react';
import { createCliente, updateCliente } from '../api/api';
import '../styles/common-modal.css';

function ClienteFormModal({ isOpen, onClose, onClienteSaved, clienteToEdit }) {
    const [clienteData, setClienteData] = useState({
        nome: '',
        cpf_cnpj: '',
        email: '',
        telefone: '', // Será o telefone com máscara
        endereco: '',
        numero_endereco: '',
        bairro: '',
        cidade: '',
        uf: '',
        cep: '',
        complemento: ''
    });
    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(false);
    const isEditing = !!clienteToEdit;

    const ufsBrasil = [
        'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
        'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
    ];

    useEffect(() => {
        if (isOpen) {
            if (isEditing) {
                setClienteData({
                    nome: clienteToEdit.nome || '',
                    cpf_cnpj: clienteToEdit.cpf_cnpj || '',
                    email: clienteToEdit.email || '',
                    telefone: clienteToEdit.telefone || '', // Carrega o telefone
                    endereco: clienteToEdit.endereco || '',
                    numero_endereco: clienteToEdit.numero_endereco || '',
                    bairro: clienteToEdit.bairro || '',
                    cidade: clienteToEdit.cidade || '',
                    uf: clienteToEdit.uf || '',
                    cep: clienteToEdit.cep || '',
                    complemento: clienteToEdit.complemento || ''
                });
            } else {
                setClienteData({
                    nome: '', cpf_cnpj: '', email: '', telefone: '', endereco: '',
                    numero_endereco: '', bairro: '', cidade: '', uf: '', cep: '', complemento: ''
                });
            }
            setMessage(null);
        }
    }, [isOpen, isEditing, clienteToEdit]);

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
            setClienteData(prevData => ({
                ...prevData,
                [name]: maskPhoneNumber(value) // Aplica a máscara ao telefone
            }));
        } else {
            setClienteData(prevData => ({
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
                ...clienteData,
                telefone: clienteData.telefone.replace(/\D/g, "") // Envia apenas dígitos para o backend
            };

            let savedCliente;
            if (isEditing) {
                savedCliente = await updateCliente(clienteToEdit.id, dataToSend);
                setMessage(`Cliente "${savedCliente.nome}" (ID: ${savedCliente.id}) atualizado com sucesso!`);
            } else {
                savedCliente = await createCliente(dataToSend);
                setMessage(`Cliente "${savedCliente.nome}" (ID: ${savedCliente.id}) cadastrado com sucesso!`);
                setClienteData({
                    nome: '', cpf_cnpj: '', email: '', telefone: '', endereco: '',
                    numero_endereco: '', bairro: '', cidade: '', uf: '', cep: '', complemento: ''
                });
            }
            if (onClienteSaved) {
                onClienteSaved();
            }
        } catch (err) {
            console.error('Erro ao salvar cliente:', err);
            const errorMessage = err.error || err.message || 'Erro desconhecido.';
            setMessage(`Erro ao salvar cliente. Detalhes: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{isEditing ? 'Editar Cliente' : 'Cadastrar Novo Cliente'}</h2>
                    <button className="close-button" onClick={onClose}>&times;</button>
                </div>
                <div className="modal-body">
                    {message && (
                        <div className={`message-box ${message.includes('sucesso') ? 'success' : 'error'}`}>
                            {message}
                        </div>
                    )}
                    <form onSubmit={handleSubmit}>
                        <h3>Dados Pessoais</h3>
                        <div className="section-container">
                            <div className="form-group">
                                <label htmlFor="nome">Nome:</label>
                                <input
                                    type="text"
                                    id="nome"
                                    name="nome"
                                    value={clienteData.nome}
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
                                    value={clienteData.cpf_cnpj}
                                    onChange={handleChange}
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
                                    value={clienteData.email}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="telefone">Telefone:</label>
                                <input
                                    type="text"
                                    id="telefone"
                                    name="telefone"
                                    value={clienteData.telefone}
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
                                    value={clienteData.endereco}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group small-input">
                                <label htmlFor="numero_endereco">Número:</label>
                                <input
                                    type="text"
                                    id="numero_endereco"
                                    name="numero_endereco"
                                    value={clienteData.numero_endereco}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="bairro">Bairro:</label>
                                <input
                                    type="text"
                                    id="bairro"
                                    name="bairro"
                                    value={clienteData.bairro}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="cidade">Cidade:</label>
                                <input
                                    type="text"
                                    id="cidade"
                                    name="cidade"
                                    value={clienteData.cidade}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group uf-select">
                                <label htmlFor="uf">UF:</label>
                                <select
                                    id="uf"
                                    name="uf"
                                    value={clienteData.uf}
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
                                    value={clienteData.cep}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="complemento">Complemento:</label>
                                <input
                                    type="text"
                                    id="complemento"
                                    name="complemento"
                                    value={clienteData.complemento}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button type="submit" disabled={loading}>
                                {loading ? (isEditing ? 'Atualizando...' : 'Cadastrando...') : (isEditing ? 'Salvar Alterações' : 'Cadastrar Cliente')}
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

export default ClienteFormModal;