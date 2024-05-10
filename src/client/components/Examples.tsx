import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';

import LoadingGif from './LoadingGif';
import Modal from './Modal';
import ModalAlert from './ModalAlert';
import ModalSpecies from './ModalSpecies';
import Hamburger from './Hamburger';

const Examples = (props: any) => {
  const location = '/#/examples/';
  const emptyfunc = () => {};

  const examples = [
    {
      path: 'modal',
      element: <Modal modalInner={'Hello world!'} />,
    },
    {
      path: 'speciesmodal',
      element: (
        <ModalSpecies
          activeInd={true}
          modalContent={{
            found: false,
            count: 43,
            taxon: 'Aves',
            pictureUrl: '',
            name: 'Fake Species!',
            scientificName: 'fakus specificus',
            taxaId: 123,
            queryInfo: {
              curD1: props.queryInfo.curD1,
              curD2: props.queryInfo.curD2,
              prevD1: props.queryInfo.prevD1,
              prevD2: props.queryInfo.prevD2,
              projectId: props.queryInfo.projectId,
              baselineMonth: props.queryInfo.baselineMonth,
            },
          }}
          closeModal={emptyfunc}
        />
      ),
    },
    {
      path: 'latemodal',
      element: (
        <ModalAlert
          modalContent={{
            title: `
            PGH Targets is currently not in season.`,
            body: `
            You're welcome to look around - just know that this data is no longer "live", and instead reflects the data at the end of the most recent City Nature Challenge.`,
          }}
          closeModal={emptyfunc}
        />
      ),
    },
    {
      path: 'earlymodal',
      element: (
        <ModalAlert
          modalContent={{
            title: `
            You're early!`,
            body: `
            You're welcome to look around, but the data won't be very useful until we start getting observations for this challenge!`,
            countdownto: +new Date() + 1000 * 60 * 60 * 5.3,
          }}
          closeModal={() => {}}
        />
      ),
    },
    {
      path: 'loadinggif',
      element: (
        <>
          <h3>This is just an example! We're not loading anything</h3>
          <LoadingGif />
        </>
      ),
    },
    {
      path: 'hamburger',
      element: (
        <>
          <Hamburger
            listitems={['about', 'previous', 'search'].map((el) => (
              <Link to={`/#/${el}`}>{el}</Link>
            ))}
          />
        </>
      ),
    },
  ];

  const routes = examples.map((el, i) => <Route key={i} {...el}></Route>);
  const links = examples.map((el, i) => (
    <li key={'item' + i}>
      <a key={'link' + i} href={location + el.path}>
        {el.path}
      </a>
    </li>
  ));

  return (
    <div id='examples-container'>
      <style>{`
      #examples-container {
        height: 100vh;
      }`}</style>
      <Routes>
        {routes}
        <Route
          path='*'
          element={
            <div>
              <style>{`
              #examples-container {
                height: 100%;
              }
              a {
                color: yellow;
                font-size: 20px;
              }
              li {
                margin: 10px;
              }
              `}</style>
              <h1>Examples</h1>
              <ul>{links}</ul>
            </div>
          }
        />
      </Routes>
    </div>
  );
};
export default Examples;
