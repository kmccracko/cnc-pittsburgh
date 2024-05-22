import React, { useState } from 'react';

interface ImodalProps {
  closeModal?: any;
  modalInner?: any;
  type?: any;
}

const Modal = (props: ImodalProps) => {
  return (
    <div className='modal-background' onClick={props.closeModal}>
      <div className='modal-card-outline'>
        <div
          className={`modal-card ${props.type}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className='modal-close' onClick={props.closeModal}>
            ✖
          </div>
          {props.modalInner}
        </div>
      </div>
    </div>
  );
};

export default Modal;
