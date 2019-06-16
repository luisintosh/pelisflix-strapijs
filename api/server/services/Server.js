'use strict';

/**
 * Read the documentation () to implement custom service functions
 */

module.exports = {

  /**
   * Create first records
   */
  async initDatabase() {
    const serverCount = await Server.count();

    if (serverCount === 0) {
      strapi.log.info('Creating serve records');
      await Server.create([
        {name: 'openload', url: 'https://openload.co'},
        {name: 'streamango', url: 'https://streamango.com'},
        {name: 'rapidvideo', url: 'https://www.rapidvideo.com'},
        {name: 'mega.nz', url: 'https://mega.nz'},
        {name: 'google', url: 'https://www.google.com'},
        {name: 'fembed', url: 'https://fembed.com'},
        {name: 'ok.ru', url: 'https://ok.ru/'},
      ]);
    }
  }

};
