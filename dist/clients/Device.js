'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DEVICE_MESSAGE_EVENTS_NAMES = exports.SYSTEM_EVENT_NAMES = exports.DEVICE_EVENT_NAMES = undefined;

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _h = require('h5.coap');

var _settings = require('../settings');

var _settings2 = _interopRequireDefault(_settings);

var _CryptoManager = require('../lib/CryptoManager');

var _CryptoManager2 = _interopRequireDefault(_CryptoManager);

var _Messages = require('../lib/Messages');

var _Messages2 = _interopRequireDefault(_Messages);

var _FileTransferStore = require('../lib/FileTransferStore');

var _FileTransferStore2 = _interopRequireDefault(_FileTransferStore);

var _Flasher = require('../lib/Flasher');

var _Flasher2 = _interopRequireDefault(_Flasher);

var _logger = require('../lib/logger');

var _logger2 = _interopRequireDefault(_logger);

var _h2 = require('h5.buffers');

var _nullthrows = require('nullthrows');

var _nullthrows2 = _interopRequireDefault(_nullthrows);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Hello — sent first by Core then by Server immediately after handshake, never again
// Ignored — sent by either side to respond to a message with a bad counter value.
// The receiver of an Ignored message can optionally decide to resend a previous message
// if the indicated bad counter value matches a recently sent message.

// package flasher
// Chunk — sent by Server to send chunks of a firmware binary to Core
// ChunkReceived — sent by Core to respond to each chunk,
// indicating the CRC of the received chunk data.
// if Server receives CRC that does not match the chunk just sent, that chunk is sent again
// UpdateBegin — sent by Server to initiate an OTA firmware update
// UpdateReady — sent by Core to indicate readiness to receive firmware chunks
// UpdateDone — sent by Server to indicate all firmware chunks have been sent

// FunctionCall — sent by Server to tell Core to call a user-exposed function
// FunctionReturn — sent by Core in response to FunctionCall to indicate return value.
// void functions will not send this message
// VariableRequest — sent by Server to request the value of a user-exposed variable
// VariableValue — sent by Core in response to VariableRequest to indicate the value

// Event — sent by Core to initiate a Server Sent Event and optionally
// an HTTP callback to a 3rd party
// KeyChange — sent by Server to change the AES credentials

/**
 * How high do our counters go before we wrap around to 0?
 * (CoAP maxes out at a 16 bit int)
 */
var COUNTER_MAX = 65536;
/**
 * How big can our tokens be in CoAP messages?
 */
/*
*   Copyright (c) 2015 Particle Industries, Inc.  All rights reserved.
*
*   This program is free software; you can redistribute it and/or
*   modify it under the terms of the GNU Lesser General Public
*   License as published by the Free Software Foundation, either
*   version 3 of the License, or (at your option) any later version.
*
*   This program is distributed in the hope that it will be useful,
*   but WITHOUT ANY WARRANTY; without even the implied warranty of
*   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
*   Lesser General Public License for more .
*
*   You should have received a copy of the GNU Lesser General Public
*   License along with this program; if not, see <http://www.gnu.org/licenses/>.
*
* 
*
*/

var TOKEN_COUNTER_MAX = 256;
var KEEP_ALIVE_TIMEOUT = _settings2.default.keepaliveTimeout;
var SOCKET_TIMEOUT = _settings2.default.socketTimeout;

var DEVICE_EVENT_NAMES = exports.DEVICE_EVENT_NAMES = {
  DISCONNECT: 'disconnect',
  FLASH_FAILED: 'flash/failed',
  FLASH_STARTED: 'flash/started',
  FLASH_SUCCESS: 'flash/success',
  READY: 'ready'
};

var SYSTEM_EVENT_NAMES = exports.SYSTEM_EVENT_NAMES = {
  APP_HASH: 'spark/device/app-hash',
  CLAIM_CODE: 'spark/device/claim/code',
  FLASH_AVAILABLE: 'spark/flash/available',
  FLASH_PROGRESS: 'spark/flash/progress',
  FLASH_STATUS: 'spark/flash/status',
  GET_IP: 'spark/device/ip',
  GET_NAME: 'spark/device/name',
  GET_RANDOM_BUFFER: 'spark/device/random',
  IDENTITY: 'spark/device/ident/0',
  LAST_RESET: 'spark/device/last_reset', // This should just have a friendly string in its payload.
  MAX_BINARY: 'spark/hardware/max_binary',
  OTA_CHUNK_SIZE: 'spark/hardware/ota_chunk_size',
  RESET: 'spark/device/reset', // send this to reset passing "safe mode"/"dfu"/"reboot"
  SAFE_MODE: 'spark/device/safemode',
  SAFE_MODE_UPDATING: 'spark/safe-mode-updater/updating',
  SPARK_SUBSYSTEM: 'spark/cc3000-patch-version',
  SPARK_STATUS: 'spark/status'
};

