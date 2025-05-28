// C:\Users\Rodrigo Ramos
// SSD\Desktop\ARK\sistema-ark-frontend\src\pages\Produtos.jsx
import React, { useState, useEffect } from 'react';
import { getProdutos, deleteProduto } from '../api/produtos-api'; // Funções de API de produtos
import LoadingSpinner from '../components/LoadingSpinner';
import ProdutoFormModal from '../components/ProdutoFormModal'; // O modal para produtos
import '../components/LoadingSpinner.css'; // Reutiliza CSS do spinner
import '../styles/common-table.css'; // Reutiliza CSS de tabelas

function Produtos() {
    const [produtos, setProdutos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [produtoToEdit, setProdutoToEdit] = useState(null); // Armazena produto para edição
    const [actionMessage, setActionMessage] = useState(null); // Mensagem para ações
    const [searchTerm, setSearchTerm] = useState(''); // Termo de pesquisa

    const fetchProdutos = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getProdutos();
            setProdutos(data);
        } catch (err) {
            console.error("Erro ao buscar produtos:", err);
            setError("Erro ao carregar produtos. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProdutos();
    }, []);

    // Abre o modal no modo de cadastro
    const handleOpenCreateModal = () => {
        setProdutoToEdit(null);
        setIsModalOpen(true);
    };

    // Abre o modal no modo de edição
    const handleOpenEditModal = (produto) => {
        setProdutoToEdit(produto);
        setIsModalOpen(true);
    };

    // Fecha o modal
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setProdutoToEdit(null);
    };

    // Chamado quando um produto é salvo (criado ou editado)
    const handleProdutoSaved = () => {
        fetchProdutos(); // Recarrega a lista
        handleCloseModal(); // Fecha o modal
        setActionMessage('Produto salvo com sucesso!');
        setTimeout(() => setActionMessage(null), 3000);
    };

    // Lida com a exclusão de produto
    const handleDeleteProduto = async (id, nome) => {
        if (window.confirm(`Tem certeza que deseja excluir o produto "${nome}" (ID:
            ${id})?`)) {
            try {
                await deleteProduto(id);
                setActionMessage(`Produto "${nome}" (ID: ${id}) excluído com sucesso!`);
                fetchProdutos(); // Recarrega a lista
                setTimeout(() => setActionMessage(null), 3000);
            } catch (err) {
                console.error('Erro ao excluir produto:', err);
                const errorMessage = err.error || err.message || 'Erro desconhecido.';
                setActionMessage(`Erro ao excluir produto. Detalhes: ${errorMessage}`);
                setTimeout(() => setActionMessage(null), 5000);
            }
        }
    };

    // Lida com a mudança no campo de pesquisa
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    // Lógica para filtrar produtos
    const filteredProdutos = produtos.filter(produto => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        return (
            produto.nome.toLowerCase().includes(lowerCaseSearchTerm) ||
            (produto.descricao && produto.descricao.toLowerCase().includes(lowerCaseSearchTerm)) ||
            (produto.codigo_barras && produto.codigo_barras.toLowerCase().includes(lowerCaseSearchTerm)) ||
            (produto.ncm && produto.ncm.toLowerCase().includes(lowerCaseSearchTerm)) ||
            (produto.unidade_medida && produto.unidade_medida.toLowerCase().includes(lowerCaseSearchTerm)) ||
            (produto.origem && produto.origem.toLowerCase().includes(lowerCaseSearchTerm)) ||
            (produto.categoria && produto.categoria.toLowerCase().includes(lowerCaseSearchTerm)) ||
            String(produto.id).toLowerCase().includes(lowerCaseSearchTerm)
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
            <h1>Produtos</h1>
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
                    Cadastrar Novo Produto
                </button>
            </div>
            <h2>Lista de Produtos</h2>
            <p>Gerenciamento de produtos.</p>
            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                <input
                    type="text"
                    placeholder="Pesquisar produtos..."
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
                            <th>Preço Venda</th>
                            <th>Preço Custo</th>
                            <th>Estoque</th>
                            <th>Est. Mínimo</th>
                            <th>Un. Med.</th>
                            <th>Cód. Barras</th>
                            <th>NCM</th>
                            <th>ICMS (%)</th>
                            <th>Origem</th>
                            <th>Categoria</th>
                            <th>Ativo</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProdutos.length > 0 ? (
                            filteredProdutos.map(produto => (
                                <tr key={produto.id}>
                                    <td>{produto.id}</td>
                                    <td>{produto.nome}</td>
                                    <td>R$ {parseFloat(produto.preco_venda).toFixed(2)}</td>
                                    <td>R$ {parseFloat(produto.preco_custo).toFixed(2)}</td>
                                    <td>{produto.estoque_atual}</td>
                                    <td>{produto.estoque_minimo}</td>
                                    <td>{produto.unidade_medida}</td>
                                    <td>{produto.codigo_barras}</td>
                                    <td>{produto.ncm}</td>
                                    <td>{parseFloat(produto.icms_aliquota).toFixed(2)}%</td>
                                    <td>{produto.origem}</td>
                                    <td>{produto.categoria}</td>
                                    <td>{produto.ativo ? 'Sim' : 'Não'}</td>
                                    <td>
                                        <button
                                            onClick={() => handleOpenEditModal(produto)}
                                            className="edit-button"
                                        >
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => handleDeleteProduto(produto.id,
                                                produto.nome)}
                                            className="delete-button"
                                        >
                                            Excluir
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                {/* Ajuste o colSpan para o número total de colunas na tabela de produtos */}
                                <td colSpan="14" style={{ textAlign: 'center' }}>
                                    {searchTerm ? 'Nenhum produto encontrado com este termo de pesquisa.' : 'Nenhum produto cadastrado ainda.'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <ProdutoFormModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onProdutoSaved={handleProdutoSaved}
                produtoToEdit={produtoToEdit}
            />
        </div>
    );
}

export default Produtos;