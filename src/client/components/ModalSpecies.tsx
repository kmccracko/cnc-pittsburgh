import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Modal from './Modal';
import HistogramGraph from './HistogramGraphWeek';

interface ImodalProps {
  activeInd: boolean;
  modalContent: iSpeciesModalContent;
  closeModal: any;
}

interface histogram {
  [key: number]: number;
}

interface iSpeciesModalContent {
  found: boolean;
  count: number;
  taxon: string;
  pictureUrl: string;
  name: string;
  scientificName: string;
  taxaId: number;
  queryInfo: {
    curD1: string;
    curD2: string;
    prevD1: string;
    prevD2: string;
    projectId: string;
    baselineMonth: string;
  };
  histogram: histogram;
}

const ModalSpecies = (props: ImodalProps) => {
  const [imgFail, setImgFail] = useState(false);
  const [histogram, setHistogram] = useState<histogram>({});

  useEffect(() => {
    // If example code, histogram will be in props
    if (props.modalContent.histogram) {
      setHistogram(props.modalContent.histogram);
    } else if (props.modalContent?.taxaId) {
      try {
        axios.get(`/histogram/${props.modalContent.taxaId}`).then((res) => {
          setHistogram(res.data.histogram);
        });
      } catch (error) {
        console.error(error);
      }
    } else {
      setHistogram({});
    }
  }, [props.modalContent.taxaId]);

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
              <div className='modal-histogram-container'>
                <HistogramGraph histogram={histogram} width={350} height={100} />
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
