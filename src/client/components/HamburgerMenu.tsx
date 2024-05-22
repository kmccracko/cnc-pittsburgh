import React, { MouseEventHandler } from 'react';

interface IhamburgerProps {
  listItems: any;
  hamburgerIsOpen: boolean;
  hamburgerToggle: MouseEventHandler<HTMLDivElement>;
}

const HamburgerMenu = (props: IhamburgerProps) => {
  const listItems = props.listItems.map((el: any, i: number) => (
    <div className='hamburger-item' key={i}>
      {el}
    </div>
  ));
  return (
    <div
      className={`hamburger-container ${
        props.hamburgerIsOpen ? 'open' : 'closed'
      }`}
    >
      <div
        className='hamburger-background'
        onClick={props.hamburgerToggle}
      ></div>
      <ul className={`hamburger-menu`}>{listItems}</ul>
    </div>
  );
};

export default HamburgerMenu;
