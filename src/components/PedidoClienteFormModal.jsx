// C:\Users\Rodrigo Ramos
// SSD\Desktop\ARK\sistema-ark-frontend\src\components\PedidoClienteFormModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { createPedidoCliente, updatePedidoCliente } from '../api/pedidos-cliente-api'; // Nova API de pedidos de cliente
import { getClientes } from '../api/api'; // getClientes continua aqui
import { getProdutos } from '../api/produtos-api'; // getProdutos do backend real
import '../styles/common-modal.css';
import '../styles/PedidoClienteFormModal.css'; // Criaremos este CSS a seguir

// Função auxiliar para formatar preço
const formatPrice = (value) => {
    return parseFloat(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

// Valor inicial para UM item de pedido de cliente em branco
const initialItemSlot = { produtoId: '', quantidade: '', preco_unitario: '' };
const NUM_INITIAL_ROWS_CLIENTE = 15; // Número inicial de linhas para a planilha de itens do cliente

function PedidoClienteFormModal({ isOpen, onClose, onPedidoSaved, pedidoToEdit }) {
    const [pedidoData, setPedidoData] = useState({
        clienteId: '',
        data_pedido: new Date().toISOString().split('T')[0],
        status: 'Aberto', // Status inicial para pedidos de cliente
        itens_planilha: Array.from({ length: NUM_INITIAL_ROWS_CLIENTE }, () => ({
            ...initialItemSlot
        }))
    });

    const [clientes, setClientes] = useState([]);
    const [produtos, setProdutos] = useState([]);
    
    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [dataLoading, setDataLoading] = useState(true);
    const isEditing = !!pedidoToEdit;

    const lastInputRef = useRef(null); // Ref para o último input da última linha para focar

    // Efeito para carregar dados de clientes e produtos quando o modal abre
    useEffect(() => {
        const fetchDependencies = async () => {
            setDataLoading(true);
            try {
                const [clis, prods] = await Promise.all([
                    getClientes(),
                    getProdutos()
                ]);
                setClientes(clis || []);
                setProdutos(prods || []);
            } catch (err) {
                console.error('Erro ao carregar dados para o formulário de pedido de cliente:', err);
                setMessage('Erro ao carregar opções para o formulário. Tente novamente.');
                setClientes([]);
                setProdutos([]);
            } finally {
                setDataLoading(false);
            }
        };
        fetchDependencies();
    }, []);

    // Efeito para preencher o formulário se estiver em modo de edição
    useEffect(() => {
        if (isOpen) {
            setMessage(null);
            if (isEditing && pedidoToEdit) {
                const newItensPlanilha = Array.from({ length: NUM_INITIAL_ROWS_CLIENTE }, () => ({
                    ...initialItemSlot
                }));

                // Distribui os itens do backend para os slots da planilha
                pedidoToEdit.itens.forEach((itemBackend, index) => {
                    if (newItensPlanilha[index]) {
                        newItensPlanilha[index] = {
                            id: itemBackend.id,
                            produtoId: itemBackend.produtoId || '',
                            quantidade: itemBackend.quantidade,
                            preco_unitario: itemBackend.preco_unitario
                        };
                    }
                });

                setPedidoData(prev => ({
                    ...prev,
                    clienteId: pedidoToEdit.clienteId || '',
                    data_pedido: pedidoToEdit.data_pedido || new Date().toISOString().split('T')[0],
                    status: pedidoToEdit.status || 'Aberto',
                    itens_planilha: newItensPlanilha
                }));
            } else {
                // Resetar para valores iniciais ao abrir para novo pedido
                setPedidoData({
                    clienteId: '',
                    data_pedido: new Date().toISOString().split('T')[0],
                    status: 'Aberto',
                    itens_planilha: Array.from({ length: NUM_INITIAL_ROWS_CLIENTE }, () => ({ ...initialItemSlot }))
                });
            }
        }
    }, [isOpen, isEditing, pedidoToEdit]);

    const handlePedidoChange = (e) => {
        const { name, value } = e.target;
        setPedidoData(prev => ({ ...prev, [name]: value }));
    };

    const handleItemChange = (itemIndex, fieldName, value) => {
        const newItensPlanilha = [...pedidoData.itens_planilha];
        newItensPlanilha[itemIndex][fieldName] = value;

        // Auto-preencher preço de venda do produto se o produto for selecionado
        if (fieldName === 'produtoId' && value) {
            const selectedProduct = produtos.find(p => String(p.id) === String(value));
            if (selectedProduct) {
                newItensPlanilha[itemIndex].preco_unitario = selectedProduct.preco_venda;
            }
        }
        setPedidoData(prev => ({ ...prev, itens_planilha: newItensPlanilha }));
    };

    const handleAddItemRow = () => {
        setPedidoData(prev => ({
            ...prev,
            itens_planilha: [...prev.itens_planilha, { ...initialItemSlot }]
        }));
        // Adiciona um pequeno atraso para garantir que o DOM seja atualizado antes de tentar focar
        setTimeout(() => {
            if (lastInputRef.current) {
                lastInputRef.current.focus();
            }
        }, 0);
    };

    const handleRemoveItem = (itemIndex) => {
        const newItensPlanilha = [...pedidoData.itens_planilha];
        // Se o item tem ID, ele existia no BD. Ao "remover" no frontend, limpamos ele
        // mas mantemos o ID para que o backend saiba qual ID não incluir mais.
        // O `handleSubmit` vai filtrar itens com `produtoId` vazio.
        if (newItensPlanilha[itemIndex].id) {
            newItensPlanilha[itemIndex] = { ...initialItemSlot, id: newItensPlanilha[itemIndex].id };
        } else {
            newItensPlanilha.splice(itemIndex, 1); // Remove completamente se for um item novo
            // Garante que haja pelo menos uma linha em branco se todas forem removidas
            if (newItensPlanilha.length === 0) {
                newItensPlanilha.push({ ...initialItemSlot });
            }
        }
        setPedidoData(prev => ({ ...prev, itens_planilha: newItensPlanilha }));

        setMessage(`Item da linha ${itemIndex + 1} foi removido/limpo.`);
        setTimeout(() => setMessage(null), 3000);
    };

    const handleKeyDown = (e, itemIndex, fieldName) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Previne o comportamento padrão do Enter (submeter formulário)

            const currentInput = e.target;
            const currentRow = currentInput.closest('.item-row');
            const inputsInRow = Array.from(currentRow.querySelectorAll('input, select'));
            const currentIndex = inputsInRow.indexOf(currentInput);

            // Tenta ir para o próximo input na mesma linha
            if (currentIndex < inputsInRow.length - 1) {
                inputsInRow[currentIndex + 1].focus();
            } else {
                // Se for o último input da linha atual, tenta ir para o primeiro input da próxima linha
                const nextRow = currentRow.nextElementSibling;
                if (nextRow && nextRow.classList.contains('item-row')) {
                    const nextRowInputs = nextRow.querySelectorAll('input, select');
                    if (nextRowInputs.length > 0) {
                        nextRowInputs[0].focus();
                    }
                } else {
                    // Se for a última linha e o último input, adiciona uma nova linha
                    handleAddItemRow();
                }
            }
        }
    };

    const calcularTotalPedido = () => {
        return pedidoData.itens_planilha.reduce((total, item) => {
            return total + (parseFloat(item.quantidade || 0) * parseFloat(item.preco_unitario || 0));
        }, 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(null);
        setLoading(true);

        if (!pedidoData.clienteId) {
            setMessage('Selecione um cliente.');
            setLoading(false);
            return;
        }
        if (!pedidoData.data_pedido) {
            setMessage('Data do Pedido é obrigatória.');
            setLoading(false);
            return;
        }

        const itensValidos = pedidoData.itens_planilha.filter(item => 
            item.produtoId && parseFloat(item.quantidade) > 0 && parseFloat(item.preco_unitario) >= 0
        ).map(item => ({
            id: item.id, // Inclui o ID para operações de PUT (atualização de itens existentes)
            produtoId: parseInt(item.produtoId),
            quantidade: parseFloat(item.quantidade),
            preco_unitario: parseFloat(item.preco_unitario)
        }));

        if (itensValidos.length === 0) {
            setMessage('O pedido deve ter pelo menos um item válido (com produto, quantidade e preço).');
            setLoading(false);
            return;
        }
        
        try {
            let savedPedido;
            if (isEditing) {
                savedPedido = await updatePedidoCliente(pedidoToEdit.id, {
                    clienteId: parseInt(pedidoData.clienteId),
                    data_pedido: pedidoData.data_pedido,
                    status: pedidoData.status,
                    itens: itensValidos
                });
                setMessage(`Pedido de Cliente (ID: ${savedPedido.pedido.id}) atualizado com sucesso!`);
            } else {
                savedPedido = await createPedidoCliente({
                    clienteId: parseInt(pedidoData.clienteId),
                    data_pedido: pedidoData.data_pedido,
                    status: pedidoData.status,
                    itens: itensValidos
                });
                setMessage(`Pedido de Cliente (ID: ${savedPedido.pedido.id}) cadastrado com sucesso!`);
                // Reseta o formulário após o cadastro
                setPedidoData({
                    clienteId: '',
                    data_pedido: new Date().toISOString().split('T')[0],
                    status: 'Aberto',
                    itens_planilha: Array.from({ length: NUM_INITIAL_ROWS_CLIENTE }, () => ({ ...initialItemSlot }))
                });
            }
            if (onPedidoSaved) {
                onPedidoSaved(); // Chama a função para recarregar a lista na página principal
            }
        } catch (err) {
            console.error('Erro ao salvar pedido de cliente:', err);
            const errorMessage = (err.response && err.response.data && err.response.data.error) || err.message || 'Erro desconhecido.';
            setMessage(`Erro ao salvar pedido de cliente. Detalhes: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    if (dataLoading) {
        return (
            <div className="modal-overlay">
                <div className="modal-content">
                    <p>Carregando dados...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content modal-content-wide" onClick={e => e.stopPropagation()}> {/* Usar modal-content-wide ou similar para largura */}
                <div className="modal-header">
                    <h2>{isEditing ? 'Editar Pedido do Cliente' : 'Novo Pedido do Cliente'}</h2>
                    <button className="close-button" onClick={onClose}>&times;</button>
                </div>
                <div className="modal-body">
                    {message && (
                        <div className={`message-box ${message.includes('sucesso') ? 'success' : 'error'}`}>
                            {message}
                        </div>
                    )}
                    <form onSubmit={handleSubmit}>
                        <h3>Dados do Pedido</h3>
                        <div className="section-container">
                            <div className="form-group">
                                <label htmlFor="clienteId">Cliente:</label>
                                <select
                                    id="clienteId"
                                    name="clienteId"
                                    value={pedidoData.clienteId}
                                    onChange={handlePedidoChange}
                                    required
                                >
                                    <option value="">Selecione um Cliente</option>
                                    {clientes.map(cli => (
                                        <option key={cli.id} value={cli.id}>{cli.nome}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="data_pedido">Data do Pedido:</label>
                                <input
                                    type="date"
                                    id="data_pedido"
                                    name="data_pedido"
                                    value={pedidoData.data_pedido}
                                    onChange={handlePedidoChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="status">Status:</label>
                                <select
                                    id="status"
                                    name="status"
                                    value={pedidoData.status}
                                    onChange={handlePedidoChange}
                                    required
                                >
                                    <option value="Aberto">Aberto</option>
                                    <option value="Processando">Processando</option>
                                    <option value="Concluído">Concluído</option>
                                    <option value="Cancelado">Cancelado</option>
                                </select>
                            </div>
                        </div>

                        <h3>Itens do Pedido</h3>
                        <div className="items-spreadsheet-container">
                            <div className="items-spreadsheet-header">
                                <div className="col-header-produto">Produto</div>
                                <div className="col-header-quantidade">Qtd.</div>
                                <div className="col-header-preco-unitario">Preço Unit.</div>
                                <div className="col-header-actions">Ações</div>
                            </div>
                            <div className="items-spreadsheet-body">
                                {pedidoData.itens_planilha.map((item, index) => (
                                    <div className="item-row" key={index}>
                                        <div className="cell col-produto">
                                            <select
                                                name="produtoId"
                                                value={item.produtoId}
                                                onChange={(e) => handleItemChange(index, e.target.name, e.target.value)}
                                                onKeyDown={(e) => handleKeyDown(e, index, e.target.name)}
                                            >
                                                <option value="">Selecione um Produto</option>
                                                {produtos.map(prod => (
                                                    <option key={prod.id} value={prod.id}>{prod.nome} ({prod.unidade_medida})</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="cell col-quantidade">
                                            <input
                                                type="number"
                                                name="quantidade"
                                                value={item.quantidade}
                                                onChange={(e) => handleItemChange(index, e.target.name, e.target.value)}
                                                placeholder="Qtd."
                                                min="0"
                                                step="0.01"
                                                onKeyDown={(e) => handleKeyDown(e, index, e.target.name)}
                                            />
                                        </div>
                                        <div className="cell col-preco-unitario">
                                            <input
                                                type="number"
                                                name="preco_unitario"
                                                value={item.preco_unitario}
                                                onChange={(e) => handleItemChange(index, e.target.name, e.target.value)}
                                                placeholder="Preço Unit."
                                                min="0"
                                                step="0.01"
                                                onKeyDown={(e) => handleKeyDown(e, index, e.target.name)}
                                                ref={index === pedidoData.itens_planilha.length - 1 ? lastInputRef : null}
                                            />
                                        </div>
                                        <div className="cell col-actions">
                                            <button type="button" onClick={() => handleRemoveItem(index)} className="remove-item-btn">
                                                &times;
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        <button type="button" onClick={handleAddItemRow} className="add-item-row-btn">
                            Adicionar Mais Itens
                        </button>

                        <div className="order-total">
                            <strong>Total do Pedido:</strong> {formatPrice(calcularTotalPedido())}
                        </div>

                        <div className="modal-actions">
                            <button type="submit" disabled={loading}>
                                {loading ? (isEditing ? 'Atualizando...' : 'Cadastrando...') : (isEditing ? 'Salvar Pedido' : 'Realizar Pedido')}
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

export default PedidoClienteFormModal;