// src/components/LoadingSpinner.jsx
import React from 'react';
import './LoadingSpinner.css'; // Importa o CSS do spinner

function LoadingSpinner() {
  return (
    <div className="spinner-container">
      <div className="spinner"></div>
      <p>Carregando...</p>
    </div>
  );
}

export default LoadingSpinner; // <--- Certifique-se de que esta linha está aqui!