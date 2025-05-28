// C:\Users\Rodrigo Ramos SSD\Desktop\ARK\sistema-ark-frontend\src\App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import Produtos from './pages/Produtos';
import PedidosCliente from './pages/PedidosCliente';
import PedidosAdmin from './pages/PedidosAdmin';
import Fornecedores from './pages/Fornecedores';
import Caminhoes from './pages/Caminhoes';
import PedidosFornecedor from './pages/PedidosFornecedor'; // IMPORTA A NOVA PÁGINA
import Romaneios from './pages/Romaneios';
import './App.css';

function App() {
    const appTitle = "SISTEMA ARK"; // Título geral da aplicação
    return (
        <Router>
            <div className="app-container">
                <Sidebar />
                <div className="main-content">
                    <Header title={appTitle} />
                    <div className="page-content">
                        <Routes>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/clientes" element={<Clientes />} />
                            <Route path="/fornecedores" element={<Fornecedores />} />
                            <Route path="/produtos" element={<Produtos />} />
                            <Route path="/caminhoes" element={<Caminhoes />} />
                            <Route path="/pedidos-fornecedor" element={<PedidosFornecedor />} /> {/* NOVA ROTA */}
                            <Route path="/pedidos-cliente" element={<PedidosCliente />} />
                            <Route path="/pedidos-admin" element={<PedidosAdmin />} />
                            <Route path="/romaneios" element={<Romaneios />} />
                            {/* Adicionar mais rotas conforme as páginas forem criadas */}
                        </Routes>
                    </div>
                </div>
            </div>
        </Router>
    );
}

export default App;