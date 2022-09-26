import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import axios from 'axios';

import '../index.scss';
import Navbar from './Navbar';
import Feed from './Feed';
import About from './About';
import Countdown from './Countdown';

type TallCards = Object[];
type TNumArr = Number[];
type Object = {
  [key: string]: any;
};

const App = () => {
  // get styles
  // const classes = useStyles();
  // set vars
  const [fullArr, setFullArr] = useState<TallCards>([]);
  const [taxaArrays, setTaxaArrays] = useState<Object>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [timer, setTimer] = useState(0);
  const [intervalId, setIntervalId] = useState(undefined);

  // make big fetch
  useEffect(() => {
    axios.get('/getObs').then((res) => {
      setTaxaArrays(res.data.taxaArrays);
      setFullArr(res.data.fullArray);
      setTimer(res.data.timeRemaining);
      setIsLoading(false);
    });
  }, []);

  let timerId: any;
  useEffect(() => {
    if (isLoading === false) {
      // start timer
      timerId = setInterval(() => {
        setTimer((timer) => {
          // console.log(timer);
          return timer - 1;
        });
      }, 1000);
      setIntervalId(timerId);
    }
  }, [isLoading]);

  useEffect(() => {
    if (timer < 1) clearInterval(intervalId);
  }, [timer]);

  const transferCount = (timer?: number) => {};

  return (
    <div id='Main'>
      <Navbar />
      <Routes>
        <Route
          path='/'
          element={
            <Feed
              fullArray={fullArr}
              taxaArrays={taxaArrays}
              isLoading={isLoading}
              countdownComponent={
                !isLoading && intervalId ? (
                  <Countdown startTime={timer} transferCount={transferCount} />
                ) : (
                  <></>
                )
              }
            />
          }
        />
        <Route path='/about' element={<About />} />
      </Routes>
    </div>
  );
};
export default App;
