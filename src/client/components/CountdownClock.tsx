import React, { useEffect, useState } from 'react';

interface IcountdownPrettyProps {
  startTime?: number;
  currentTime?: number;
}

const cleanTimeUntil = (
  startTime: number = +new Date(),
  currentTime: number = +new Date()
) => {
  function padZero(num: number) {
    return (num.toString().length === 1 ? '0' : '') + num;
  }
  if (startTime < currentTime)
    [currentTime, startTime] = [startTime, currentTime];
  const distance = startTime - currentTime;

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  return [days, hours, minutes, seconds].map((el) => padZero(el)).join(':');
};

const CountdownPretty = (props: IcountdownPrettyProps) => {
  const [timer, setTimer] = useState('');

  useEffect(() => {
    // start interval
    let timerInterval: any;
    const startTime = +new Date(props.startTime);
    setTimer(`${cleanTimeUntil(startTime)}`);
    timerInterval = setInterval(() => {
      setTimer(`${cleanTimeUntil(startTime)}`);
    }, 1000);

    // clear interval
    return function cleanup() {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, []);

  // const [d, h, m, s] = timer.split(':');
  const timeArr = timer
    .split(':')
    .join('-:-')
    .split('-')
    .map((el, i) => {
      const className = el === ':' ? 'colon' : 'time';
      return (
        <div key={i} className={className}>
          {el}
        </div>
      );
    });

  return <div className='countdown-pretty'>{timeArr}</div>;
};

export default CountdownPretty;
