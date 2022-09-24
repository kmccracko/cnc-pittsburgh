import React, { useState, useEffect } from 'react';
import InfiniteScroll from 'react-infinite-scroller';

import BirdCard from './BirdCard';
import '../index.scss';
import LoadingGif from './LoadingGif';

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import useMediaQuery from '@mui/material/useMediaQuery';

type TallCards = Object[];
type TNumArr = Number[];
type Object = {
  [key: string]: any;
};

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

interface IfeedProps {
  fullArray: any[];
  taxaArrays: Object;
  isLoading: boolean;
}

const Feed = (props: IfeedProps) => {
  console.log(props.fullArray);
  // set vars
  const [activeArr, setActiveArr] = useState<TallCards>([]);
  const [viewArr, setViewArr] = useState<TallCards>([]);
  const [activeFilters, setActiveFilters] = useState<Object>({});

  // make big fetch
  useEffect(() => {
    setActiveArr(props.fullArray);
    setViewArr(props.fullArray.slice(0, 25));
    const filters: Object = {};
    for (const key in props.taxaArrays) {
      filters[taxaTranslation[key]] = false;
    }
    setActiveFilters(filters);
  }, [props.fullArray]);

  // on change of viewArr
  useEffect(() => {
    console.log(viewArr);
  }, [viewArr]);

  // on filter change
  useEffect(() => {
    let newView = [];
    // if no active filters, show everything
    if (!Object.values(activeFilters).includes(true)) {
      newView = props.fullArray;
    }
    // if at least one active filter, merge them all
    else {
      for (const shownTaxa in activeFilters) {
        const actualTaxa = taxaTranslation[shownTaxa];
        const include =
          activeFilters[shownTaxa] && props.taxaArrays[actualTaxa];
        if (include) newView.push(...props.taxaArrays[actualTaxa]);
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
            activeArr.length !== props.fullArray.length ? 'active' : 'inactive'
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
                activeArr.length !== props.fullArray.length
                  ? 'active'
                  : 'inactive'
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
    <div id='Main'>
      {filterContainer}
      <div id='result-summary'>
        Displaying{' '}
        {activeArr.length.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}{' '}
        unobserved species
      </div>
      {props.isLoading ? <LoadingGif /> : infiniteScroll}
    </div>
  );
};
export default Feed;