// These constants should be consistent with message names in
// MessageSpecifications.js
var DEVICE_MESSAGE_EVENTS_NAMES = exports.DEVICE_MESSAGE_EVENTS_NAMES = {
  GET_TIME: 'GetTime',
  PRIVATE_EVENT: 'PrivateEvent',
  PUBLIC_EVENT: 'PublicEvent',
  SUBSCRIBE: 'Subscribe'
};

// Setup IPC Server for load balancing
const serverid = "10.0.1.6";
var ipc = require('node-ipc');
ipc.config.id   = 'cloud-server-'+serverid;
ipc.config.retry= 10;

ipc.connectToNet(
    'routingdb',
    '10.0.1.7',
    2000,
    function(){
        ipc.of.routingdb.on(
            'connect',
            function(){
                ipc.log('## connected to routingdb ##'.rainbow, ipc.config.delay);
            }
        );
        ipc.of.routingdb.on(
            'disconnect',
            function(){
                ipc.log('disconnected from routingdb'.notice);
            }
        );
        ipc.of.routingdb.on(
            'results',  //any event or message type your server listens for 
            function(data){
                ipc.log('got a message from routingdb : '.debug, data);
            }
        );
    }
);

/**
 * Implementation of the Particle messaging protocol
 * @Device
 */

