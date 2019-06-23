'use strict';

const TMDB = require('./TheMovieDB');
const puppeteer = require('puppeteer');

/**
 * Generate an AJAX POST request and send params as URL encoded ex: hash=123...
 * @param url
 * @param params
 * @returns {string}
 */
const injectAJAXReq = (url, hash) => {
  return `
    (function(){
      $.ajax({
        type: "POST",
        url: configWeb.urlStream + "getFile.php",
        dataType: "JSON",
        data: "hash=${hash}",
      });
    })();
  `;
};

const getVideoLinks = async (pageUrl) => {
  // const GET_MOVIES_API = 'http://www.cliver.to/frm/cargar-mas.php';
  // const GET_MOVIE_HASHES_API = 'http://www.cliver.to/frm/obtener-enlaces-pelicula.php';
  const GET_VIDEO_LINKS_API = 'https://directvideo.stream/getFile.php';

  strapi.log.info('CliverScraper :: Getting video links');
  // instance of puppeteer
  const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
  const page = await browser.newPage();

  let originalTitle = null;
  let year = null;
  let videoLinks = [];

  // json response for: http://www.cliver.to/frm/obtener-enlaces-pelicula.php
  let obtenerEnlacesPelicula = null;
  let tempVideoItem = null;

  page.on('response', async response => {
    // find video tokens
    if (response.url().endsWith('obtener-enlaces-pelicula.php')) {
      obtenerEnlacesPelicula = await response.json();
      strapi.log.info('CliverScraper :: Success: obtener-enlaces-pelicula.php');
    }
    // trap the response to add the video url to video object
    if (response.url().endsWith('getFile.php')) {
      try {
        const getFile = await response.json();
        tempVideoItem.url = getFile.url;
        if ( !videoLinks.find(v => v.url === tempVideoItem.url) ) {
          videoLinks.push(tempVideoItem);
          strapi.log.info('CliverScraper :: A new url found: ' + tempVideoItem.url);
        }
      } catch(e) {
        //strapi.log.error('CliverScraper "getFile.php" request error :: ' + e.toString());
      }
    }
  });

  try {
    // open website
    await page.goto(pageUrl);
    // get movie title
    originalTitle = await page.$eval(
      'body > div.contenedor.contenedor-pelicula > div > aside > div.peli-der-c > span',
      el => el.innerText
    );
    // get movie year
    year = await page.$eval(
      'body > div.contenedor.contenedor-pelicula > div > section > div.info-p-r > p:nth-child(3)',
      el => {
        let v = el.innerText;
        v = v.match(/\d{4}/);
        return v ? v[0] : null;
      }
    );

    let videoItems = [];

    // spanish video links
    if (obtenerEnlacesPelicula && obtenerEnlacesPelicula.es) {
      videoItems = [...videoItems, ...obtenerEnlacesPelicula.es];
    }
    // latin american video links
    if (obtenerEnlacesPelicula && obtenerEnlacesPelicula.es_la) {
      videoItems = [...videoItems, ...obtenerEnlacesPelicula.es_la];
    }
    // english sub video links
    if (obtenerEnlacesPelicula && obtenerEnlacesPelicula.vose) {
      videoItems = [...videoItems, ...obtenerEnlacesPelicula.vose];
    }

    strapi.log.info('CliverScraper :: Total of video tokens to check: ' + videoItems.length);

    // create AJAX request for every video
    for (let i = 0; i < videoItems.length; i++) {
      tempVideoItem = videoItems[i];

      await page.addScriptTag({
        content: injectAJAXReq( GET_VIDEO_LINKS_API, tempVideoItem.token )
      });
      await page.waitForResponse(GET_VIDEO_LINKS_API); // wait until detect a request response
      await new Promise(resolve => setTimeout(resolve, 3000)); // prevent blocker
    }
  } catch (e) {
    strapi.log.error('CliverScraper :: ' + e.toString());
  }

  // close browser to save memory
  await browser.close();

  // Bohemian Rhapsody, 2018, [ { idioma, url, ... } ]
  const result = {originalTitle, year, videoLinks};
  // strapi.log.info('CliverScraper :: Page result ' + JSON.stringify(result));
  return result;
};

