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
        <Link to='/'>Feeds</Link>
        <Link to='/'>Search</Link>
        <Link to='/about'>About</Link>
      </div>
    </div>
  );
};

export default Navbar;
