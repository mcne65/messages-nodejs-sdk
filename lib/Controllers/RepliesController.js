/**
 * messagemedia-messages
 *
 */

'use strict';

const _request = require('../Http/Client/RequestClient');
const _configuration = require('../configuration');
const _apiHelper = require('../APIHelper');
const _baseController = require('./BaseController');
const _logger = require('winston');

class RepliesController {
    /**
     * Mark a reply message as confirmed so it is no longer returned in check replies requests.
     * The confirm replies endpoint is intended to be used in conjunction with the check replies
     * endpoint
     * to allow for robust processing of reply messages. Once one or more reply messages have
     * been processed
     * they can then be confirmed using the confirm replies endpoint so they are no longer
     * returned in
     * subsequent check replies requests.
     * The confirm replies endpoint takes a list of reply IDs as follows:
     * ```json
     * {
     * "reply_ids": [
     * "011dcead-6988-4ad6-a1c7-6b6c68ea628d",
     * "3487b3fa-6586-4979-a233-2d1b095c7718",
     * "ba28e94b-c83d-4759-98e7-ff9c7edb87a1"
     * ]
     * }
     * ```
     * Up to 100 replies can be confirmed in a single confirm replies request.
     *
     * @param {ConfirmRepliesAsReceivedRequest} body TODO: type description here
     *
     * @callback    The callback function that returns response from the API call
     *
     * @returns {Promise}
     */
    static createConfirmRepliesAsReceived(body, callback) {
        _logger.info('createConfirmRepliesAsReceived being called');
        // create empty callback if absent
        const _callback = typeof callback === 'function' ? callback : () => undefined;

        // prepare query string for API call
        _logger.info('Preparing Query URL for createConfirmRepliesAsReceived');
        const _baseUri = _configuration.BASEURI;

        const _queryBuilder = `${_baseUri}${'/v1/replies/confirmed'}`;

        // validate and preprocess url
        const _queryUrl = _apiHelper.cleanUrl(_queryBuilder);

        // prepare headers
        _logger.info('Preparing headers for createConfirmRepliesAsReceived');
        const _headers = {
            accept: 'application/json',
            'content-type': 'application/json; charset=utf-8',
            'user-agent': 'messagemedia-messages-nodejs-sdk-1.0.0',
        };

        // remove null values
        _apiHelper.cleanObject(body);

        // construct the request
        const _options = {
            queryUrl: _queryUrl,
            method: 'POST',
            headers: _headers,
            body: _apiHelper.jsonSerialize(body),
            username: _configuration.basicAuthUserName,
            password: _configuration.basicAuthPassword,
        };
        _logger.debug(`'Raw request for createConfirmRepliesAsReceived  > ${JSON.stringify(_options)}'`);

        // build the response processing.
        return new Promise((_fulfill, _reject) => {
            _logger.info('Sending request for createConfirmRepliesAsReceived...');
            _request(_options, (_error, _response, _context) => {
                let errorResponse;
                if (_error) {
                    _logger.error(_error);
                    errorResponse = _baseController.validateResponse(_context, 'createConfirmRepliesAsReceived');
                    _callback(errorResponse.error, errorResponse.response, errorResponse.context);
                    _reject(errorResponse.error);
                } else if (_response.statusCode >= 200 && _response.statusCode <= 206) {
                    _logger.debug(`'Raw response for createConfirmRepliesAsReceived...  > ${JSON.stringify(_response)}'`);
                    const parsed = JSON.parse(_response.body);
                    _callback(null, parsed, _context);
                    _fulfill(parsed);
                } else if (_response.statusCode === 400) {
                    _baseController.printErrorLog(_response.statusCode, 'createConfirmRepliesAsReceived');
                    const _err = { errorMessage: '', errorCode: 400, errorResponse: _response.body };
                    _callback(_err, null, _context);
                    _reject(_err);
                } else {
                    _logger.info('Validating response for createConfirmRepliesAsReceived ');
                    errorResponse = _baseController.validateResponse(_context, 'createConfirmRepliesAsReceived');
                    _callback(errorResponse.error, errorResponse.response, errorResponse.context);
                    _reject(errorResponse.error);
                }
            });
        });
    }

