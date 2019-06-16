'use strict';

/**
 * Cron config that gives you an opportunity
 * to run scheduled jobs.
 *
 * The cron format consists of:
 * [MINUTE] [HOUR] [DAY OF MONTH] [MONTH OF YEAR] [DAY OF WEEK] [YEAR (optional)]
 */

module.exports = {

  /**
   * Simple example.
   * Every monday at 1am.
   */

  // '0 1 * * 1': () => {
  //
  // }

  // Run every day at 4 am
  '0 4 * * *': async () => {
    strapi.log.info('CRON: Running sitemap scanning');
    await strapi.services.sourcepage.scanSitemaps();
  },

  // Run every 3 minutes
  '*/3 * * * *': async () => {
    strapi.log.info('CRON: Running web scraping');
    await strapi.services.movie.runScrapers();
  },
};
