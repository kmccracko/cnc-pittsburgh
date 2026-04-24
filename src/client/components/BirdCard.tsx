import React, { useState } from 'react';
import { queryParams } from '../../types';

interface IbirdCardProps {
  name: string;
  taxon: string;
  scientificName: string;
  count: number;
  pictureUrl: string;
  taxaId: number;
  queryInfo: queryParams;
  found: boolean;
  newspecies?: boolean;
  userName: string;
  showModal: Function;
}

const BirdCard = (props: IbirdCardProps) => {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgFail, setImgFail] = useState(false);

  return (
    <div className={`card ${props.newspecies ? 'newspecies' : ''}`}>
      <div
        className={`card-img ${imgLoaded ? 'bouncy' : ''}`}
        onClick={() => {
          props.showModal('species', props);
        }}
      >
        <img
          className={`${imgFail ? 'default' : ''}`}
          src={props.pictureUrl}
          // loading='lazy'
          onLoad={(e) => {
            setImgLoaded(true);
          }}
          onError={({ currentTarget }) => {
            if (!imgFail) {
              setImgFail(true);
              currentTarget.src = `../assets/${props.taxon}.png`;
            }
          }}
        />

        <div className='count'>{props.count} Observation{props.count > 1 ? 's' : ''}</div>
      </div>
      <div className='summary-label'>
        <div className='common-name'>{props.name || 'No Common Name'} {props.newspecies ? <span className='newspecies-tag'>NEW!</span> : ''}</div>
        <div className='scientific-name'>({props.scientificName})</div>
      </div>
    </div>
  );
};

export default BirdCard;
