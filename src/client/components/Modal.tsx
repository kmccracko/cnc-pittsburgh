import React, { useState } from 'react';
import ModalSpecies from './ModalSpecies';
import ModalAlert from './ModalAlert';

interface ImodalProps {
  activeInd: boolean;
  modalContent: any;
  closeModal: any;
  queryInfo: any;
}

const Modal = (props: ImodalProps) => {
  let modalInner = (
    <ModalSpecies
      activeInd={props.activeInd}
      modalContent={props.modalContent}
      closeModal={props.closeModal}
    />
  );
  if (props.modalContent.alert) {
    modalInner = (
      <ModalAlert
        closeModal={props.closeModal}
        modalContent={props.modalContent}
        queryInfo={props.queryInfo}
      />
    );
  }

  return (
    <div className='modal-background' onClick={props.closeModal}>
      <div className='modal-card-outline'>
        <div className='modal-card' onClick={(e) => e.stopPropagation()}>
          <div className='modal-close' onClick={props.closeModal}>
            ✖
          </div>
          {modalInner}
        </div>
      </div>
    </div>
  );
};

export default Modal;
