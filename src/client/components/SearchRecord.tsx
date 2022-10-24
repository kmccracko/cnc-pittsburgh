import React, { useState } from 'react';
import { queryParams } from '../../types';

interface IsearchRecordProps {
  name: string;
  scientificName: string;
  count: number;
  pictureUrl: string;
  taxaId: number;
  found: boolean;
  showModal: any;
  queryInfo: queryParams;
}

const SearchRecord = (props: IsearchRecordProps) => {
  return (
    <div className='record' onClick={() => props.showModal(props)}>
      <div className='record-left'>
        <div className='record-thumb'>
          <img src={props.pictureUrl} />
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
