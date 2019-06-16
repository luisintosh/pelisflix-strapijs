const rp = require('request-promise');

// API endpoints
const TMDB_DATA_API = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_API = 'https://image.tmdb.org/t/p/w500';
const TMDB_API_KEY = 'fe3441f1141d0196584be5ffeb46a14a';
const TMDB_API_LANG = 'es';


module.exports = {

  findMovieByTitle: (title, year = null) => {
    return rp(`${TMDB_DATA_API}/search/movie`, {
      qs: {
        api_key: TMDB_API_KEY,
        language: TMDB_API_LANG,
        query: title.trim(),
        year,
        page: 1,
        include_adult: true,
      },
      json: true
    })
      .then((response) => {
        if (response.total_results > 0) {
          const movie = response.results[0];
          if (movie.backdrop_path)
            movie.backdrop_path = TMDB_IMAGE_API + movie.backdrop_path;
          if (movie.poster_path)
            movie.poster_path = TMDB_IMAGE_API + movie.poster_path;
          return movie;
        } else {
          return null;
        }
      });
  },

};
