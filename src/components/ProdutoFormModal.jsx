// C:\Users\Rodrigo Ramos
// SSD\Desktop\ARK\sistema-ark-frontend\src\components\ProdutoFormModal.jsx
import React, { useState, useEffect } from 'react';
import { createProduto, updateProduto } from '../api/produtos-api';
import '../styles/common-modal.css'; // Estilos gerais do modal
import '../styles/ProdutoFormModal.css'; // Estilos específicos do formulário de produto

function ProdutoFormModal({ isOpen, onClose, onProdutoSaved, produtoToEdit }) {
    const [produtoData, setProdutoData] = useState({
        nome: '',
        preco_venda: '',
        preco_custo: '',
        estoque_atual: '',
        estoque_minimo: '',
        unidade_medida: '',
        codigo_barras: '',
        ncm: '',
        origem_mercadoria: '',
        icms_aliquota: '',
        ipi_aliquota: '',
        pis_aliquota: '',
        cofins_aliquota: '',
        observacoes: ''
    });

    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(false);
    const isEditing = !!produtoToEdit;

    const unidadesMedida = ['UN', 'KG', 'L', 'M', 'CX', 'PC'];
    const origensMercadoria = ['Nacional', 'Estrangeira Importacao Direta', 'Estrangeira Adquirida no Mercado Interno'];

    useEffect(() => {
        if (isOpen) {
            if (isEditing) {
                setProdutoData({
                    nome: produtoToEdit.nome || '',
                    preco_venda: produtoToEdit.preco_venda !== undefined ? parseFloat(produtoToEdit.preco_venda) : '',
                    preco_custo: produtoToEdit.preco_custo !== undefined ? parseFloat(produtoToEdit.preco_custo) : '',
                    estoque_atual: produtoToEdit.estoque_atual !== undefined ? parseInt(produtoToEdit.estoque_atual) : '',
                    estoque_minimo: produtoToEdit.estoque_minimo !== undefined ? parseInt(produtoToEdit.estoque_minimo) : '',
                    unidade_medida: produtoToEdit.unidade_medida || '',
                    codigo_barras: produtoToEdit.codigo_barras || '',
                    ncm: produtoToEdit.ncm || '',
                    origem_mercadoria: produtoToEdit.origem_mercadoria || '',
                    icms_aliquota: produtoToEdit.icms_aliquota !== undefined ? parseFloat(produtoToEdit.icms_aliquota) : '',
                    ipi_aliquota: produtoToEdit.ipi_aliquota !== undefined ? parseFloat(produtoToEdit.ipi_aliquota) : '',
                    pis_aliquota: produtoToEdit.pis_aliquota !== undefined ? parseFloat(produtoToEdit.pis_aliquota) : '',
                    cofins_aliquota: produtoToEdit.cofins_aliquota !== undefined ? parseFloat(produtoToEdit.cofins_aliquota) : '',
                    observacoes: produtoToEdit.observacoes || ''
                });
            } else {
                setProdutoData({
                    nome: '', preco_venda: '', preco_custo: '',
                    estoque_atual: '', estoque_minimo: '', unidade_medida: '',
                    codigo_barras: '', ncm: '', origem_mercadoria: '',
                    icms_aliquota: '', ipi_aliquota: '', pis_aliquota: '',
                    cofins_aliquota: '', observacoes: ''
                });
            }
            setMessage(null);
        }
    }, [isOpen, isEditing, produtoToEdit]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProdutoData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(null);
        setLoading(true);

        try {
            // Converte valores para o tipo correto ou null se a string for vazia.
            const dataToSend = {
                ...produtoData,
                preco_venda: parseFloat(produtoData.preco_venda) || 0, // preco_venda é obrigatório
                preco_custo: produtoData.preco_custo === '' ? null : parseFloat(produtoData.preco_custo),
                estoque_atual: parseInt(produtoData.estoque_atual) || 0, // estoque_atual é obrigatório
                estoque_minimo: produtoData.estoque_minimo === '' ? null : parseInt(produtoData.estoque_minimo),
                icms_aliquota: produtoData.icms_aliquota === '' ? null : parseFloat(produtoData.icms_aliquota),
                ipi_aliquota: produtoData.ipi_aliquota === '' ? null : parseFloat(produtoData.ipi_aliquota),
                pis_aliquota: produtoData.pis_aliquota === '' ? null : parseFloat(produtoData.pis_aliquota),
                cofins_aliquota: produtoData.cofins_aliquota === '' ? null : parseFloat(produtoData.cofins_aliquota),
                // Código de Barras: Se vazio, enviar como null para o backend.
                codigo_barras: produtoData.codigo_barras === '' ? null : produtoData.codigo_barras
            };

            let savedProduto;
            if (isEditing) {
                savedProduto = await updateProduto(produtoToEdit.id, dataToSend);
                setMessage(`Produto "${savedProduto.nome}" (ID: ${savedProduto.id}) atualizado com sucesso!`);
            } else {
                savedProduto = await createProduto(dataToSend);
                setMessage(`Produto "${savedProduto.nome}" (ID: ${savedProduto.id}) cadastrado com sucesso!`);
                setProdutoData({
                    nome: '', preco_venda: '', preco_custo: '',
                    estoque_atual: '', estoque_minimo: '', unidade_medida: '',
                    codigo_barras: '', ncm: '', origem_mercadoria: '',
                    icms_aliquota: '', ipi_aliquota: '', pis_aliquota: '',
                    cofins_aliquota: '', observacoes: ''
                });
            }

            if (onProdutoSaved) {
                onProdutoSaved();
            }
        } catch (err) {
            console.error('Erro ao salvar produto:', err);
            // Melhora a mensagem de erro para o usuário
            const errorMessage = (err.response && err.response.data && err.response.data.error)
                                 ? err.response.data.error // Mensagem de erro específica do backend
                                 : (err.message || 'Erro desconhecido.'); // Mensagem de erro geral

            setMessage(`Erro ao salvar produto. Detalhes: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{isEditing ? 'Editar Produto' : 'Cadastrar Novo Produto'}</h2>
                    <button className="close-button" onClick={onClose}>&times;</button>
                </div>
                <div className="modal-body">
                    {message && (
                        <div className={`message-box ${message.includes('sucesso') ? 'success' : 'error'}`}>
                            {message}
                        </div>
                    )}
                    <form onSubmit={handleSubmit}>
                        <h3>Dados do Produto</h3>
                        <div className="section-container produto-form-section">
                            <div className="form-group nome-produto">
                                <label htmlFor="nome">Nome:</label>
                                <input
                                    type="text"
                                    id="nome"
                                    name="nome"
                                    value={produtoData.nome}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            {/* Unidade de Medida MOVIDA para ficar ao lado do Nome */}
                            <div className="form-group">
                                <label htmlFor="unidade_medida">Unidade de Medida:</label>
                                <select
                                    id="unidade_medida"
                                    name="unidade_medida"
                                    value={produtoData.unidade_medida}
                                    onChange={handleChange}
                                >
                                    <option value="">Selecione</option>
                                    {unidadesMedida.map(un => (
                                        <option key={un} value={un}>{un}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Preços em uma linha (usando field-group-row) */}
                            <div className="field-group-row">
                                <div className="form-group">
                                    <label htmlFor="preco_venda">Preço de Venda:</label>
                                    <input
                                        type="number"
                                        id="preco_venda"
                                        name="preco_venda"
                                        value={produtoData.preco_venda}
                                        onChange={handleChange}
                                        step="0.01"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="preco_custo">Preço de Custo:</label>
                                    <input
                                        type="number"
                                        id="preco_custo"
                                        name="preco_custo"
                                        value={produtoData.preco_custo}
                                        onChange={handleChange}
                                        step="0.01"
                                    />
                                </div>
                            </div>

                            {/* Estoque em uma linha (usando field-group-row) - Unidade de Medida não está mais aqui */}
                            <div className="field-group-row">
                                <div className="form-group">
                                    <label htmlFor="estoque_atual">Estoque Atual:</label>
                                    <input
                                        type="number"
                                        id="estoque_atual"
                                        name="estoque_atual"
                                        value={produtoData.estoque_atual}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="estoque_minimo">Estoque Mínimo:</label>
                                    <input
                                        type="number"
                                        id="estoque_minimo"
                                        name="estoque_minimo"
                                        value={produtoData.estoque_minimo}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="form-group codigo-barras">
                                <label htmlFor="codigo_barras">Código de Barras:</label>
                                <input
                                    type="text"
                                    id="codigo_barras"
                                    name="codigo_barras"
                                    value={produtoData.codigo_barras}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <h3>Informações Fiscais</h3>
                        <div className="section-container produto-form-section">
                            <div className="form-group">
                                <label htmlFor="ncm">NCM:</label>
                                <input
                                    type="text"
                                    id="ncm"
                                    name="ncm"
                                    value={produtoData.ncm}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="origem_mercadoria">Origem da Mercadoria:</label>
                                <select
                                    id="origem_mercadoria"
                                    name="origem_mercadoria"
                                    value={produtoData.origem_mercadoria}
                                    onChange={handleChange}
                                >
                                    <option value="">Selecione</option>
                                    {origensMercadoria.map(origem => (
                                        <option key={origem} value={origem}>{origem}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="icms_aliquota">Alíquota ICMS (%):</label>
                                <input
                                    type="number"
                                    id="icms_aliquota"
                                    name="icms_aliquota"
                                    value={produtoData.icms_aliquota}
                                    onChange={handleChange}
                                    step="0.01"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="ipi_aliquota">Alíquota IPI (%):</label>
                                <input
                                    type="number"
                                    id="ipi_aliquota"
                                    name="ipi_aliquota"
                                    value={produtoData.ipi_aliquota}
                                    onChange={handleChange}
                                    step="0.01"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="pis_aliquota">Alíquota PIS (%):</label>
                                <input
                                    type="number"
                                    id="pis_aliquota"
                                    name="pis_aliquota"
                                    value={produtoData.pis_aliquota}
                                    onChange={handleChange}
                                    step="0.01"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="cofins_aliquota">Alíquota COFINS (%):</label>
                                <input
                                    type="number"
                                    id="cofins_aliquota"
                                    name="cofins_aliquota"
                                    value={produtoData.cofins_aliquota}
                                    onChange={handleChange}
                                    step="0.01"
                                />
                            </div>
                        </div>

                        <h3>Observações</h3>
                        <div className="section-container produto-form-section">
                            <div className="form-group">
                                <label htmlFor="observacoes">Observações Gerais:</label>
                                <textarea
                                    id="observacoes"
                                    name="observacoes"
                                    value={produtoData.observacoes}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="modal-actions">
                            <button type="submit" disabled={loading}>
                                {loading ? (isEditing ? 'Atualizando...' : 'Cadastrando...') : (isEditing ? 'Salvar Alterações' : 'Cadastrar Produto')}
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

export default ProdutoFormModal;