// C:\Users\Rodrigo Ramos
// SSD\Desktop\ARK\sistema-ark-frontend\src\pages\Fornecedores.jsx
import React, { useState, useEffect } from 'react';
import { getFornecedores, deleteFornecedor } from '../api/fornecedores-api';
import LoadingSpinner from '../components/LoadingSpinner';
import FornecedorFormModal from '../components/FornecedorFormModal';
import '../components/LoadingSpinner.css';
import '../styles/common-table.css';

function Fornecedores() {
    const [fornecedores, setFornecedores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [fornecedorToEdit, setFornecedorToEdit] = useState(null);
    const [actionMessage, setActionMessage] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchFornecedores = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getFornecedores();
            setFornecedores(data);
        } catch (err) {
            console.error("Erro ao buscar fornecedores:", err);
            setError("Erro ao carregar fornecedores. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFornecedores();
    }, []);

    const handleOpenCreateModal = () => {
        setFornecedorToEdit(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (fornecedor) => {
        setFornecedorToEdit(fornecedor);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setFornecedorToEdit(null);
    };

    const handleFornecedorSaved = () => {
        fetchFornecedores();
        handleCloseModal();
        setActionMessage('Fornecedor salvo com sucesso!');
        setTimeout(() => setActionMessage(null), 3000);
    };

    const handleDeleteFornecedor = async (id, nome) => {
        if (window.confirm(`Tem certeza que deseja excluir o fornecedor "${nome}" (ID:
            ${id})?`)) {
            try {
                await deleteFornecedor(id);
                setActionMessage(`Fornecedor "${nome}" (ID: ${id}) excluído com sucesso!`);
                fetchFornecedores();
                setTimeout(() => setActionMessage(null), 3000);
            } catch (err) {
                console.error('Erro ao excluir fornecedor:', err);
                const errorMessage = err.error || err.message || 'Erro desconhecido.';
                setActionMessage(`Erro ao excluir fornecedor. Detalhes: ${errorMessage}`);
                setTimeout(() => setActionMessage(null), 5000);
            }
        }
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredFornecedores = fornecedores.filter(fornecedor => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        return (
            fornecedor.nome.toLowerCase().includes(lowerCaseSearchTerm) ||
            (fornecedor.cpf_cnpj && fornecedor.cpf_cnpj.toLowerCase().includes(lowerCaseSearchTerm)) || // CPF/CNPJ
            (fornecedor.email && fornecedor.email.toLowerCase().includes(lowerCaseSearchTerm)) ||
            (fornecedor.telefone && fornecedor.telefone.toLowerCase().includes(lowerCaseSearchTerm)) ||
            (fornecedor.endereco && fornecedor.endereco.toLowerCase().includes(lowerCaseSearchTerm)) ||
            (fornecedor.numero_endereco && fornecedor.numero_endereco.toLowerCase().includes(lowerCaseSearchTerm)) || // Número Endereço
            (fornecedor.bairro && fornecedor.bairro.toLowerCase().includes(lowerCaseSearchTerm)) ||
            (fornecedor.cidade && fornecedor.cidade.toLowerCase().includes(lowerCaseSearchTerm)) ||
            (fornecedor.uf && fornecedor.uf.toLowerCase().includes(lowerCaseSearchTerm)) ||
            (fornecedor.cep && fornecedor.cep.toLowerCase().includes(lowerCaseSearchTerm)) ||
            (fornecedor.complemento && fornecedor.complemento.toLowerCase().includes(lowerCaseSearchTerm)) || // Complemento
            String(fornecedor.id).toLowerCase().includes(lowerCaseSearchTerm)
        );
    });

    if (loading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return <div style={{ color: 'red', textAlign: 'center' }}>{error}</div>;
    }

    return (
        <div>
            <h1>Fornecedores</h1>
            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                {actionMessage && (
                    <div style={{
                        padding: '10px',
                        borderRadius: '5px',
                        backgroundColor: actionMessage.includes('sucesso') ? '#d4edda' : '#f8d7da',
                        color: actionMessage.includes('sucesso') ? '#155724' : '#721c24',
                        border: '1px solid',
                        flexGrow: 1,
                        marginBottom: '10px'
                    }}>
                        {actionMessage}
                    </div>
                )}
                <button
                    onClick={handleOpenCreateModal}
                    style={{ padding: '10px 20px', backgroundColor: '#01579b', color: '#fff', border:
                        'none', borderRadius: '5px', cursor: 'pointer', fontSize: '1em' }}
                >
                    Cadastrar Novo Fornecedor
                </button>
            </div>
            <h2>Lista de Fornecedores</h2>
            <p>Gerenciamento de fornecedores.</p>
            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                <input
                    type="text"
                    placeholder="Pesquisar fornecedores..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    style={{ padding: '8px', width: '300px', borderRadius: '5px', border: '1px solid #ccc' }}
                />
            </div>
            <div style={{ overflowX: 'auto' }}>
                <table className="common-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nome/Razão Social</th>
                            <th>CPF/CNPJ</th> {/* Padronizado */}
                            <th>E-mail</th>
                            <th>Telefone</th>
                            <th>Endereço</th>
                            <th>Número</th> {/* Padronizado */}
                            <th>Bairro</th>
                            <th>Cidade</th>
                            <th>UF</th>
                            <th>CEP</th>
                            <th>Complemento</th> {/* Padronizado */}
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredFornecedores.length > 0 ? (
                            filteredFornecedores.map(fornecedor => (
                                <tr key={fornecedor.id}>
                                    <td>{fornecedor.id}</td>
                                    <td>{fornecedor.nome}</td>
                                    <td>{fornecedor.cpf_cnpj}</td>
                                    <td>{fornecedor.email}</td>
                                    <td>{fornecedor.telefone}</td>
                                    <td>{fornecedor.endereco}</td>
                                    <td>{fornecedor.numero_endereco}</td>
                                    <td>{fornecedor.bairro}</td>
                                    <td>{fornecedor.cidade}</td>
                                    <td>{fornecedor.uf}</td>
                                    <td>{fornecedor.cep}</td>
                                    <td>{fornecedor.complemento}</td>
                                    <td>
                                        <button
                                            onClick={() => handleOpenEditModal(fornecedor)}
                                            className="edit-button"
                                        >
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => handleDeleteFornecedor(fornecedor.id,
                                                fornecedor.nome)}
                                            className="delete-button"
                                        >
                                            Excluir
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                {/* ATUALIZADO: colSpan para 12 (11 colunas de dados + Ações) */}
                                <td colSpan="12" style={{ textAlign: 'center' }}>
                                    {searchTerm ? 'Nenhum fornecedor encontrado com este termo de pesquisa.' : 'Nenhum fornecedor cadastrado ainda.'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <FornecedorFormModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onFornecedorSaved={handleFornecedorSaved}
                fornecedorToEdit={fornecedorToEdit}
            />
        </div>
    );
}

export default Fornecedores;