'use strict';

/**
 * An asynchronous bootstrap function that runs before
 * your application gets started.
 *
 * This gives you an opportunity to set up your data model,
 * run jobs, or perform some special logic.
 */

module.exports = cb => {
  // create genre and server rows in database
  strapi.services.genre.initDatabase();
  strapi.services.server.initDatabase();
  strapi.services.sourcepage.scanSitemaps();

  // fixer
  // strapi.services.movie.movieFixer();

  cb();
};
