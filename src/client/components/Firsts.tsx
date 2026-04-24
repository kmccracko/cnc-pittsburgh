import React, { useState } from 'react';
import LoadingGif from './LoadingGif';

interface IfirstsProps {
  firstsArr: any[];
  queryInfo: Object;
  showModal: Function;
  isLoading: boolean;
}

const Firsts = (props: IfirstsProps) => {
  const sortedFirsts = [...props.firstsArr].sort((a, b) => {
    return +new Date(a.observationCreatedAt || 0) - +new Date(b.observationCreatedAt || 0);
  });

  const allRows = sortedFirsts.map((el: any) => (
    <FirstsRecord key={el.taxaId} data={el} showModal={props.showModal} queryInfo={props.queryInfo} />
  ));

  return (
    <div id='search-container' className='firsts-page'>
      <div id='search-top' className='firsts-top'>
        <h2>Pittsburgh CNC Firsts</h2>
        <div className='firsts-subtitle'>
          This is the first time these species have been observed during a Pittsburgh City Nature Challenge!
        </div>
      </div>
      {props.isLoading ? <LoadingGif size='5' /> : <div id='search-results'>{allRows}</div>}
    </div>
  );
};

const FirstsRecord = (props: any) => {
  const [imgFail, setImgFail] = useState(false);
  const { data } = props;
  const modalPayload = {
    ...data,
    queryInfo: props.queryInfo,
    newObservationUrl: data.newObservationUrl,
    pictureUrl: data.pictureurl,
    scientificName: data.scientificname,
    userName: '',
    found: true,
  };

  return (
    <div
      className='record firsts-record newspecies'
      onClick={() => props.showModal('species', modalPayload)}
    >
      <div className='record-left'>
        <div className='record-thumb'>
          <img
            className={`${imgFail ? 'default' : ''}`}
            src={data.pictureurl}
            onError={({ currentTarget }) => {
              if (!imgFail) {
                setImgFail(true);
                currentTarget.src = `../assets/${data.taxon}.png`;
              }
            }}
          />
        </div>
        <div className='names'>
          <div className='common-name'>{data.name || 'No Common Name'}</div>
          <div className='scientific-name'>({data.scientificname})</div>
          <div className='firsts-credit'>First observed by @{data.observer}</div>
        </div>
      </div>
    </div>
  );
};

export default Firsts;