var Device = function (_EventEmitter) {
  (0, _inherits3.default)(Device, _EventEmitter);

  function Device(socket, connectionKey, handshake) {
    var _this2 = this;

    (0, _classCallCheck3.default)(this, Device);

    var _this = (0, _possibleConstructorReturn3.default)(this, (Device.__proto__ || (0, _getPrototypeOf2.default)(Device)).call(this));

    _this._cipherStream = null;
    _this._connectionKey = null;
    _this._connectionStartTime = null;
    _this._decipherStream = null;
    _this._deviceFunctionState = null;
    _this._disconnectCounter = 0;
    _this._id = '';
    _this._lastCorePing = new Date();
    _this._maxBinarySize = null;
    _this._otaChunkSize = null;
    _this._particleProductId = 0;
    _this._platformId = 0;
    _this._productFirmwareVersion = 0;
    _this._recieveCounter = 0;
    _this._sendCounter = 0;
    _this._sendToken = 0;
    _this._tokens = {};

    _this.setMaxBinarySize = function (maxBinarySize) {
      _this._maxBinarySize = maxBinarySize;
    };

    _this.setOtaChunkSize = function (maxBinarySize) {
      _this._otaChunkSize = maxBinarySize;
    };

    _this.startupProtocol = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
      return _regenerator2.default.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _this._socket.setNoDelay(true);
              _this._socket.setKeepAlive(true, KEEP_ALIVE_TIMEOUT); // every 15 second(s)
              _this._socket.setTimeout(SOCKET_TIMEOUT);

              _this._socket.on('error', function (error) {
                return _this.disconnect('socket error: ' + error.message);
              });
              _this._socket.on('close', function () {
                return _this.disconnect('socket close');
              });
              _this._socket.on('timeout', function () {
                return _this.disconnect('socket timeout');
              });

              _context.next = 8;
              return _this.startHandshake();

            case 8:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, _this2);
    }));
    _this.startHandshake = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3() {
      return _regenerator2.default.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _context3.prev = 0;
              return _context3.delegateYield(_regenerator2.default.mark(function _callee2() {
                var _ref3, cipherStream, decipherStream, deviceID, handshakeBuffer, pendingBuffers;

                return _regenerator2.default.wrap(function _callee2$(_context2) {
                  while (1) {
                    switch (_context2.prev = _context2.next) {
                      case 0:
                        _context2.next = 2;
                        return _this._handshake.start(_this);

                      case 2:
                        _ref3 = _context2.sent;
                        cipherStream = _ref3.cipherStream;
                        decipherStream = _ref3.decipherStream;
                        deviceID = _ref3.deviceID;
                        handshakeBuffer = _ref3.handshakeBuffer;
                        pendingBuffers = _ref3.pendingBuffers;

                        _this._id = deviceID;

                        _this._getHello(handshakeBuffer);
                        _this._sendHello(cipherStream, decipherStream);

                        _this.ready();

                        pendingBuffers.map(function (data) {
                          return _this.routeMessage(data);
                        });
                        decipherStream.on('readable', function () {
                          var chunk = decipherStream.read();
                          if (!chunk) {
                            return;
                          }
                          _this.routeMessage(chunk);
                        });

                      case 14:
                      case 'end':
                        return _context2.stop();
                    }
                  }
                }, _callee2, _this2);
              })(), 't0', 2);

            case 2:
              _context3.next = 7;
              break;

            case 4:
              _context3.prev = 4;
              _context3.t1 = _context3['catch'](0);

              _this.disconnect(_context3.t1);

            case 7:
            case 'end':
              return _context3.stop();
          }
        }
      }, _callee3, _this2, [[0, 4]]);
    }));

    _this._getHello = function (chunk) {
      var message = _Messages2.default.unwrap(chunk);
      if (!message) {
        throw new Error('failed to parse hello');
      }

      _this._recieveCounter = message.getId();

      try {
        var payload = message.getPayload();
        if (payload.length <= 0) {
          return;
        }

        var payloadBuffer = new _h2.BufferReader(payload);
        _this._particleProductId = payloadBuffer.shiftUInt16();
        _this._productFirmwareVersion = payloadBuffer.shiftUInt16();
        _this._platformId = payloadBuffer.shiftUInt16();
      } catch (exception) {
        _logger2.default.log('error while parsing hello payload ', exception);
      }
    };

    _this._sendHello = function (cipherStream, decipherStream) {
      _this._cipherStream = cipherStream;
      _this._decipherStream = decipherStream;

      // client will set the counter property on the message
      _this._sendCounter = _CryptoManager2.default.getRandomUINT16();
      _this.sendMessage('Hello', {}, null);
    };

    _this.ready = function () {
      _this._connectionStartTime = new Date();

      //Send update to RoutingDB
      ipc.of.routingdb.emit(
          'update', 
          JSON.stringify({deviceid: this._id, server: serverid})
      );

      _logger2.default.log('On Device Ready:\r\n', {
        cache_key: _this._connectionKey,
        deviceID: _this._id,
        firmwareVersion: _this._productFirmwareVersion,
        ip: _this.getRemoteIPAddress(),
        platformID: _this._platformId,
        productID: _this._particleProductId
      });

      _this.emit(DEVICE_EVENT_NAMES.READY);
    };

    _this.ping = function () {
      if (_settings2.default.logApiMessages) {
        _logger2.default.log('Pinged, replying', { deviceID: _this._id });
      }

      return {
        connected: _this._socket !== null,
        lastPing: _this._lastCorePing
      };
    };

    _this.routeMessage = function (data) {
      var message = _Messages2.default.unwrap(data);
      if (!message) {
        _logger2.default.error('routeMessage got a NULL coap message ', { deviceID: _this._id });
        return;
      }

      // should be adequate
      var messageCode = message.getCode();
      var requestType = '';
      if (messageCode > _h.Message.Code.EMPTY && messageCode <= _h.Message.Code.DELETE) {
        // probably a request
        requestType = _Messages2.default.getRequestType(message);
      }

      if (!requestType) {
        requestType = _this._getResponseType(message.getTokenString());
      }

      if (message.isAcknowledgement()) {
        if (!requestType) {
          // no type, can't route it.
          requestType = 'PingAck';
        }

        _this.emit(requestType, message);
        return;
      }

      _this._incrementReceiveCounter();
      if (message.isEmpty() && message.isConfirmable()) {
        _this._lastCorePing = new Date();
        _this.sendReply('PingAck', message.getId());
        return;
      }

      if (!message || message.getId() !== _this._recieveCounter) {
        _logger2.default.log('got counter ', message.getId(), ' expecting ', _this._recieveCounter, { deviceID: _this._id });

        if (requestType === 'Ignored') {
          // don't ignore an ignore...
          _this.disconnect('Got an Ignore');
          return;
        }

        // this.sendMessage('Ignored', null, {}, null, null);
        _this.disconnect('Bad Counter');
        return;
      }

      _this.emit(requestType || '', message);
    };

    _this.sendReply = function (messageName, id, data, token, requester) {
      if (!_this._isSocketAvailable(requester || null, messageName)) {
        _logger2.default.error('This client has an exclusive lock.');
        return;
      }

      // if my reply is an acknowledgement to a confirmable message
      // then I need to re-use the message id...

      // set our counter
      if (id < 0) {
        _this._incrementSendCounter();
        id = _this._sendCounter;
      }

      var message = _Messages2.default.wrap(messageName, id, null, data, token, null);
      if (!message) {
        _logger2.default.error('Device - could not unwrap message', { deviceID: _this._id });
        return;
      }

      if (!_this._cipherStream) {
        _logger2.default.error('Device - sendReply before READY', { deviceID: _this._id });
        return;
      }
      _this._cipherStream.write(message);
    };

    _this.sendMessage = function (messageName, params, data, requester) {
      if (!_this._isSocketAvailable(requester, messageName)) {
        _logger2.default.error('This client has an exclusive lock.');
        return -1;
      }

      // increment our counter
      _this._incrementSendCounter();

      var token = null;
      if (!_Messages2.default.isNonTypeMessage(messageName)) {
        _this._incrementSendToken();
        _this._useToken(messageName, _this._sendToken);
        token = _this._sendToken;
      }

      var message = _Messages2.default.wrap(messageName, _this._sendCounter, params, data, token);

      if (!message) {
        _logger2.default.error('Could not wrap message', messageName, params, data);
        return -1;
      }

      if (!_this._cipherStream) {
        _logger2.default.error('Client - sendMessage before READY', { deviceID: _this._id, messageName: messageName });
        return -1;
      }

      _this._cipherStream.write(message);

      return token || 0;
    };

    _this.listenFor = function () {
      var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4(eventName, uri, token) {
        var tokenHex, beVerbose;
        return _regenerator2.default.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                tokenHex = token ? _this._toHexString(token) : null;
                beVerbose = _settings2.default.showVerboseDeviceLogs;
                return _context4.abrupt('return', new _promise2.default(function (resolve, reject) {
                  var timeout = setTimeout(function () {
                    cleanUpListeners();
                    reject('Request timed out');
                  }, KEEP_ALIVE_TIMEOUT);

                  // adds a one time event
                  var handler = function handler(message) {
                    clearTimeout(timeout);
                    if (uri && message.getUriPath().indexOf(uri) !== 0) {
                      if (beVerbose) {
                        _logger2.default.log('URI filter did not match', uri, message.getUriPath(), { deviceID: _this._id });
                      }
                      return;
                    }

                    if (tokenHex && tokenHex !== message.getTokenString()) {
                      if (beVerbose) {
                        _logger2.default.log('Tokens did not match ', tokenHex, message.getTokenString(), { deviceID: _this._id });
                      }
                      return;
                    }

                    cleanUpListeners();
                    resolve(message);
                  };

                  var disconnectHandler = function disconnectHandler() {
                    cleanUpListeners();
                    reject();
                  };

                  var cleanUpListeners = function cleanUpListeners() {
                    _this.removeListener(eventName, handler);
                    _this.removeListener('disconnect', disconnectHandler);
                  };

                  _this.on(eventName, handler);
                  _this.on('disconnect', disconnectHandler);
                }));

              case 3:
              case 'end':
                return _context4.stop();
            }
          }
        }, _callee4, _this2);
      }));

      return function (_x, _x2, _x3) {
        return _ref4.apply(this, arguments);
      };
    }();

    _this._increment = function (counter, maxSize) {
      counter++;
      return counter < maxSize ? counter : 0;
    };

    _this._incrementSendCounter = function () {
      _this._sendCounter = _this._increment(_this._sendCounter, COUNTER_MAX);
    };

    _this._incrementReceiveCounter = function () {
      _this._recieveCounter = _this._increment(_this._recieveCounter, COUNTER_MAX);
    };

    _this._incrementSendToken = function () {
      _this._sendToken = _this._increment(_this._sendToken, TOKEN_COUNTER_MAX);
      _this._clearToken(_this._sendToken);
      return _this._sendToken;
    };

    _this._useToken = function (name, sendToken) {
      var key = _this._toHexString(sendToken);

      if (_this._tokens[key]) {
        throw new Error('Token ' + name + ' ' + _this._tokens[key] + ' ' + key + ' already in use');
      }

      _this._tokens[key] = name;
    };

    _this._clearToken = function (sendToken) {
      var key = _this._toHexString(sendToken);

      if (_this._tokens[key]) {
        delete _this._tokens[key];
      }
    };

    _this._getResponseType = function (tokenString) {
      var request = _this._tokens[tokenString];
      // logger.log('respType for key ', tokenStr, ' is ', request);

      if (!request) {
        return '';
      }

      return _Messages2.default.getResponseType(request);
    };

    _this.getDescription = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee5() {
      var isBusy;
      return _regenerator2.default.wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              isBusy = !_this._isSocketAvailable(null);

              if (!isBusy) {
                _context5.next = 3;
                break;
              }

              throw new Error('This device is locked during the flashing process.');

            case 3:
              _context5.prev = 3;
              _context5.next = 6;
              return _this._ensureWeHaveIntrospectionData();

            case 6:
              return _context5.abrupt('return', {
                firmwareVersion: _this._productFirmwareVersion,
                productID: _this._particleProductId,
                state: (0, _nullthrows2.default)(_this._deviceFunctionState),
                systemInformation: (0, _nullthrows2.default)(_this._systemInformation)
              });

            case 9:
              _context5.prev = 9;
              _context5.t0 = _context5['catch'](3);
              throw new Error('No device state!');

            case 12:
            case 'end':
              return _context5.stop();
          }
        }
      }, _callee5, _this2, [[3, 9]]);
    }));

    _this.getVariableValue = function () {
      var _ref6 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee6(name) {
        var isBusy, messageToken, message;
        return _regenerator2.default.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                isBusy = !_this._isSocketAvailable(null);

                if (!isBusy) {
                  _context6.next = 3;
                  break;
                }

                throw new Error('This device is locked during the flashing process.');

              case 3:
                _context6.next = 5;
                return _this._ensureWeHaveIntrospectionData();

              case 5:
                if (_this._hasParticleVariable(name)) {
                  _context6.next = 7;
                  break;
                }

                throw new Error('Variable not found');

              case 7:
                messageToken = _this.sendMessage('VariableRequest', { name: name });
                _context6.next = 10;
                return _this.listenFor('VariableValue', null, messageToken);

              case 10:
                message = _context6.sent;
                return _context6.abrupt('return', _this._transformVariableResult(name, message));

              case 12:
              case 'end':
                return _context6.stop();
            }
          }
        }, _callee6, _this2);
      }));

      return function (_x4) {
        return _ref6.apply(this, arguments);
      };
    }();

    _this.callFunction = function () {
      var _ref7 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee7(functionName, functionArguments) {
        var isBusy, buffer, writeUrl, token, message;
        return _regenerator2.default.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                isBusy = !_this._isSocketAvailable(null);

                if (!isBusy) {
                  _context7.next = 3;
                  break;
                }

                throw new Error('This device is locked during the flashing process.');

              case 3:
                _context7.next = 5;
                return _this._transformArguments(functionName, functionArguments);

              case 5:
                buffer = _context7.sent;

                if (buffer) {
                  _context7.next = 8;
                  break;
                }

                throw new Error('Unknown Function ' + functionName);

              case 8:

                if (_settings2.default.showVerboseDeviceLogs) {
                  _logger2.default.log('sending function call to the core', { deviceID: _this._id, functionName: functionName });
                }

                writeUrl = function writeUrl(message) {
                  message.setUri('f/' + functionName);
                  if (buffer) {
                    message.setUriQuery(buffer.toString());
                  }

                  return message;
                };

                token = _this.sendMessage('FunctionCall', {
                  _writeCoapUri: writeUrl,
                  args: buffer,
                  name: functionName
                }, null);
                _context7.next = 13;
                return _this.listenFor('FunctionReturn', null, token);

              case 13:
                message = _context7.sent;
                return _context7.abrupt('return', _this._transformFunctionResult(functionName, message));

              case 15:
              case 'end':
                return _context7.stop();
            }
          }
        }, _callee7, _this2);
      }));

      return function (_x5, _x6) {
        return _ref7.apply(this, arguments);
      };
    }();

    _this.raiseYourHand = function () {
      var _ref8 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee8(shouldShowSignal) {
        var isBusy, token;
        return _regenerator2.default.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                isBusy = !_this._isSocketAvailable(null);

                if (!isBusy) {
                  _context8.next = 3;
                  break;
                }

                throw new Error('This device is locked during the flashing process.');

              case 3:
                token = _this.sendMessage('SignalStart', { _writeCoapUri: _Messages2.default.raiseYourHandUrlGenerator(shouldShowSignal) }, null);
                _context8.next = 6;
                return _this.listenFor('SignalStartReturn', null, token);

              case 6:
                return _context8.abrupt('return', _context8.sent);

              case 7:
              case 'end':
                return _context8.stop();
            }
          }
        }, _callee8, _this2);
      }));

      return function (_x7) {
        return _ref8.apply(this, arguments);
      };
    }();

    _this.flash = function () {
      var _ref9 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee9(binary) {
        var fileTransferStore = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _FileTransferStore2.default.FIRMWARE;
        var address = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '0x0';
        var isBusy, flasher;
        return _regenerator2.default.wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                isBusy = !_this._isSocketAvailable(null);

                if (!isBusy) {
                  _context9.next = 3;
                  break;
                }

                throw new Error('This device is locked during the flashing process.');

              case 3:
                flasher = new _Flasher2.default(_this, _this._maxBinarySize, _this._otaChunkSize);
                _context9.prev = 4;

                _logger2.default.log('flash device started! - sending api event', { deviceID: _this._id });

                _this.emit(DEVICE_EVENT_NAMES.FLASH_STARTED);

                _context9.next = 9;
                return flasher.startFlashBuffer(binary, fileTransferStore, address);

              case 9:

                _logger2.default.log('flash device finished! - sending api event', { deviceID: _this._id });

                _this.emit(DEVICE_EVENT_NAMES.FLASH_SUCCESS);

                return _context9.abrupt('return', 'Update finished');

              case 14:
                _context9.prev = 14;
                _context9.t0 = _context9['catch'](4);

                _logger2.default.log('flash device failed! - sending api event', { deviceID: _this._id, error: _context9.t0 });

                _this.emit(DEVICE_EVENT_NAMES.FLASH_FAILED);
                throw new Error('Update failed: ' + _context9.t0.message);

              case 19:
              case 'end':
                return _context9.stop();
            }
          }
        }, _callee9, _this2, [[4, 14]]);
      }));

      return function (_x8) {
        return _ref9.apply(this, arguments);
      };
    }();

    _this._isSocketAvailable = function (requester, messageName) {
      if (!_this._owningFlasher || _this._owningFlasher === requester) {
        return true;
      }

      _logger2.default.error('This client has an exclusive lock', {
        cache_key: _this._connectionKey,
        deviceID: _this._id,
        messageName: messageName
      });

      return false;
    };

    _this.takeOwnership = function (flasher) {
      if (_this._owningFlasher) {
        _logger2.default.error('already owned', { deviceID: _this._id });
        return false;
      }
      // only permit the owning object to send messages.
      _this._owningFlasher = flasher;
      return true;
    };

    _this.releaseOwnership = function (flasher) {
      _logger2.default.log('releasing flash ownership ', { coreID: _this._id });
      if (_this._owningFlasher === flasher) {
        _this._owningFlasher = null;
      } else if (_this._owningFlasher) {
        _logger2.default.error('cannot releaseOwnership, ', flasher, ' isn\'t the current owner ', { deviceID: _this._id });
      }
    };

    _this._transformVariableResult = function (name, message) {
      // grab the variable type, if the core doesn't say, assume it's a 'string'
      var variableFunctionState = _this._deviceFunctionState ? _this._deviceFunctionState.v : null;
      var variableType = variableFunctionState && variableFunctionState[name] ? variableFunctionState[name] : 'string';

      var result = null;
      var data = null;
      try {
        if (message && message.getPayload) {
          // leaving raw payload in response message for now, so we don't shock
          // our users.
          data = message.getPayload();
          result = _Messages2.default.fromBinary(data, variableType);
        }
      } catch (error) {
        _logger2.default.error('_transformVariableResult - error transforming response ' + error);
      }

      return result;
    };

    _this._transformFunctionResult = function (name, message) {
      var variableType = 'int32';

      var result = null;
      try {
        if (message && message.getPayload) {
          result = _Messages2.default.fromBinary(message.getPayload(), variableType);
        }
      } catch (error) {
        _logger2.default.error('_transformFunctionResult - error transforming response ' + error);
        throw error;
      }

      return result;
    };

    _this._transformArguments = function () {
      var _ref10 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee10(name, args) {
        var deviceFunctionState, functionState, oldProtocolFunctionState;
        return _regenerator2.default.wrap(function _callee10$(_context10) {
          while (1) {
            switch (_context10.prev = _context10.next) {
              case 0:
                console.log(args);
                console.log(args);
                console.log(args);

                if (args) {
                  _context10.next = 5;
                  break;
                }

                return _context10.abrupt('return', null);

              case 5:
                _context10.next = 7;
                return _this._ensureWeHaveIntrospectionData();

              case 7:
                name = name.toLowerCase();
                deviceFunctionState = (0, _nullthrows2.default)(_this._deviceFunctionState);
                functionState = deviceFunctionState[name];

                if (!functionState || !functionState.args) {
                  //maybe it's the old protocol?
                  oldProtocolFunctionState = deviceFunctionState.f;

                  if (oldProtocolFunctionState && oldProtocolFunctionState.some(function (fn) {
                    return fn.toLowerCase() === name;
                  })) {
                    //current / simplified function format (one string arg, int return type)
                    functionState = {
                      returns: 'int',
                      args: [[null, 'string']]
                    };
                  }
                }

                if (!(!functionState || !functionState.args)) {
                  _context10.next = 13;
                  break;
                }

                return _context10.abrupt('return', null);

              case 13:
                return _context10.abrupt('return', _Messages2.default.buildArguments(args, functionState.args));

              case 14:
              case 'end':
                return _context10.stop();
            }
          }
        }, _callee10, _this2);
      }));

      return function (_x11, _x12) {
        return _ref10.apply(this, arguments);
      };
    }();

    _this._ensureWeHaveIntrospectionData = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee12() {
      return _regenerator2.default.wrap(function _callee12$(_context12) {
        while (1) {
          switch (_context12.prev = _context12.next) {
            case 0:
              if (!_this._hasFunctionState()) {
                _context12.next = 2;
                break;
              }

              return _context12.abrupt('return', _promise2.default.resolve());

            case 2:
              _context12.prev = 2;
              return _context12.delegateYield(_regenerator2.default.mark(function _callee11() {
                var systemMessage, data, systemInformation, functionState;
                return _regenerator2.default.wrap(function _callee11$(_context11) {
                  while (1) {
                    switch (_context11.prev = _context11.next) {
                      case 0:
                        _this.sendMessage('Describe');
                        _context11.next = 3;
                        return _this.listenFor('DescribeReturn', null, null);

                      case 3:
                        systemMessage = _context11.sent;


                        //got a description, is it any good?
                        data = systemMessage.getPayload();
                        systemInformation = JSON.parse(data.toString());

                        // In the newer firmware the application data comes in a later message.
                        // We run a race to see if the function state comes in the first response.

                        _context11.next = 8;
                        return _promise2.default.race([_this.listenFor('DescribeReturn', null, null).then(function (applicationMessage) {
                          //got a description, is it any good?
                          var data = applicationMessage.getPayload();
                          return JSON.parse(data.toString());
                        }), new _promise2.default(function (resolve, reject) {
                          if (systemInformation.f && systemInformation.v) {
                            resolve(systemInformation);
                          }
                        })]);

                      case 8:
                        functionState = _context11.sent;


                        if (functionState && functionState.v) {
                          //'v':{'temperature':2}
                          functionState.v = _Messages2.default.translateIntTypes(functionState.v);
                        }

                        _this._systemInformation = systemInformation;
                        _this._deviceFunctionState = functionState;

                      case 12:
                      case 'end':
                        return _context11.stop();
                    }
                  }
                }, _callee11, _this2);
              })(), 't0', 4);

            case 4:
              _context12.next = 9;
              break;

            case 6:
              _context12.prev = 6;
              _context12.t1 = _context12['catch'](2);
              throw _context12.t1;

            case 9:
            case 'end':
              return _context12.stop();
          }
        }
      }, _callee12, _this2, [[2, 6]]);
    }));
    _this.getSystemInformation = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee13() {
      return _regenerator2.default.wrap(function _callee13$(_context13) {
        while (1) {
          switch (_context13.prev = _context13.next) {
            case 0:
              _context13.next = 2;
              return _this._ensureWeHaveIntrospectionData();

            case 2:
              return _context13.abrupt('return', _this._systemInformation);

            case 3:
            case 'end':
              return _context13.stop();
          }
        }
      }, _callee13, _this2);
    }));

    _this.onCoreEvent = function (event) {
      _this.sendCoreEvent(event);
    };

    _this.sendCoreEvent = function (event) {
      var data = event.data,
          isPublic = event.isPublic,
          name = event.name,
          publishedAt = event.publishedAt,
          ttl = event.ttl;


      var rawFunction = function rawFunction(message) {
        try {
          message.setMaxAge(ttl);
          message.setTimestamp((0, _moment2.default)(publishedAt).toDate());
        } catch (error) {
          _logger2.default.error('onCoreHeard - ' + error.message);
        }

        return message;
      };

      var messageName = isPublic ? DEVICE_MESSAGE_EVENTS_NAMES.PUBLIC_EVENT : DEVICE_MESSAGE_EVENTS_NAMES.PRIVATE_EVENT;

      // const userID = (this._userId || '').toLowerCase() + '/';
      // name = name ? name.toString() : name;
      // if (name && name.indexOf && (name.indexOf(userID)===0)) {
      //   name = name.substring(userID.length);
      // }

      _this.sendMessage(messageName, {
        _raw: rawFunction,
        event_name: name.toString()
      }, data && new Buffer(data) || null);
    };

    _this._hasFunctionState = function () {
      return !!_this._deviceFunctionState;
    };

    _this._hasParticleVariable = function (name) {
      return !!(_this._deviceFunctionState && _this._deviceFunctionState.v && _this._deviceFunctionState.v[name]);
    };

    _this._hasSparkFunction = function (name) {
      // has state, and... the function is an object, or it's in the function array
      var lowercaseName = name.toLowerCase();
      return !!(_this._deviceFunctionState && (_this._deviceFunctionState[name] || _this._deviceFunctionState.f && _this._deviceFunctionState.f.some(function (fn) {
        return fn.toLowerCase() === lowercaseName;
      })));
    };

    _this._toHexString = function (value) {
      return (value < 10 ? '0' : '') + value.toString(16);
    };

    _this.getID = function () {
      return _this._id;
    };

    _this.getRemoteIPAddress = function () {
      return _this._socket.remoteAddress ? _this._socket.remoteAddress.toString() : 'unknown';
    };

    _this.disconnect = function () {
      var message = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

      // eslint-disable-next-line no-plusplus
      _this._disconnectCounter++;

      if (_this._disconnectCounter > 1) {
        // don't multi-disconnect
        return;
      }

      try {
        var logInfo = {
          cache_key: _this._connectionKey,
          deviceID: _this._id,
          duration: _this._connectionStartTime ? (new Date() - _this._connectionStartTime) / 1000.0 : undefined
        };

        _logger2.default.log(_this._disconnectCounter + ' : Core disconnected: ' + (message || ''), logInfo);
      } catch (error) {
        _logger2.default.error('Disconnect log error ' + error);
      }

      try {
        _this._socket.end();
        _this._socket.destroy();
      } catch (error) {
        _logger2.default.error('Disconnect TCPSocket error: ' + error);
      }

      if (_this._decipherStream) {
        try {
          _this._decipherStream.end();
          _this._decipherStream = null;
        } catch (error) {
          _logger2.default.error('Error cleaning up decipherStream: ' + error);
        }
      }

      if (_this._cipherStream) {
        try {
          _this._cipherStream.end();
          _this._cipherStream = null;
        } catch (error) {
          _logger2.default.error('Error cleaning up cipherStream: ' + error);
        }
      }

      _this.emit(DEVICE_EVENT_NAMES.DISCONNECT, message);

      // obv, don't do this before emitting disconnect.
      try {
        _this.removeAllListeners();
      } catch (error) {
        _logger2.default.error('Problem removing listeners ' + error);
      }
    };

    _this._connectionKey = connectionKey;
    _this._socket = socket;
    _this._handshake = handshake;
    return _this;
  }

  /**
   * configure our socket and start the handshake
   */


  /**
   * Deals with messages coming from the core over our secure connection
   * @param data
   */


  /**
   * Adds a listener to our secure message stream
   * @param name the message type we're waiting on
   * @param uri - a particular function / variable?
   * @param token - what message does this go with? (should come from
   *  sendMessage)
   */


  /**
   * Gets or wraps
   * @returns {null}
   */


  /**
   * increments or wraps our token value, and makes sure it isn't in use
   */


  /**
   * Associates a particular token with a message we're sending, so we know
   * what we're getting back when we get an ACK
   * @param name
   * @param sendToken
   */


  /**
   * Clears the association with a particular token
   * @param sendToken
   */


  /**
   * Ensures we have introspection data from the core, and then
   * requests a variable value to be sent, when received it transforms
   * the response into the appropriate type
   **/


  // call function on device firmware


  /**
   * Asks the core to start or stop its 'raise your hand' signal.
   * This will turn `nyan` mode on or off which just flashes the LED a bunch of
   * colors.
   */


  /**
   *
   * @param name
   * @param message
   * @param callback-- callback expects (value, buf, err)
   * @returns {null}
   */


  /**
   * Transforms the result from a core function to the correct type.
   * @param name
   * @param msg
   * @param callback
   * @returns {null}
   */


  /**
   * transforms our object into a nice coap query string
   * @param name
   * @param args
   * @private
   */


  /**
   * Checks our cache to see if we have the function state, otherwise requests
   * it from the core, listens for it, and resolves our deferred on success
   * @returns {*}
   */


  //-------------
  // Core Events / Spark.publish / Spark.subscribe
  //-------------


  // eslint-disable-next-line no-confusing-arrow


  return Device;
}(_events2.default);

exports.default = Device;