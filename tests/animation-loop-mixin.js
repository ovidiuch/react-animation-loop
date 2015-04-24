describe("AnimationLoop mixin", function() {

  var _ = require('lodash'),
      chai = require('chai'),
      expect = chai.expect,
      sinon = require('sinon'),
      sinonChai = require('sinon-chai'),
      AnimationLoop = require('../src/animation-loop-mixin.js');

  chai.use(sinonChai);

  var fakeComponent;

  beforeEach(function() {
    fakeComponent = _.clone(AnimationLoop);

    // Mock React API
    fakeComponent.setState = sinon.spy();
    fakeComponent.state = {};

    fakeComponent.onFrame = sinon.spy();
  });

  describe("mocked timeout functions", function() {
    var _setTimeout,
        _clearTimeout,
        timeoutId = 555;

    beforeEach(function() {
      _setTimeout = setTimeout;
      setTimeout = sinon.stub().returns(timeoutId);

      _clearTimeout = clearTimeout;
      clearTimeout = sinon.spy();
    });

    afterEach(function() {
      setTimeout = _setTimeout;
      clearTimeout = _clearTimeout;
    });

    it("should call setTimeout when starting with animation true", function() {
      fakeComponent.state.animationLoopRunning = true;
      fakeComponent.componentWillMount();

      expect(setTimeout)
            .to.have.been.calledWith(fakeComponent.animationCallback);
    });

    it("should call setTimeout when setting animation true", function() {
      fakeComponent.state.animationLoopRunning = false;
      fakeComponent.componentWillUpdate({}, {
        animationLoopRunning: true
      });

      expect(setTimeout)
            .to.have.been.calledWith(fakeComponent.animationCallback);
    });

    it("should call onFrame callback in animationCallback", function() {
      var fakeTimestamp;

      sinon.stub(Date, 'now', function() {
        return fakeTimestamp;
      });

      fakeTimestamp = 0;
      fakeComponent.state.animationLoopRunning = true;
      fakeComponent.componentWillMount();

      // Fake passing of half a second since animation started
      fakeTimestamp = 500;
      // We already tested we send animationCallback to setTimeout
      fakeComponent.animationCallback();

      expect(fakeComponent.onFrame.args[0][0])
            .to.be.closeTo(30, 0.00000000001);

      Date.now.restore();
    });

    describe("when animation was running", function() {

      beforeEach(function() {
        fakeComponent.state.animationLoopRunning = true;
        fakeComponent.componentWillMount();
      });

      it("should call setTimeout again after animationCallback", function() {
        fakeComponent.animationCallback();

        expect(setTimeout)
              .to.have.been.calledWith(fakeComponent.animationCallback);
      });

      it("should call clearTimeout on stopAnimationLoop", function() {
        fakeComponent.state.animationLoopRunning = true;
        fakeComponent.componentWillUpdate({}, {
          animationLoopRunning: false
        });

        expect(clearTimeout).to.have.been.calledWith(timeoutId);
      });

      it("should call clearTimeout when unmounting", function() {
        fakeComponent.componentWillUnmount();

        expect(clearTimeout).to.have.been.calledWith(timeoutId);
      });
    });
  });
});
