var Params = {
  query: function( query ) {
    var result = {};
    query.split("&").forEach(function(part) {
      var item = part.split("=");
      result[item[0]] = decodeURIComponent(item[1]);
    });
    return result;
  }
};


var Guid = {
  get: function(){
    var s4 = function() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    };
    return( s4() + s4() + '-' + s4() + '-' + s4() + '-' +
      s4() + '-' + s4() + s4() + s4()
    );
  }
};


// !IMPORTANT! DO NOT ABUSE.
// empty object to store global variables when absolutely needed for performance.
(function(){
    window.CSGLOBAL = {};
}());

// string trim
if (!String.prototype.trim) { String.prototype.trim = function () { return this.replace(/^\s+|\s+$/g, ''); }; }

(function(){
    window.IS_MOBILE = {
        Android: function() { return navigator.userAgent.match(/Android/i); },
        BlackBerry: function() { return navigator.userAgent.match(/BlackBerry/i); },
        iOS: function() { return navigator.userAgent.match(/iPhone|iPad|iPod/i); },
        Opera: function() { return navigator.userAgent.match(/Opera Mini/i); },
        Windows: function() { return navigator.userAgent.match(/IEMobile/i); },
        any: function() { return (window.IS_MOBILE.Android() || window.IS_MOBILE.BlackBerry() || window.IS_MOBILE.iOS() || window.IS_MOBILE.Opera() || window.IS_MOBILE.Windows()); }
    };
}());

// Avoid `console` errors in browsers that lack a console.
(function() {
    var method;
    var noop = function () {};
    var methods = [
        'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
        'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
        'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
        'timeStamp', 'trace', 'warn'
    ];
    var length = methods.length;
    var console = (window.console = window.console || {});

    while (length--) {
        method = methods[length];
        // Only stub undefined methods.
        if (!console[method]) {
            console[method] = noop;
        }
    }
}());

/* requestAnimationFrame polly */
(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] 
        || window[vendors[x]+'CancelRequestAnimationFrame'];
    }
 
    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
 
    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());

/* 
Simple Utility for Global Event Management
Written by Christopher L. Smith :: somethingcolorful.com
Features:
- pure javascript, so no dependencies at all.
- value is that the "scope" is in the proper object of the callback function.
TODO: Make this a hashtable of "eventNames", eventName = {scope:obj, func: funcName}, & remove old objects to prevent mem leaks.
*/
(function() {
   window.CSEventManager = {
        events:[],
        VERBOSE:false,
        addListener:function(eventName, eventScope, eventFunctionNameString){
            var i, e=CSEventManager.events, hasName=false, l=e.length;
            for(i=0; i<l; i++){
                if(e[i].name == eventName){
                    if(e[i].scope == eventScope){
                         e[i].callback.push(eventFunctionNameString);
                         hasName=true;
                    }
                }
            }
            if( ! hasName){
                e.push({
                    name: eventName,
                    scope: eventScope,
                    callback: [eventFunctionNameString]
                });
            }
        },
        removeListener:function(eventName, eventScope, eventFunctionNameString){
            var i, e = CSEventManager.events, l=e.length;
            for(i=0; i<l; i++){
                if(e[i].name == eventName){
                    if(e[i].scope == eventScope){
                        var j, c=e[i].callback, l2=c.length;
                        for(j=0; j<l2; j++){
                            if(c[j] == eventFunctionNameString) c.splice(j,1);
                        }
                    }
                }
            }
        },
        broadcast:function(eventName, data){
            if(data===undefined || data===null) data = {};
            var i, e = CSEventManager.events, l=e.length;
            for(i=0; i<l; i++){
                if(e[i].name == eventName){
                    if(CSEventManager.VERBOSE) console.log("CSEventManager: ["+eventName+"], scope:", e[i].scope);
                    var j, c=e[i].callback, l2=c.length;
                    for(j=0; j<l2; j++){
                        e[i].scope[c[j]].call( e[i].scope, data );
                    }
                }
            }
        }
   };
}());


window.getUrlParameter = function(sParam){
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++){
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam) {
            return sParameterName[1];
        }
    }
    return false;
};


$.fn.isBound = function(type, fn) {
    var data = $(this).data()['events'];
    return Boolean( data !== undefined);
};



