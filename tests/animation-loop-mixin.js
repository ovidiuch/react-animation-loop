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

  it("should set state flag true when calling startAnimationLoop", function() {
    fakeComponent.startAnimationLoop();

    expect(fakeComponent.setState).to.have.been.calledWith({
      animationLoopRunning: true
    });
  });

  it("should set state flag false when calling stopAnimationLoop", function() {
    fakeComponent.stopAnimationLoop();

    expect(fakeComponent.setState).to.have.been.calledWith({
      animationLoopRunning: false
    });
  });

  it("should call startAnimationLoop if state flag true at mount", function() {
    fakeComponent.startAnimationLoop = sinon.spy();
    fakeComponent.state.animationLoopRunning = true;

    fakeComponent.componentDidMount();

    expect(fakeComponent.startAnimationLoop).to.have.been.called;
  });

  it("should call stopAnimationLoop if state flag false at mount", function() {
    fakeComponent.stopAnimationLoop = sinon.spy();
    fakeComponent.state.animationLoopRunning = false;

    fakeComponent.componentDidMount();

    expect(fakeComponent.stopAnimationLoop).to.have.been.called;
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

    it("should send callback to setTimeout on startAnimationLoop", function() {
      fakeComponent.startAnimationLoop();

      expect(setTimeout)
            .to.have.been.calledWith(fakeComponent.animationCallback);
    });

    describe("when animation was running", function() {

      beforeEach(function() {
        fakeComponent.startAnimationLoop();
      });

      it("should call onFrame callback in animationCallback", function() {
        var fakeTimestamp;

        sinon.stub(Date, 'now', function() {
          return fakeTimestamp;
        });

        fakeTimestamp = 0;
        fakeComponent.startAnimationLoop();

        // Fake passing of half a second since animation started
        fakeTimestamp = 500;
        // We already tested we send animationCallback to setTimeout
        fakeComponent.animationCallback();

        expect(fakeComponent.onFrame.args[0][0])
              .to.be.closeTo(30, 0.00000000001);

        Date.now.restore();
      });

      it("should call setTimeout again after animationCallback", function() {
        fakeComponent.animationCallback();

        expect(setTimeout)
              .to.have.been.calledWith(fakeComponent.animationCallback);
      });

      it("should call clearTimeout on stopAnimationLoop", function() {
        fakeComponent.stopAnimationLoop();

        expect(clearTimeout).to.have.been.calledWith(timeoutId);
      });

      it("should call clearTimeout when unmounting", function() {
        fakeComponent.componentWillUnmount();

        expect(clearTimeout).to.have.been.calledWith(timeoutId);
      });

      it("should call clearTimeout on 2nd startAnimationLoop", function() {
        fakeComponent.startAnimationLoop();

        expect(clearTimeout).to.have.been.calledWith(timeoutId);
      });
    });
  });
});
