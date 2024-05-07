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
import ModalAlert from './ModalAlert';
import ModalSpecies from './ModalSpecies';
import FourOFour from './FourOFour';
import Examples from './Examples';

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
  const [modalType, setModalType] = useState<string>('');
  const [modalContent, setModalContent] = useState<any>({});

  // Avoid unnecessary fetches
  const location = useLocation();
  const pathsRequiringData = ['/', '/previous', '/search'];

  // make big fetch
  useEffect(() => {
    // Get queryinfo
    axios.get('/getInfo').then((res) => {
      if (Object.keys(queryInfo).length === 0) setQueryInfo(res.data);
    });

    // Stop if no fetch needed
    if (
      !pathsRequiringData.includes(location.pathname) ||
      location.pathname.includes('/examples/')
    )
      return;

    // Make big data fetch
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

      setRefreshTime(
        !res.data.timeRemaining
          ? 0
          : +new Date() + res.data.timeRemaining * 1000
      );
      setIsLoading(false);
    });
  }, [location.pathname]);

  useEffect(() => {
    if (Object.keys(queryInfo).length === 0) return;
    if (location.pathname.includes('/examples/')) return;
    if (+new Date() <= +new Date(queryInfo.curD1)) {
      // Show modal if before challenge start
      setModalType('alert');
      setModal(true);
      setModalContent({
        title: `
        You're early!`,
        body: `

        You're welcome to look around, but the data won't be very useful until we start getting observations for this challenge!`,
        countdownto: queryInfo.curEndDate,
      });
      // Show modal if after challenge end
    } else if (+new Date() > +new Date(queryInfo.curEndDate)) {
      setModalType('alert');
      setModal(true);
      setModalContent({
        title: `
        PGH Targets is currently not in season.
    `,
        body: `
        You're welcome to look around - just know that this data is no longer "live", and instead reflects the data at the end of the most recent City Nature Challenge.`,
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
  const showModal = (type: string, data: any) => {
    setModal(true);
    setModalType(type);
    setModalContent(data);
  };

  // close modal
  const closeModal = () => {
    setModal(false);
    setModalContent({});
  };

  return (
    <div id='Main'>
      {modal &&
        (modalType === 'alert' ? (
          <ModalAlert modalContent={modalContent} closeModal={closeModal} />
        ) : (
          <ModalSpecies
            activeInd={activeInd}
            modalContent={modalContent}
            closeModal={closeModal}
          />
        ))}
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
                !isLoading && refreshTime ? (
                  <Countdown refreshTime={refreshTime} />
                ) : (
                  <></>
                )
              }
              showModal={showModal}
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
                !isLoading && refreshTime ? (
                  <Countdown refreshTime={refreshTime} />
                ) : (
                  <></>
                )
              }
              showModal={showModal}
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
            />
          }
        />
        <Route
          path='/examples/*'
          element={<Examples queryInfo={queryInfo} />}
        />
        <Route path='/*' element={<FourOFour />} />
      </Routes>
    </div>
  );
};
export default App;
