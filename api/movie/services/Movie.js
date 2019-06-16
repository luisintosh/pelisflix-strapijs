'use strict';

const CliverScraper = require('./lib/CliverScraper');

/**
 * Read the documentation () to implement custom service functions
 */

module.exports = {

  async runScrapers() {
    await CliverScraper.scrape();
  }

};
