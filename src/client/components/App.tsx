import React, { useState, useEffect, useContext } from 'react';
import { Routes, Route } from 'react-router-dom';
import axios from 'axios';

import '../styles/index.scss';
import Navbar from './Navbar';
import Feed from './Feed';
import About from './About';
import Countdown from './Countdown';
import { allFoundObj } from '../../types';
import { SocketContext } from '../context/socket';

type TallCards = Object[];
type TNumArr = Number[];
type Object = {
  [key: string]: any;
};

const App = () => {
  const socket = useContext(SocketContext);
  // get styles
  // const classes = useStyles();
  // set vars
  const [fullArr, setFullArr] = useState<TallCards>([]);
  const [taxaArrays, setTaxaArrays] = useState<Object>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshTime, setRefreshTime] = useState(0);
  const [queryInfo, setQueryInfo] = useState<Object>({});
  const [curSocket, setCurSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  // make big fetch
  useEffect(() => {
    // establish socket.io connection
    console.log('connection socket');

    setCurSocket(socket);

    socket.on('connect', () => {
      console.log('socket is connected!', socket.id);
      setIsConnected(true);
    });
    socket.on('disconnect', () => {
      setIsConnected(false);
      console.log('socket is disconnected!');
    });

    axios.get('/getObs').then((res) => {
      const current: Object[] = res.data.current;
      const baseline: Object[] = res.data.baseline;

      const [missingSpecies, taxaArrays] = getMissing(baseline, current);
      // console.log(missingSpecies);

      setTaxaArrays(taxaArrays);
      updateFullArr(res.data.liveUpdates, missingSpecies);
      setRefreshTime(+new Date() + res.data.timeRemaining * 1000);
      setQueryInfo(res.data.queryInfo);
      setIsLoading(false);
    });

    return () => {
      socket.close();
    };
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

    return [missingSpecies as Object[], taxaArrays];
  }

  useEffect(() => {
    if (isConnected) {
      // create handler for receiving species update
      curSocket.on('receive-found-species', (allFoundObj: Object) => {
        console.log(' youve received a message!');
        // console.log(fullArr);
        updateFullArr(allFoundObj);
      });
    }
  }, [isConnected]);

  const updateFullArr = (allFoundObj: allFoundObj, inputArr?: any) => {
    console.log(allFoundObj);
    // create copy
    console.log('entered updateFullArr');
    setFullArr((currentFullArr) => {
      // only do stuff if there's updates
      if (Object.keys(allFoundObj).length) {
        // decide on arr to use and create a copy
        inputArr = inputArr ? inputArr : currentFullArr;
        const arrCopy = [...inputArr];

        // loop through full arr, search for live updates along the way
        console.log('about to loop');
        for (let i = 0; i < arrCopy.length; i++) {
          const curSpecies = arrCopy[i];
          // if curSpecies's id is in the changes, update the curSpecies
          if (Object.keys(allFoundObj).includes(curSpecies.taxaId)) {
            console.log('inclueds!!!');
            curSpecies.found = allFoundObj[curSpecies.taxaId].signature;
          }
        }
        // if we made changes, update with changes
        return arrCopy;
      }
      // if no changes but we pass an arr, use that arr
      else if (inputArr) return inputArr;
      // if no changes, update with current
      return currentFullArr;
    });
  };

  const sendFoundSpecies = (allFoundObj: Object) => {
    // emit event
    curSocket.emit('send-found-species', allFoundObj);
    // update FE
    updateFullArr(allFoundObj, fullArr);
    // laster, change that to be a CB the server invokes
  };

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
              sendFoundSpecies={sendFoundSpecies}
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
