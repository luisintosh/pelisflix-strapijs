'use strict';

const TMDB = require('./TheMovieDB');

/**
 * Module
 * Find movies without genres and trying to fin its genres
 */
module.exports = {
    async findGenres() {
        strapi.log.info('GenreFinderr :: Finding movies without genres...');
        const movies = await Movie.find(); // get all movies
        const movieCount = await Movie.countDocuments();
        for (let i = 0; i < movieCount; i++) {
            const movie = movies[i];
            if (!movie.genres) { // movie without genres
                strapi.log.info('GenreFinder :: Fetching genres from TMDB Api for ' + movie.tmdb_id);
                const movieApi = await TMDB.findMovieById(movie.tmdb_id);
                if (movieApi && movieApi.genres) {
                    for (let x = 0; x < movieApi.genres.length; x++) {
                        const g = movieApi.genres[x];
                        const genre = await Genre.findOne({tmdb_id: g.id});
                        if (genre && genre.id) {
                            if (Array.isArray(genre.movie)) {
                                genre.movie.push(movie.id);
                            } else {
                                genre.movie = [movie.id];
                            }
                            await genre.save(); // assign movies to genre
                            strapi.log.info('GenreFinder :: Success!');
                        }
                    }
                }
            }
        }
    }
}
