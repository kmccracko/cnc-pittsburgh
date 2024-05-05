import React, { useEffect, useState } from 'react';
import CountdownPretty from './CountdownClock';
import Modal from './Modal';

interface ImodalProps {
  closeModal: any;
  modalContent: any;
}

const ModalAlert = (props: ImodalProps) => {
  console.log('modal alert new!');
  const { title, body, countdownto } = props.modalContent;

  const divArr = body
    .trim()
    .split('\n')
    .map((el: any, i: number) => (
      <div key={i}>
        {el}
        <br />
      </div>
    ));
  if (countdownto)
    divArr.unshift(
      <CountdownPretty
        key={'countdownpretty'}
        currentTime={+new Date()}
        startTime={+new Date(countdownto)}
      />
    );

  const modal = (
    <Modal
      type={'alert'}
      closeModal={props.closeModal}
      modalInner={
        <>
          <div className='modal-title alert'>{title}</div>
          <div className='line-horz'></div>
          <div className='modal-body alert'>{divArr}</div>
          <button className='modal-okay' onClick={props.closeModal}>
            Okay
          </button>
        </>
      }
    />
  );

  return modal;
};

export default ModalAlert;
