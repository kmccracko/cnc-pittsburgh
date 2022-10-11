import React, { useState } from 'react';

interface IbirdCardProps {
  name: string;
  scientificName: string;
  count: number;
  pictureUrl: string;
  taxaId: number;
  obsMonth: number;
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

        <div className='count'>
          <a
            href={`https://www.inaturalist.org/observations?month=${props.obsMonth}&place_id=122840&taxon_id=${props.taxaId}&verifiable=any`}
            target='_blank'
          >
            {props.count} Observations
          </a>
        </div>
      </div>
      <div className='summary-label'>
        <div className='common-name'>
          <a
            href={`https://www.inaturalist.org/taxa/${props.taxaId}`}
            target='_blank'
          >
            {props.name || 'No Common Name'}
          </a>
        </div>
        <div className='scientific-name'>({props.scientificName})</div>
      </div>
    </div>
  );
};

export default BirdCard;
