import React, { useState } from 'react';
import './RegaloModal.css';

interface Props {
  contenidoId: number;
  onClose: () => void;
  onRegalar: (usuarioDestino: string, mensaje: string) => void;
}

const RegaloModal: React.FC<Props> = ({ contenidoId, onClose, onRegalar }) => {
  const [usuarioDestino, setUsuarioDestino] = useState('');
  const [mensaje, setMensaje] = useState('');

  const handleEnviar = () => {
    if (!usuarioDestino.trim()) {
      alert("Ingrese el nombre de usuario destino.");
      return;
    }
    onRegalar(usuarioDestino.trim(), mensaje);
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h3>Regalar contenido</h3>
        <label>Nombre del usuario destino:</label>
        <input
          type="text"
          value={usuarioDestino}
          onChange={(e) => setUsuarioDestino(e.target.value)}
        />
        <label>Mensaje para el destinatario:</label>
        <textarea
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
        />
        <div className="modal-buttons">
          <button onClick={handleEnviar} className="btn-black">Enviar regalo</button>
          <button onClick={onClose} className="btn-red">Cancelar</button>
        </div>
      </div>
    </div>
  );
};

export default RegaloModal;