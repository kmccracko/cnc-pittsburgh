import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useMediaQuery from '@mui/material/useMediaQuery';
import HamburgerMenu from './HamburgerMenu';

const Navbar = () => {
  const [navHamburgerOpen, setNavHamburgerOpen] = useState<boolean>(false);

  const handleBurgerClick = (e: any) => {
    setNavHamburgerOpen(!navHamburgerOpen);
  };

  const wideEnough = useMediaQuery('(min-width:601px)');
  const linkClass = !wideEnough ? 'link-wide' : '';
  const links = [
    <Link className={linkClass} to='/search'>
      Search
    </Link>,
    <Link className={linkClass} to='/previous'>
      Previous
    </Link>,
    <Link className={linkClass} to='/about'>
      About
    </Link>,
  ];

  return (
    <>
      <div id='navbar'>
        <Link to='/' id='home-link'>
          <div id='nav-left'>
            <span id='pgh'>Pittsburgh</span>
            <span id='cnc'>CNC</span>
          </div>
        </Link>
        <div
          id='nav-right'
          className={`${!wideEnough ? 'mobile' : ''} ${
            navHamburgerOpen ? 'open' : 'closed'
          }`}
        >
          {wideEnough ? (
            links
          ) : (
            <div className='hamburger-button' onClick={handleBurgerClick}>
              ≡
            </div>
          )}
        </div>
      </div>
      <div
        id='nav-buffer'
        className={navHamburgerOpen ? 'hamburger-active' : ''}
      ></div>
      <HamburgerMenu
        listItems={links}
        hamburgerIsOpen={navHamburgerOpen}
        hamburgerToggle={handleBurgerClick}
      />
    </>
  );
};

export default Navbar;
