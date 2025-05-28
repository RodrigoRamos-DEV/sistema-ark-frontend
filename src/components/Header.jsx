// src/components/Header.jsx
import React from 'react';
import './Header.css'; // Mantenha a importação do CSS

// Importe sua imagem do logo aqui.
// Se você salvou a imagem transparente do logo que eu te dei,
// coloque-a na pasta 'public/' do seu projeto frontend (ex: public/logo-ark.png)
// E então importe assim (sem './'):
// const logoArk = '/logo-ark.png'; // Caminho relativo à pasta 'public'
// Se preferir colocar em src/assets, precisaria: import logoArk from '../assets/logo-ark.png';

// Por enquanto, vou usar a URL de placeholder, mas substitua pela sua URL real ou import:
const logoArk = 'https://cdn.discordapp.com/attachments/1360704799011504128/1377090975213813882/SistemaARK.png?ex=6837b369&is=683661e9&hm=8d836317b592ec11f78561c03282f6f49af91c25bceaa8d87ae18d347415c8ef&'; // URL do logo transparente que você gostou

function Header() {
  return (
    <div className="header-container">
      <img src={logoArk} alt="Logo SISTEMA ARK" className="header-logo-central" />
      {/* O título pode ser removido se a logo for autoexplicativa, ou mantido como texto adicional */}
      {/* <h2 className="header-title">{title}</h2> */}
    </div>
  );
}

export default Header;