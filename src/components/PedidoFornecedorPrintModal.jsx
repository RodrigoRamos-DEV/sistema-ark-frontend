// C:\Users\Rodrigo Ramos
// SSD\Desktop\ARK\sistema-ark-frontend\src\components\PedidoFornecedorPrintModal.jsx
import React, { useEffect, useRef } from 'react';
import html2pdf from 'html2pdf.js'; // Importa a biblioteca html2pdf
import '../styles/common-modal.css'; // Reutiliza o CSS comum para modais
import './PedidoFornecedorPrintModal.css'; // CSS específico para este modal

// Importe sua imagem do logo aqui.
// Se você salvou a imagem transparente do logo que eu te dei,
// coloque-a na pasta 'public/' do seu projeto frontend (ex: public/logo-ark.png)
// E então importe assim (sem './'):

// Ou continue usando a URL se preferir:
const logoArk = 'https://cdn.discordapp.com/attachments/1360704799011504128/1377090975213813882/SistemaARK.png?ex=6837b369&is=683661e9&hm=8d836317b592ec11f78561c03282f6f49af91c25bceaa8d87ae18d347415c8ef&'; // URL do logo transparente que você gostou

// Funções auxiliares (reutilizadas de outros componentes)
const formatPrice = (value) => {
    return parseFloat(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const formatDisplayDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('pt-BR');
};

function PedidoFornecedorPrintModal({ isOpen, onClose, pedido }) {
    const contentRef = useRef(null); // Ref para o conteúdo a ser impresso/PDF

    // Não renderiza o modal se não estiver aberto ou não houver pedido
    if (!isOpen || !pedido) return null;

    // NOVO: Função para imprimir diretamente
    const handlePrintDirect = () => {
        if (contentRef.current) {
            const printWindow = window.open('', '_blank');
            // Construa o HTML que você quer imprimir
            const printContent = `
                <html>
                <head>
                    <title>Pedido de Fornecedor - ${pedido.id}</title>
                    <style>
                        /* Inclua AQUI o CSS ESSENCIAL para a impressão */
                        body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
                        .print-container { width: 100%; margin: 0 auto; padding: 20px; box-sizing: border-box; }
                        
                        .print-header-logo { display: block; margin: 0 auto 10px auto; max-width: 150px; height: auto; }
                        .print-subtitle { text-align: center; font-size: 1.4em; color: #01579b; margin-bottom: 20px; padding-bottom: 5px; border-bottom: 2px solid #01579b; }
                        
                        .pedido-info-line { display: flex; justify-content: space-around; align-items: center; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 1px solid #eee; flex-wrap: wrap; gap: 10px; }
                        .pedido-info-line p { margin: 0; font-size: 0.95em; text-align: center; }
                        .pedido-info-line strong { color: #333; }
                        
                        h2 { color: #01579b; text-align: center; margin-top: 20px; margin-bottom: 10px; padding-bottom: 5px; border-bottom: 1px solid #e0e0e0; }
                        
                        .items-list-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        .items-list-table th, .items-list-table td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 0.85em; }
                        .items-list-table th { background-color: #f2f2f2; font-weight: bold; }
                        .items-list-table tr:nth-child(even) { background-color: #f9f9f9; }
                        
                        .total-info { margin-top: 30px; padding-top: 15px; border-top: 2px solid #01579b; text-align: right; font-size: 1.2em; font-weight: bold; color: #01579b; }

                        /* Regras específicas para impressão */
                        @page { margin: 20mm; } /* Define margens da página no navegador */
                        body { print-color-adjust: exact; } /* Garante que cores de fundo sejam impressas */
                        .items-list-table { page-break-inside: auto; } /* Tenta quebrar a tabela de forma inteligente */
                        .items-list-table tr { page-break-inside: avoid; page-break-after: auto; } /* Evita quebra dentro da linha */
                        
                    </style>
                </head>
                <body>
                    ${contentRef.current.innerHTML}
                </body>
                </html>
            `;
            printWindow.document.write(printContent);
            printWindow.document.close(); // Fecha o documento para que o navegador comece a renderizar
            printWindow.focus(); // Foca na nova janela
            // Pequeno atraso para garantir que o conteúdo seja renderizado antes de imprimir
            setTimeout(() => {
                printWindow.print();
                // printWindow.close(); // Opcional: fechar a janela após a impressão
            }, 500); // 500ms de atraso
        }
    };

    const handleSavePdf = () => { // Renomeado de handlePrint para ser específico de PDF
        if (contentRef.current) {
            html2pdf(contentRef.current, {
                margin: 10,
                filename: `Pedido_Fornecedor_${pedido.id}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }, // Formato A4 Retrato
                pagebreak: { 
                    mode: ['avoid-all', 'css', 'legacy']
                } 
            }).then(() => {
                console.log('PDF gerado e baixado!');
            }).catch(err => {
                console.error('Erro ao gerar PDF:', err);
                alert('Erro ao gerar PDF. Verifique o console para mais detalhes.');
            });
        }
    };

    // Combinamos todos os itens do pedido em uma única lista para a tabela.
    const allItemsForPrint = pedido.itens;

    const totalPedidoGeral = pedido.itens.reduce((sum, item) => sum + (parseFloat(item.quantidade || 0) * parseFloat(item.preco_unitario || 0)), 0);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content modal-content-full-width" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Visualizar e Imprimir Pedido de Fornecedor</h2>
                    <button className="close-button" onClick={onClose}>&times;</button>
                </div>
                <div className="modal-body print-modal-body">
                    {/* Conteúdo a ser impresso/gerado PDF */}
                    <div ref={contentRef} className="print-container">
                        {/* NOVO: Logo e Título "Pedido de Fornecedores" */}
                        <img src={logoArk} alt="SISTEMA ARK Logo" className="print-header-logo" />
                        <h1 className="print-subtitle">Pedido de Fornecedores</h1>

                        {/* NOVO: ID, Data e Status na mesma linha */}
                        <div className="pedido-info-line">
                            <p><strong>ID do Pedido:</strong> {pedido.id}</p>
                            <p><strong>Data do Pedido:</strong> {formatDisplayDate(pedido.data_pedido)}</p>
                            <p><strong>Status:</strong> {pedido.status}</p>
                        </div>

                        <h2>Detalhes dos Itens</h2>
                        {allItemsForPrint.length > 0 ? (
                            <table className="items-list-table">
                                <thead>
                                    <tr>
                                        <th>Fornecedor</th>
                                        <th>Quantidade</th>
                                        <th>Produto</th>
                                        <th>Preço Unit.</th>
                                        <th>Preço Total</th>
                                        <th>Caminhão</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allItemsForPrint.map((item, index) => {
                                        const fornecedorItem = item.fornecedor || pedido.fornecedor; // Fornecedor do item ou principal
                                        const produto = item.produto;
                                        const caminhaoItem = item.caminhao;
                                        const precoTotalItem = (parseFloat(item.quantidade || 0) * parseFloat(item.preco_unitario || 0));

                                        return (
                                            <tr key={item.id || index}> 
                                                <td>{fornecedorItem ? fornecedorItem.nome : '-'}</td>
                                                <td>{item.quantidade || '-'} {produto ? produto.unidade_medida : ''}</td>
                                                <td>{produto ? produto.nome : '-'}</td>
                                                <td>{formatPrice(item.preco_unitario || 0)}</td>
                                                <td>{formatPrice(precoTotalItem)}</td>
                                                <td>{caminhaoItem ? `${caminhaoItem.modelo} (${caminhaoItem.placa})` : '-'}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        ) : (
                            <p style={{textAlign: 'center'}}>Nenhum item neste pedido.</p>
                        )}
                        
                        <div className="total-info">
                            <h3>Total Geral do Pedido: {formatPrice(totalPedidoGeral)}</h3>
                        </div>
                    </div>
                </div>
                <div className="modal-actions">
                    <button type="button" onClick={handlePrintDirect} className="print-button"> {/* NOVO BOTÃO */}
                        Imprimir Direto
                    </button>
                    <button type="button" onClick={handleSavePdf} className="save-pdf-button"> {/* Renomeado a classe */}
                        Salvar PDF
                    </button>
                    <button type="button" onClick={onClose} className="cancel-button">
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
}

export default PedidoFornecedorPrintModal;