import React, { useState, useEffect } from 'react';

interface IcountdownProps {
  refreshTime: number; // time in ms
}

const Countdown = (props: IcountdownProps) => {
  const [timeRemaining, setTimeRemaining] = useState(
    props.refreshTime - +new Date()
  ); // timer in ms
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | undefined>(undefined);

  // Single useEffect to handle all timer logic
  useEffect(() => {
    // Clear any existing interval
    if (intervalId) {
      clearInterval(intervalId);
    }
    
    // Calculate initial time remaining
    const initialTimeRemaining = props.refreshTime - +new Date();
    setTimeRemaining(initialTimeRemaining);
    
    // Only start a new interval if there's time remaining
    if (initialTimeRemaining >= 1) {
      const newIntervalId = setInterval(() => {
        const updatedTimeRemaining = props.refreshTime - +new Date();
        setTimeRemaining(updatedTimeRemaining);
        
        // Clear interval if time has expired
        if (updatedTimeRemaining < 1) {
          clearInterval(newIntervalId);
        }
      }, 1000);
      
      setIntervalId(newIntervalId);
    }
    
    // Cleanup function
    return function cleanup() {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [props.refreshTime]);

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
