import React from 'react';

interface IbirdCardProps {
  name: string;
  scientificName: string;
  count: number;
  pictureUrl: string;
  taxaId: number;
}

const BirdCard = (props: IbirdCardProps) => {
  return (
    <div className='card'>
      <div className='card-img'>
        <img src={props.pictureUrl} />
        <div className='count'>
          <a
            href={`https://www.inaturalist.org/observations?month=4,5&place_id=122840&taxon_id=${props.taxaId}&verifiable=any`}
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
            {props.name}
          </a>
        </div>
        <div className='scientific-name'>({props.scientificName})</div>
      </div>
    </div>
  );
};

export default BirdCard;
