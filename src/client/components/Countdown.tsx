import React, { useState, useEffect } from 'react';

interface IcountdownProps {
  startTime: number;
  refreshTime: number;
}

const Countdown = (props: IcountdownProps) => {
  const [timer, setTimer] = useState(props.startTime);
  const [intervalId, setIntervalId] = useState(undefined);

  useEffect(() => {
    console.log('creating the countdown with ', props.startTime);

    // start interval
    let timerInterval: any;
    if (timer >= 1) {
      timerInterval = setInterval(() => {
        setTimer((timer) => {
          // console.log(timer);
          return timer - 1;
        });
      }, 1000);
      setIntervalId(timerInterval);
    }
    // clear interval
    return function cleanup() {
      if (timerInterval) {
        clearInterval(timerInterval);
        console.log('leaving countdown with ', timer);
      }
    };
  }, []);

  useEffect(() => {
    // if refreshtime has arrived (browser can unload page)
    if (+new Date() > props.refreshTime) setTimer(0);
    if (timer < 1) clearInterval(intervalId);
  }, [timer]);

  const timerText = (
    <div className='pending'>
      New data available in{' '}
      {Math.floor((timer % 3600) / 60)
        .toString()
        .padStart(2, '0')}
      :{' '}
      {Math.floor(timer % 60)
        .toString()
        .padStart(2, '0')}
    </div>
  );
  const dataReady = (
    <div className='ready'>
      <a href=''>New data available. Click me to update!</a>
    </div>
  );

  return <div id='countainer'>{timer >= 1 ? timerText : dataReady}</div>;
};

export default Countdown;
