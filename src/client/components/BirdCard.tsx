import React, { useState } from 'react';
import { queryParams } from '../../types';

interface IbirdCardProps {
  name: string;
  scientificName: string;
  count: number;
  pictureUrl: string;
  taxaId: number;
  queryInfo: queryParams;
  showModal: Function;
}

const BirdCard = (props: IbirdCardProps) => {
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <div className='card'>
      <div
        className='card-img'
        onClick={() => {
          props.showModal(props);
        }}
      >
        <img
          className={imgLoaded ? 'bouncy' : ''}
          src={props.pictureUrl}
          // loading='lazy'
          onLoad={(e) => {
            setImgLoaded(true);
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
