import verify   from './verify';
import isString from 'lodash.isstring';

/*--------------------------------------------------------------------------------
   Simple logging utility with the following features:
   - can be enabled/disabled at run-time
   - all logging probes are prefixed
   - a simple layer on top of console.log()

   USAGE:
     import {createLogger} from 'util/logger';
     ...
     const log = createLogger('*** My Prefix *** ').enable();

     ... log('now is the time', myData); // emits: *** My Prefix *** now is the time

   API:
     log(msg [,obj]): void       ... conditionally log probe when enabled
     log.force(msg [,obj]): void ... unconditionally log probe
     log.isEnabled(): true/false ... is logging enabled or disabled
     log.enable():  log          ... enable logging
     log.disable(): log          ... disable logging
   --------------------------------------------------------------------------------*/

export function createLogger(prefix) {

  // validate parameters
  const check = verify.prefix('createLogger() parameter violation: ');
  check(prefix,           'prefix is required');
  check(isString(prefix), 'prefix must be a string');

  // our logger is disabled by default
  let _enabled = false;

  // create our new logger
  const logger = function(msg, obj) { // our primary logging function
    if (_enabled) {
      logger.force(msg, obj);
    }
  };

  // inject additional API

  logger.force = (msg, obj) => {
    msg = prefix + msg;
    if (obj) {
      console.log(msg, obj);
    }
    else {
      console.log(msg);
    }
  };

  logger.isEnabled = () => _enabled;

  logger.enable = () => {
    _enabled = true;
    logger('enabling logging');
    return logger;
  };

  logger.disable = () => {
    logger('disabling logging');
    _enabled = false;
    return logger;
  };

  // thats all folks
  return logger;
}
