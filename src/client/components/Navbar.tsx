import React from 'react';
import { Link } from 'react-router-dom';
import useMediaQuery from '@mui/material/useMediaQuery';
import Hamburger from './Hamburger';

const Navbar = () => {
  let navLinks;
  const wideEnough = useMediaQuery('(min-width:601px)');
  const links = [
    <Link to='/search'>Search</Link>,
    <Link to='/previous'>Previous</Link>,
    <Link to='/about'>About</Link>,
  ];
  if (wideEnough) {
    navLinks = <>{links}</>;
  } else {
    navLinks = <Hamburger listitems={links} />;
  }

  console.log({ wideEnough });

  return (
    <div id='navbar'>
      <Link to='/' id='home-link'>
        <div id='nav-left'>
          <span id='pgh'>Pittsburgh</span>
          <span id='cnc'>CNC</span>
        </div>
      </Link>
      <div id='nav-right' className={`${!wideEnough ? 'mobile' : ''}`}>
        {navLinks}
      </div>
    </div>
  );
};

export default Navbar;
