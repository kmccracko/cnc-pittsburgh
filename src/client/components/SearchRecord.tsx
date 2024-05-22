import React, { useState } from 'react';
import { queryParams } from '../../types';

interface IsearchRecordProps {
  name: string;
  taxon: string;
  scientificName: string;
  count: number;
  pictureUrl: string;
  taxaId: number;
  found: boolean;
  showModal: any;
  queryInfo: queryParams;
}

const SearchRecord = (props: IsearchRecordProps) => {
  const [imgFail, setImgFail] = useState(false);

  return (
    <div className='record' onClick={() => props.showModal('species', props)}>
      <div className='record-left'>
        <div className='record-thumb'>
          <img
            className={`${imgFail ? 'default' : ''}`}
            src={props.pictureUrl}
            onError={({ currentTarget }) => {
              if (!imgFail) {
                setImgFail(true);
                currentTarget.src = `../assets/${props.taxon}.png`;
              }
            }}
          />
        </div>
        <div className='names'>
          <div className='common-name'>{props.name || 'No Common Name'}</div>
          <div className='scientific-name'>({props.scientificName})</div>
        </div>
      </div>
      <div className='status'>
        <div className={props.found ? 'found' : 'missing'}>
          {props.found ? '✔' : '◌'}
        </div>
      </div>
    </div>
  );
};

export default SearchRecord;
