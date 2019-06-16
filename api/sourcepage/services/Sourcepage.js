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
  }

};
