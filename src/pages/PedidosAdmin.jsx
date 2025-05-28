// src/pages/PedidosAdmin.jsx
import React, { useState, useEffect } from 'react';
import { getPedidos } from '../api/api';
import LoadingSpinner from '../components/LoadingSpinner';

function PedidosAdmin() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroData, setFiltroData] = useState('');
  const [filtroCliente, setFiltroCliente] = useState('');

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const response = await getPedidos();
        setPedidos(response.data);
      } catch (err) {
        console.error("Erro ao buscar pedidos:", err);
        setError("Erro ao carregar pedidos. Tente novamente.");
      } finally {
        setLoading(false);
      }
    };
    fetchPedidos();
  }, []);

  const pedidosFiltrados = pedidos.filter(pedido => {
    const dataMatch = filtroData ? pedido.data === filtroData : true;
    const clienteMatch = filtroCliente ?
      pedido.nomeCliente.toLowerCase().includes(filtroCliente.toLowerCase()) ||
      pedido.clienteId.toLowerCase().includes(filtroCliente.toLowerCase()) :
      true;
    return dataMatch && clienteMatch;
  });

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div style={{ color: 'red', textAlign: 'center' }}>{error}</div>;
  }

  return (
    <div>
      <h1>Gerenciar Pedidos</h1>
      <div className="filters" style={{ marginBottom: '20px' }}>
        <label>
          Filtrar por Data:
          <input
            type="date"
            value={filtroData}
            onChange={(e) => setFiltroData(e.target.value)}
            style={{ marginLeft: '10px', padding: '5px' }}
          />
        </label>
        <label style={{ marginLeft: '20px' }}>
          Filtrar por Cliente (ID/Nome):
          <input
            type="text"
            value={filtroCliente}
            onChange={(e) => setFiltroCliente(e.target.value)}
            placeholder="Ex: CLI001 ou Alpha"
            style={{ marginLeft: '10px', padding: '5px' }}
          />
        </label>
      </div>
      <table>
        <thead>
          <tr>
            <th>ID Pedido</th>
            <th>Data</th>
            <th>Cliente (ID/Nome)</th>
            <th>Status</th>
            <th>Itens</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {pedidosFiltrados.length === 0 ? (
              <tr><td colSpan="6" style={{textAlign: 'center'}}>Nenhum pedido encontrado.</td></tr>
          ) : (
              pedidosFiltrados.map(pedido => (
              <tr key={pedido.id}>
                  <td>{pedido.id}</td>
                  <td>{pedido.data}</td>
                  <td>{pedido.nomeCliente} ({pedido.clienteId})</td>
                  <td>{pedido.status}</td>
                  <td>
                  <ul>
                      {pedido.itens.map((item, index) => (
                      <li key={index}>
                          {item.prodId} (Qtd: {item.qtd})
                      </li>
                      ))}
                  </ul>
                  </td>
                  <td>
                  <button>Detalhes</button>
                  <button style={{ marginLeft: '5px' }}>Alterar Status</button>
                  </td>
              </tr>
              ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default PedidosAdmin;