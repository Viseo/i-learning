/// <reference path="../typings/tsd.d.ts"/>
var stringLib: {
  format: (...params: any[]) => string
};
/*
    Replaces the format item in a specified string
    with the string representation of a corresponding object in a specified array.
*/
stringLib.format = function format(...params: any[]): string {
  var allArgs = params;
  var format = allArgs[0];
  var result = format.substring(0, format.length);

  if (allArgs.length === 2 && typeof allArgs[1] === 'object') {
      // object pass like two argument
      var obj = allArgs[1];
      for (var prop in obj) {
          if (obj.hasOwnProperty(prop)) {
              result = result.replace('{' + prop + '}', obj[prop]);
          }
      }
  } else {
      // many args separate elements
      var args = allArgs.filter(function(item, i) {
          return i > 0;
      });

      for (var i = 0, len = args.length; i < len; i++) {
          result = result.replace('{' + i + '}', args[i]);
      }
  }

  return result;

}

export = stringLib;
