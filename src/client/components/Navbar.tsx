import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useMediaQuery from '@mui/material/useMediaQuery';
import HamburgerMenu from './HamburgerMenu';

interface INavbarProps {
  onUserSearch?: () => void;
  newSpeciesCelebrations?: any[];
}

const Navbar: React.FC<INavbarProps> = ({ onUserSearch, newSpeciesCelebrations }) => {
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

  const tickerItems = (newSpeciesCelebrations || [])
    .filter((item: any) => item?.author && item?.species)
    .map((item: any) => `@${item.author} • ${item.species}`);

  return (
    <>
      <div id='navbar'>
        <Link to='/' id='home-link'>
          <div id='nav-left'>
            <span id='pgh'>Pittsburgh</span>
            <span id='cnc'>CNC</span>
          </div>
        </Link>
        {tickerItems.length > 0 && (
          <a href='#/firsts' id='nav-center-firsts-link'>
            <div id='nav-center-firsts' aria-label='firsts ticker in navbar'>
              <div className='nav-center-title'>Pittsburgh CNC Firsts!</div>
              <div
                className='nav-center-window'
                style={
                  {
                    '--ticker-items': tickerItems.length,
                    '--ticker-duration': `${Math.max(8, tickerItems.length * 2.5)}s`,
                  } as React.CSSProperties
                }
              >
                <div className='nav-center-track'>
                  {[...tickerItems, ...tickerItems].map((item: string, idx: number) => (
                    <div className='nav-center-item' key={`${item}-${idx}`}>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </a>
        )}
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
