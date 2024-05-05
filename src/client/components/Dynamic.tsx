import React from 'react';
import { useParams } from 'react-router';
import About from './About';
import App from './App';
import BirdCard from './BirdCard';
import Countdown from './Countdown';
import CountdownPretty from './CountdownClock';
import Feed from './Feed';
import Filter from './Filter';
import FourOFour from './FourOFour';
import LoadingGif from './LoadingGif';
import Modal from './Modal';
// import ModalAlert from './ModalAlert';
import ModalAlert from './ModalAlert';
import ModalSpecies from './ModalSpecies';
import Navbar from './Navbar';
import Search from './Search';
import SearchRecord from './SearchRecord';

const DynamicComponent = (props: any) => {
  let { name } = useParams();
  console.log(name);
  let component = <></>;
  switch (name.toLowerCase()) {
    //
    //
    //
    case 'modal':
      component = <Modal modalInner={'Hello world!'} />;
      break;
    //
    //
    //
    case 'earlymodal':
      component = (
        <ModalAlert
          modalContent={{
            title: `
        You're early!`,
            body: `

        You're welcome to look around, but the data won't be very useful until we start getting observations for this challenge!`,
            countdownto: props.queryInfo.curEndDate,
          }}
          closeModal={() => {}}
        />
      );
      break;
    //
    //
    //
    case 'latemodal':
      component = (
        <ModalAlert
          modalContent={{
            title: `
        PGH Targets is currently not in season.
    `,
            body: `
        You're welcome to look around - just know that this data is no longer "live", and instead reflects the data at the end of the most recent City Nature Challenge.`,
          }}
          closeModal={() => {}}
        />
      );
      break;
    //
    //
    //
    default:
      break;
  }
  return <div id='dynamic'>{component}</div>;
};

export default DynamicComponent;
