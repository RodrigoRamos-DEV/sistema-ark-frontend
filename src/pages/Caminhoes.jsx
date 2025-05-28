// C:\Users\Rodrigo Ramos
// SSD\Desktop\ARK\sistema-ark-frontend\src\pages\Caminhoes.jsx
import React, { useState, useEffect } from 'react';
import { getCaminhoes, deleteCaminhao } from '../api/caminhoes-api'; // Funções de API de caminhões
import LoadingSpinner from '../components/LoadingSpinner';
import CaminhaoFormModal from '../components/CaminhaoFormModal'; // O modal para caminhões
import '../components/LoadingSpinner.css'; // Reutiliza CSS do spinner
import '../styles/common-table.css'; // Reutiliza CSS de tabelas

function Caminhoes() {
    const [caminhoes, setCaminhoes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [caminhaoToEdit, setCaminhaoToEdit] = useState(null); // Armazena caminhão para edição
    const [actionMessage, setActionMessage] = useState(null); // Mensagem para ações
    const [searchTerm, setSearchTerm] = useState(''); // Termo de pesquisa

    const fetchCaminhoes = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getCaminhoes();
            setCaminhoes(data);
        } catch (err) {
            console.error("Erro ao buscar caminhões:", err);
            setError("Erro ao carregar caminhões. Tente novamente.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCaminhoes();
    }, []);

    // Abre o modal no modo de cadastro
    const handleOpenCreateModal = () => {
        setCaminhaoToEdit(null);
        setIsModalOpen(true);
    };

    // Abre o modal no modo de edição
    const handleOpenEditModal = (caminhao) => {
        setCaminhaoToEdit(caminhao);
        setIsModalOpen(true);
    };

    // Fecha o modal
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCaminhaoToEdit(null);
    };

    // Chamado quando um caminhão é salvo (criado ou editado)
    const handleCaminhaoSaved = () => {
        fetchCaminhoes(); // Recarrega a lista
        handleCloseModal(); // Fecha o modal
        setActionMessage('Caminhão salvo com sucesso!');
        setTimeout(() => setActionMessage(null), 3000);
    };

    // Lida com a exclusão de caminhão
    const handleDeleteCaminhao = async (id, modelo) => {
        if (window.confirm(`Tem certeza que deseja excluir o caminhão "${modelo}" (ID: ${id})?`)) {
            try {
                await deleteCaminhao(id);
                setActionMessage(`Caminhão "${modelo}" (ID: ${id}) excluído com sucesso!`);
                fetchCaminhoes(); // Recarrega a lista
                setTimeout(() => setActionMessage(null), 3000);
            } catch (err) {
                console.error('Erro ao excluir caminhão:', err);
                const errorMessage = err.error || err.message || 'Erro desconhecido.';
                setActionMessage(`Erro ao excluir caminhão. Detalhes: ${errorMessage}`);
                setTimeout(() => setActionMessage(null), 5000);
            }
        }
    };

    // Lida com a mudança no campo de pesquisa
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    // Lógica para filtrar caminhões
    const filteredCaminhoes = caminhoes.filter(caminhao => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        return (
            caminhao.modelo.toLowerCase().includes(lowerCaseSearchTerm) ||
            caminhao.placa.toLowerCase().includes(lowerCaseSearchTerm) ||
            (caminhao.cor && caminhao.cor.toLowerCase().includes(lowerCaseSearchTerm)) ||
            (caminhao.apelido && caminhao.apelido.toLowerCase().includes(lowerCaseSearchTerm)) ||
            (caminhao.unidade_capacidade && caminhao.unidade_capacidade.toLowerCase().includes(lowerCaseSearchTerm)) ||
            String(caminhao.capacidade).includes(lowerCaseSearchTerm) || // Pesquisa por número
            String(caminhao.id).toLowerCase().includes(lowerCaseSearchTerm)
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
            <h1>Caminhões</h1>
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
                    Cadastrar Novo Caminhão
                </button>
            </div>

            <h2>Lista de Caminhões</h2>
            <p>Gerenciamento de veículos.</p>

            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                <input
                    type="text"
                    placeholder="Pesquisar caminhões..."
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
                            <th>Modelo</th>
                            <th>Placa</th>
                            <th>Cor</th>
                            <th>Capacidade</th>
                            <th>Unidade</th>
                            <th>Apelido</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCaminhoes.length > 0 ? (
                            filteredCaminhoes.map(caminhao => (
                                <tr key={caminhao.id}>
                                    <td>{caminhao.id}</td>
                                    <td>{caminhao.modelo}</td>
                                    <td>{caminhao.placa}</td>
                                    <td>{caminhao.cor}</td>
                                    <td>{parseFloat(caminhao.capacidade).toFixed(2)}</td>
                                    <td>{caminhao.unidade_capacidade}</td>
                                    <td>{caminhao.apelido}</td>
                                    <td>
                                        <button
                                            onClick={() => handleOpenEditModal(caminhao)}
                                            className="edit-button"
                                        >
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => handleDeleteCaminhao(caminhao.id, caminhao.modelo)}
                                            className="delete-button"
                                        >
                                            Excluir
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                {/* colSpan = 8 (ID, Modelo, Placa, Cor, Capacidade, Unidade, Apelido, Ações) */}
                                <td colSpan="8" style={{ textAlign: 'center' }}>
                                    {searchTerm ? 'Nenhum caminhão encontrado com este termo de pesquisa.' : 'Nenhum caminhão cadastrado ainda.'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <CaminhaoFormModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onCaminhaoSaved={handleCaminhaoSaved}
                caminhaoToEdit={caminhaoToEdit}
            />
        </div>
    );
}

export default Caminhoes;