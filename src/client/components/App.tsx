import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';

import '../index.scss';
import Navbar from './Navbar';
import Feed from './Feed';
import About from './About';

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
  // const [isLoading, setIsLoading] = useState<boolean>(true);

  // make big fetch
  useEffect(() => {
    console.log('useeffect');
    axios.get('/getObs').then((res) => {
      setTaxaArrays(res.data.taxaArrays);
      setFullArr(res.data.fullArray);
      // setIsLoading(false);
    });
  }, []);

  return (
    <div id='Main'>
      <Navbar />
      <Routes>
        <Route
          path='/'
          element={<Feed fullArray={fullArr} taxaArrays={taxaArrays} />}
          // element={<div>HELLO!</div>}
        />
        <Route path='/about' element={<About />} />
      </Routes>
    </div>
  );
};
export default App;
