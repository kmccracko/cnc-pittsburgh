import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useMediaQuery from '@mui/material/useMediaQuery';
import HamburgerMenu from './HamburgerMenu';

interface INavbarProps {
  onUserSearch?: () => void;
}

const Navbar: React.FC<INavbarProps> = ({ onUserSearch }) => {
  const [navHamburgerOpen, setNavHamburgerOpen] = useState<boolean>(false);

  const handleBurgerClick = (e: any) => {
    setNavHamburgerOpen(!navHamburgerOpen);
  };

  const wideEnough = useMediaQuery('(min-width:670px)');
  const linkClass = !wideEnough ? 'link-wide' : '';
  const links = [
    <Link className={linkClass} to='/search' onClick={() => setNavHamburgerOpen(false)}>
      Search
    </Link>,
    <Link className={linkClass} to='/previous' onClick={() => setNavHamburgerOpen(false)}>
      Previous
    </Link>,
    onUserSearch && (
      <a 
        className={linkClass} 
        onClick={() => {
          setNavHamburgerOpen(false);
          onUserSearch();
        }}
      >
        Set User
      </a>
    ),
    <Link className={linkClass} to='/about' onClick={() => setNavHamburgerOpen(false)}>
      About
    </Link>,
  ].filter(Boolean);

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
