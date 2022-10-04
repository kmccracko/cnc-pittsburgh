import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import axios from 'axios';

import '../styles/index.scss';
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
  const [refreshTime, setRefreshTime] = useState(0);
  const [queryInfo, setQueryInfo] = useState<Object>({});

  // make big fetch
  useEffect(() => {
    axios.get('/getObs').then((res) => {
      setTaxaArrays(res.data.taxaArrays);
      setFullArr(res.data.fullArray);
      setRefreshTime(+new Date() + res.data.timeRemaining * 1000);
      setQueryInfo(res.data.queryInfo);
      setIsLoading(false);
    });
  }, []);

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
              queryInfo={queryInfo}
              countdownComponent={
                !isLoading ? <Countdown refreshTime={refreshTime} /> : <></>
              }
            />
          }
        />
        <Route path='/about' element={<About queryInfo={queryInfo} />} />
      </Routes>
    </div>
  );
};
export default App;
