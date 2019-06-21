'use strict';

const CliverScraper = require('./lib/CliverScraper');
const Cinecalidad = require('./lib/CinecalidadScraper');
const GenreFinder = require('./lib/GenreFinder');

/**
 * Read the documentation () to implement custom service functions
 */

module.exports = {

  async runScrapers() {
    await CliverScraper.scrape();
    await Cinecalidad.scrape();
  },

  async movieFixer() {
    await GenreFinder.findGenres();
  }
};
