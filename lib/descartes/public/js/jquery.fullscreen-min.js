/*
 jquery.fullscreen 1.0.0
 https://github.com/kayahr/jquery-fullscreen-plugin
 Copyright (C) 2012 Klaus Reimer <k@ailis.de>
 Licensed under the MIT license
 (See http://www.opensource.org/licenses/mit-license)
*/
(function(){function d(c){var b,a;if(!this.length)return this;b=this[0];b instanceof Document?(a=b,b=a.documentElement):a=b.ownerDocument;if(c==null){if(!a.cancelFullScreen&&!a.webkitCancelFullScreen&&!a.mozCancelFullScreen)return null;return!!a.fullScreen||!!a.webkitIsFullScreen||!!a.mozFullScreen}c?(c=b.requestFullScreen||b.webkitRequestFullScreen||b.mozRequestFullScreen)&&c.call(b):(c=a.cancelFullScreen||a.webkitCancelFullScreen||a.mozCancelFullScreen)&&c.call(a);return this}jQuery.fn.fullScreen=
d;jQuery.fn.toggleFullScreen=function(){return d.call(this,!d.call(this))}})();