import React, { useState, useEffect } from 'react';
import InfiniteScroll from 'react-infinite-scroller';

import BirdCard from './BirdCard';
import LoadingGif from './LoadingGif';
import Filter from './Filter';
import Modal from './Modal';
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
  activeInd: boolean;
  fullArray: any[];
  taxaArrays: Object;
  isLoading: boolean;
  countdownComponent: JSX.Element;
  queryInfo: queryParams;
}

const Feed = (props: IfeedProps) => {
  // set vars
  const [activeArr, setActiveArr] = useState<TallCards>([]);
  const [viewArr, setViewArr] = useState<TallCards>([]);
  const [activeFilters, setActiveFilters] = useState<Object>({});
  const [modal, setModal] = useState<boolean>(false);
  const [modalContent, setModalContent] = useState<Object>({});
  const [needApp, setNeedApp] = useState<boolean>(true);

  // assign props to state
  useEffect(() => {
    console.log('fullARR CHANGEDDDD');

    // this use effect exists only to bring down our app-level data
    // we only need to trigger it when app passes down something useful
    // after that, we set needApp to false so we don't update when we don't need to
    // all data is passed by reference, so a top level update doesn't require trickle-down updates
    // if (needApp) {
    if (props.fullArray.length && Object.keys(props.taxaArrays).length) {
      // setNeedApp(false);
      setActiveArr(props.fullArray);
      setViewArr(props.fullArray.slice(0, 5));
      const filters: Object = {};
      for (const key in props.taxaArrays) {
        filters[taxaTranslation[key]] = false;
      }
      setActiveFilters(filters);
    }
    // }
    if (modal) setModalContent({ ...modalContent });
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

  const allCardElements: JSX.Element[] = viewArr.map((el: Object) => {
    return (
      <BirdCard
        key={el.taxaId}
        taxaId={el.taxaId}
        name={el.name}
        scientificName={el.scientificname}
        count={el.count}
        pictureUrl={el.pictureurl}
        queryInfo={props.queryInfo}
        showModal={showModal}
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

  return (
    <div id='Main'>
      {modal && (
        <Modal
          activeInd={props.activeInd}
          modalContent={modalContent}
          closeModal={closeModal}
        />
      )}
      <Filter
        activeFilters={activeFilters}
        toggleFilter={toggleFilter}
        clearAllFilters={clearAllFilters}
        isLoading={props.isLoading ? true : false}
        status={
          activeArr.length !== props.fullArray.length ? 'active' : 'inactive'
        }
      />
      {props.countdownComponent}

      {props.isLoading ? (
        // <React.Fragment>
        <LoadingGif size='5' />
      ) : (
        // </React.Fragment>
        <React.Fragment>
          <div id='result-summary'>
            <span>
              Displaying{' '}
              {activeArr.length
                .toString()
                .replace(/\B(?=(\d{3})+(?!\d))/g, ',')}{' '}
              {props.activeInd ? 'observed' : 'unobserved'} species during&nbsp;
            </span>{' '}
            <span>
              {`${new Date(props.queryInfo.curD1).toLocaleDateString('en-US', {
                timeZone: 'UTC',
              })}-${new Date(props.queryInfo.curD2).toLocaleDateString(
                'en-US',
                { timeZone: 'UTC' }
              )}`}
            </span>
          </div>
          {infiniteScroll}
        </React.Fragment>
      )}
    </div>
  );
};
export default Feed;
