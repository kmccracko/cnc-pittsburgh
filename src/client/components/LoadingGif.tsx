import { CircularProgress } from '@mui/material';
import React from 'react';

// import puckman from '../assets/puckman.gif';
// import * as puckman from '../assets/puckman.gif';

interface IloadingGifProps {
  size: string;
  color?: string;
}

const LoadingGif = (props: IloadingGifProps) => {
  return (
    <div id='loader'>
      <CircularProgress size={`${props.size}rem`} />
    </div>
  );
};

export default LoadingGif;
