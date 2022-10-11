import React from 'react';

interface ImodalProps {
  modalContent: any;
  closeModal: any;
}

const Modal = (props: ImodalProps) => {
  return (
    <div className='modal-background' onClick={props.closeModal}>
      <div className='modal-card' onClick={(e) => e.stopPropagation()}>
        <div className='modal-top'>
          <div className='modal-close' onClick={props.closeModal}>
            ✖
          </div>
          <div className='modal-common-name'>
            <a
              href={`https://www.inaturalist.org/taxa/${props.modalContent.taxaId}`}
              target='_blank'
            >
              {props.modalContent.name || props.modalContent.scientificName}
            </a>
          </div>
          <div className='empty'></div>
        </div>
        <div className='modal-card-img'>
          <img src={props.modalContent.pictureUrl} />
        </div>
        <div className='modal-summary-label'>
          <div className='modal-count'>
            <a
              href={`https://www.inaturalist.org/observations?month=${props.modalContent.obsMonth}&place_id=122840&taxon_id=${props.modalContent.taxaId}&verifiable=any`}
              target='_blank'
            >
              {props.modalContent.count} Observations
            </a>
          </div>
          <div className='modal-scientific-name'>
            ({props.modalContent.scientificName})
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
