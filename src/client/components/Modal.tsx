import React, { useState } from 'react';

interface ImodalProps {
  activeInd: boolean;
  modalContent: any;
  closeModal: any;
}

const Modal = (props: ImodalProps) => {
  const queryDays =
    props.activeInd !== undefined
      ? {
          D1: props.modalContent.queryInfo.curD1,
          D2: props.modalContent.queryInfo.curD2,
        }
      : {
          D1: props.modalContent.queryInfo.prevD1,
          D2: props.modalContent.queryInfo.prevD2,
        };
  const [imgFail, setImgFail] = useState(false);

  return (
    <div className='modal-background' onClick={props.closeModal}>
      <div className='modal-card-outline'>
        <div className='modal-card' onClick={(e) => e.stopPropagation()}>
          <div className='modal-top'>
            <div className='modal-common-name'>
              {props.modalContent.name || props.modalContent.scientificName}
            </div>
            <div className='modal-close' onClick={props.closeModal}>
              ✖
            </div>
          </div>
          <div className='modal-card-img'>
            <img
              src={props.modalContent.pictureUrl}
              className={`${imgFail ? 'default' : ''}`}
              onError={({ currentTarget }) => {
                if (!imgFail) {
                  setImgFail(true);
                  currentTarget.src = `../assets/${props.modalContent.taxon}.png`;
                }
              }}
            />
          </div>
          <div className='modal-summary-label'>
            <div className='modal-scientific-name'>
              ({props.modalContent.scientificName})
            </div>
            <div>
              <a
                href={`https://www.inaturalist.org/taxa/${props.modalContent.taxaId}`}
                target='_blank'
              >
                View on iNaturalist ↪
              </a>
            </div>
            <div className='modal-count'>
              {props.modalContent.found ? (
                <a
                  href={`https://www.inaturalist.org/observations?d1=${queryDays.D1}&d2=${queryDays.D2}&place_id=122840&taxon_id=${props.modalContent.taxaId}&hrank=species&lrank=species&verifiable=any`}
                  target='_blank'
                >
                  View {props.modalContent.count} Current Obs. on iNaturalist ↪
                </a>
              ) : (
                <a
                  href={`https://www.inaturalist.org/observations?month=${props.modalContent.queryInfo.baselineMonth}&place_id=122840&taxon_id=${props.modalContent.taxaId}&hrank=species&lrank=species&verifiable=any`}
                  target='_blank'
                >
                  View {props.modalContent.count} Past Obs. on iNaturalist ↪
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
