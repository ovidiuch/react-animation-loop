// Works with Node and browser globals
(function(root, factory) {
  if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.AnimationLoopMixin = factory();
  }
}(this, function(root) {

var FPS = 60,
    MILLISECONDS_PER_FRAME = 1000 / FPS;

var AnimationLoopMixin = {
  /**
   * Simple API for running a callback at 60fps. The callback receives a
   * *frames* argument which is equal to the number of frames passed since the
   * last call. Ideally, if the browser performs seamlessly the *frames* will
   * always be `1`. However, when the browser lags behind the value will
   * increase, akin to a frame-skipping mechanism. This way you can use the
   * *frames* value as a multiplier for a transition step.
   *
   * A requestAnimationFrame>setTimeout polyfill is used for the callbacks.
   */
  componentWillMount: function() {
    if (this.state.animationLoopRunning === true) {
      this._nextFrame();
    }
  },

  componentWillUpdate: function(nextProps, nextState) {
    if (nextState.animationLoopRunning === this.state.animationLoopRunning) {
      return;
    }

    if (nextState.animationLoopRunning === true) {
      this._nextFrame();
    } else {
      this._cancelFrame();
    }
  },

  componentWillUnmount: function() {
    this._cancelFrame();
  },

  animationCallback: function() {
    if (typeof(this.onFrame) != 'function') {
      return;
    }

    var now = Date.now(),
        timePassed = now - this._prevTime;

    this.onFrame(timePassed / MILLISECONDS_PER_FRAME);

    // Sometimes the next frame is still called even after it was canceled, so
    // we need to make sure we don't continue with the animation loop
    if (this._animationRequestId) {
      this._nextFrame();
    }
  },

  _nextFrame: function() {
    this._prevTime = Date.now();

    // Keep a reference to the animation request to be able to clear it on
    // stopAnimationLoop()
    this._animationRequestId = requestAnimationFrame(this.animationCallback);
  },

  _cancelFrame: function() {
    if (this._animationRequestId) {
      cancelAnimationFrame(this._animationRequestId);
      this._animationRequestId = null;
    }
  }
};

var windowExists = function() {
  return typeof(window) !== 'undefined';
};

var getRequestAnimationFrameMethod = function() {
  if (!windowExists()) {
    return;
  }

  return window.requestAnimationFrame ||
         window.webkitRequestAnimationFrame ||
         window.mozRequestAnimationFrame;
};

var getCancelAnimationFrameMethod = function() {
  if (!windowExists()) {
    return;
  }

  return window.cancelAnimationFrame ||
         window.webkitCancelAnimationFrame ||
         window.mozCancelAnimationFrame;
};

// Polyfill inspired by Paul Irish
// http://www.paulirish.com/2011/requestanimationframe-for-smart-animating/
var requestAnimationFrame =
  getRequestAnimationFrameMethod() ||
  function(callback) {
    return setTimeout(callback, 1000 / 60);
  };

var cancelAnimationFrame =
  getCancelAnimationFrameMethod() ||
  function(requestId) {
    clearTimeout(requestId);
  };

return AnimationLoopMixin;

}));
