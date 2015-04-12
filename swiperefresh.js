var swiperefresh = (function () {
	'use strict';

	var defaults = {
		// ID of the element holding pannable content area
		contentEl: 'swiperefresh',

		// ID of the element holding pull to refresh loading area
		ptrEl: 'ptr',

		// Number of pixels of panning until refresh
		distanceToRefresh: 70,

		// Pointer to function that does the loading and returns a promise
		loadingFunction: false,

		// Dragging resistance level
		resistance: 2.5
	};

  var pan = {
    scroll: 0,
    start: 0,
    distance: 0,
    enabled: false,
    trigger: false
  };
  var options = {};
  var bodyClass;
	var init = function( params ) {
		params = params || {};
		options = {
			contentEl: params.contentEl || document.getElementById( defaults.contentEl ),
			ptrEl: params.ptrEl || document.getElementById( defaults.ptrEl ),
			distanceToRefresh: params.distanceToRefresh || defaults.distanceToRefresh,
			loadingFunction: params.loadingFunction || defaults.loadingFunction,
			resistance: params.resistance || defaults.resistance
		};

		if ( ! options.contentEl || ! options.ptrEl ) {
			return false;
		}

    var nav = options.contentEl;

    bodyClass = document.body.classList;

    nav.addEventListener('touchstart', start, false);
    nav.addEventListener('mousedown', start, false);
    nav.addEventListener('touchend', end, false);
    nav.addEventListener('mouseup', end, false);
    nav.addEventListener('touchmove', move, false);
    nav.addEventListener('mousemove', move, false);
	};

  function update(e) {
    if(e.changedTouches) {
      e = e.changedTouches[0]
    }
    return e;
  }

	var start = function(e) {
		pan.scroll = document.body.scrollTop;
		if (pan.scroll <= 1) {
      e = update(e);
      pan.start = e.pageY;
			pan.enabled = true;
		}
	};

	var move = function(e) {
		if (!pan.enabled) {
			return;
		}

    var t = update(e);
    pan.distance = (t.pageY - pan.start) / options.resistance;
    if(pan.distance < 0) {
      reset();
      return;
    }

		e.preventDefault();
    options.contentEl.style.transform = options.contentEl.style.webkitTransform = 'translate3d( 0, ' + pan.distance + 'px, 0 )';
		options.ptrEl.style.transform = options.ptrEl.style.webkitTransform = 'translate3d( 0, ' + ( pan.distance - options.ptrEl.offsetHeight ) + 'px, 0 )';

    pan.trigger = pan.distance > options.distanceToRefresh;
	};

	var end = function(e) {
		if (!pan.enabled) {
			return;
		}

    e.preventDefault();
    e = update(e);

		options.contentEl.style.transform = options.contentEl.style.webkitTransform = '';
		options.ptrEl.style.transform = options.ptrEl.style.webkitTransform = '';

    if (pan.trigger && options.loadingFunction) {
      options.loadingFunction();
    }
		reset();
	};

	var reset = function() {
		bodyClass.add('ptr-reset');

		var bodyClassRemove = function() {
			bodyClass.remove('ptr-reset');
			document.body.removeEventListener('transitionend', bodyClassRemove, false);
		};
    document.body.addEventListener('transitionend', bodyClassRemove, false);
		pan.distance = 0;
		pan.enabled = false;
		pan.trigger = false;

    window.scrollTo(0, 0);
	};

	return {
		init: init
	}
})();
