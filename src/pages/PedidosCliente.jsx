// C:\Users\Rodrigo Ramos
// SSD\Desktop\ARK\sistema-ark-frontend\src\pages\PedidosCliente.jsx
import React, { useState, useEffect } from 'react';
import { getPedidosCliente, deletePedidoCliente } from '../api/pedidos-cliente-api'; // API real de pedidos de cliente
import LoadingSpinner from '../components/LoadingSpinner';
import PedidoClienteFormModal from '../components/PedidoClienteFormModal'; // Novo modal de formulário
import RomaneioPrintModal from '../components/RomaneioPrintModal'; // NOVO: Importar RomaneioPrintModal
import NotaPrintModal from '../components/NotaPrintModal';       // NOVO: Importar NotaPrintModal
// import PlanilhaGeralPrintModal from '../components/PlanilhaGeralPrintModal'; // Será criado na próxima fase
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

function PedidosCliente() {
    const [pedidos, setPedidos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [pedidoToEdit, setPedidoToEdit] = useState(null);
    const [actionMessage, setActionMessage] = useState(null);
    const [selectedPedidos, setSelectedPedidos] = useState({}); // Stores { pedidoId: true/false }
    const [searchTerm, setSearchTerm] = useState("");
    
    const today = new Date().toISOString().split('T')[0];
    const [filterStartDate, setFilterStartDate] = useState(today);
    const [filterEndDate, setFilterEndDate] = useState(today);

    // Estados para controlar a abertura dos modais de impressão
    const [isRomaneioModalOpen, setIsRomaneioModalOpen] = useState(false);
    const [isNotaModalOpen, setIsNotaModalOpen] = useState(false);
    const [isPlanilhaGeralModalOpen, setIsPlanilhaGeralModalOpen] = useState(false);
    const [pedidosParaImpressao, setPedidosParaImpressao] = useState([]); // Array de objetos de pedidos completos para os modais de impressão

    const fetchPedidos = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getPedidosCliente();
            setPedidos(data);
        } catch (err) {
            console.error("Erro ao buscar pedidos de cliente:", err);
            setError("Erro ao carregar pedidos de cliente. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPedidos();
    }, []);

    const handleOpenCreateModal = () => {
        setPedidoToEdit(null);
        setIsFormModalOpen(true);
    };

    const handleOpenEditModal = (pedido) => {
        setPedidoToEdit(pedido);
        setIsFormModalOpen(true);
    };

    const handleCloseFormModal = () => {
        setIsFormModalOpen(false);
        setPedidoToEdit(null);
    };

    const handlePedidoSaved = () => {
        fetchPedidos();
        handleCloseFormModal();
        setActionMessage('Pedido de Cliente salvo com sucesso!');
        setTimeout(() => setActionMessage(null), 3000);
    };

    const handleDeletePedido = async (id, clienteNome) => {
        if (window.confirm(`Tem certeza que deseja excluir o pedido do cliente ${clienteNome} (ID: ${id})?`)) {
            try {
                await deletePedidoCliente(id);
                setActionMessage(`Pedido de Cliente (ID: ${id}) excluído com sucesso!`);
                fetchPedidos();
                setTimeout(() => setActionMessage(null), 3000);
            } catch (err) {
                console.error('Erro ao excluir pedido de cliente:', err);
                const errorMessage = err.error || err.message || 'Erro desconhecido.';
                setActionMessage(`Erro ao excluir pedido de cliente. Detalhes: ${errorMessage}`);
                setTimeout(() => setActionMessage(null), 5000);
            }
        }
    };

    // Lógica para seleção de pedidos
    const handleSelectPedido = (id) => {
        setSelectedPedidos(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleSelectAll = () => {
        const allSelected = filteredPedidos.every(pedido => selectedPedidos[pedido.id]);
        const newSelected = {};
        if (!allSelected) {
            filteredPedidos.forEach(pedido => {
                newSelected[pedido.id] = true;
            });
        }
        setSelectedPedidos(newSelected);
    };

    const handleDeselectAll = () => {
        setSelectedPedidos({});
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleFilterStartDateChange = (e) => {
        setFilterStartDate(e.target.value);
    };

    const handleFilterEndDateChange = (e) => {
        setFilterEndDate(e.target.value);
    };

    const filteredPedidos = pedidos.filter(pedido => {
        const pedidoDate = pedido.data_pedido;
        const dateMatch = (pedidoDate >= filterStartDate && pedidoDate <= filterEndDate);
        
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        const searchMatch = (
            (pedido.cliente && pedido.cliente.nome.toLowerCase().includes(lowerCaseSearchTerm)) ||
            (pedido.status && pedido.status.toLowerCase().includes(lowerCaseSearchTerm)) ||
            (pedido.itens && pedido.itens.some(item =>
                item.produto &&
                item.produto.nome.toLowerCase().includes(lowerCaseSearchTerm)
            )) ||
            String(pedido.id).toLowerCase().includes(lowerCaseSearchTerm)
        );
        return dateMatch && searchMatch;
    });

    const totalLucroPeriodo = filteredPedidos.reduce((total, pedido) => {
        return total + (parseFloat(pedido.valor_lucro_total) || 0);
    }, 0);

    const totalVendaPeriodo = filteredPedidos.reduce((total, pedido) => {
        return total + (parseFloat(pedido.valor_venda_total) || 0);
    }, 0);

    // Funções para abrir modais de impressão
    const handleOpenRomaneioModal = () => {
        const selected = filteredPedidos.filter(pedido => selectedPedidos[pedido.id]);
        if (selected.length === 0) {
            alert('Selecione pelo menos um pedido para imprimir o romaneio.');
            return;
        }
        setPedidosParaImpressao(selected);
        setIsRomaneioModalOpen(true);
    };

    const handleCloseRomaneioModal = () => {
        setIsRomaneioModalOpen(false);
        setPedidosParaImpressao([]);
        setSelectedPedidos({}); // Desseleciona todos os pedidos após fechar o modal
    };

    const handleOpenNotaModal = () => {
        const selected = filteredPedidos.filter(pedido => selectedPedidos[pedido.id]);
        if (selected.length === 0) {
            alert('Selecione pelo menos um pedido para imprimir a nota.');
            return;
        }
        setPedidosParaImpressao(selected);
        setIsNotaModalOpen(true);
    };

    const handleCloseNotaModal = () => {
        setIsNotaModalOpen(false);
        setPedidosParaImpressao([]);
        setSelectedPedidos({}); // Desseleciona todos os pedidos após fechar o modal
    };

    const handleOpenPlanilhaGeralModal = () => {
        // Para a planilha geral, não precisa de seleção, vai usar os pedidos filtrados pelo dia
        // A lógica de agregação por dia será dentro do modal de planilha
        const pedidosDoDiaFiltrado = filteredPedidos.filter(p => p.data_pedido === filterStartDate); // Ou outro critério de "dia"
        
        if (pedidosDoDiaFiltrado.length === 0) {
            alert('Nenhum pedido encontrado para a data selecionada para gerar a planilha geral.');
            return;
        }
        setPedidosParaImpressao(pedidosDoDiaFiltrado);
        setIsPlanilhaGeralModalOpen(true);
    };

    const handleClosePlanilhaGeralModal = () => {
        setIsPlanilhaGeralModalOpen(false);
        setPedidosParaImpressao([]);
        // Não reseta selectedPedidos aqui, pois a planilha geral não depende de seleção por checkbox
    };


    if (loading) {
        return <LoadingSpinner />;
    }
    if (error) {
        return <div style={{ color: 'red', textAlign: 'center' }}>{error}</div>;
    }

    return (
        <div>
            <h1>Pedidos do Cliente</h1>
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
                    Realizar Pedido
                </button>
            </div>
            <h2>Lista de Pedidos</h2>
            <p>Gerenciamento de pedidos dos clientes.</p>
            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <div className="filter-group">
                    <label htmlFor="filterStartDate">Período Inicial: </label>
                    <input
                        type="date"
                        id="filterStartDate"
                        name="filterStartDate"
                        value={filterStartDate}
                        onChange={handleFilterStartDateChange}
                        style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }}
                    />
                </div>
                <div className="filter-group">
                    <label htmlFor="filterEndDate">Período Final: </label>
                    <input
                        type="date"
                        id="filterEndDate"
                        name="filterEndDate"
                        value={filterEndDate}
                        onChange={handleFilterEndDateChange}
                        style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }}
                    />
                </div>
                <div className="search-group" style={{ flexGrow: 1 }}>
                    <input
                        type="text"
                        placeholder="Pesquisar pedidos..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        style={{ padding: '8px', width: '100%', borderRadius: '5px', border: '1px solid #ccc' }}
                    />
                </div>
            </div>

            {/* Ações de seleção e impressão */}
            <div style={{ marginBottom: '15px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button className="secondary-button" onClick={handleSelectAll}>Selecionar Todos</button>
                <button className="secondary-button" onClick={handleDeselectAll}>Desmarcar Todos</button>
                
                <button className="print-button" onClick={handleOpenRomaneioModal} disabled={Object.keys(selectedPedidos).length === 0}>Imprimir Romaneio</button>
                <button className="print-button" onClick={handleOpenNotaModal} disabled={Object.keys(selectedPedidos).length === 0}>Imprimir Nota</button>
                <button className="print-button" onClick={handleOpenPlanilhaGeralModal}>Imprimir Planilha Geral do Dia</button>
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table className="common-table">
                    <thead>
                        <tr>
                            <th style={{ width: '30px' }}></th> {/* Coluna para o checkbox */}
                            <th>Data</th>
                            <th>Cliente</th>
                            <th>Valor de Custo</th>
                            <th>Valor de Lucro</th>
                            <th>Valor Total da Venda</th>
                            <th>Status</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPedidos.length > 0 ? (
                            filteredPedidos.map(pedido => (
                                <tr key={pedido.id}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={!!selectedPedidos[pedido.id]}
                                            onChange={() => handleSelectPedido(pedido.id)}
                                        />
                                    </td>
                                    <td>{formatDate(pedido.data_pedido)}</td>
                                    <td>{pedido.cliente ? pedido.cliente.nome : 'N/A'}</td>
                                    <td>{formatPrice(pedido.valor_custo_total)}</td>
                                    <td>{formatPrice(pedido.valor_lucro_total)}</td>
                                    <td>{formatPrice(pedido.valor_venda_total)}</td>
                                    <td>{pedido.status}</td>
                                    <td>
                                        <button
                                            onClick={() => handleOpenEditModal(pedido)}
                                            className="edit-button"
                                        >
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => handleDeletePedido(pedido.id, pedido.cliente ? pedido.cliente.nome : 'N/A')}
                                            className="delete-button"
                                        >
                                            Excluir
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="8" style={{ textAlign: 'center' }}>
                                    {searchTerm || filterStartDate !== today || filterEndDate !== today ? 'Nenhum pedido encontrado com os filtros aplicados.' : 'Nenhum pedido cadastrado ainda.'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {/* Rodapé com totais de lucro e venda */}
            <div className="table-footer-total" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px' }}>
                <strong>Total de Lucro no Período:</strong> {formatPrice(totalLucroPeriodo)}
                <strong>Total de Venda no Período:</strong> {formatPrice(totalVendaPeriodo)}
            </div>

            {/* Modal de formulário para Pedidos do Cliente */}
            <PedidoClienteFormModal
                isOpen={isFormModalOpen}
                onClose={handleCloseFormModal}
                onPedidoSaved={handlePedidoSaved}
                pedidoToEdit={pedidoToEdit}
            />

            {/* Modais de impressão */}
            <RomaneioPrintModal
                isOpen={isRomaneioModalOpen}
                onClose={handleCloseRomaneioModal}
                selectedPedidos={pedidosParaImpressao}
            />
            <NotaPrintModal
                isOpen={isNotaModalOpen}
                onClose={handleCloseNotaModal}
                selectedPedidos={pedidosParaImpressao}
            />
            {/* PlanilhaGeralPrintModal será adicionado aqui em breve */}
            {/* <PlanilhaGeralPrintModal
                isOpen={isPlanilhaGeralModalOpen}
                onClose={handleClosePlanilhaGeralModal}
                pedidosDoDia={pedidosParaImpressao}
                selectedDate={filterStartDate} // Passa a data selecionada para a planilha
            /> */}
        </div>
    );
}

export default PedidosCliente;