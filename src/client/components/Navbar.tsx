import React from 'react';

// import puckman from '../assets/puckman.gif';
// import * as puckman from '../assets/puckman.gif';

const Navbar = () => {
  return (
    <div id='navbar'>
      <div id='nav-left'>
        <span id='pgh'>Pittsburgh</span>
        <span id='cnc'>CNC</span>
      </div>
      <div id='nav-right'>
        <a href=''>About</a>
        <a
          href='https://carnegiemnh.org/explore/city-nature-challenge/'
          target='_blank'
        >
          CNC
        </a>
        {/* <a href=''>Taxonomy</a> */}
      </div>
    </div>
  );
};

export default Navbar;
