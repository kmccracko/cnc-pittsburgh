import React, { useEffect, useState } from 'react';

interface ImodalProps {
  closeModal: any;
  modalContent: any;
  queryInfo: any;
}

const cleanTimeUntil = (
  startTime: number,
  currentTime: number = +new Date()
) => {
  const ms = startTime - currentTime;
  // Converting milliseconds to seconds
  let seconds = Math.floor(ms / 1000);

  // Converting seconds to days, hours, minutes, and seconds
  const days = Math.floor(seconds / (24 * 60 * 60));
  seconds -= days * 24 * 60 * 60;
  const hours = Math.floor(seconds / (60 * 60));
  seconds -= hours * 60 * 60;
  const minutes = Math.floor(seconds / 60);
  seconds -= minutes * 60;

  // Creating an array to hold each part of the time
  const parts = [];
  if (days) parts.push(`${days} day${days > 1 ? 's' : ''}`);
  if (hours) parts.push(`${hours} hour${hours > 1 ? 's' : ''}`);
  if (minutes) parts.push(`${minutes} minute${minutes > 1 ? 's' : ''}`);
  if (seconds || (!days && !hours && !minutes))
    parts.push(`${seconds} second${seconds === 1 ? '' : 's'}`);

  // Joining all parts with commas and "and" for the last part
  return parts.join(', ').replace(/, ([^,]*)$/, ' and $1');
};

const ModalAlert = (props: ImodalProps) => {
  const { title, body, countdownto } = props.modalContent;
  const [timer, setTimer] = useState('');

  useEffect(() => {
    // Only do a countdown if we're about to enter CNC season
    if (!countdownto) return;

    // start interval
    let timerInterval: any;
    const startTime = +new Date(countdownto);
    setTimer(`${cleanTimeUntil(startTime)}`);
    timerInterval = setInterval(() => {
      setTimer(`${cleanTimeUntil(startTime)}`);
    }, 1000);

    // clear interval
    return function cleanup() {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, []);

  const divArr = body
    .trim()
    .split('\n')
    .map((el: any, i: number) => (
      <div key={i}>
        {el}
        <br />
      </div>
    ));
  if (countdownto) divArr.unshift(`${timer}`);

  return (
    <div>
      <div className='modal-title'>{title}</div>
      <br />
      <div className='modal-body alert'>{divArr}</div>
    </div>
  );
};

export default ModalAlert;
