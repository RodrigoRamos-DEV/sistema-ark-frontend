// C:\Users\Rodrigo Ramos
// SSD\Desktop\ARK\sistema-ark-frontend\src\components\RomaneioPrintModal.jsx
import React, { useRef, useEffect, useState } from 'react';
import html2pdf from 'html2pdf.js';
import '../styles/common-modal.css';
import './RomaneioPrintModal.css'; // Criaremos este CSS a seguir

const logoArk = '/logo-ark.png'; // Caminho relativo à pasta 'public'

const formatDisplayDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('pt-BR');
};

function RomaneioPrintModal({ isOpen, onClose, selectedPedidos }) {
    // selectedPedidos será um array de objetos de pedido completos
    const printRef = useRef(null); // Usado para referenciar o container principal para impressão
    const [elementsToPrint, setElementsToPrint] = useState([]); // Array de refs para cada romaneio individual

    // Efeito para preparar os elementos para impressão quando o modal abre ou os pedidos mudam
    useEffect(() => {
        if (isOpen && selectedPedidos && selectedPedidos.length > 0) {
            // Cria um array de refs, uma para cada romaneio que será gerado
            setElementsToPrint(selectedPedidos.map(() => React.createRef()));
        } else {
            setElementsToPrint([]);
        }
    }, [isOpen, selectedPedidos]);

    if (!isOpen || !selectedPedidos || selectedPedidos.length === 0) return null;

    // Define o tamanho da página personalizada para Romaneio
    // 215.9 mm = 8.5 polegadas (largura)
    // 110.07 mm = 4.33 polegadas (altura)
    const customPageSize = [215.9, 110.07]; // [width, height] in mm

    const handlePrintDirect = () => {
        if (elementsToPrint.length === 0) {
            alert('Nenhum romaneio selecionado para impressão.');
            return;
        }

        const printWindow = window.open('', '_blank');
        printWindow.document.write('<html><head><title>Imprimir Romaneios</title>');
        printWindow.document.write('<style>');
        printWindow.document.write(`
            body { font-family: Arial, sans-serif; margin: 0; padding: 0; display: flex; flex-wrap: wrap; justify-content: center; align-items: flex-start; }
            .romaneio-page {
                width: 215.9mm; /* Largura da página */
                height: 110.07mm; /* Altura da página */
                box-sizing: border-box;
                padding: 10mm; /* Margem interna para o conteúdo */
                display: flex;
                flex-direction: column;
                justify-content: space-between; /* Conteúdo e total */
                border: 1px solid #ccc; /* Apenas para visualização no navegador */
                margin-bottom: 5mm; /* Espaço entre romaneios no HTML para visualização */
                overflow: hidden; /* Esconde conteúdo que vazar, importante para impressão */
            }
            .romaneio-header { text-align: center; margin-bottom: 10mm; }
            .romaneio-header img { max-width: 100px; height: auto; margin-bottom: 5mm; }
            .romaneio-header h1 { font-size: 1.2em; color: #01579b; margin: 0; }
            .romaneio-info { font-size: 0.8em; margin-bottom: 5mm; text-align: center; }
            .romaneio-info p { margin: 2px 0; }
            .items-table { width: 100%; border-collapse: collapse; margin-top: 5mm; }
            .items-table th, .items-table td { border: 1px solid #ddd; padding: 3px 5px; text-align: left; font-size: 0.75em; }
            .items-table th { background-color: #f2f2f2; }
            .romaneio-footer { text-align: right; margin-top: 5mm; font-size: 0.8em; }

            /* Para impressão: força cada romaneio em uma nova página */
            @media print {
                body {
                    display: block; /* Remove flexbox para impressão */
                }
                .romaneio-page {
                    border: none !important; /* Remove borda de visualização */
                    page-break-after: always; /* Força nova página após cada romaneio */
                    margin: 0 !important; /* Remove margem entre eles na impressão */
                    height: 110.07mm !important; /* Garante a altura para cada página */
                    width: 215.9mm !important; /* Garante a largura para cada página */
                    padding: 10mm !important;
                    box-sizing: border-box !important;
                    overflow: hidden !important; /* Esconde overflow */
                }
                .romaneio-page:last-child {
                    page-break-after: auto; /* Não quebra depois do último */
                }
            }
        `);
        printWindow.document.write('</style>');
        printWindow.document.write('</head><body>');

        // Adiciona cada romaneio gerado dinamicamente ao corpo da janela de impressão
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
            // printWindow.close(); // Opcional: fechar a janela após a impressão
        }, 500); // Pequeno atraso para renderização
    };

    const handleSavePdf = () => {
        if (elementsToPrint.length === 0) {
            alert('Nenhum romaneio selecionado para salvar em PDF.');
            return;
        }

        // html2pdf pode receber um array de elementos para imprimir em sequência
        const opt = {
            margin: [0, 0, 0, 0], // Margens: top, left, bottom, right (em mm)
            filename: `Romaneios_Pedidos.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: {
                unit: 'mm',
                format: customPageSize, // Define o tamanho personalizado da página
                orientation: 'portrait' // Mesmo que o formato seja customizado, é bom especificar a orientação
            },
            pagebreak: {
                mode: ['avoid-all', 'css'], // Tenta evitar quebras dentro de elementos e respeita CSS
                before: '.romaneio-page' // Força uma quebra de página antes de cada romaneio
            }
        };

        const contentNodes = elementsToPrint.map(ref => ref.current).filter(node => node);

        html2pdf().from(contentNodes).set(opt).save()
            .then(() => {
                console.log('PDF de romaneios gerado e baixado!');
            }).catch(err => {
                console.error('Erro ao gerar PDF de romaneios:', err);
                alert('Erro ao gerar PDF. Verifique o console para mais detalhes.');
            });
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content modal-content-print-narrow" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Imprimir Romaneios</h2>
                    <button className="close-button" onClick={onClose}>&times;</button>
                </div>
                <div className="modal-body print-modal-body-scroll"> {/* Adicionado scrollbar */}
                    {selectedPedidos.map((pedido, pedidoIndex) => (
                        <div key={pedido.id} ref={elementsToPrint[pedidoIndex]} className="romaneio-page">
                            <div className="romaneio-header">
                                <img src={logoArk} alt="SISTEMA ARK Logo" />
                                <h1>ROMANEIO DE ENTREGA</h1>
                            </div>
                            <div className="romaneio-info">
                                <p><strong>Cliente:</strong> {pedido.cliente ? pedido.cliente.nome : 'N/A'}</p>
                                <p><strong>Data do Pedido:</strong> {formatDisplayDate(pedido.data_pedido)}</p>
                                <p><strong>ID do Pedido:</strong> {pedido.id}</p>
                            </div>
                            <div className="items-section">
                                <table className="items-table">
                                    <thead>
                                        <tr>
                                            <th>Produto</th>
                                            <th>Quantidade</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pedido.itens.map((item, itemIndex) => (
                                            <tr key={item.id || itemIndex}>
                                                <td>{item.produto ? item.produto.nome : 'N/A'}</td>
                                                <td>{item.quantidade || '0'} {item.produto ? item.produto.unidade_medida : ''}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="romaneio-footer">
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

export default RomaneioPrintModal;