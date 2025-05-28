// C:\Users\Rodrigo Ramos SSD\Desktop\ARK\sistema-ark-frontend\src\pages\PedidosFornecedor.jsx

import React, { useState, useEffect } from 'react';
import { getPedidosFornecedor, deletePedidoFornecedor } from '../api/pedidos-fornecedor-api';
// REMOVIDO: Não precisamos mais de getFornecedores aqui, pois o modal de WhatsApp filtra do pedido
// import { getFornecedores } from '../api/fornecedores-api'; 
import LoadingSpinner from '../components/LoadingSpinner';
import PedidoFornecedorFormModal from '../components/PedidoFornecedorFormModal';
import WhatsAppSenderModal from '../components/WhatsAppSenderModal'; // Importa o modal de envio de WhatsApp
import '../components/LoadingSpinner.css';
import '../styles/common-table.css';

// Função auxiliar para formatar data e preço
const formatDate = (dateString) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
};

const formatPrice = (value) => {
    return parseFloat(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

function PedidosFornecedor() {
    const [pedidos, setPedidos] = useState([]);
    // REMOVIDO: Não precisamos mais de um estado para todos os fornecedores aqui, o modal de WhatsApp resolve isso
    // const [fornecedores, setFornecedores] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [pedidoToEdit, setPedidoToEdit] = useState(null);
    const [actionMessage, setActionMessage] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0, 7));

    const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
    const [pedidoToSendViaWhatsApp, setPedidoToSendViaWhatsApp] = useState(null);

    const fetchPedidos = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getPedidosFornecedor();
            setPedidos(data);
        } catch (err) {
            console.error("Erro ao buscar pedidos de fornecedor:", err);
            setError("Erro ao carregar pedidos de fornecedor. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    // REMOVIDO: fetchFornecedores não é mais necessário aqui.
    // const fetchFornecedores = async () => {
    //     try {
    //         const data = await getFornecedores();
    //         setFornecedores(data);
    //     } catch (err) {
    //         console.error("Erro ao buscar fornecedores para WhatsApp:", err);
    //     }
    // };

    useEffect(() => {
        fetchPedidos();
        // REMOVIDO: fetchFornecedores() não é mais necessário aqui.
        // fetchFornecedores(); 
    }, []);

    const handleOpenCreateModal = () => {
        setPedidoToEdit(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (pedido) => {
        setPedidoToEdit(pedido);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setPedidoToEdit(null);
    };

    const handlePedidoSaved = () => {
        fetchPedidos();
        handleCloseModal();
        setActionMessage('Pedido de Fornecedor salvo com sucesso!');
        setTimeout(() => setActionMessage(null), 3000);
    };

    const handleDeletePedido = async (id, data) => {
        if (window.confirm(`Tem certeza que deseja excluir o pedido de ${formatDate(data)} (ID: ${id})?`)) {
            try {
                await deletePedidoFornecedor(id);
                setActionMessage(`Pedido de Fornecedor (ID: ${id}) excluído com sucesso!`);
                fetchPedidos();
                setTimeout(() => setActionMessage(null), 3000);
            } catch (err) {
                console.error('Erro ao excluir pedido de fornecedor:', err);
                const errorMessage = err.error || err.message || 'Erro desconhecido.';
                setActionMessage(`Erro ao excluir pedido de fornecedor. Detalhes: ${errorMessage}`);
                setTimeout(() => setActionMessage(null), 5000);
            }
        }
    };

    const handleOpenWhatsAppModal = (pedido) => {
        setPedidoToSendViaWhatsApp(pedido);
        setIsWhatsAppModalOpen(true);
    };

    const handleCloseWhatsAppModal = () => {
        setIsWhatsAppModalOpen(false);
        setPedidoToSendViaWhatsApp(null);
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleMonthFilterChange = (e) => {
        setFilterMonth(e.target.value);
    };

    const filteredPedidos = pedidos.filter(pedido => {
        const pedidoMonth = pedido.data_pedido ? pedido.data_pedido.slice(0, 7) : "";
        const monthMatch = filterMonth ? pedidoMonth === filterMonth : true;

        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        const searchMatch = (
            (pedido.fornecedor &&
                pedido.fornecedor.nome.toLowerCase().includes(lowerCaseSearchTerm)) ||
            (pedido.status && pedido.status.toLowerCase().includes(lowerCaseSearchTerm)) ||
            (pedido.itens && pedido.itens.some(item =>
                item.produto &&
                item.produto.nome.toLowerCase().includes(lowerCaseSearchTerm)
            )) ||
            String(pedido.id).toLowerCase().includes(lowerCaseSearchTerm)
        );
        return monthMatch && searchMatch;
    });

    const totalPeriodo = filteredPedidos.reduce((total, pedido) => {
        const pedidoTotal = pedido.itens.reduce((sum, item) => {
            const quantidade = parseFloat(item.quantidade) || 0;
            const preco = parseFloat(item.preco_unitario) || 0;
            return sum + (quantidade * preco);
        }, 0);
        return total + pedidoTotal;
    }, 0);

    if (loading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return <div style={{ color: 'red', textAlign: 'center' }}>{error}</div>;
    }

    return (
        <div>
            <h1>Pedidos de Fornecedor</h1>
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
                <button
                    onClick={handleOpenCreateModal}
                    style={{ padding: '10px 20px', backgroundColor: '#01579b', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '1em' }}
                >
                    Fazer Pedido
                </button>
            </div>

            <h2>Lista de Pedidos</h2>
            <p>Gerenciamento de pedidos aos fornecedores.</p>

            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="filter-group">
                    <label htmlFor="filterMonth">Filtrar por Mês: </label>
                    <input
                        type="month"
                        id="filterMonth"
                        name="filterMonth"
                        value={filterMonth}
                        onChange={handleMonthFilterChange}
                        style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }}
                    />
                </div>
                <div className="search-group">
                    <input
                        type="text"
                        placeholder="Pesquisar pedidos..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        style={{ padding: '8px', width: '300px', borderRadius: '5px', border: '1px solid #ccc' }}
                    />
                </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table className="common-table">
                    <thead>
                        <tr>
                            <th>ID Pedido</th>
                            <th>Data</th>
                            <th>Fornecedor</th>
                            <th>Status</th>
                            <th>Itens (Qtd. Produto - Valor)</th>
                            <th>Total Pedido</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPedidos.length > 0 ? (
                            filteredPedidos.map(pedido => (
                                <tr key={pedido.id}>
                                    <td>{pedido.id}</td>
                                    <td>{formatDate(pedido.data_pedido)}</td>
                                    <td>{pedido.fornecedor ? pedido.fornecedor.nome : 'N/A'}</td>
                                    <td>{pedido.status}</td>
                                    <td>
                                        <ul style={{ margin: 0, padding: '0 0 0 15px', listStyle: 'disc' }}>
                                            {pedido.itens && pedido.itens.length > 0 ? (
                                                pedido.itens.map(item => (
                                                    <li key={item.id || item.produtoId}>
                                                        {item.quantidade} x {item.produto ? item.produto.nome : 'Produto Desconhecido'} ({formatPrice(item.preco_unitario)})
                                                        {item.cliente && ` p/${item.cliente.nome}`}
                                                        {item.caminhao && ` no ${item.caminhao.modelo} (${item.caminhao.placa})`}
                                                        {item.observacoes && ` (Obs: ${item.observacoes})`}
                                                    </li>
                                                ))
                                            ) : (
                                                <li>Nenhum item</li>
                                            )}
                                        </ul>
                                    </td>
                                    <td>{formatPrice(pedido.itens.reduce((sum, item) => sum + (parseFloat(item.quantidade) * parseFloat(item.preco_unitario)), 0))}</td>
                                    <td>
                                        <button
                                            onClick={() => handleOpenEditModal(pedido)}
                                            className="edit-button"
                                        >
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => handleDeletePedido(pedido.id, pedido.data_pedido)}
                                            className="delete-button"
                                        >
                                            Excluir
                                        </button>
                                        {/* NOVO BOTÃO: Enviar WhatsApp */}
                                        <button
                                            onClick={() => handleOpenWhatsAppModal(pedido)}
                                            className="send-whatsapp-button"
                                            style={{ marginLeft: '5px', backgroundColor: '#25d366', color: 'white' }}
                                        >
                                            WhatsApp
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" style={{ textAlign: 'center' }}>
                                    {searchTerm || filterMonth ? 'Nenhum pedido encontrado com os filtros aplicados.' : 'Nenhum pedido cadastrado ainda.'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Rodapé com total do período */}
            <div className="table-footer-total">
                <strong>Total do Período:</strong> {formatPrice(totalPeriodo)}
            </div>

            <PedidoFornecedorFormModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onPedidoSaved={handlePedidoSaved}
                pedidoToEdit={pedidoToEdit}
            />

            {/* NOVO: Renderiza o WhatsAppSenderModal */}
            <WhatsAppSenderModal
                isOpen={isWhatsAppModalOpen}
                onClose={handleCloseWhatsAppModal}
                pedido={pedidoToSendViaWhatsApp}
                // fornecedores={fornecedores} REMOVIDO: O modal de WhatsApp não precisa mais da lista completa de fornecedores.
            />
        </div>
    );
}

export default PedidosFornecedor;