import { CircularProgress } from '@mui/material';
import React from 'react';

// import puckman from '../assets/puckman.gif';
// import * as puckman from '../assets/puckman.gif';

const LoadingGif = () => {
  return (
    <div id='loader'>
      <CircularProgress size='5rem' />
    </div>
  );
};

export default LoadingGif;
