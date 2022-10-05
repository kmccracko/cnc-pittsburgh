import React, { useState, useEffect } from 'react';
import InfiniteScroll from 'react-infinite-scroller';

import BirdCard from './BirdCard';
import LoadingGif from './LoadingGif';
import Filter from './Filter';
import Modal from './Modal';

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
  fullArray: any[];
  taxaArrays: Object;
  isLoading: boolean;
  countdownComponent: JSX.Element;
  queryInfo: Object;
}

const Feed = (props: IfeedProps) => {
  // set vars
  const [activeArr, setActiveArr] = useState<TallCards>([]);
  const [viewArr, setViewArr] = useState<TallCards>([]);
  const [activeFilters, setActiveFilters] = useState<Object>({});
  const [modal, setModal] = useState<boolean>(false);
  const [modalContent, setModalContent] = useState<Object>({});

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
        if (include) newView.push(...props.taxaArrays[actualTaxa]);
        newView.sort((a, b) => {
          return b.count - a.count;
        });
      }
    }
    setActiveArr(newView);
    setViewArr(newView.slice(0, 25));
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
        key={el.taxaid}
        taxaId={el.taxaid}
        name={el.name}
        scientificName={el.scientificname}
        count={el.count}
        pictureUrl={el.pictureurl}
        obsMonth={props.queryInfo.baselineMonth}
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
      {modal && <Modal modalContent={modalContent} closeModal={closeModal} />}
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
              unobserved species during&nbsp;
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
