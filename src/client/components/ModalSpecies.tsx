import React, { useState } from 'react';
import Modal from './Modal';

interface ImodalProps {
  activeInd: boolean;
  modalContent: iSpeciesModalContent;
  closeModal: any;
}

interface iSpeciesModalContent {
  found: boolean,
  count: number,
  taxon: string,
  pictureUrl: string,
  name: string,
  scientificName: string,
  taxaId: number,
  queryInfo: {
    curD1: string,
    curD2: string,
    prevD1: string,
    prevD2: string,
    projectId: string,
    baselineMonth: string
  }
}

const ModalSpecies = (props: ImodalProps) => {
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

  const projectIdExists = props.modalContent.queryInfo.projectId;
  const challenge = projectIdExists
    ? `project_id=${props.modalContent.queryInfo.projectId}`
    : 'place_id=122840';
  const days = `&d1=${queryDays.D1}&d2=${queryDays.D2}`;

  const currentUrl = `https://www.inaturalist.org/observations?${
    projectIdExists ? challenge : challenge + days
  }&taxon_id=${
    props.modalContent.taxaId
  }&hrank=species&lrank=species&verifiable=any`;

  const pastUrl = `https://www.inaturalist.org/observations?month=${props.modalContent.queryInfo.baselineMonth}&place_id=122840&taxon_id=${props.modalContent.taxaId}&hrank=species&lrank=species&verifiable=any`;

  const modal = (
    <Modal
      type={'species'}
      closeModal={props.closeModal}
      modalInner={
        <>
          <div className='modal-title'>
            <div className='modal-common-name'>
              {props.modalContent.name || props.modalContent.scientificName}
            </div>
          </div>
          <div className='modal-body'>
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
                  <>
                    <a href={currentUrl} target='_blank'>
                      View {props.modalContent.count} Current Obs. on
                      iNaturalist ↪
                    </a>
                  </>
                ) : (
                  <>
                    <a href={pastUrl} target='_blank'>
                      View {props.modalContent.count} Past Obs. on iNaturalist ↪
                    </a>
                    <a href={currentUrl} target='_blank'>
                      Is it still missing? ↪
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      }
    />
  );

  return modal;
};

export default ModalSpecies;
