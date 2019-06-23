const xRay = require('x-ray');
const TMDB = require('./TheMovieDB');

const x = xRay({
  filters: {
    trim: (value) => {
      return typeof value === 'string' ? value.trim() : value;
    },
    reverse: (value) => {
      return typeof value === 'string'
        ? value
          .split('')
          .reverse()
          .join('')
        : value;
    },
    slice: (value, start, end) => {
      return typeof value === 'string' ? value.slice(start, end) : value;
    },
    lowerCase: value => {
      return typeof value === 'string' ? value.toLowerCase() : value;
    },
    movieTitle: (value) => {
      return typeof value === 'string' ? value.split('(')[0] : value;
    },
    movieYear: (value) => {
      if (typeof value === 'string') {
        let year = value.match(/\(\d{4}\)/);
        if (!year) return '';
        year = year[0];
        year = year.replace('(', '');
        year = year.replace(')', '');
        return year;
      }
      return value;
    },
  },
});


/**
 * Decode video ID from cinecalidad.to
 * @param {String} str
 */
const decodeVideoServerId = (str) => {
  let d = '';
  const codes = str.split(' ');
  for (const code of codes) {
    d += String.fromCharCode(parseInt(code) - 2);
  }

  return d;
};


const getVideoLinks = async (pageUrl) => {
  strapi.log.info('Cinecalidad :: Getting video links');

  const videoServerUrls = {
    openload: {
      url: 'https://openload.co/f/',
      id: '5cc3cd269a484442152d7c72',
    },
    streamango: {
      url: 'https://streamango.com/f/',
      id: '5cc3cd3d9a484442152d7c73',
    },
    rapidvideo: {
      url: 'https://www.rapidvideo.com/v/',
      id: '5cc3cd539a484442152d7c74',
    },
    mega: {
      url: 'https://mega.nz/#!',
      id: '5cc3cd639a484442152d7c75',
    },
  };

  let originalTitle = null;
  let year = null;
  let videoLinks = [];

  try {
    const response = await x(pageUrl, '.single_left', {
      title: 'h1 | movieTitle | trim',
      year: 'h1 | movieYear | trim',
      videoServers: ['a.onlinelink[service]@service | lowerCase'],
      videoIds: ['a.onlinelink[data]@data'],
    });

    originalTitle = response.title;
    year = response.year;

    response.videoServers.forEach((element, index) => {
      const videoServer = element.replace('online', '');
      strapi.log.info(`Cinecalidad :: Cheking video server: ${videoServer}`);
      if (videoServerUrls[videoServer]) {
        const videoLink = `${videoServerUrls[videoServer]['url']}${decodeVideoServerId(response.videoIds[index])}`;
        videoLinks.push({
          url: videoLink,
          lang: 'es_la'
        });
      }
    });
  } catch (e) {
    strapi.log.error('Cinecalidad :: ' + e.toString());
  }

  // Bohemian Rhapsody, 2018, [ { lang, url, ... } ]
  const result = {originalTitle, year, videoLinks};
  // strapi.log.info('Cinecalidad :: Page result ' + JSON.stringify(result));
  return result;
};


/**
 * Module
 * @type {{scrapeMovies(): Promise<*>}}
 */
module.exports = {

  async scrape() {
    strapi.log.info('Cinecalidad :: Init scraping');
    const page = await strapi.services.sourcepage.getPageUrl('cinecalidad');

    if (!page) {
      strapi.log.info('Cinecalidad :: No pending page found');
      return null;
    } else {
      strapi.log.info('Cinecalidad :: Scraping page ' + page.url);
    }

    let movie = null;
    let videolinksCounter = 0;

    try {
      // get all video links
      const {originalTitle, year, videoLinks} = await getVideoLinks(page.url);

      if (videoLinks && !videoLinks.length) {
        // strapi.log.error('Cinecalidad :: No video links found');
        throw 'No video links found';
      } else {
        strapi.log.info(`Cinecalidad :: ${videoLinks.length} video links found`);
      }

      // get movie info
      const movieObj = await TMDB.findMovieByTitle(originalTitle, year);

      if (!movieObj) {
        // strapi.log.error('Cinecalidad :: No movie found');
        throw 'No movie found';
      } else {
        strapi.log.info(`Cinecalidad :: Movie found ${movieObj.title} (${movieObj.release_date})`);
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

      // eslint-disable-next-line no-undef
      const videoservers = await Server.find();

      // saving video links
      for (let l = 0; l < videoLinks.length; l++) {
        for (let v = 0; v < videoservers.length; v++) {
          const videoObj = videoLinks[l]; // { lang, url, ... }
          const videoserver = videoservers[v];
          if (videoObj.url.indexOf(videoserver.name) >= 0) {
            strapi.log.info(`Cinecalidad :: Saving video link: ${videoObj.url}`);
            // video server allowed found
            // eslint-disable-next-line no-undef
            await Video.create({
              url: videoObj.url,
              videoserver: videoserver._id,
              movie: movie._id,
              lang: videoObj.lang
            });
            videolinksCounter++;
          }
        }
      }
    } catch(e) {
      strapi.log.error('Cinecalidad :: ' + e.toString());
    }

    // updating sourcepage record
    await strapi.services.sourcepage.addNewHit(page);
    strapi.log.info(`Cinecalidad :: Finished scraping with ${videolinksCounter} video links saved`);
  }

};
