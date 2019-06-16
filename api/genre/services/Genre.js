'use strict';

/**
 * Read the documentation () to implement custom service functions
 */

module.exports = {

  /**
   * Create first records
   */
  async initDatabase() {
    const genreCount = await Genre.count();

    if (genreCount === 0) {
      strapi.log.info('Creating first Video Server records');
      await Genre.create([
        {name: 'Acción', tmdb_id: 28},
        {name: 'Aventura', tmdb_id: 12},
        {name: 'Animación', tmdb_id: 16},
        {name: 'Comedia', tmdb_id: 35},
        {name: 'Crimen', tmdb_id: 80},
        {name: 'Documental', tmdb_id: 99},
        {name: 'Drama', tmdb_id: 18},
        {name: 'Familia', tmdb_id: 10751},
        {name: 'Fantasía', tmdb_id: 14},
        {name: 'Historia', tmdb_id: 36},
        {name: 'Terror', tmdb_id: 27},
        {name: 'Música', tmdb_id: 10402},
        {name: 'Misterio', tmdb_id: 9648},
        {name: 'Romance', tmdb_id: 10749},
        {name: 'Ciencia Ficción', tmdb_id: 878},
        {name: 'Película de TV', tmdb_id: 10770},
        {name: 'Suspenso', tmdb_id: 53},
        {name: 'Bélica', tmdb_id: 10752},
        {name: 'Western', tmdb_id: 37},
      ]);
    }
  }

};
