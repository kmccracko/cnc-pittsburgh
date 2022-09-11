import React from 'react';

interface IbirdCardProps {
  name: string;
  count: number;
  pictureUrl: string;
}

const BirdCard = (props: IbirdCardProps) => {
  return (
    <div className='card'>
      <div className='card-img'>
        <img src={props.pictureUrl} />
        <div className='count'>{props.count} Observations</div>
      </div>
      <div className='summary-label'>
        <div className='common-name'>{props.name}</div>
      </div>
    </div>
  );
};

export default BirdCard;
