import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <div id='navbar'>
      <Link to='/' id='home-link'>
        <div id='nav-left'>
          <span id='pgh'>Pittsburgh</span>
          <span id='cnc'>CNC</span>
        </div>
      </Link>
      <div id='nav-right'>
        <Link to='/about'>About</Link>
        <a
          href='https://carnegiemnh.org/explore/city-nature-challenge/'
          target='_blank'
        >
          CNC
        </a>
      </div>
    </div>
  );
};

export default Navbar;
