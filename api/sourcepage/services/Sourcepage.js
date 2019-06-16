'use strict';

const SitemapTools = require('./lib/SitemapTools');
const CinecalidadURLScanner = require('./lib/CinecalidadURLScanner');

/**
 * Read the documentation () to implement custom service functions
 */

module.exports = {

  /**
   * Scan sitemaps for new URLs to scrape
   * @returns {Promise<void>}
   */
  async scanSitemaps() {
    try {
      // Scan websites
      strapi.log.info('Sourcepage scanSitemaps :: Init function');
      // eslint-disable-next-line no-undef
      const firstScan = !(await Sourcepage.count()); // if no records found

      const cliverURLs = await SitemapTools.getSitemapUrls('http://www.cliver.to/sitemap.xml', '/pelicula/');
      const cinecalidadURLs = await CinecalidadURLScanner.getURLs(firstScan);
      // Merge url lists
      let urls = [
        ...cliverURLs,
        ...cinecalidadURLs
      ];

      // Find duplicated records
      strapi.log.info('Sourcepage scanSitemaps :: Find duplicated records');
      // eslint-disable-next-line no-undef
      const lastRecords = await Sourcepage.find().exec();
      urls = urls.filter(url => !(lastRecords.find(r => r.url === url.url)));

      // Create records
      // eslint-disable-next-line no-undef
      await Sourcepage.create(urls);
      strapi.log.info('Sourcepage scanSitemaps :: New URLs saved, total: ' + urls.length);
    } catch (e) {
      strapi.log.error('Sourcepage scanSitemaps :: ' + e.toString());
    }
  },

  /**
   * Get a page url with the date of last scrapping lower than this month
   * @returns {*}
   */
  getPageUrl(filter) {
    const lastMonth = new Date();
    if (lastMonth.getMonth() === 0) {
      lastMonth.setFullYear(lastMonth.getFullYear() - 1, 11);
    } else {
      lastMonth.setMonth(lastMonth.getMonth() - 1);
    }
    // return next page url to do scraping
    // eslint-disable-next-line no-undef
    return Sourcepage.findOne({
      $or: [ { lastScraped: { $exists: false } }, { lastScraped: { $lte: lastMonth } } ],
      url: new RegExp(filter, 'i')
    });
  },

  /**
   * Update model 'lastScraped' and 'hits' value
   * @param model: Sourcepage
   * @returns {*|void}
   */
  addNewHit(model) {
    strapi.log.info('Sourcepage :: Updating model with a new hit');
    model.lastScraped = new Date();
    model.hits += 1;
    return model.save();
  },



};
