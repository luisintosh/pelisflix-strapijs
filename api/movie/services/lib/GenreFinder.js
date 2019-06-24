'use strict';

const TMDB = require('./TheMovieDB');

/**
 * Module
 * Find movies without genres and trying to fin its genres
 */
module.exports = {
  async findGenres() {
    strapi.log.info('GenreFinderr :: Finding movies without genres...');
    const movies = await Movie.find({
      $or: [{genres: {$size: 0}}, {genres: {$exists: false}}]
    }); // get all movies
    const genres = await Genre.find();
    const movieCount = await Movie.countDocuments();
    for (let i = 0; i < movieCount; i++) {
      const movie = movies[i];
      if (!movie) continue;
      movie.genres = [];

      strapi.log.info('GenreFinder :: Fetching genres from TMDB Api for ' + movie.tmdb_id);
      const movieApi = await TMDB.findMovieById(movie.tmdb_id);
      if (movieApi && movieApi.genres) {
        for (let x = 0; x < movieApi.genres.length; x++) {
          const g = movieApi.genres[x];
          const genre = genres.find(gen => gen.tmdb_id === g.id);
          movie.genres.push(genre._id);
          strapi.log.info(`GenreFinder :: ${genre._id}`);
        }
      }

      await movie.save();
      strapi.log.info('GenreFinder :: Genres saved! = ' + movie.genres.length);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
};
