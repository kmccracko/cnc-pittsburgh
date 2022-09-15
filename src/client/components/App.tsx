import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, HashRouter } from 'react-router-dom';
import axios from 'axios';
import BirdCard from './BirdCard';
import InfiniteScroll from 'react-infinite-scroller';

import '../index.scss';
import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
} from '@mui/material';

type TallCards = Object[];
type TNumArr = Number[];
type Object = {
  [key: string]: any;
};

const App = () => {
  // set vars
  const [fullArr, setFullArr] = useState<TallCards>([]);
  const [activeArr, setActiveArr] = useState<TallCards>([]);
  const [viewArr, setViewArr] = useState<TallCards>([]);
  const [taxaArrays, setTaxaArrays] = useState<Object>({});
  const [activeFilters, setActiveFilters] = useState<Object>({
    Plantae: false,
    Fungi: false,
    Aves: false,
    Mammalia: false,
    Reptilia: false,
    Amphibia: false,
    Arachnida: false,
  });

  // make big fetch
  useEffect(() => {
    console.log('useeffect');
    axios.get('/getObs').then((res) => {
      console.log(res.data);
      setTaxaArrays(res.data.taxaArrays);
      setFullArr(res.data.fullArray);
      setActiveArr(res.data.fullArray);
      setViewArr(res.data.fullArray.slice(0, 25));
    });
  }, []);

  // on change of viewArr
  useEffect(() => {
    console.log(viewArr);
  }, [viewArr]);

  // on filter change
  useEffect(() => {
    let newView = [];
    // if no active filters, show everything
    if (!Object.values(activeFilters).includes(true)) {
      newView = fullArr;
    }
    // if at least one active filter, merge them all
    else {
      for (const taxa in activeFilters) {
        if (Object.prototype.hasOwnProperty.call(activeFilters, taxa)) {
          const include = activeFilters[taxa] && taxaArrays[taxa];
          if (include) newView.push(...taxaArrays[taxa]);
          newView.sort((a, b) => {
            return b.count - a.count;
          });
        }
      }
    }
    setActiveArr(newView);
    setViewArr(newView.slice(0, 25));
  }, [activeFilters]);

  function handleScroll() {
    setViewArr([
      ...viewArr,
      ...activeArr.slice(viewArr.length, viewArr.length + 25),
    ]);
  }

  const allCardElements: JSX.Element[] = viewArr.map((el: Object) => {
    return (
      <BirdCard
        key={el.taxaId}
        taxaId={el.taxaId}
        name={el.name}
        scientificName={el.scientificName}
        count={el.count}
        pictureUrl={el.pictureUrl}
      />
    );
  });

  return (
    <HashRouter>
      <div className='Main'>
        Unga bunga
        <div id='filters-container'>
          <FormControl component='fieldset' variant='standard'>
            <FormGroup row>
              {Object.entries(activeFilters).map((el) => {
                return (
                  <FormControlLabel
                    labelPlacement='top'
                    control={
                      <Checkbox
                        checked={el[1]}
                        onChange={() => {
                          setActiveFilters({
                            ...activeFilters,
                            [el[0]]: !el[1],
                          });
                        }}
                        name={el[0]}
                      />
                    }
                    label={el[0]}
                  />
                );
              })}
            </FormGroup>
          </FormControl>
        </div>
        <InfiniteScroll
          pageStart={0}
          loadMore={handleScroll}
          hasMore={viewArr.length !== activeArr.length}
          loader={
            <div className='loader' key={0}>
              Loading ...
            </div>
          }
        >
          <div id='cards-container'>{allCardElements}</div>
        </InfiniteScroll>
      </div>
    </HashRouter>
  );
};
export default App;
