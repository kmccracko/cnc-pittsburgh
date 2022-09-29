import React, { useState, useEffect } from 'react';

interface IcountdownProps {
  refreshTime: number; // time in ms
}

const Countdown = (props: IcountdownProps) => {
  const [timeRemaining, setTimeRemaining] = useState(
    props.refreshTime - +new Date()
  ); // timer in ms
  const [intervalId, setIntervalId] = useState(undefined);

  useEffect(() => {
    // start interval
    let timerInterval: any;
    if (timeRemaining >= 1) {
      timerInterval = setInterval(() => {
        setTimeRemaining(props.refreshTime - +new Date());
      }, 1000);
      setIntervalId(timerInterval);
    }
    // clear interval
    return function cleanup() {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, []);

  useEffect(() => {
    // if refreshtime has arrived (browser can freeze page)
    if (+new Date() > props.refreshTime) setTimeRemaining(0);
    if (timeRemaining < 1) clearInterval(intervalId);
  }, [timeRemaining]);

  const timerText = (
    <div className='pending'>
      New data available in{' '}
      {Math.floor(timeRemaining / 60000)
        .toString()
        .padStart(2, '0')}
      :{' '}
      {Math.floor((timeRemaining % 60000) / 1000)
        .toString()
        .padStart(2, '0')}
    </div>
  );
  const dataReady = (
    <div className='ready'>
      <a href=''>New data available. Click me to update!</a>
    </div>
  );

  return (
    <div id='countainer'>{timeRemaining >= 1 ? timerText : dataReady}</div>
  );
};

export default Countdown;
