import React from 'react';
import { queryParams } from '../../types';

interface IaboutProps {
  queryInfo: queryParams;
}

const About = (props: IaboutProps) => {
  return (
    <div id='about'>
      <h1>About The Site</h1>
      <h2>What is this place?</h2>
      <p>
        The purpose of this project is to assist Pittsburgh participants of the
        City Nature Challenge.
        <br />
        <br />
        This site uses iNaturalist data to identify species that have not yet
        been observed within{' '}
        <a
          href={`https://www.inaturalist.org/projects/${props.queryInfo.projectId}/`}
          target='_blank'
        >
          Pittsburgh's current City Nature Challenge project
        </a>
        , and sorts them such that the most likely to be observed species are
        positioned at the top of the list. This provides ideas of what to seek
        out, and ensures species aren't missed because they were assumed to be
        observed already.
      </p>
      <h2>How do I use this site?</h2>
      <p>
        However you like! My grandmother enjoyed looking at the birds, mostly.
        Just know that the species that appear in the <b>Missing</b> feed are
        ones that have not yet been identified in the given project, while
        species in the <b>Found</b> feed have been observed in the given
        project. Naturalists can use this information to guide their efforts in
        observing as many missing species as possible.
      </p>
      <h2>How do you determine what species are more likely to be observed?</h2>
      <p>
        This site compares information from two data sources: one data source
        for the Current project, and another for the "Historical" timeframe,
        which looks at all observations for April and May, across all years.{' '}
        <br></br>
        <br></br> We find what species from the "Historical" dataset do not
        occur in the "Current" dataset and sort them all by the total amount of
        observations per species. Because we can reasonably conclude that the
        species with more historical observations are more likely to be seen
        again during the current timeframe, we sort highest to lowest, bringing
        the "low hanging fruit" to the top.
      </p>
      <h2>Can I check the observed status of a species without scrolling?</h2>
      <p>
        Yes! The <b>Search</b> feature at the top of the page allows you to type
        any part of a species' name (common name or scientific name) and view
        all species matching that search term. On the right side of each result
        is an icon indicating the status of that species: missing or found.
      </p>
      <h2>I like a challenge. What do you suggest?</h2>
      <p>
        We have a feature that allows you to view Pittsburgh's shortcomings from
        last year. Specifically, by visiting the&nbsp;
        <a href='/#/previous'>last year misses page</a>, you can view the
        remaining species that weren't observed during the previous challenge
        that also have not yet been observed during this challenge. Basically,
        you can try to get what we couldn't last year!
      </p>
      <h2>Why can't I find this species? It's towards the top in observations!</h2>
      <p>
        Some species will have a high number of observations, but be difficult to find during the City Nature Challenge. This is often due to seasonality coupled with the fact that our historical data casts a relatively wide net. Our data is for species that are observed in the months of April and May, but a species may be ending its activity in early April, or just starting in mid or late May.
        <br></br>
        <br></br>To get a better sense of this seasonality, we've added a histogram to the details popup for each species. This may help get an idea of why something is so hard to find!
      </p>
      <h2>My new observation isn't showing up. What gives?</h2>
      <p>
        The network of hamster wheels that keeps this site running is able to
        fetch updates every 15 minutes, but requires a page refresh in order to
        deliver the new data. There's a countdown on the feed page that shows
        how much time is left, and if you like math, how recently the data has
        been updated. <br></br>
        <br></br> But because we all get impatient, you can also "double check"
        the status of a given species by clicking the "Is it still missing?"
        link in the details popup for it.
      </p>
      <h2>How did you decide what filters to offer?</h2>
      <p>
        This{' '}
        <a href='https://www.inaturalist.org/taxa/' target='_blank'>
          taxa page
        </a>{' '}
        on iNaturalist lists the major categories it uses. Note that these are
        different levels of identification, including kingdoms, classes, and
        phyla.
      </p>
      <div className='spacer'></div>
      <h3>Relevant links</h3>
      <ul>
        <li>
          <a href='https://www.citynaturechallenge.org/faq/' target='_blank'>
            City Nature Challenge FAQ
          </a>
        </li>
        <li>
          <a
            href='https://carnegiemnh.org/explore/city-nature-challenge/'
            target='_blank'
          >
            City Nature Challenge (Pittsburgh)
          </a>
        </li>
        <li>
          <a
            href={`https://www.inaturalist.org/projects/${props.queryInfo.projectId}/`}
            target='_blank'
          >
            iNaturalist Challenge Page (Pittsburgh)
          </a>
        </li>
      </ul>
      <h3>My links</h3>
      <ul>
        <li>
          <a
            href='https://github.com/kmccracko/cnc-pittsburgh/'
            target='_blank'
          >
            This project on Github
          </a>
        </li>
        <li>
          <a href='https://www.buymeacoffee.com/kmccracko/' target='_blank'>
            Buy Me a Coffee
          </a>
        </li>
      </ul>
      <p>
        Inspired by{' '}
        <a href='http://targets.cncphilly.org/' target='_blank'>
          targets.cncphilly.org&nbsp;
        </a>
        and its creator, Navin Sasikumar.
      </p>
      <div className='spacer'></div>
    </div>
  );
};

export default About;
