import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import axios from 'axios';

import '../styles/index.scss';
import Navbar from './Navbar';
import Feed from './Feed';
import About from './About';
import Countdown from './Countdown';
import { queryParams } from '../../types';
import Search from './Search';
import Modal from './Modal';
import FourOFour from './FourOFour';

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
  const [prevArr, setPrevArr] = useState<Object[]>([]);
  const [taxaObj, setTaxaObj] = useState<Object>({});
  const [missingTaxaObj, setMissingTaxaObj] = useState<Object>({});
  const [foundTaxaObj, setFoundTaxaObj] = useState<Object>({});
  const [prevTaxaObj, setPrevTaxaObj] = useState<Object>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshTime, setRefreshTime] = useState(0);
  const [queryInfo, setQueryInfo] = useState<queryParams>({});
  const [modal, setModal] = useState<boolean>(false);
  const [modalContent, setModalContent] = useState<Object>({});

  // Avoid unnecessary fetches
  const location = useLocation();
  const pathsRequiringData = ['/', '/previous', '/search'];

  // make big fetch
  useEffect(() => {
    if (!pathsRequiringData.includes(location.pathname)) return;

    axios.get('/getObs').then((res) => {
      const current: Object[] = res.data.current;
      const baseline: Object[] = res.data.baseline;
      const previous: Object[] = res.data.previous;

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

      // Only update prev if it had no data (prev doesn't change)
      let prevMissingSpecies: any, prevMissingTaxa: Object;
      if (prevArr.length === 0) {
        const arr = getMissingVsFound(baseline, [...previous, ...current]);
        prevMissingSpecies = arr[0];
        prevMissingTaxa = arr[2];
        setPrevTaxaObj(prevMissingTaxa);
        setPrevArr(prevMissingSpecies);
      }

      // Only update queryInfo if it had no data (query doesn't change)
      if (Object.keys(queryInfo).length === 0) setQueryInfo(res.data.queryInfo);

      setRefreshTime(+new Date() + res.data.timeRemaining * 1000);
      setIsLoading(false);
    });
  }, [location.pathname]);

  useEffect(() => {
    if (Object.keys(queryInfo).length === 0) return;
    // Show modal if before challenge start
    if (+new Date() <= +new Date(queryInfo.curD1)) {
      setModal(true);
      setModalContent({
        alert: true,
        title: `
        You're early!
  `,
        body: `until the challenge starts.

        You're welcome to look around, but the data won't be very useful until we start getting observations for this challenge!`,
      });
    }
  }, [queryInfo]);

  function getMissingVsFound(baseline: Object[], current: Object[]) {
    // get current names only
    const curResNames = new Set([]);
    const missingSpecies: Object[] = [];
    const missingTaxaObj: Object = {};
    const currentSpecies: Object[] = [];
    const currentTaxaObj: Object = {};

    for (const el of current) {
      curResNames.add(el.taxaId);
    }

    // get and build missing
    for (let el of baseline) {
      const elPlusFound = { ...el, found: false };
      if (!curResNames.has(el.taxaId)) {
        missingSpecies.push(elPlusFound);
        if (missingTaxaObj[el.taxon])
          missingTaxaObj[el.taxon].push(elPlusFound);
        else missingTaxaObj[el.taxon] = [elPlusFound];
      }
    }
    // build found
    for (let el of current) {
      const elPlusFound = { ...el, found: true };
      currentSpecies.push(elPlusFound);
      if (currentTaxaObj[el.taxon]) currentTaxaObj[el.taxon].push(elPlusFound);
      else currentTaxaObj[el.taxon] = [elPlusFound];
    }

    return [missingSpecies, currentSpecies, missingTaxaObj, currentTaxaObj];
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

  // show modal
  const showModal = (data: any) => {
    setModal(true);
    setModalContent(data);
  };

  // close modal
  const closeModal = () => {
    setModal(false);
    setModalContent({});
  };

  return (
    <div id='Main'>
      {modal && (
        <Modal
          activeInd={activeInd}
          modalContent={modalContent}
          closeModal={closeModal}
          queryInfo={queryInfo}
        />
      )}
      <Navbar />
      <Routes>
        <Route
          path='/'
          element={
            <Feed
              toggleMissingVsFound={toggleMissingVsFound}
              activeInd={activeInd}
              fullArray={fullArr}
              taxaArrays={taxaObj}
              isLoading={isLoading}
              queryInfo={queryInfo}
              countdownComponent={
                !isLoading ? <Countdown refreshTime={refreshTime} /> : <></>
              }
              showModal={showModal}
              closeModal={closeModal}
            />
          }
        />
        <Route
          path='/previous'
          element={
            <Feed
              toggleMissingVsFound={toggleMissingVsFound}
              fullArray={prevArr}
              taxaArrays={prevTaxaObj}
              isLoading={isLoading}
              queryInfo={queryInfo}
              countdownComponent={
                !isLoading ? <Countdown refreshTime={refreshTime} /> : <></>
              }
              showModal={showModal}
              closeModal={closeModal}
            />
          }
        />
        <Route path='/about' element={<About queryInfo={queryInfo} />} />
        <Route
          path='/search'
          element={
            <Search
              allArr={[...missingArr, ...foundArr]}
              queryInfo={queryInfo}
              showModal={showModal}
              closeModal={closeModal}
            />
          }
        />
        <Route path='/*' element={<FourOFour />} />
      </Routes>
    </div>
  );
};
export default App;
