import React, { useState, useEffect } from 'react';
import InfiniteScroll from 'react-infinite-scroller';

import BirdCard from './BirdCard';
import LoadingGif from './LoadingGif';
import Filter from './Filter';
import { queryParams } from '../../types';

type TallCards = Object[];
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
  activeInd?: boolean;
  fullArray: any[];
  taxaArrays: Object;
  isLoading: boolean;
  countdownComponent: JSX.Element;
  queryInfo: queryParams;
  toggleMissingVsFound?: any;
  showModal: Function;
  closeModal: Function;
}

const Feed = (props: IfeedProps) => {
  // set vars
  const [activeArr, setActiveArr] = useState<TallCards>([]);
  const [viewArr, setViewArr] = useState<TallCards>([]);
  const [activeFilters, setActiveFilters] = useState<Object>({});

  // assign props to state
  useEffect(() => {
    setActiveArr(props.fullArray);
    setViewArr(props.fullArray.slice(0, 5));
    const filters: Object = {};
    for (const key in props.taxaArrays) {
      filters[taxaTranslation[key]] = false;
    }
    setActiveFilters(filters);
  }, [props.fullArray]);

  // on filter change, update activeArr and viewArr
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
        if (include) newView.push(...props.taxaArrays[actualTaxa]); // here we're creating an arr without our prev info
        newView.sort((a, b) => {
          return b.count - a.count;
        });
      }
    }
    setActiveArr(newView);
    setViewArr(newView.slice(0, 25)); // here and right above, we're using it
  }, [activeFilters]);

  // update one filter
  const toggleFilter = (el?: [string, boolean]) => {
    setActiveFilters({ ...activeFilters, [el[0]]: !el[1] });
  };

  // toggle all filters to false
  const clearAllFilters = () => {
    const filtersClone = { ...activeFilters };
    for (let key in filtersClone) filtersClone[key] = false;
    setActiveFilters(filtersClone);
  };

  function handleScroll() {
    setViewArr([
      ...viewArr,
      ...activeArr.slice(viewArr.length, viewArr.length + 5),
    ]);
  }

  const formatHistoricalText = (dateArr: [string, string]) => {
    const months: string[] = dateArr.reduce((acc, cur) => {
      const monthStr = new Date(cur).toLocaleDateString('en-US', {
        month: 'long',
      });
      if (monthStr === acc[0]) return acc;
      return [...acc, monthStr];
    }, []);
    const formatter = new Intl.ListFormat('en', {
      style: 'long',
      type: 'conjunction',
    });
    const monthsText = formatter.format(months);
    return `Comparing to data in ${monthsText}, all years.`;
  };

  const allCardElements: JSX.Element[] = viewArr.map((el: Object) => {
    return (
      <BirdCard
        key={el.taxaId}
        taxaId={el.taxaId}
        name={el.name}
        scientificName={el.scientificname}
        count={el.count}
        pictureUrl={el.pictureurl}
        found={el.found}
        taxon={el.taxon}
        queryInfo={props.queryInfo}
        showModal={props.showModal}
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

  const missingFoundContainer =
    props.activeInd !== undefined ? (
      <div id='toggle-missing-container'>
        <input
          id='toggle-missing'
          type='checkbox'
          checked={props.activeInd}
          onChange={props.toggleMissingVsFound}
        ></input>

        <label
          className={`missing-label ${
            props.activeInd ? 'deselected' : 'selected'
          }`}
          htmlFor='toggle-missing'
        >
          Missing
        </label>
        <span className='spacer'>|</span>
        <label
          className={`found-label ${
            props.activeInd ? 'selected' : 'deselected'
          }`}
          htmlFor='toggle-missing'
        >
          Found
        </label>
      </div>
    ) : (
      <div id='previous-warning-container'>
        <span className='warn'>Warning!&nbsp;</span>
        <a href='#/'>
          <span>
            This is last year's challenge data. Click this text to return to the
            current year's view instead.
          </span>
        </a>
      </div>
    );

  const queryDays =
    props.activeInd !== undefined
      ? { D1: props.queryInfo.curD1, D2: props.queryInfo.curD2 }
      : { D1: props.queryInfo.prevD1, D2: props.queryInfo.prevD2 };

  return (
    <div id='Main'>
      <div id='filters-band' className='hamburger'>
        {missingFoundContainer}
        <Filter
          activeFilters={activeFilters}
          toggleFilter={toggleFilter}
          clearAllFilters={clearAllFilters}
          isLoading={props.isLoading ? true : false}
          status={
            activeArr.length !== props.fullArray.length ? 'active' : 'inactive'
          }
        />
      </div>
      {props.countdownComponent}

      {props.isLoading ? (
        <LoadingGif size='5' />
      ) : (
        <React.Fragment>
          <div id='result-summary'>
            <div>
              <span>
                Displaying{' '}
                {activeArr.length
                  .toString()
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ',')}{' '}
                {props.activeInd ? 'observed' : 'unobserved'} species
                during&nbsp;
              </span>
              <span>
                {[queryDays.D1, queryDays.D2]
                  .map((el) =>
                    new Date(el).toLocaleDateString('en-US', {
                      timeZone: 'UTC',
                    })
                  )
                  .join('-')}
              </span>
            </div>
            <div>
              <span>{formatHistoricalText([queryDays.D1, queryDays.D2])}</span>
            </div>
          </div>
          {infiniteScroll}
        </React.Fragment>
      )}
    </div>
  );
};
export default Feed;