    /**
     * Check for any replies that have been received.
     * Replies are messages that have been sent from a handset in response to a message sent by
     * an
     * application or messages that have been sent from a handset to a inbound number associated
     * with
     * an account, known as a dedicated inbound number (contact <support@messagemedia.com> for
     * more
     * information on dedicated inbound numbers).
     * Each request to the check replies endpoint will return any replies received that have not
     * yet
     * been confirmed using the confirm replies endpoint. A response from the check replies
     * endpoint
     * will have the following structure:
     * ```json
     * {
     * "replies": [
     * {
     * "metadata": {
     * "key1": "value1",
     * "key2": "value2"
     * },
     * "message_id": "877c19ef-fa2e-4cec-827a-e1df9b5509f7",
     * "reply_id": "a175e797-2b54-468b-9850-41a3eab32f74",
     * "date_received": "2016-12-07T08:43:00.850Z",
     * "callback_url": "https://my.callback.url.com",
     * "destination_number": "+61491570156",
     * "source_number": "+61491570157",
     * "vendor_account_id": {
     * "vendor_id": "MessageMedia",
     * "account_id": "MyAccount"
     * },
     * "content": "My first reply!"
     * },
     * {
     * "metadata": {
     * "key1": "value1",
     * "key2": "value2"
     * },
     * "message_id": "8f2f5927-2e16-4f1c-bd43-47dbe2a77ae4",
     * "reply_id": "3d8d53d8-01d3-45dd-8cfa-4dfc81600f7f",
     * "date_received": "2016-12-07T08:43:00.850Z",
     * "callback_url": "https://my.callback.url.com",
     * "destination_number": "+61491570157",
     * "source_number": "+61491570158",
     * "vendor_account_id": {
     * "vendor_id": "MessageMedia",
     * "account_id": "MyAccount"
     * },
     * "content": "My second reply!"
     * }
     * ]
     * }
     * ```
     * Each reply will contain details about the reply message, as well as details of the message
     * the reply was sent
     * in response to, including any metadata specified. Every reply will have a reply ID to be
     * used with the
     * confirm replies endpoint.
     * *Note: The source number and destination number properties in a reply are the inverse of
     * those
     * specified in the message the reply is in response to. The source number of the reply
     * message is the
     * same as the destination number of the original message, and the destination number of the
     * reply
     * message is the same as the source number of the original message. If a source number
     * wasn't specified in the original message, then the destination number property will not be
     * present
     * in the reply message.*
     * Subsequent requests to the check replies endpoint will return the same reply messages and
     * a maximum
     * of 100 replies will be returned in each request. Applications should use the confirm
     * replies endpoint
     * in the following pattern so that replies that have been processed are no longer returned
     * in
     * subsequent check replies requests.
     * 1. Call check replies endpoint
     * 2. Process each reply message
     * 3. Confirm all processed reply messages using the confirm replies endpoint
     * *Note: It is recommended to use the Webhooks feature to receive reply messages rather than
     * polling
     * the check replies endpoint.*
     *
     * @callback    The callback function that returns response from the API call
     *
     * @returns {Promise}
     */
    static getCheckReplies(callback) {
        _logger.info('getCheckReplies being called');
        // create empty callback if absent
        const _callback = typeof callback === 'function' ? callback : () => undefined;

        // prepare query string for API call
        _logger.info('Preparing Query URL for getCheckReplies');
        const _baseUri = _configuration.BASEURI;

        const _queryBuilder = `${_baseUri}${'/v1/replies'}`;

        // validate and preprocess url
        const _queryUrl = _apiHelper.cleanUrl(_queryBuilder);

        // prepare headers
        _logger.info('Preparing headers for getCheckReplies');
        const _headers = {
            accept: 'application/json',
            'user-agent': 'messagemedia-messages-nodejs-sdk-1.0.0',
        };

        // construct the request
        const _options = {
            queryUrl: _queryUrl,
            method: 'GET',
            headers: _headers,
            username: _configuration.basicAuthUserName,
            password: _configuration.basicAuthPassword,
        };
        _logger.debug(`'Raw request for getCheckReplies  > ${JSON.stringify(_options)}'`);

        // build the response processing.
        return new Promise((_fulfill, _reject) => {
            _logger.info('Sending request for getCheckReplies...');
            _request(_options, (_error, _response, _context) => {
                let errorResponse;
                if (_error) {
                    _logger.error(_error);
                    errorResponse = _baseController.validateResponse(_context, 'getCheckReplies');
                    _callback(errorResponse.error, errorResponse.response, errorResponse.context);
                    _reject(errorResponse.error);
                } else if (_response.statusCode >= 200 && _response.statusCode <= 206) {
                    _logger.debug(`'Raw response for getCheckReplies...  > ${JSON.stringify(_response)}'`);
                    let parsed = JSON.parse(_response.body);
                    _logger.info('Deserializing response for getCheckReplies');
                    parsed = _baseController.getObjectMapper().mapObject(parsed, 'CheckRepliesResponse');
                    _callback(null, parsed, _context);
                    _fulfill(parsed);
                } else {
                    _logger.info('Validating response for getCheckReplies ');
                    errorResponse = _baseController.validateResponse(_context, 'getCheckReplies');
                    _callback(errorResponse.error, errorResponse.response, errorResponse.context);
                    _reject(errorResponse.error);
                }
            });
        });
    }

}

module.exports = RepliesController;
