'use strict';

/**
 * Read the documentation () to implement custom controller functions
 */

module.exports = {
  getAll(ctx) {
    return strapi.services.movie.getAllMovies();
  }
};
