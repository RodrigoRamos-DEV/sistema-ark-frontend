// C:\Users\Rodrigo Ramos
// SSD\Desktop\ARK\sistema-ark-frontend\src\components\PedidoClienteFormModal.jsx
import React, { useState, useEffect } from 'react';
// Importa funções de API de clientes e produtos (passadas via props do PedidosCliente.jsx)
// E as funções de API de pedidos de cliente
import { createPedidoCliente, updatePedidoCliente } from '../api/api'; 
// Reutiliza CSS comum e cria um específico para este modal
import '../styles/common-modal.css';
import '../styles/PedidoClienteFormModal.css'; // Criaremos este CSS no próximo passo

// Função auxiliar para formatar preço
const formatPrice = (value) => {
    return parseFloat(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

function PedidoClienteFormModal({ isOpen, onClose, onPedidoSaved, pedidoToEdit, clientes, produtos }) {
    const [pedidoData, setPedidoData] = useState({
        data_pedido: new Date().toISOString().split('T')[0], // Data atual por padrão
        clienteId: '', // Pedido para qual cliente
        itens: [] // Array para os itens do pedido
    });

    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(false);
    const isEditing = !!pedidoToEdit;

    useEffect(() => {
        if (isOpen) {
            setMessage(null); // Limpa mensagens ao abrir
            if (isEditing) {
                // Quando em modo de edição, preenche com os dados do pedido existente
                setPedidoData({
                    data_pedido: pedidoToEdit.data_pedido || new Date().toISOString().split('T')[0],
                    clienteId: pedidoToEdit.clienteId || '',
                    itens: pedidoToEdit.itens.map(item => ({
                        id: item.id, // ID do item, se estiver editando
                        produtoId: item.produtoId,
                        quantidade: item.quantidade,
                        preco_unitario: item.preco_unitario,
                        // Não há clienteId ou caminhaoId a nível de item para pedido de cliente,
                        // mas se houvesse, seriam adicionados aqui.
                        observacoes: item.observacoes || ''
                    }))
                });
            } else {
                // Modo de cadastro: limpa o formulário e adiciona uma linha de item vazia
                setPedidoData({
                    data_pedido: new Date().toISOString().split('T')[0],
                    clienteId: '',
                    itens: [{ produtoId: '', quantidade: '', preco_unitario: '', observacoes: '' }]
                });
            }
        }
    }, [isOpen, isEditing, pedidoToEdit]);

    // Manipula mudanças nos campos do cabeçalho do pedido
    const handlePedidoChange = (e) => {
        const { name, value } = e.target;
        setPedidoData(prev => ({ ...prev, [name]: value }));
    };

    // Manipula mudanças nos campos de um item específico do pedido
    const handleItemChange = (index, e) => {
        const { name, value } = e.target;
        const newItens = [...pedidoData.itens];
        newItens[index][name] = value;

        // Auto-preencher preço do produto se o produto for selecionado
        if (name === 'produtoId' && value) {
            const selectedProduct = produtos.find(p => String(p.id) === String(value));
            if (selectedProduct) {
                newItens[index].preco_unitario = selectedProduct.preco_venda; // Preço de venda do produto
            }
        }

        setPedidoData(prev => ({ ...prev, itens: newItens }));
    };

    // Adiciona uma nova linha de item vazia
    const handleAddItem = () => {
        setPedidoData(prev => ({
            ...prev,
            itens: [...prev.itens, { produtoId: '', quantidade: '', preco_unitario: '', observacoes: '' }]
        }));
    };

    // Remove uma linha de item pelo índice
    const handleRemoveItem = (index) => {
        const newItens = pedidoData.itens.filter((_, i) => i !== index);
        setPedidoData(prev => ({ ...prev, itens: newItens }));
    };

    // Calcula o total do pedido
    const calcularTotal = () => {
        return pedidoData.itens.reduce((total, item) => {
            const quantidade = parseFloat(item.quantidade) || 0;
            const preco = parseFloat(item.preco_unitario) || 0;
            return total + (quantidade * preco);
        }, 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(null);
        setLoading(true);

        // Validação básica do cabeçalho
        if (!pedidoData.clienteId || !pedidoData.data_pedido) {
            setMessage('Cliente e Data do Pedido são obrigatórios.');
            setLoading(false);
            return;
        }

        // Validação básica dos itens
        if (pedidoData.itens.length === 0) {
            setMessage('O pedido deve ter pelo menos um item.');
            setLoading(false);
            return;
        }

        const itensValidos = pedidoData.itens.map(item => ({
            produtoId: parseInt(item.produtoId),
            quantidade: parseFloat(item.quantidade),
            preco_unitario: parseFloat(item.preco_unitario),
            observacoes: item.observacoes === '' ? null : item.observacoes,
        }));

        // Verifica se todos os itens têm produto, quantidade e preço
        const itemsCompletos = itensValidos.every(item => 
            !isNaN(item.produtoId) && item.produtoId > 0 &&
            !isNaN(item.quantidade) && item.quantidade > 0 &&
            !isNaN(item.preco_unitario) && item.preco_unitario >= 0
        );

        if (!itemsCompletos) {
            setMessage('Todos os itens devem ter Produto, Quantidade e Preço unitário válidos.');
            setLoading(false);
            return;
        }

        try {
            let savedPedido;
            if (isEditing) {
                savedPedido = await updatePedidoCliente(pedidoToEdit.id, {
                    ...pedidoData,
                    itens: itensValidos
                });
                setMessage(`Pedido de Cliente (ID: ${savedPedido.pedido.id}) atualizado com sucesso!`);
            } else {
                savedPedido = await createPedidoCliente({
                    ...pedidoData,
                    itens: itensValidos
                });
                setMessage(`Pedido de Cliente (ID: ${savedPedido.pedido.id}) cadastrado com sucesso!`);
                // Limpa o formulário após o cadastro
                setPedidoData({
                    data_pedido: new Date().toISOString().split('T')[0],
                    clienteId: '',
                    itens: [{ produtoId: '', quantidade: '', preco_unitario: '', observacoes: '' }]
                });
            }
            if (onPedidoSaved) {
                onPedidoSaved();
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

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
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
                        </div>

                        <h3>Itens do Pedido</h3>
                        <div className="items-table-container"> {/* Reutiliza a classe do PedidoFornecedor */}
                            <div className="items-header">
                                <div className="col-quantidade">Qtd</div>
                                <div className="col-produto">Produto</div>
                                <div className="col-preco">Preço Unit.</div>
                                <div className="col-total">Total Item</div>
                                <div className="col-observacoes">Obs. Item</div>
                                <div className="col-acoes"></div>
                            </div>
                            {pedidoData.itens.map((item, index) => (
                                <div className="item-row" key={index}>
                                    <div className="col-quantidade">
                                        <input
                                            type="number"
                                            name="quantidade"
                                            value={item.quantidade}
                                            onChange={(e) => handleItemChange(index, e)}
                                            required
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                    <div className="col-produto">
                                        <select
                                            name="produtoId"
                                            value={item.produtoId}
                                            onChange={(e) => handleItemChange(index, e)}
                                            required
                                        >
                                            <option value="">Selecione</option>
                                            {produtos.map(prod => (
                                                <option key={prod.id} value={prod.id}>{prod.nome} ({prod.unidade_medida})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-preco">
                                        <input
                                            type="number"
                                            name="preco_unitario"
                                            value={item.preco_unitario}
                                            onChange={(e) => handleItemChange(index, e)}
                                            required
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>
                                    <div className="col-total">
                                        {formatPrice((parseFloat(item.quantidade) || 0) * (parseFloat(item.preco_unitario) || 0))}
                                    </div>
                                    <div className="col-observacoes">
                                        <input
                                            type="text"
                                            name="observacoes"
                                            value={item.observacoes}
                                            onChange={(e) => handleItemChange(index, e)}
                                            placeholder="Obs."
                                        />
                                    </div>
                                    <div className="col-acoes">
                                        <button type="button" onClick={() => handleRemoveItem(index)} className="remove-item-btn">
                                            &times;
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <button type="button" onClick={handleAddItem} className="add-item-btn">
                                Adicionar Item
                            </button>
                            <div className="order-total">
                                <strong>Total do Pedido:</strong> {formatPrice(calcularTotal())}
                            </div>
                        </div>

                        <div className="modal-actions">
                            <button type="submit" disabled={loading}>
                                {loading ? (isEditing ? 'Atualizando...' : 'Cadastrando...') : (isEditing ? 'Salvar Pedido' : 'Criar Pedido')}
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