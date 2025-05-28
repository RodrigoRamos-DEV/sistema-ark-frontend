// C:\Users\Rodrigo Ramos
// SSD\Desktop\ARK\sistema-ark-frontend\src\pages\PedidosCliente.jsx
import React, { useState, useEffect } from 'react';
// Importa apenas as funções mockadas de Pedidos e Produtos que existem no api.js
import { getPedidos, getProdutos } from '../api/api'; 
import LoadingSpinner from '../components/LoadingSpinner';
import '../components/LoadingSpinner.css';
import '../styles/common-table.css';

// Função auxiliar para formatar preço
const formatPrice = (value) => {
    return parseFloat(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

function PedidosCliente() {
    const [pedidos, setPedidos] = useState([]);
    const [produtos, setProdutos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null); // Para mensagens de sucesso/erro do pedido

    // Estado para o novo pedido (apenas mockado para exibição, sem funcionalidade de salvar real por enquanto)
    const [newPedido, setNewPedido] = useState({
        cliente: 'Cliente Teste (Mock)', // Mockando cliente por enquanto
        produto: '',
        quantidade: 1,
        valorTotal: 0,
        data: new Date().toISOString().split('T')[0], // Data atual
    });

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                // getPedidos e getProdutos ainda são mockadas no api.js principal
                const [pedidosData, produtosData] = await Promise.all([
                    getPedidos('client'), // Função mockada
                    getProdutos() // Função mockada
                ]);
                setPedidos(pedidosData.data);
                setProdutos(produtosData.data);
            } catch (err) {
                console.error("Erro ao carregar dados:", err);
                setError("Erro ao carregar pedidos ou produtos. Tente novamente.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Lida com a mudança nos campos do formulário de pedido (mockado)
    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewPedido(prevPedido => ({
            ...prevPedido,
            [name]: value
        }));
    };

    // Lida com o envio do formulário de pedido (mockado)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(null);
        // Validação de um pedido por dia por cliente (mockado)
        const today = new Date().toISOString().split('T')[0];
        const hasOrderToday = pedidos.some(
            (pedido) =>
            pedido.cliente === newPedido.cliente &&
            pedido.data === today
        );
        if (hasOrderToday) {
            setMessage("Erro: Já existe um pedido para este cliente hoje.");
            return;
        }

        // Calcula valor total (mockado)
        const selectedProduct = produtos.find(p => p.nome === newPedido.produto);
        const calculatedValue = selectedProduct ? selectedProduct.preco * newPedido.quantidade : 0;
        const finalPedido = { ...newPedido, valorTotal: calculatedValue };

        // Simula o salvamento (mockado)
        // Em um sistema real, aqui você chamaria uma API createPedidoCliente
        // const pedidoCriado = await createPedidoCliente(finalPedido);

        // Apenas adiciona ao estado local para visualização
        const mockId = `ped${Math.random().toString(16).slice(2, 8)}`;
        const mockPedidoSalvo = { ...finalPedido, id: mockId, status: 'Pendente' };

        setPedidos(prevPedidos => [...prevPedidos, mockPedidoSalvo]);
        setMessage(`Pedido ${mockId} para ${finalPedido.cliente} criado com sucesso (Mock)!`);

        // Limpa o formulário, exceto o nome do cliente mockado
        setNewPedido(prevPedido => ({
            ...prevPedido,
            produto: '',
            quantidade: 1,
            valorTotal: 0,
            data: new Date().toISOString().split('T')[0],
        }));
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
            <p>Aqui você pode ver e gerenciar seus pedidos.</p>
            <h2>Fazer Novo Pedido</h2>
            {message && (
                <div style={{
                    padding: '10px',
                    margin: '10px 0',
                    borderRadius: '5px',
                    backgroundColor: message.includes('sucesso') ? '#d4edda' : '#f8d7da',
                    color: message.includes('sucesso') ? '#155724' : '#721c24',
                    borderColor: message.includes('sucesso') ? '#c3e6cb' : '#f5c6cb',
                    border: '1px solid'
                }}>
                    {message}
                </div>
            )}
            <form onSubmit={handleSubmit} style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px', maxWidth: '600px', margin: '0 auto 20px auto' }}>
                <div style={{ marginBottom: '10px' }}>
                    <label htmlFor="cliente" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Cliente:</label>
                    <input
                        type="text"
                        id="cliente"
                        name="cliente"
                        value={newPedido.cliente}
                        onChange={handleChange}
                        readOnly // Cliente mockado por enquanto
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '4px', backgroundColor: '#e9e9e9' }}
                    />
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <label htmlFor="produto" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Produto:</label>
                    <select
                        id="produto"
                        name="produto"
                        value={newPedido.produto}
                        onChange={handleChange}
                        required
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '4px' }}
                    >
                        <option value="">Selecione um Produto</option>
                        {produtos.map(prod => (
                            <option key={prod.id} value={prod.nome}>{prod.nome} (R${prod.preco_venda.toFixed(2)})</option>
                        ))}
                    </select>
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <label htmlFor="quantidade" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Quantidade:</label>
                    <input
                        type="number"
                        id="quantidade"
                        name="quantidade"
                        value={newPedido.quantidade}
                        onChange={handleChange}
                        min="1"
                        required
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box', border: '1px solid #ccc', borderRadius: '4px' }}
                    />
                </div>
                <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#01579b', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '1em' }}>
                    Realizar Pedido
                </button>
            </form>
            <h3>Seus Pedidos Atuais</h3>
            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f2f2f2' }}>
                            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>ID</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Cliente</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Produto</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Quantidade</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Valor Total</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Data</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pedidos.length > 0 ? (
                            pedidos.map(pedido => (
                                <tr key={pedido.id} style={{ '&:nth-child(even)': { backgroundColor: '#f9f9f9' } }}>
                                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{pedido.id}</td>
                                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{pedido.cliente}</td>
                                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{pedido.produto}</td>
                                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{pedido.quantidade}</td>
                                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>R$ {pedido.valorTotal ? pedido.valorTotal.toFixed(2) : '0.00'}</td>
                                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{pedido.data}</td>
                                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{pedido.status}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>Nenhum pedido encontrado.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default PedidosCliente;