import React from 'react';

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import useMediaQuery from '@mui/material/useMediaQuery';

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

interface IfilterProps {
  activeFilters: Object;
  toggleFilter: Function;
  clearAllFilters: Function;
  status: string;
  isLoading: boolean;
}

// const middleman: ChangeEventHandler = (e: ChangeEvent, el?: any) => {};

const Filter = (props: IfilterProps) => {
  const filterForm = (
    <form id='filters-container'>
      {Object.entries(props.activeFilters).map((el) => {
        return (
          <div key={el[0]} className='filter-item'>
            <input
              type='checkbox'
              name={el[0]}
              id={el[0]}
              checked={el[1]}
              onChange={(e) => {
                props.toggleFilter(el);
              }}
            />
            <label className='filterButton' htmlFor={el[0]}>
              {el[0]}
            </label>
          </div>
        );
      })}
    </form>
  );

  const clearFiltersBtn = (
    <button
      id='clear-filters-button'
      className={`filterButton ${props.status}`}
      onClick={() => {
        props.clearAllFilters();
      }}
    >
      Clear all filters
    </button>
  );

  const wideEnough = useMediaQuery('(min-width:601px)');
  let filterContainer;
  // without accordion
  if (wideEnough) {
    filterContainer = (
      <div id='filters-band' className='hotdog'>
        {filterForm}
        {clearFiltersBtn}
      </div>
    );
  }
  // put it in an accordion
  else {
    filterContainer = (
      <Accordion
        disableGutters
        sx={{
          color: 'white',
          backgroundColor: 'rgb(0,0,0,0)',
          margin: '3% 0px',
          '&.Mui-expanded:first-of-type': {
            margin: '3% 0px',
          },
          '&.Mui-expanded:last-of-type': {
            margin: '3% 0px',
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
          {filterForm}
          {clearFiltersBtn}
        </AccordionDetails>
      </Accordion>
    );
  }

  return <React.Fragment>{filterContainer}</React.Fragment>;
};
export default Filter;
