import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import axios from 'axios';

import '../styles/index.scss';
import Navbar from './Navbar';
import Feed from './Feed';
import About from './About';
import Countdown from './Countdown';
import { queryParams } from '../../types';

type Object = {
  [key: string]: any;
};

const App = () => {
  // get styles
  // const classes = useStyles();
  // set vars
  const [activeInd, setActiveInd] = useState<boolean>(false);
  const [fullArr, setFullArr] = useState<Object[]>([]);
  const [missingArr, setMissingArr] = useState<Object[]>([]);
  const [foundArr, setFoundArr] = useState<Object[]>([]);
  const [taxaObj, setTaxaObj] = useState<Object>({});
  const [missingTaxaObj, setMissingTaxaObj] = useState<Object>({});
  const [foundTaxaObj, setFoundTaxaObj] = useState<Object>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshTime, setRefreshTime] = useState(0);
  const [queryInfo, setQueryInfo] = useState<queryParams>({});

  // make big fetch
  useEffect(() => {
    axios.get('/getObs').then((res) => {
      const current: Object[] = res.data.current;
      const baseline: Object[] = res.data.baseline;

      let missingSpecies: any,
        foundSpecies: any,
        missingTaxa: Object,
        foundTaxa: Object;
      [missingSpecies, foundSpecies, missingTaxa, foundTaxa] =
        getMissingVsFound(baseline, current);

      setTaxaObj(missingTaxa);
      setMissingTaxaObj(missingTaxa);
      setFoundTaxaObj(foundTaxa);
      setFullArr(missingSpecies);
      setMissingArr(missingSpecies);
      setFoundArr(foundSpecies);
      setRefreshTime(+new Date() + res.data.timeRemaining * 1000);
      setQueryInfo(res.data.queryInfo);
      setIsLoading(false);
    });
  }, []);

  function getMissingVsFound(baseline: Object[], current: Object[]) {
    //
    // THIS CAN BE REFACTORED BIG TIME
    //
    //
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
    const missingTaxaObj = missingSpecies.reduce((obj: Object, cur: Object) => {
      if (obj[cur.taxon]) obj[cur.taxon].push(cur);
      else obj[cur.taxon] = [cur];
      return obj;
    }, {});
    const currentTaxaObj = current.reduce((obj: Object, cur: Object) => {
      if (obj[cur.taxon]) obj[cur.taxon].push(cur);
      else obj[cur.taxon] = [cur];
      return obj;
    }, {});

    return [missingSpecies, current, missingTaxaObj, currentTaxaObj];
  }

  function toggleMissingVsFound() {
    if (!activeInd) {
      setFullArr(foundArr);
      setTaxaObj(foundTaxaObj);
    } else {
      setFullArr(missingArr);
      setTaxaObj(missingTaxaObj);
    }
    setActiveInd(!activeInd);
  }

  return (
    <div id='Main'>
      <Navbar />
      <button onClick={toggleMissingVsFound}>{`Show ${
        activeInd ? 'Missing' : 'Found'
      } Species`}</button>
      <Routes>
        <Route
          path='/'
          element={
            <Feed
              activeInd={activeInd}
              fullArray={fullArr}
              taxaArrays={taxaObj}
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