/**
 * Module
 * @type {{scrapeMovies(): Promise<*>}}
 */
module.exports = {

  async scrape() {
    strapi.log.info('CliverScraper :: Init scraping');
    const page = await strapi.services.sourcepage.getPageUrl('cliver');

    if (!page) {
      strapi.log.info('CliverScraper :: No page found');
      return null;
    } else {
      strapi.log.info('CliverScraper :: Scraping page ' + page.url);
    }

    let movie = null;
    let videolinksCounter = 0;

    try {
      // get all video links
      const {originalTitle, year, videoLinks} = await getVideoLinks(page.url);

      if (videoLinks && !videoLinks.length) {
        // strapi.log.error('CliverScraper :: No video links found');
        throw 'No video links found';
      } else {
        strapi.log.info(`CliverScraper :: ${videoLinks.length} video links found`);
      }

      // get movie info
      const movieObj = await TMDB.findMovieByTitle(originalTitle, year);

      if (!movieObj) {
        // strapi.log.error('CliverScraper :: No movie found');
        throw 'No movie found';
      } else {
        strapi.log.info(`CliverScraper :: Movie found ${movieObj.title} (${movieObj.release_date})`);
      }

      // get or create a movie record
      // eslint-disable-next-line no-undef
      movie = await Movie.findOne({tmdb_id: movieObj.id});
      if (!movie || ( movie && !movie._id )) {
        // eslint-disable-next-line no-undef
        movie = new Movie({
          tmdb_id: movieObj.id,
          poster_path: movieObj.poster_path,
          adult: movieObj.adult,
          release_date: movieObj.release_date,
          original_title: movieObj.original_title,
          original_language: movieObj.original_language,
          title: movieObj.title,
          backdrop_path: movieObj.backdrop_path,
          popularity: movieObj.popularity,
          vote_count: movieObj.vote_count,
          video: movieObj.video,
          vote_average: movieObj.vote_average,
          overview: movieObj.overview,
        });
        // add genres
        for (let g = 0; g < movieObj.genre_ids.length; g++) {
          // eslint-disable-next-line no-undef
          const genre = await Genre.findOne({tmdb_id: movieObj.genre_ids[g]});
          if (genre && genre.id) {
            if (Array.isArray(movie.genres)) {
              movie.genres.push(genre._id);
            } else {
              movie.genres = [genre._id];
            }
          }
        }

        await movie.save();
      }

      // get all allowed video servers
      const getLang = (videoObj) => videoObj.idioma === 'vose' ? 'en' : videoObj.idioma;
      // eslint-disable-next-line no-undef
      const videoservers = await Server.find();

      // saving video links
      for (let l = 0; l < videoLinks.length; l++) {
        for (let v = 0; v < videoservers.length; v++) {
          const videoObj = videoLinks[l]; // { idioma, url, ... }
          const videoserver = videoservers[v];
          if (videoObj.url.indexOf(videoserver.name) >= 0) {
            strapi.log.info(`CliverScraper :: Saving video link: ${videoObj.url}`);
            // video server allowed found
            // eslint-disable-next-line no-undef
            await Video.create({
              url: videoObj.url,
              videoserver: videoserver._id,
              movie: movie._id,
              lang: getLang(videoObj)
            });
            videolinksCounter++;
          }
        }
      }
    } catch(e) {
      strapi.log.error('Movie scraper :: ' + e.toString());
    }

    // updating sourcepage record
    await strapi.services.sourcepage.addNewHit(page);
    strapi.log.info(`CliverScraper :: Finished scraping with ${videolinksCounter} video links saved`);
  }

};
