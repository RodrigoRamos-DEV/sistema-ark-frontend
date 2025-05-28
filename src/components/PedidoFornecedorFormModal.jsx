// C:\Users\Rodrigo Ramos
// SSD\Desktop\ARK\sistema-ark-frontend\src\components\PedidoFornecedorFormModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { createPedidoFornecedor, updatePedidoFornecedor } from '../api/pedidos-fornecedor-api';
import { getFornecedores } from '../api/fornecedores-api';
import { getProdutos } from '../api/produtos-api';
import { getClientes } from '../api/api'; // getClientes de api.js
import { getCaminhoes } from '../api/caminhoes-api';
import '../styles/common-modal.css';
import '../styles/PedidoFornecedorFormModal.css'; // O CSS que fará a mágica da planilha

// Função auxiliar para formatar preço
const formatPrice = (value) => {
    return parseFloat(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

// Valor inicial para UM item de pedido em branco (um slot na planilha)
const initialSlotItem = { quantidade: '', fornecedorId: '', produtoId: '', caminhaoId: '', preco_unitario: '' };
const NUM_INITIAL_ROWS = 30; // Define o número inicial de LINHAS da planilha
const NUM_COL_GROUPS_PER_ROW = 2; // Duas colunas (esquerda e direita)

function PedidoFornecedorFormModal({ isOpen, onClose, onPedidoSaved, pedidoToEdit }) {
    const [pedidoData, setPedidoData] = useState({
        data_pedido: new Date().toISOString().split('T')[0],
        status: 'Criado',
        // Cada "linha" da planilha conterá 2 "slots" de item
        itens_planilha: Array.from({ length: NUM_INITIAL_ROWS }, () => ({
            left: { ...initialSlotItem },
            right: { ...initialSlotItem }
        }))
    });

    const [fornecedores, setFornecedores] = useState([]);
    const [produtos, setProdutos] = useState([]);
    const [clientes, setClientes] = useState([]); 
    const [caminhoes, setCaminhoes] = useState([]); 

    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(false);
    const [dataLoading, setDataLoading] = useState(true);
    const isEditing = !!pedidoToEdit;

    const lastInputRef = useRef(null); // Ref para o último input da última linha

    useEffect(() => {
        const fetchDependencies = async () => {
            setDataLoading(true);
            try {
                const [forns, prods, clis, cams] = await Promise.all([
                    getFornecedores(),
                    getProdutos(),
                    getClientes(),
                    getCaminhoes()
                ]);
                setFornecedores(forns || []);
                setProdutos(prods || []);
                setClientes(clis || []);
                setCaminhoes(cams || []); 
            } catch (err) {
                console.error('Erro ao carregar dados para o formulário de pedido:', err);
                setMessage('Erro ao carregar opções para o formulário. Tente novamente.');
                setFornecedores([]);
                setProdutos([]);
                setClientes([]);
                setCaminhoes([]);
            } finally {
                setDataLoading(false);
            }
        };
        fetchDependencies();
    }, []);

    useEffect(() => {
        if (isOpen) {
            setMessage(null);
            if (isEditing) {
                const newItensPlanilha = Array.from({ length: NUM_INITIAL_ROWS }, () => ({
                    left: { ...initialSlotItem },
                    right: { ...initialSlotItem }
                }));

                // Distribui os itens do backend para os slots da planilha
                pedidoToEdit.itens.forEach((itemBackend, backendIndex) => {
                    const rowIndex = Math.floor(backendIndex / NUM_COL_GROUPS_PER_ROW);
                    const slotSide = backendIndex % NUM_COL_GROUPS_PER_ROW === 0 ? 'left' : 'right';

                    if (newItensPlanilha[rowIndex]) {
                        newItensPlanilha[rowIndex][slotSide] = {
                            id: itemBackend.id,
                            quantidade: itemBackend.quantidade,
                            fornecedorId: itemBackend.fornecedorId || '',
                            produtoId: itemBackend.produtoId || '',
                            caminhaoId: itemBackend.caminhaoId || '',
                            preco_unitario: itemBackend.preco_unitario
                        };
                    }
                });

                setPedidoData(prev => ({
                    ...prev,
                    data_pedido: pedidoToEdit.data_pedido || new Date().toISOString().split('T')[0],
                    status: pedidoToEdit.status || 'Criado',
                    itens_planilha: newItensPlanilha
                }));
            } else {
                setPedidoData(prev => ({
                    data_pedido: new Date().toISOString().split('T')[0],
                    status: 'Criado',
                    itens_planilha: Array.from({ length: NUM_INITIAL_ROWS }, () => ({
                        left: { ...initialSlotItem },
                        right: { ...initialSlotItem }
                    }))
                }));
            }
        }
    }, [isOpen, isEditing, pedidoToEdit]);

    const handlePedidoChange = (e) => {
        const { name, value } = e.target;
        setPedidoData(prev => ({ ...prev, [name]: value }));
    };

    const handleSlotItemChange = (rowIndex, slotSide, fieldName, value) => {
        const newItensPlanilha = [...pedidoData.itens_planilha];
        newItensPlanilha[rowIndex][slotSide][fieldName] = value;

        if (fieldName === 'produtoId' && value) {
            const selectedProduct = produtos.find(p => String(p.id) === String(value));
            if (selectedProduct) {
                newItensPlanilha[rowIndex][slotSide].preco_unitario = selectedProduct.preco_venda;
            }
        }
        setPedidoData(prev => ({ ...prev, itens_planilha: newItensPlanilha }));
    };

    const handleAddRow = () => {
        setPedidoData(prev => ({
            ...prev,
            itens_planilha: [...prev.itens_planilha, { left: { ...initialSlotItem }, right: { ...initialSlotItem } }]
        }));
        setTimeout(() => {
            if (lastInputRef.current) {
                lastInputRef.current.focus();
            }
        }, 0);
    };

    const handleRemoveSlotItem = (rowIndex, slotSide) => {
        const newItensPlanilha = [...pedidoData.itens_planilha];
        newItensPlanilha[rowIndex][slotSide] = { ...initialSlotItem };
        setPedidoData(prev => ({ ...prev, itens_planilha: newItensPlanilha }));

        setMessage(`Campos do slot ${slotSide === 'left' ? 'esquerdo' : 'direito'} da linha ${rowIndex + 1} foram limpos.`);
        setTimeout(() => setMessage(null), 3000);
    };

    const handleKeyDown = (e, rowIndex, slotSide, fieldName) => {
        if (e.key === 'Enter' && rowIndex === pedidoData.itens_planilha.length - 1 && slotSide === 'right' && fieldName === 'preco_unitario') {
            e.preventDefault();
            handleAddRow();
        }
    };

    const calcularTotal = () => {
        return pedidoData.itens_planilha.reduce((totalGeral, row) => {
            const totalRow = (parseFloat(row.left.quantidade) || 0) * (parseFloat(row.left.preco_unitario) || 0) +
                             (parseFloat(row.right.quantidade) || 0) * (parseFloat(row.right.preco_unitario) || 0);
            return totalGeral + totalRow;
        }, 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(null);
        setLoading(true);

        if (!pedidoData.data_pedido) {
            setMessage('Data do Pedido é obrigatória.');
            setLoading(false);
            return;
        }

        const itensValidos = [];
        pedidoData.itens_planilha.forEach(row => {
            if (row.left.produtoId && parseFloat(row.left.quantidade) > 0 && parseFloat(row.left.preco_unitario) >= 0) {
                itensValidos.push({
                    produtoId: parseInt(row.left.produtoId),
                    quantidade: parseFloat(row.left.quantidade),
                    preco_unitario: parseFloat(row.left.preco_unitario),
                    fornecedorId: row.left.fornecedorId === '' ? null : parseInt(row.left.fornecedorId),
                    caminhaoId: row.left.caminhaoId === '' ? null : parseInt(row.left.caminhaoId),
                });
            }
            if (row.right.produtoId && parseFloat(row.right.quantidade) > 0 && parseFloat(row.right.preco_unitario) >= 0) {
                itensValidos.push({
                    produtoId: parseInt(row.right.produtoId),
                    quantidade: parseFloat(row.right.quantidade),
                    preco_unitario: parseFloat(row.right.preco_unitario),
                    fornecedorId: row.right.fornecedorId === '' ? null : parseInt(row.right.fornecedorId),
                    caminhaoId: row.right.caminhaoId === '' ? null : parseInt(row.right.caminhaoId),
                });
            }
        });


        if (itensValidos.length === 0) {
            setMessage('O pedido deve ter pelo menos um item válido (com produto, quantidade e preço).');
            setLoading(false);
            return;
        }
        
        try {
            let savedPedido;
            const fornecedorPrincipalId = itensValidos.length > 0 ? itensValidos[0].fornecedorId : null;

            if (isEditing) {
                savedPedido = await updatePedidoFornecedor(pedidoToEdit.id, {
                    ...pedidoData,
                    fornecedorId: fornecedorPrincipalId,
                    itens: itensValidos
                });
                setMessage(`Pedido de Fornecedor (ID: ${savedPedido.pedido.id}) atualizado com sucesso!`);
            } else {
                savedPedido = await createPedidoFornecedor({
                    ...pedidoData,
                    fornecedorId: fornecedorPrincipalId,
                    itens: itensValidos
                });
                setMessage(`Pedido de Fornecedor (ID: ${savedPedido.pedido.id}) cadastrado com sucesso!`);
                setPedidoData({
                    data_pedido: new Date().toISOString().split('T')[0],
                    status: 'Criado',
                    itens_planilha: Array.from({ length: NUM_INITIAL_ROWS }, () => ({ left: { ...initialSlotItem }, right: { ...initialSlotItem } }))
                });
            }
            if (onPedidoSaved) {
                onPedidoSaved();
            }
        } catch (err) {
            console.error('Erro ao salvar pedido de fornecedor:', err);
            const errorMessage = (err.response && err.response.data && err.response.data.error) || err.message || 'Erro desconhecido.';
            setMessage(`Erro ao salvar pedido de fornecedor. Detalhes: ${errorMessage}`);
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
            <div className="modal-content modal-content-full-width" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{isEditing ? 'Editar Pedido de Fornecedor' : 'Novo Pedido de Fornecedor'}</h2>
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
                                <label htmlFor="status">Status:</label>
                                <select
                                    id="status"
                                    name="status"
                                    value={pedidoData.status}
                                    onChange={handlePedidoChange}
                                    required
                                >
                                    <option value="Criado">Criado</option>
                                    <option value="Enviado">Enviado</option>
                                    <option value="Confirmado">Confirmado</option>
                                    <option value="Recebido">Recebido</option>
                                    <option value="Cancelado">Cancelado</option>
                                </select>
                            </div>
                        </div>

                        <h3>Itens do Pedido (Planilha)</h3>
                        <div className="spreadsheet-container">
                            <div className="spreadsheet-header">
                                {/* Cabeçalhos para o BLOCO ESQUERDO */}
                                <div className="col-header-qty">Qtd</div>
                                <div className="col-header-fornecedor-item">Fornecedor</div>
                                <div className="col-header-produto">Produto</div>
                                <div className="col-header-caminhao">Caminhão</div>
                                <div className="col-header-preco">Preço</div>
                                <div className="col-header-actions">Ações</div> {/* Ações para o bloco esquerdo */}

                                {/* Cabeçalhos para o BLOCO DIREITO */}
                                <div className="col-header-qty">Qtd</div>
                                <div className="col-header-fornecedor-item">Fornecedor</div>
                                <div className="col-header-produto">Produto</div>
                                <div className="col-header-caminhao">Caminhão</div>
                                <div className="col-header-preco">Preço</div>
                                <div className="col-header-actions">Ações</div> {/* Ações para o bloco direito */}
                            </div>
                            <div className="spreadsheet-body">
                                {pedidoData.itens_planilha.map((row, rowIndex) => (
                                    <div className="spreadsheet-row" key={rowIndex}>
                                        {/* BLOCO ESQUERDO (COLUNAS A-E + Excluir) */}
                                        <div className="cell col-quantidade">
                                            <input
                                                type="number"
                                                name="quantidade"
                                                value={row.left.quantidade}
                                                onChange={(e) => handleSlotItemChange(rowIndex, 'left', e.target.name, e.target.value)}
                                                placeholder="Qtd."
                                                min="0"
                                                step="0.01"
                                                onKeyDown={(e) => handleKeyDown(e, rowIndex, 'left', e.target.name)}
                                            />
                                        </div>
                                        <div className="cell col-fornecedor-item">
                                            <select
                                                name="fornecedorId"
                                                value={row.left.fornecedorId}
                                                onChange={(e) => handleSlotItemChange(rowIndex, 'left', e.target.name, e.target.value)}
                                            >
                                                <option value="">Selecione Forn.</option>
                                                {fornecedores.map(forn => (
                                                    <option key={forn.id} value={forn.id}>{forn.nome}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="cell col-produto">
                                            <select
                                                name="produtoId"
                                                value={row.left.produtoId}
                                                onChange={(e) => handleSlotItemChange(rowIndex, 'left', e.target.name, e.target.value)}
                                            >
                                                <option value="">Selecione Produto</option>
                                                {produtos.map(prod => (
                                                    <option key={prod.id} value={prod.id}>{prod.nome} ({prod.unidade_medida})</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="cell col-caminhao">
                                            <select
                                                name="caminhaoId"
                                                value={row.left.caminhaoId}
                                                onChange={(e) => handleSlotItemChange(rowIndex, 'left', e.target.name, e.target.value)}
                                            >
                                                <option value="">Selecione Caminhão</option>
                                                {caminhoes.map(cam => (
                                                    <option key={cam.id} value={cam.id}>{cam.modelo} ({cam.placa})</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="cell col-preco">
                                            <input
                                                type="number"
                                                name="preco_unitario"
                                                value={row.left.preco_unitario}
                                                onChange={(e) => handleSlotItemChange(rowIndex, 'left', e.target.name, e.target.value)}
                                                placeholder="Preço Unit."
                                                min="0"
                                                step="0.01"
                                                onKeyDown={(e) => handleKeyDown(e, rowIndex, 'left', e.target.name)}
                                            />
                                        </div>
                                        <div className="cell col-actions">
                                            <button type="button" onClick={() => handleRemoveSlotItem(rowIndex, 'left')} className="remove-item-btn">
                                                &times;
                                            </button>
                                        </div>

                                        {/* BLOCO DIREITO (COLUNAS F-J + Excluir) */}
                                        <div className="cell col-quantidade">
                                            <input
                                                type="number"
                                                name="quantidade"
                                                value={row.right.quantidade}
                                                onChange={(e) => handleSlotItemChange(rowIndex, 'right', e.target.name, e.target.value)}
                                                placeholder="Qtd."
                                                min="0"
                                                step="0.01"
                                                onKeyDown={(e) => handleKeyDown(e, rowIndex, 'right', e.target.name)}
                                            />
                                        </div>
                                        <div className="cell col-fornecedor-item">
                                            <select
                                                name="fornecedorId"
                                                value={row.right.fornecedorId}
                                                onChange={(e) => handleSlotItemChange(rowIndex, 'right', e.target.name, e.target.value)}
                                            >
                                                <option value="">Selecione Forn.</option>
                                                {fornecedores.map(forn => (
                                                    <option key={forn.id} value={forn.id}>{forn.nome}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="cell col-produto">
                                            <select
                                                name="produtoId"
                                                value={row.right.produtoId}
                                                onChange={(e) => handleSlotItemChange(rowIndex, 'right', e.target.name, e.target.value)}
                                            >
                                                <option value="">Selecione Produto</option>
                                                {produtos.map(prod => (
                                                    <option key={prod.id} value={prod.id}>{prod.nome} ({prod.unidade_medida})</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="cell col-caminhao">
                                            <select
                                                name="caminhaoId"
                                                value={row.right.caminhaoId}
                                                onChange={(e) => handleSlotItemChange(rowIndex, 'right', e.target.name, e.target.value)}
                                            >
                                                <option value="">Selecione Caminhão</option>
                                                {caminhoes.map(cam => (
                                                    <option key={cam.id} value={cam.id}>{cam.modelo} ({cam.placa})</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="cell col-preco">
                                            <input
                                                type="number"
                                                name="preco_unitario"
                                                value={row.right.preco_unitario}
                                                onChange={(e) => handleSlotItemChange(rowIndex, 'right', e.target.name, e.target.value)}
                                                placeholder="Preço Unit."
                                                min="0"
                                                step="0.01"
                                                onKeyDown={(e) => handleKeyDown(e, rowIndex, 'right', e.target.name)}
                                                ref={rowIndex === pedidoData.itens_planilha.length - 1 ? lastInputRef : null}
                                            />
                                        </div>
                                        <div className="cell col-actions">
                                            <button type="button" onClick={() => handleRemoveSlotItem(rowIndex, 'right')} className="remove-item-btn">
                                                &times;
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        {/* BOTÃO ADICIONAR NOVA LINHA - AGORA DESCOMENTADO */}
                        <button type="button" onClick={handleAddRow} className="add-item-btn">
                            Adicionar Nova Linha
                        </button>

                        <div className="order-total">
                            <strong>Total do Pedido:</strong> {formatPrice(calcularTotal())}
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

export default PedidoFornecedorFormModal;