import React, { useEffect, useState } from 'react';
import SearchRecord from './SearchRecord';

interface IsearchProps {
  allArr: any;
}

const Search = (props: IsearchProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [resultsArr, setResultsArr] = useState([]);

  useEffect(() => {
    console.log(
      props.allArr.filter((el: any) => {
        const scientificMatch =
          el.scientificname.toLowerCase().indexOf(searchTerm.toLowerCase()) >
          -1;
        const commonMatch =
          el.name.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1;
        return scientificMatch || commonMatch;
      })
    );

    setResultsArr(
      props.allArr.filter((el: any) => {
        const scientificMatch =
          el.scientificname.toLowerCase().indexOf(searchTerm.toLowerCase()) >
          -1;
        const commonMatch =
          el.name.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1;
        return scientificMatch || commonMatch;
      })
    );
  }, [searchTerm]);

  const handleSearchUpdate = (e: any) => {
    setSearchTerm(e.target.value);
  };

  const allCardElements: JSX.Element[] = resultsArr.map((el: any) => {
    return (
      <SearchRecord
        key={el.taxaId}
        taxaId={el.taxaId}
        name={el.name}
        scientificName={el.scientificname}
        count={el.count}
        pictureUrl={el.pictureurl}
      />
    );
  });

  return (
    <div id='search-container'>
      <input
        id='searchbar'
        value={searchTerm}
        onChange={handleSearchUpdate}
      ></input>
      {allCardElements}
    </div>
  );
};

export default Search;
