// C:\Users\Rodrigo Ramos
// SSD\Desktop\ARK\sistema-ark-frontend\src\components\NotaPrintModal.jsx
import React, { useRef, useEffect, useState } from 'react';
import html2pdf from 'html2pdf.js';
import '../styles/common-modal.css';
import './NotaPrintModal.css'; // Criaremos este CSS a seguir (similar ao RomaneioPrintModal.css)

const logoArk = '/logo-ark.png'; // Caminho relativo à pasta 'public'

const formatPrice = (value) => {
    return parseFloat(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};

const formatDisplayDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('pt-BR');
};

function NotaPrintModal({ isOpen, onClose, selectedPedidos }) {
    const printRef = useRef(null);
    const [elementsToPrint, setElementsToPrint] = useState([]);

    useEffect(() => {
        if (isOpen && selectedPedidos && selectedPedidos.length > 0) {
            setElementsToPrint(selectedPedidos.map(() => React.createRef()));
        } else {
            setElementsToPrint([]);
        }
    }, [isOpen, selectedPedidos]);

    if (!isOpen || !selectedPedidos || selectedPedidos.length === 0) return null;

    // Define o tamanho da página personalizada para Nota (mesmo do Romaneio)
    const customPageSize = [215.9, 110.07]; // [width, height] in mm

    const handlePrintDirect = () => {
        if (elementsToPrint.length === 0) {
            alert('Nenhuma nota selecionada para impressão.');
            return;
        }

        const printWindow = window.open('', '_blank');
        printWindow.document.write('<html><head><title>Imprimir Notas</title>');
        printWindow.document.write('<style>');
        // Inclua AQUI o CSS ESSENCIAL para a impressão direta
        printWindow.document.write(`
            body { font-family: Arial, sans-serif; margin: 0; padding: 0; display: flex; flex-wrap: wrap; justify-content: center; align-items: flex-start; }
            .nota-page {
                width: 215.9mm; /* Largura da página */
                height: 110.07mm; /* Altura da página */
                box-sizing: border-box;
                padding: 10mm; /* Margem interna para o conteúdo */
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                border: 1px solid #ccc; /* Apenas para visualização no navegador */
                margin-bottom: 5mm;
                overflow: hidden;
            }
            .nota-header { text-align: center; margin-bottom: 10mm; }
            .nota-header img { max-width: 100px; height: auto; margin-bottom: 5mm; }
            .nota-header h1 { font-size: 1.2em; color: #01579b; margin: 0; }
            .nota-info { font-size: 0.8em; margin-bottom: 5mm; text-align: center; }
            .nota-info p { margin: 2px 0; }
            .items-table { width: 100%; border-collapse: collapse; margin-top: 5mm; }
            .items-table th, .items-table td { border: 1px solid #ddd; padding: 3px 5px; text-align: left; font-size: 0.75em; }
            .items-table th { background-color: #f2f2f2; }
            .nota-total { text-align: right; margin-top: 5mm; font-size: 0.9em; font-weight: bold; }
            .nota-footer { text-align: right; margin-top: 5mm; font-size: 0.8em; }

            /* Para impressão: força cada nota em uma nova página */
            @media print {
                body { display: block; }
                .nota-page {
                    border: none !important;
                    page-break-after: always;
                    margin: 0 !important;
                    height: 110.07mm !important;
                    width: 215.9mm !important;
                    padding: 10mm !important;
                    box-sizing: border-box !important;
                    overflow: hidden !important;
                }
                .nota-page:last-child {
                    page-break-after: auto;
                }
            }
        `);
        printWindow.document.write('</style>');
        printWindow.document.write('</head><body>');

        elementsToPrint.forEach((ref, index) => {
            if (ref.current) {
                printWindow.document.write(ref.current.outerHTML);
            }
        });

        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
        }, 500);
    };

    const handleSavePdf = () => {
        if (elementsToPrint.length === 0) {
            alert('Nenhuma nota selecionada para salvar em PDF.');
            return;
        }

        const opt = {
            margin: [0, 0, 0, 0], // Margens: top, left, bottom, right (em mm)
            filename: `Notas_Pedidos.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: {
                unit: 'mm',
                format: customPageSize,
                orientation: 'portrait'
            },
            pagebreak: {
                mode: ['avoid-all', 'css'],
                before: '.nota-page' // Força uma quebra de página antes de cada nota
            }
        };

        const contentNodes = elementsToPrint.map(ref => ref.current).filter(node => node);

        html2pdf().from(contentNodes).set(opt).save()
            .then(() => {
                console.log('PDF de notas gerado e baixado!');
            }).catch(err => {
                console.error('Erro ao gerar PDF de notas:', err);
                alert('Erro ao gerar PDF. Verifique o console para mais detalhes.');
            });
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content modal-content-print-narrow" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Imprimir Notas de Venda</h2>
                    <button className="close-button" onClick={onClose}>&times;</button>
                </div>
                <div className="modal-body print-modal-body-scroll">
                    {selectedPedidos.map((pedido, pedidoIndex) => (
                        <div key={pedido.id} ref={elementsToPrint[pedidoIndex]} className="nota-page">
                            <div className="nota-header">
                                <img src={logoArk} alt="SISTEMA ARK Logo" />
                                <h1>NOTA DE VENDA</h1>
                            </div>
                            <div className="nota-info">
                                <p><strong>Cliente:</strong> {pedido.cliente ? pedido.cliente.nome : 'N/A'}</p>
                                <p><strong>Data do Pedido:</strong> {formatDisplayDate(pedido.data_pedido)}</p>
                                <p><strong>ID do Pedido:</strong> {pedido.id}</p>
                            </div>
                            <div className="items-section">
                                <table className="items-table">
                                    <thead>
                                        <tr>
                                            <th>Produto</th>
                                            <th>Qtd</th>
                                            <th>Preço Unit.</th>
                                            <th>Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pedido.itens.map((item, itemIndex) => {
                                            const subtotal = (parseFloat(item.quantidade || 0) * parseFloat(item.preco_unitario || 0));
                                            return (
                                                <tr key={item.id || itemIndex}>
                                                    <td>{item.produto ? item.produto.nome : 'N/A'}</td>
                                                    <td>{item.quantidade || '0'} {item.produto ? item.produto.unidade_medida : ''}</td>
                                                    <td>{formatPrice(item.preco_unitario || 0)}</td>
                                                    <td>{formatPrice(subtotal)}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                            <div className="nota-total">
                                <p><strong>Total da Venda:</strong> {formatPrice(pedido.valor_venda_total || 0)}</p>
                            </div>
                            <div className="nota-footer">
                                <p>Assinatura do Recebedor: ______________________________</p>
                                <p>Data do Recebimento: ____/____/________</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="modal-actions">
                    <button type="button" onClick={handlePrintDirect} className="print-button">
                        Imprimir Direto
                    </button>
                    <button type="button" onClick={handleSavePdf} className="save-pdf-button">
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

export default NotaPrintModal;