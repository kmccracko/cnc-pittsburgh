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
  userName: string;
  showModal: Function;
}

const BirdCard = (props: IbirdCardProps) => {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgFail, setImgFail] = useState(false);

  return (
    <div className='card'>
      <div
        className='card-img'
        onClick={() => {
          props.showModal('species', props);
        }}
      >
        <img
          className={`${imgLoaded ? 'bouncy' : ''} ${imgFail ? 'default' : ''}`}
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

        <div className='count'>{props.count} Observations</div>
      </div>
      <div className='summary-label'>
        <div className='common-name'>{props.name || 'No Common Name'}</div>
        <div className='scientific-name'>({props.scientificName})</div>
      </div>
    </div>
  );
};

export default BirdCard;
