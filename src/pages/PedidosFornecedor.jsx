// C:\Users\Rodrigo Ramos
// SSD\Desktop\ARK\sistema-ark-frontend\src\pages\PedidosFornecedor.jsx
import React, { useState, useEffect } from 'react';
import { getPedidosFornecedor, deletePedidoFornecedor } from '../api/pedidos-fornecedor-api';
import { getFornecedores } from '../api/fornecedores-api';
import LoadingSpinner from '../components/LoadingSpinner';
import PedidoFornecedorFormModal from '../components/PedidoFornecedorFormModal';
import WhatsAppSenderModal from '../components/WhatsAppSenderModal';
import PedidoFornecedorPrintModal from '../components/PedidoFornecedorPrintModal'; // NOVO: Importa o modal de impressão

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
    const [fornecedores, setFornecedores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [pedidoToEdit, setPedidoToEdit] = useState(null);
    const [actionMessage, setActionMessage] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0, 7));
    const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
    const [pedidoToSendViaWhatsApp, setPedidoToSendViaWhatsApp] = useState(null);
    const [isPrintModalOpen, setIsPrintModalOpen] = useState(false); // NOVO: Estado para o modal de impressão
    const [pedidoToPrint, setPedidoToPrint] = useState(null); // NOVO: Pedido a ser impresso

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

    // Função para buscar todos os fornecedores (necessário para o modal do WhatsApp e Print)
    const fetchFornecedores = async () => {
        try {
            const data = await getFornecedores();
            setFornecedores(data);
        } catch (err) {
            console.error("Erro ao buscar fornecedores para modais:", err);
            // Não define erro na tela principal, pois é um erro secundário
        }
    };

    useEffect(() => {
        fetchPedidos();
        fetchFornecedores(); // Busca fornecedores ao carregar a página
    }, []);

    // Abre o modal no modo de cadastro
    const handleOpenCreateModal = () => {
        setPedidoToEdit(null);
        setIsModalOpen(true);
    };

    // Abre o modal no modo de edição
    const handleOpenEditModal = (pedido) => {
        setPedidoToEdit(pedido);
        setIsModalOpen(true);
    };

    // Fecha o modal de Edição/Criação
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setPedidoToEdit(null);
    };

    // Chamado quando um pedido é salvo (criado ou editado)
    const handlePedidoSaved = () => {
        fetchPedidos(); // Recarrega a lista
        handleCloseModal(); // Fecha o modal
        setActionMessage('Pedido de Fornecedor salvo com sucesso!');
        setTimeout(() => setActionMessage(null), 3000);
    };

    // Lida com a exclusão de pedido
    const handleDeletePedido = async (id, data) => {
        if (window.confirm(`Tem certeza que deseja excluir o pedido de ${formatDate(data)} (ID: ${id})?`)) {
            try {
                await deletePedidoFornecedor(id);
                setActionMessage(`Pedido de Fornecedor (ID: ${id}) excluído com sucesso!`);
                fetchPedidos(); // Recarrega a lista
                setTimeout(() => setActionMessage(null), 3000);
            } catch (err) {
                console.error('Erro ao excluir pedido de fornecedor:', err);
                const errorMessage = err.error || err.message || 'Erro desconhecido.';
                setActionMessage(`Erro ao excluir pedido de fornecedor. Detalhes: ${errorMessage}`);
                setTimeout(() => setActionMessage(null), 5000);
            }
        }
    };

    // Abre o modal do WhatsApp
    const handleOpenWhatsAppModal = (pedido) => {
        setPedidoToSendViaWhatsApp(pedido);
        setIsWhatsAppModalOpen(true);
    };

    // Fecha o modal do WhatsApp
    const handleCloseWhatsAppModal = () => {
        setIsWhatsAppModalOpen(false);
        setPedidoToSendViaWhatsApp(null);
    };

    // NOVO: Abre o modal de impressão
    const handleOpenPrintModal = (pedido) => {
        setPedidoToPrint(pedido);
        setIsPrintModalOpen(true);
    };

    // NOVO: Fecha o modal de impressão
    const handleClosePrintModal = () => {
        setIsPrintModalOpen(false);
        setPedidoToPrint(null);
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
                            <th>Status</th>
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
                                    <td>{pedido.status}</td>
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
                                        <button
                                            onClick={() => handleOpenWhatsAppModal(pedido)}
                                            className="send-whatsapp-button"
                                            style={{ marginLeft: '5px', backgroundColor: '#25d366', color: 'white' }}
                                        >
                                            WhatsApp
                                        </button>
                                        {/* NOVO BOTÃO: Imprimir/PDF */}
                                        <button
                                            onClick={() => handleOpenPrintModal(pedido)}
                                            className="print-button"
                                            style={{ marginLeft: '5px', backgroundColor: '#007bff', color: 'white' }}
                                        >
                                            Imprimir/PDF
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                {/* colSpan é 5 agora: ID Pedido, Data, Status, Total Pedido, Ações */}
                                <td colSpan="5" style={{ textAlign: 'center' }}>
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
            {/* Renderiza o WhatsAppSenderModal */}
            <WhatsAppSenderModal
                isOpen={isWhatsAppModalOpen}
                onClose={handleCloseWhatsAppModal}
                pedido={pedidoToSendViaWhatsApp}
            />
            {/* NOVO: Renderiza o PedidoFornecedorPrintModal */}
            <PedidoFornecedorPrintModal
                isOpen={isPrintModalOpen}
                onClose={handleClosePrintModal}
                pedido={pedidoToPrint}
            />
        </div>
    );
}

export default PedidosFornecedor;