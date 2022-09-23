import React, { useState, useEffect } from 'react';
import { HashRouter } from 'react-router-dom';
import axios from 'axios';
import BirdCard from './BirdCard';
import LoadingGif from './LoadingGif';
import InfiniteScroll from 'react-infinite-scroller';

import '../index.scss';
import Navbar from './Navbar';

import { Object } from '../../types';

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import useMediaQuery from '@mui/material/useMediaQuery';
// import Checkbox from '@mui/material/Checkbox';
// import FormControl from '@mui/material/FormControl';
// import FormControlLabel from '@mui/material/FormControlLabel';
// import FormGroup from '@mui/material/FormGroup';
// import { makeStyles } from '@material-ui/core/styles';

// const useStyles = makeStyles((theme) => ({
//   formGroup: {
//     justifyContent: 'center',
//   },
// }));

type TallCards = Object[];
type TNumArr = Number[];

let taxaTranslation: Object = {
  Chromista: 'Chromista 🌿',
  Insecta: 'Insects 🦋',
  Actinopterygii: 'Fish 🐠',
  Amphibia: 'Amphibians 🐸',
  Mammalia: 'Mammals 🦌',
  Animalia: 'Other Animals 🐛',
  Mollusca: 'Molluscs 🐌',
  Plantae: 'Plants 🌻',
  Protozoa: 'Protozoans 🦠',
  Fungi: 'Fungi 🍄',
  Aves: 'Birds 🦆',
  Arachnida: 'Arachnids 🕷',
  Reptilia: 'Reptiles 🐍',
  null: 'Other ❔',
};
const objEntries = Object.entries(taxaTranslation);
taxaTranslation = Object.fromEntries([
  ...objEntries,
  ...objEntries.map((e) => [...e].reverse()),
]);

console.log(taxaTranslation);

const App = () => {
  // get styles
  // const classes = useStyles();
  // set vars
  const [fullArr, setFullArr] = useState<TallCards>([]);
  const [activeArr, setActiveArr] = useState<TallCards>([]);
  const [viewArr, setViewArr] = useState<TallCards>([]);
  const [taxaArrays, setTaxaArrays] = useState<Object>({});
  const [activeFilters, setActiveFilters] = useState<Object>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // make big fetch
  useEffect(() => {
    console.log('useeffect');
    axios.get('/getObs').then((res) => {
      console.log(res.data);
      setTaxaArrays(res.data.taxaArrays);
      setFullArr(res.data.fullArray);
      setActiveArr(res.data.fullArray);
      setViewArr(res.data.fullArray.slice(0, 25));
      const filters: Object = {};
      for (const key in res.data.taxaArrays) {
        filters[taxaTranslation[key]] = false;
      }
      setActiveFilters(filters);
      setIsLoading(false);
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
      for (const shownTaxa in activeFilters) {
        const actualTaxa = taxaTranslation[shownTaxa];
        const include = activeFilters[shownTaxa] && taxaArrays[actualTaxa];
        if (include) newView.push(...taxaArrays[actualTaxa]);
        newView.sort((a, b) => {
          return b.count - a.count;
        });
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
        key={el.taxaid}
        taxaId={el.taxaid}
        name={el.name}
        scientificName={el.scientificname}
        count={el.count}
        pictureUrl={el.pictureurl}
      />
    );
  });

  const infiniteScroll = (
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
  );

  const matches = useMediaQuery('(min-width:601px)');
  let filterContainer;
  if (matches) {
    filterContainer = (
      <div id='filters-band' className='hotdog'>
        <form id='filters-container'>
          {Object.entries(activeFilters).map((el) => {
            return (
              <div className='filter-item'>
                <input
                  type='checkbox'
                  name={el[0]}
                  id={el[0]}
                  checked={el[1]}
                  onChange={() => {
                    setActiveFilters({
                      ...activeFilters,
                      [el[0]]: !el[1],
                    });
                  }}
                />
                <label className='filterButton' htmlFor={el[0]}>
                  {el[0]}
                </label>
              </div>
            );
          })}
        </form>
        <button
          id='clear-filters-button'
          className={`filterButton ${
            activeArr.length !== fullArr.length ? 'active' : 'inactive'
          }`}
          onClick={() => {
            const filtersClone = { ...activeFilters };
            for (let key in filtersClone) filtersClone[key] = false;
            setActiveFilters(filtersClone);
          }}
        >
          Clear all filters
        </button>
      </div>
    );
  } else {
    filterContainer = (
      <div id='filters-band' className='hamburger'>
        <Accordion
          disableGutters
          sx={{
            color: 'white',
            backgroundColor: 'rgb(0,0,0,0)',
            margin: '35px 0px',
            '&.Mui-expanded:first-of-type': {
              margin: '35px 0px',
            },
            '&.Mui-expanded:last-of-type': {
              margin: '35px 0px',
            },
          }}
        >
          <AccordionSummary
            sx={{
              backgroundColor: 'rgb(35,35,35)',
            }}
            expandIcon={<ExpandMoreIcon style={{ color: 'white' }} />}
            aria-controls='panel1a-content'
            id='panel1a-header'
          >
            <Typography>Filter options</Typography>
          </AccordionSummary>
          <AccordionDetails
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              backgroundColor: 'rgb(0,0,0,0)',
              border: '2px solid rgb(50,50,50)',
              padding: '6px 5px',
            }}
          >
            <form id='filters-container'>
              {Object.entries(activeFilters).map((el) => {
                return (
                  <div className='filter-item'>
                    <input
                      type='checkbox'
                      name={el[0]}
                      id={el[0]}
                      checked={el[1]}
                      onChange={() => {
                        setActiveFilters({
                          ...activeFilters,
                          [el[0]]: !el[1],
                        });
                      }}
                    />
                    <label className='filterButton' htmlFor={el[0]}>
                      {el[0]}
                    </label>
                  </div>
                );
              })}
            </form>
            <button
              id='clear-filters-button'
              className={`filterButton ${
                activeArr.length !== fullArr.length ? 'active' : 'inactive'
              }`}
              onClick={() => {
                const filtersClone = { ...activeFilters };
                for (let key in filtersClone) filtersClone[key] = false;
                setActiveFilters(filtersClone);
              }}
            >
              Clear all filters
            </button>
          </AccordionDetails>
        </Accordion>
      </div>
    );
  }

  return (
    <HashRouter>
      <div id='Main'>
        <Navbar />
        {filterContainer}
        <div id='result-summary'>
          Displaying{' '}
          {activeArr.length.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}{' '}
          unobserved species
        </div>
        {isLoading ? <LoadingGif /> : infiniteScroll}
      </div>
    </HashRouter>
  );
};
export default App;
