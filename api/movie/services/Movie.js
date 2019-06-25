'use strict';

const CliverScraper = require('./lib/CliverScraper');
const Cinecalidad = require('./lib/CinecalidadScraper');
const GenreFinder = require('./lib/GenreFinder');

/**
 * Read the documentation () to implement custom service functions
 */

module.exports = {

  /**
   * Get all movies without population of relations
   * @returns {*}
   */
  async getAllMovies() {
    // eslint-disable-next-line no-undef
    return await Movie.find()
      .sort({'release_date': -1})
      .select('id title poster_path vote_average release_date genres');
  },

  async runScrapers() {
    await CliverScraper.scrape();
    await Cinecalidad.scrape();
  },

  async movieFixer() {
    await GenreFinder.findGenres();
  }
};
