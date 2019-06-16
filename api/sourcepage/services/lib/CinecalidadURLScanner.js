'use strict';

const xRay = require('x-ray');
const x = xRay();

/**
 * Function to get a list of urls from a page
 */
module.exports = {

  /**
   * Scan cinecalidad.to and get movie urls
   * @returns {Promise<Array>} => [ { url: 'https://site.com/path' } ]
   */
  async getURLs(firstScan = false) {
    const baseURL = 'https://www.cinecalidad.to';
    let urls = [];
    strapi.log.info('CinecalidadURLScanner :: Scanning ' + baseURL);

    try {

      urls = await x(baseURL, '#content_inside .post_box', [ 'a@href', ])
        .paginate('a.nextpostslink@href')
        .limit(firstScan ? 10000 : 10)
        .then(response => response.map(url => ({ url })));

    } catch(e) {
      strapi.log.error('CinecalidadURLScanner :: ' + e.toString());
    }

    strapi.log.info('CinecalidadURLScanner :: Total of URLs found ' + urls.length);
    return urls;
  }

};
