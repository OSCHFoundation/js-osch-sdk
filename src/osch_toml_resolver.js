import axios from 'axios';
import toml from 'toml';
import {Config} from "./config";

// OSCH_TOML_MAX_SIZE is the maximum size of osch.toml file
export const OSCH_TOML_MAX_SIZE = 100 * 1024;

/**
 * OschTomlResolver allows resolving `osch.toml` files.
 */
export class OschTomlResolver {
  /**
   * Returns a parsed `osch.toml` file for a given domain.
   * Returns a `Promise` that resolves to the parsed osch.toml object. If `osch.toml` file does not exist for a given domain or is invalid Promise will reject.
   * ```js
   * OschSdk.OschTomlResolver.resolve('acme.com')
   *   .then(oschToml => {
   *     // oschToml in an object representing domain osch.toml file.
   *   })
   *   .catch(error => {
   *     // osch.toml does not exist or is invalid
   *   });
   * ```
   * @param {string} domain Domain to get osch.toml file for
   * @param {object} [opts]
   * @param {boolean} [opts.allowHttp] - Allow connecting to http servers, default: `false`. This must be set to false in production deployments!
   * @param {number} [opts.timeout] - Allow a timeout, default: 0. Allows user to avoid nasty lag due to TOML resolve issue.
   * @returns {Promise}
   */
  static resolve(domain, opts = {}) {
    let allowHttp = Config.isAllowHttp();
    let timeout = Config.getTimeout();

    if (typeof opts.allowHttp !== 'undefined') {
        allowHttp = opts.allowHttp;
    }

    if (typeof opts.timeout === 'number') {
      timeout = opts.timeout;
    } 

    let protocol = 'https';
    if (allowHttp) {
        protocol = 'http';
    }

    return axios.get(`${protocol}://${domain}/.well-known/osch.toml`, {maxContentLength: OSCH_TOML_MAX_SIZE, timeout})
      .then(response => {
      	try {
            let tomlObject = toml.parse(response.data);
            return Promise.resolve(tomlObject);
        } catch (e) {
            return Promise.reject(new Error(`Parsing error on line ${e.line}, column ${e.column}: ${e.message}`));
        }
      })
      .catch(err => {
        if (err.message.match(/^maxContentLength size/)) {
          throw new Error(`osch.toml file exceeds allowed size of ${OSCH_TOML_MAX_SIZE}`);
        } else {
          throw err;
        }
      });
  }
}
