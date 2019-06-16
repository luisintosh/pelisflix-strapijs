'use strict';

const rp = require('request-promise');
const xmlparse = require('xml-parser');

/**
 * Function to get a list of urls from a sitemap
 */
module.exports = {

  /**
   * Scan a sitemap and get valid urls
   * @param sitemapUrl
   * @param regexFilter
   * @returns {Promise<Array>} => [ { url: 'https://site.com/path' } ]
   */
  async getSitemapUrls(sitemapUrl, regexFilter = '') {
    strapi.log.info('SitemapTools :: Scanning ' + sitemapUrl);
    const filteredUrls = [];

    try {
      const sitemapReq = await rp(sitemapUrl);
      const xmlObject = await xmlparse(sitemapReq);

      strapi.log.info('SitemapTools :: Filtering sitemap URLs with the following regex: ' + regexFilter);

      const regex = new RegExp(regexFilter, 'i');
      xmlObject.root.children.forEach(urlTag => {
        const url = urlTag.children[0].content;
        if (regex.test(url)) {
          filteredUrls.push( {url} );
        }
      });
    } catch (e) {
      strapi.log.error('SitemapTools :: ' + e.toString());
    }

    strapi.log.info('SitemapTools :: Total of URLs found: ' + filteredUrls.length);
    return filteredUrls;
  }

};
