// C:\Users\Rodrigo Ramos SSD\Desktop\ARK\sistema-ark-frontend\src\pages\Clientes.jsx
import React, { useState, useEffect } from 'react';
import { getClientes, deleteCliente } from '../api/api';
import LoadingSpinner from '../components/LoadingSpinner';
import ClienteFormModal from '../components/ClienteFormModal';
import '../components/LoadingSpinner.css';
import '../styles/common-table.css';

function Clientes() {
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false); // Estado para controlar a visibilidade do modal
    const [clienteToEdit, setClienteToEdit] = useState(null); // Armazena cliente para edição
    const [actionMessage, setActionMessage] = useState(null); // Mensagem para ações
    const [searchTerm, setSearchTerm] = useState(''); // Termo de pesquisa

    const fetchClientes = async () => {
        setLoading(true);
        setError(null);
        try {
            // ATUALIZADO: getClientes() agora retorna os dados diretamente, não response.data
            const data = await getClientes(); 
            setClientes(data); // Define os clientes com os dados recebidos
        } catch (err) {
            console.error("Erro ao buscar clientes:", err);
            setError("Erro ao carregar clientes. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClientes();
    }, []);

    // Função para abrir o modal no modo de cadastro
    const handleOpenCreateModal = () => {
        setClienteToEdit(null); // Garante que o modal esteja no modo de cadastro
        setIsModalOpen(true);
    };

    // Função para abrir o modal no modo de edição
    const handleOpenEditModal = (cliente) => {
        setClienteToEdit(cliente); // Define o cliente a ser editado
        setIsModalOpen(true);
    };

    // Função para fechar o modal
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setClienteToEdit(null); // Limpa o cliente a ser editado ao fechar
    };

    // Função para lidar com o cliente salvo (criado ou editado)
    const handleClienteSaved = () => {
        fetchClientes(); // Recarrega a lista de clientes para incluir o novo/atualizado
        handleCloseModal(); // Fecha o modal
        setActionMessage('Cliente salvo com sucesso!'); // Mensagem genérica para sucesso de salvar
        setTimeout(() => setActionMessage(null), 3000); // Limpa a mensagem após 3 segundos
    };

    // Função para lidar com a exclusão de um cliente
    const handleDeleteCliente = async (id, nome) => {
        if (window.confirm(`Tem certeza que deseja excluir o cliente "${nome}" (ID: ${id})?`)) {
            try {
                await deleteCliente(id);
                setActionMessage(`Cliente "${nome}" (ID: ${id}) excluído com sucesso!`);
                fetchClientes(); // Recarrega a lista após a exclusão
                setTimeout(() => setActionMessage(null), 3000); // Limpa a mensagem
            } catch (err) {
                console.error('Erro ao excluir cliente:', err);
                const errorMessage = err.error || err.message || 'Erro desconhecido.';
                setActionMessage(`Erro ao excluir cliente. Detalhes: ${errorMessage}`);
                setTimeout(() => setActionMessage(null), 5000); // Limpa a mensagem de erro mais tarde
            }
        }
    };

    // Função para lidar com a mudança no campo de pesquisa
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    // Lógica para filtrar os clientes exibidos
    // Adicionado ? antes de .filter para garantir que clientes seja um array antes de chamar filter
    const filteredClientes = clientes?.filter(cliente => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        return (
            cliente.nome.toLowerCase().includes(lowerCaseSearchTerm) ||
            (cliente.telefone && cliente.telefone.toLowerCase().includes(lowerCaseSearchTerm)) ||
            (cliente.endereco && cliente.endereco.toLowerCase().includes(lowerCaseSearchTerm)) ||
            (cliente.bairro && cliente.bairro.toLowerCase().includes(lowerCaseSearchTerm)) ||
            (cliente.cpf_cnpj && cliente.cpf_cnpj.toLowerCase().includes(lowerCaseSearchTerm)) ||
            (cliente.cidade && cliente.cidade.toLowerCase().includes(lowerCaseSearchTerm)) ||
            (cliente.uf && cliente.uf.toLowerCase().includes(lowerCaseSearchTerm)) ||
            (cliente.email && cliente.email.toLowerCase().includes(lowerCaseSearchTerm)) ||
            (cliente.cep && cliente.cep.toLowerCase().includes(lowerCaseSearchTerm)) ||
            (cliente.numero_endereco && cliente.numero_endereco.toLowerCase().includes(lowerCaseSearchTerm)) ||
            (cliente.complemento && cliente.complemento.toLowerCase().includes(lowerCaseSearchTerm)) ||
            String(cliente.id).toLowerCase().includes(lowerCaseSearchTerm)
        );
    }) || []; // Garante que filteredClientes seja um array vazio se clientes for undefined/null

    if (loading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return <div style={{ color: 'red', textAlign: 'center' }}>{error}</div>;
    }

    return (
        <div>
            <h1>Clientes</h1>
            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
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
                {/* BOTÃO QUE ABRE O MODAL DE CADASTRO */}
                <button
                    onClick={handleOpenCreateModal}
                    style={{ padding: '10px 20px', backgroundColor: '#01579b', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '1em' }}
                >
                    Cadastrar Novo Cliente
                </button>
            </div>

            <h2>Lista de Clientes</h2>
            <p>Gerenciamento de clientes.</p>

            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                <input
                    type="text"
                    placeholder="Pesquisar clientes..."
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
                            <th>Nome</th>
                            <th>CPF/CNPJ</th>
                            <th>E-mail</th>
                            <th>Telefone</th>
                            <th>Endereço</th>
                            <th>Número</th>
                            <th>Bairro</th>
                            <th>Cidade</th>
                            <th>UF</th>
                            <th>CEP</th>
                            <th>Complemento</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* Garante que filteredClientes é um array antes de chamar .length */}
                        {filteredClientes.length > 0 ? ( 
                            filteredClientes.map(cliente => (
                                <tr key={cliente.id}>
                                    <td>{cliente.id}</td>
                                    <td>{cliente.nome}</td>
                                    <td>{cliente.cpf_cnpj}</td>
                                    <td>{cliente.email}</td>
                                    <td>{cliente.telefone}</td>
                                    <td>{cliente.endereco}</td>
                                    <td>{cliente.numero_endereco}</td>
                                    <td>{cliente.bairro}</td>
                                    <td>{cliente.cidade}</td>
                                    <td>{cliente.uf}</td>
                                    <td>{cliente.cep}</td>
                                    <td>{cliente.complemento}</td>
                                    <td>
                                        <button
                                            onClick={() => handleOpenEditModal(cliente)}
                                            className="edit-button"
                                        >
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => handleDeleteCliente(cliente.id, cliente.nome)}
                                            className="delete-button"
                                        >
                                            Excluir
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="13" style={{ textAlign: 'center' }}>
                                    {searchTerm ? 'Nenhum cliente encontrado com este termo de pesquisa.' : 'Nenhum cliente cadastrado ainda.'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Renderiza o ClienteFormModal - ele só será visível se isModalOpen for true */}
            <ClienteFormModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onClienteSaved={handleClienteSaved}
                clienteToEdit={clienteToEdit}
            />
        </div>
    );
}

export default Clientes;