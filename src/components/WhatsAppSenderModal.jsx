import React, { useState, useEffect } from 'react';
import '../styles/common-modal.css';
import './WhatsAppSenderModal.css';

// Formata um valor numérico para o formato de moeda BRL.
const formatPrice = (value) => {
    return parseFloat(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

// Formata uma string de data para o formato de data local (pt-BR).
const formatDisplayDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('pt-BR');
};

function WhatsAppSenderModal({ isOpen, onClose, pedido }) {
    const [personalMessage, setPersonalMessage] = useState("");
    // sentStatus armazena o status de envio para cada fornecedor (sent, error, ou pending).
    const [sentStatus, setSentStatus] = useState({});
    // fornecedoresParaEnviar guarda a lista de fornecedores únicos do pedido.
    const [fornecedoresParaEnviar, setFornecedoresParaEnviar] = useState([]);
    // selectedFornecedores mantém os IDs dos fornecedores selecionados para envio.
    const [selectedFornecedores, setSelectedFornecedores] = useState([]);
    // message é para exibir feedback ao usuário (sucesso/erro).
    const [message, setMessage] = useState(null);

    // useEffect para inicializar o estado do modal quando ele abre ou o pedido muda.
    useEffect(() => {
        if (isOpen && pedido) {
            setPersonalMessage("");
            setSentStatus({});
            setMessage(null);

            // Coleta fornecedores únicos do pedido e seus itens.
            const uniqueFornecedoresMap = new Map();
            if (pedido.fornecedor && pedido.fornecedor.id) {
                uniqueFornecedoresMap.set(pedido.fornecedor.id, pedido.fornecedor);
            }
            pedido.itens.forEach(item => {
                if (item.fornecedor && item.fornecedor.id) {
                    uniqueFornecedoresMap.set(item.fornecedor.id, item.fornecedor);
                }
            });
            const fornList = Array.from(uniqueFornecedoresMap.values());
            setFornecedoresParaEnviar(fornList);
            setSelectedFornecedores(fornList.map(f => f.id));
        }
    }, [isOpen, pedido]);

    // O modal não é renderizado se não estiver aberto ou não houver pedido.
    if (!isOpen || !pedido) return null;

    // Constrói a mensagem completa do pedido para o WhatsApp.
    const buildOrderMessage = (fornecedor) => {
        let messageContent = `Olá ${fornecedor.nome},`;
        // Adiciona a mensagem personalizada (se houver), seguida por duas quebras de linha.
        // Se não houver mensagem personalizada, adiciona apenas duas quebras de linha para espaçamento.
        messageContent += personalMessage ? `\n${personalMessage}\n\n` : "\n\n";

        // Constrói a lista de produtos com suas quantidades e preços.
        const produtosNoPedido = pedido.itens.map(item => {
            const produtoNome = item.produto ? item.produto.nome : `Produto ID ${item.produtoId}`;
            const quantidade = item.quantidade;
            const unidade = item.produto ? item.produto.unidade_medida : '';
            // Corrigido: Removidas tags HTML e caracteres especiais.
            return `${quantidade} ${unidade} de ${produtoNome} (R$ ${parseFloat(item.preco_unitario || 0).toFixed(2)})`;
        });

        messageContent += produtosNoPedido.join("\n"); // Une os produtos com quebra de linha.

        // Adiciona o total do pedido e a data.
        messageContent += `\n\nTotal do pedido: R$ ${parseFloat(pedido.itens.reduce((sum, item) => sum + (parseFloat(item.quantidade || 0) * parseFloat(item.preco_unitario || 0)), 0)).toFixed(2)}`;
        messageContent += `\nData do Pedido: ${formatDisplayDate(pedido.data_pedido)}`;

        // Codifica a mensagem para ser usada em um URL.
        return encodeURIComponent(messageContent);
    };

    // Lida com o envio da mensagem para um fornecedor específico.
    const handleSendMessage = (fornecedor) => {
        setMessage(null); // Limpa mensagens anteriores.

        // Verifica se a mensagem já foi enviada para este fornecedor.
        if (sentStatus[fornecedor.id] === 'sent') {
            setMessage(`A mensagem para ${fornecedor.nome} já foi enviada.`);
            return;
        }

        const fullMessage = buildOrderMessage(fornecedor);
        // Limpa o telefone para garantir apenas dígitos.
        const telefoneLimpo = fornecedor.telefone ? fornecedor.telefone.replace(/\D/g, '') : '';

        // Exibe erro se o telefone for inválido.
        if (!telefoneLimpo) {
            setMessage(`Telefone do fornecedor ${fornecedor.nome} não disponível ou inválido.`);
            setSentStatus(prevStatus => ({ ...prevStatus, [fornecedor.id]: 'error' }));
            return;
        }

        // Abre o link do WhatsApp com a mensagem predefinida.
        const whatsappLink = `https://wa.me/55${telefoneLimpo}?text=${fullMessage}`;
        window.open(whatsappLink, '_blank');

        // Atualiza o status para 'sent' após o envio.
        setSentStatus(prevStatus => ({
            ...prevStatus,
            [fornecedor.id]: 'sent'
        }));
        setMessage(`Mensagem enviada para ${fornecedor.nome}!`);
    };

    // Lida com a mudança no estado do checkbox de seleção do fornecedor.
    const handleCheckboxChange = (fornecedorId) => {
        setSelectedFornecedores(prevSelected =>
            prevSelected.includes(fornecedorId)
                ? prevSelected.filter(id => id !== fornecedorId)
                : [...prevSelected, fornecedorId]
        );
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Enviar Pedido via WhatsApp</h2>
                    <button className="close-button" onClick={onClose}>&times;</button>
                </div>
                <div className="modal-body">
                    {message && (
                        <div className={`message-box ${message.includes('sucesso') || message.includes('enviada') ? 'success' : 'error'}`}>
                            {message}
                        </div>
                    )}
                    <p>Pedido ID: <strong>{pedido.id}</strong> (Feito em: {formatDisplayDate(pedido.data_pedido)})</p>

                    <h3>Mensagem Personalizada:</h3>
                    <div className="form-group">
                        <textarea
                            value={personalMessage}
                            onChange={(e) => setPersonalMessage(e.target.value)}
                            placeholder="Digite uma mensagem adicional (opcional)..."
                            rows="4"
                        ></textarea>
                    </div>
                    <h3>Fornecedores envolvidos no Pedido:</h3>
                    <ul className="whatsapp-fornecedor-list">
                        {fornecedoresParaEnviar.length > 0 ? (
                            fornecedoresParaEnviar.map(forn => {
                                // Desabilita o botão de envio se o fornecedor não estiver selecionado,
                                // se não tiver telefone, ou se a mensagem já foi enviada.
                                const isDisabled = !selectedFornecedores.includes(forn.id) ||
                                                    !forn.telefone ||
                                                    sentStatus[forn.id] === 'sent';

                                return (
                                    <li key={forn.id} className={sentStatus[forn.id] === 'sent' ? 'sent-item' : ''}>
                                        <input
                                            type="checkbox"
                                            id={`forn-${forn.id}`}
                                            checked={selectedFornecedores.includes(forn.id)}
                                            onChange={() => handleCheckboxChange(forn.id)}
                                            disabled={isDisabled}
                                        />
                                        <label htmlFor={`forn-${forn.id}`}>
                                            {forn.nome} ({forn.telefone || 'Telefone não disponível'})
                                            {sentStatus[forn.id] === 'sent' && <span className="status-icon success">&#10003; Enviado</span>}
                                            {sentStatus[forn.id] === 'error' && <span className="status-icon error">&#10060; Erro</span>}
                                        </label>
                                        <button
                                            onClick={() => handleSendMessage(forn)}
                                            disabled={isDisabled}
                                            className="send-wpp-button"
                                        >
                                            Enviar WhatsApp
                                        </button>
                                    </li>
                                );
                            })
                        ) : (
                            <li>Nenhum fornecedor principal associado a este pedido.</li>
                        )}
                    </ul>
                </div>
                <div className="modal-actions">
                    <button type="button" onClick={onClose} className="cancel-button">
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
}

export default WhatsAppSenderModal;