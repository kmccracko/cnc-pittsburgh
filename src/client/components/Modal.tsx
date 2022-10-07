import React, { useContext } from 'react';
import { SocketContext } from '../context/socket';

interface ImodalProps {
  modalContent: any;
  closeModal: any;
  sendFoundSpecies: Function;
}

const Modal = (props: ImodalProps) => {
  const socket = useContext(SocketContext);
  console.log('MODAL UPDATES HERE!!!');
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

          {(!props.modalContent.found ||
            props.modalContent.found === document.cookie.split('=')[1]) && (
            <button
              type='button'
              onClick={() => {
                let signature: string;
                // if cookie exists
                if (document.cookie.split('=')[0] === 'clientid') {
                  // signature = cookie
                  signature = document.cookie.split('=')[1];
                } else {
                  // else, update cookie and set signature
                  document.cookie = `clientid=${socket.id}`;
                  signature = socket.id;
                }
                props.sendFoundSpecies({
                  [props.modalContent.taxaId]: {
                    taxaId: props.modalContent.taxaId,
                    signature: props.modalContent.found ? undefined : signature,
                    credName: undefined,
                  },
                });
              }}
            >
              {props.modalContent.found
                ? `Unfind this, please`
                : `I made an observation on iNaturalist!`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
