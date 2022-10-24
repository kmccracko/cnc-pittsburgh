import React from 'react';

interface ImodalProps {
  activeInd: boolean;
  modalContent: any;
  closeModal: any;
}

const Modal = (props: ImodalProps) => {
  return (
    <div className='modal-background' onClick={props.closeModal}>
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
          <img src={props.modalContent.pictureUrl} />
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
            {props.activeInd ? (
              <a
                href={`https://www.inaturalist.org/observations?d1=${props.modalContent.queryInfo.curD1}&d2=${props.modalContent.queryInfo.curD2}&place_id=122840&taxon_id=${props.modalContent.taxaId}&verifiable=any`}
                target='_blank'
              >
                View {props.modalContent.count} Current Observations on
                iNaturalist ↪
              </a>
            ) : (
              <a
                href={`https://www.inaturalist.org/observations?month=${props.modalContent.queryInfo.baselineMonth}&place_id=122840&taxon_id=${props.modalContent.taxaId}&verifiable=any`}
                target='_blank'

                //baseline: `https://inaturalist.org/v1/observations/species_counts?place_id=122840&month=${process.env.BASELINE_MONTH}&per_page=1000`,
                // current: `https://api.inaturalist.org/v1/observations/species_counts?place_id=122840&d1=${process.env.CURRENT_D1}&d2=${process.env.CURRENT_D2}&per_page=500`,
              >
                View {props.modalContent.count} Past Observations on iNaturalist
                ↪
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
