import React, { useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import SearchRecord from './SearchRecord';

interface IsearchProps {
  allArr: any;
  queryInfo: Object;
  showModal: Function;
}

const Search = (props: IsearchProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [resultsArr, setResultsArr] = useState([]);
  const [viewArr, setViewArr] = useState([]);

  useEffect(() => {
    // ignore if empty search
    if (searchTerm === '') return;

    // get results
    const results: Object[] = [];
    for (let el of props.allArr) {
      const scientificMatch =
        el.scientificname.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1;
      const commonMatch =
        el.name.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1;

      // add to results if match
      if (scientificMatch || commonMatch) results.push(el);

      // give the gui something short and keep working
      if (results.length === 20) setResultsArr(results);
    }

    // set results after checking everything
    setResultsArr(results);
    setViewArr(results.slice(0, 5));
  }, [searchTerm]);

  const handleSearchUpdate = (e: any) => {
    // setViewArr([]);
    setResultsArr([]);
    setSearchTerm(e.target.value);
  };

  const allCardElements: JSX.Element[] = viewArr.map((el: any) => {
    return (
      <SearchRecord
        key={el.taxaId}
        taxon={el.taxon}
        taxaId={el.taxaId}
        name={el.name}
        scientificName={el.scientificname}
        count={el.count}
        pictureUrl={el.pictureurl}
        found={el.found}
        showModal={props.showModal}
        queryInfo={props.queryInfo}
      />
    );
  });

  function handleScroll() {
    setViewArr([
      ...viewArr,
      ...resultsArr.slice(viewArr.length, viewArr.length + 5),
    ]);
  }

  const infiniteScroll = (
    <InfiniteScroll
      pageStart={0}
      loadMore={handleScroll}
      hasMore={viewArr.length < resultsArr.length}
      loader={
        <div className='loader' key={0}>
          Loading ...
        </div>
      }
    >
      <div id='search-results'>{allCardElements}</div>
    </InfiniteScroll>
  );

  return (
    <div id='search-container'>
      <div id='search-top'>
        <input
          id='searchbar'
          autoFocus
          value={searchTerm}
          onChange={handleSearchUpdate}
          placeholder='Search...'
        ></input>
        <div id='search-key'>
          <span>
            Missing:
            <span className='missing'>◌</span>
          </span>
          <span>
            Found:<span className='found'>✔</span>
          </span>
        </div>
      </div>
      {infiniteScroll}
    </div>
  );
};

export default Search;
