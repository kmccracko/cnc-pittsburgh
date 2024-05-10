import React from 'react';

interface IhamburgerProps {
  listitems: any;
}

const Hamburger = (props: IhamburgerProps) => {
  const listItems = props.listitems.map((el: any, i: number) => (
    <li key={i}>{el}</li>
  ));
  return (
    <div className={`hamburger-container`}>
      <input type='checkbox' id='hamburger-check' />
      <label className='hamburger-button' htmlFor={'hamburger-check'}>
        ≡
      </label>
      <label
        htmlFor={'hamburger-check'}
        className='hamburger-background'
      ></label>
      <div className='hamburger-popout'>
        <ul>{listItems}</ul>
      </div>
    </div>
  );
};

export default Hamburger;
