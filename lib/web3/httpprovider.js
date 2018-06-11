/*
    This file is part of web3.js.

    web3.js is free software: you can redistribute it and/or modify
    it under the terms of the GNU Lesser General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    web3.js is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Lesser General Public License for more details.

    You should have received a copy of the GNU Lesser General Public License
    along with web3.js.  If not, see <http://www.gnu.org/licenses/>.
*/
/** @file httpprovider.js
 * @authors:
 *   Marek Kotewicz <marek@ethdev.com>
 *   Marian Oancea <marian@ethdev.com>
 *   Fabian Vogelsteller <fabian@ethdev.com>
 * @date 2015
 */

var errors = require('./errors');

// workaround to use httpprovider in different envs
// 需要修改
// weex
var network = weex.requireModule('network');
/**
 * HttpProvider should be used to send rpc calls over http
 */
var HttpProvider = function (host, timeout, user, password, headers) {
  this.host = host || 'http://localhost:8545';
  this.timeout = timeout || 0;
  this.user = user;
  this.password = password;
  this.headers = headers;
};

/**
 * Should be called to prepare new XMLHttpRequest
 *
 * @method prepareRequest
 * @param {Boolean} true if request should be async
 * @return object
 */
HttpProvider.prototype.prepareRequest = function (async) {
  // async 感觉没用了
  var request = {};
  var headers = {};

  request['method'] = 'POST';
  // request['type'] = 'json';
  request['url'] = this.host;

  if (this.user && this.password) {
    var auth = 'Basic ' + new Buffer(this.user + ':' + this.password).toString('base64');
    headers['Authorization'] = auth;
  } 
  headers['Content-Type'] = 'application/json';
  if(this.headers) {
      this.headers.forEach(function(header) {
        headers[header.name] = header.value;
      });
  }
  request['headers'] = headers;
  return request;
};

/**
 * Should be called to make sync request
 *
 * @method send
 * @param {Object} payload
 * @return {Object} result
 */
HttpProvider.prototype.send = function (payload) {
  var request = this.prepareRequest(false);

  var result;
  try {
    request['body'] = JSON.stringify(payload);
    response = network.requestSync(request);
    result = JSON.parse(response['data']);
  } catch (error) {
    throw errors.InvalidConnection(this.host);
  }

  return result;
};

/**
 * Should be used to make async request
 *
 * @method sendAsync
 * @param {Object} payload
 * @param {Function} callback triggered on end with (err, result)
 */
HttpProvider.prototype.sendAsync = function (payload, callback) {
  var request = this.prepareRequest(true);

  try {
    request['body'] = JSON.stringify(payload);
    network.request(request, (response) => {
      result = JSON.parse(response['data']);
      console.log(`result: ${result}`)
      callback(null, result);
    });
  } catch (error) {
    callback(errors.InvalidConnection(this.host));
  }
};

/**
 * Synchronously tries to make Http request
 *
 * @method isConnected
 * @return {Boolean} returns true if request haven't failed. Otherwise false
 */
HttpProvider.prototype.isConnected = function () {
  try {
    this.send({
      id: 9999999999,
      jsonrpc: '2.0',
      method: 'net_listening',
      params: []
    });
    return true;
  } catch (e) {
    return false;
  }
};

module.exports = HttpProvider;
