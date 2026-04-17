import React, { useState } from 'react';
import Modal from './Modal';

interface IModalPromptProps {
  closeModal: () => void;
  title: string;
  placeholder?: string;
  buttonText?: string;
  onConfirm: (inputValue: string) => void;
}

const ModalPrompt: React.FC<IModalPromptProps> = ({
  closeModal,
  title,
  placeholder = 'Enter text...',
  buttonText = 'Confirm',
  onConfirm
}) => {
  const [inputValue, setInputValue] = useState('');

  const handleConfirm = () => {
    if (inputValue.trim()) {
      onConfirm(inputValue.trim());
      closeModal();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleConfirm();
    }
  };

  return (
    <Modal
      type="prompt"
      closeModal={closeModal}
      modalInner={
        <>
          <div className="modal-title prompt">{title}</div>
          <div className="line-horz"></div>
          <div className="modal-body prompt">
            <input
              type="text"
              className="modal-input"
              placeholder={placeholder}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              autoFocus
            />
            <div className="modal-buttons">
              <button className="modal-cancel" onClick={closeModal}>
                Cancel
              </button>
              <button 
                className="modal-confirm" 
                onClick={handleConfirm}
                disabled={!inputValue.trim()}
              >
                {buttonText}
              </button>
            </div>
          </div>
        </>
      }
    />
  );
};

export default ModalPrompt; 