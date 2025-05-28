// src/components/Sidebar.jsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

function Sidebar() {
    const location = useLocation();
    const [isCadastrosOpen, setIsCadastrosOpen] = useState(false);
    const [isPedidosOpen, setIsPedidosOpen] = useState(false); // NOVO: Estado para submenu Pedidos

    const getLinkClass = (path) => {
        return location.pathname === path ? 'active' : '';
    };

    const toggleCadastros = () => {
        setIsCadastrosOpen(!isCadastrosOpen);
        setIsPedidosOpen(false); // Fecha outros submenus
    };

    const togglePedidos = () => { // NOVO: Função para alternar submenu Pedidos
        setIsPedidosOpen(!isPedidosOpen);
        setIsCadastrosOpen(false); // Fecha outros submenus
    };

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <h3>SISTEMA ARK</h3>
            </div>
            <ul className="sidebar-nav">
                <li><Link to="/" className={getLinkClass('/')}>Dashboard</Link></li>

                {/* Item de menu "Cadastros" com submenu */}
                <li className="has-submenu">
                    <a onClick={toggleCadastros} className={isCadastrosOpen || 
                        location.pathname.startsWith('/clientes') ||
                        location.pathname.startsWith('/fornecedores') ||
                        location.pathname.startsWith('/produtos') ||
                        location.pathname.startsWith('/caminhoes')
                        ? 'active' : ''}>
                        Cadastros <span className={`arrow ${isCadastrosOpen ? 'open' : ''}`}>&#9660;</span>
                    </a>
                    {isCadastrosOpen && (
                        <ul className="submenu">
                            <li><Link to="/clientes" className={getLinkClass('/clientes')}>Clientes</Link></li>
                            <li><Link to="/fornecedores" className={getLinkClass('/fornecedores')}>Fornecedores</Link></li>
                            <li><Link to="/produtos" className={getLinkClass('/produtos')}>Produtos</Link></li>
                            <li><Link to="/caminhoes" className={getLinkClass('/caminhoes')}>Caminhões</Link></li>
                        </ul>
                    )}
                </li>

                {/* NOVO: Item de menu "Pedidos" com submenu */}
                <li className="has-submenu">
                    <a onClick={togglePedidos} className={isPedidosOpen || 
                        location.pathname.startsWith('/pedidos-fornecedor') ||
                        location.pathname.startsWith('/pedidos-cliente') ||
                        location.pathname.startsWith('/pedidos-admin')
                        ? 'active' : ''}>
                        Pedidos <span className={`arrow ${isPedidosOpen ? 'open' : ''}`}>&#9660;</span>
                    </a>
                    {isPedidosOpen && (
                        <ul className="submenu">
                            <li><Link to="/pedidos-fornecedor" className={getLinkClass('/pedidos-fornecedor')}>Pedidos Fornecedor</Link></li>
                            <li><Link to="/pedidos-cliente" className={getLinkClass('/pedidos-cliente')}>Pedidos Cliente</Link></li>
                            <li><Link to="/pedidos-admin" className={getLinkClass('/pedidos-admin')}>Gerenciar Pedidos</Link></li>
                        </ul>
                    )}
                </li>

                <li><Link to="/romaneios" className={getLinkClass('/romaneios')}>Romaneios</Link></li>
                {/* Adicionar mais links conforme módulos */}
            </ul>
        </div>
    );
}

export default Sidebar;