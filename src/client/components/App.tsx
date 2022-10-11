import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import axios from 'axios';

import '../styles/index.scss';
import Navbar from './Navbar';
import Feed from './Feed';
import About from './About';
import Countdown from './Countdown';

type Object = {
  [key: string]: any;
};

const App = () => {
  // get styles
  // const classes = useStyles();
  // set vars
  const [fullArr, setFullArr] = useState<Object[]>([]);
  const [taxaArrays, setTaxaArrays] = useState<Object>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshTime, setRefreshTime] = useState(0);
  const [queryInfo, setQueryInfo] = useState<Object>({});

  // make big fetch
  useEffect(() => {
    axios.get('/getObs').then((res) => {
      const current: Object[] = res.data.current;
      const baseline: Object[] = res.data.baseline;

      let missingSpecies: any, taxaArrays: Object;
      [missingSpecies, taxaArrays] = getMissing(baseline, current);

      setTaxaArrays(taxaArrays);
      setFullArr(missingSpecies);
      setRefreshTime(+new Date() + res.data.timeRemaining * 1000);
      setQueryInfo(res.data.queryInfo);
      setIsLoading(false);
    });
  }, []);

  function getMissing(baseline: Object[], current: Object[]) {
    // get current names only
    const curResNames = new Set([]);
    for (const el of current) {
      curResNames.add(el.taxaId);
    }

    console.log(baseline.length);
    // filter full list where current name exists
    const missingSpecies: Object[] = baseline.filter((el: Object) => {
      return !curResNames.has(el.taxaId);
    });
    console.log(missingSpecies.length);

    // loop through full list, distribute each specie into taxa
    const taxaArrays = missingSpecies.reduce((obj: Object, cur: Object) => {
      if (obj[cur.taxon]) obj[cur.taxon].push(cur);
      else obj[cur.taxon] = [cur];
      return obj;
    }, {});

    return [missingSpecies, taxaArrays];
  }

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
