import normalizeWheel from "normalize-wheel";

import EventEmitter from "./EventEmitter.js";

let _direction = 0;
let _wheeling = false;
let _previousValue = 0;
let _idleTimeout = null;
let _lastTriggerTimeout = null;
let _previousValueTimeout = null;
let _recentlyTriggered = false;

export default class Wheel extends EventEmitter {
  constructor() {
    super();

    this.onMouseWheel = this.onMouseWheel.bind(this);
    this.eventName = "wheel";
    this.preventDefault = true;

    document.addEventListener(this.eventName, this.onMouseWheel, {
      passive: false,
    });
  }

  onMouseWheel(event) {
    this.triggered = false;

    if (this.preventDefault) event.preventDefault();

    // Get normalized value
    const normalized = normalizeWheel(event);

    const triggeredByDirection = this.testWheelByDirection(normalized.pixelY);
    const triggeredByIdle = this.testWheelByIdle();
    const triggeredByIncrease = this.testWheelByIncrease(normalized.pixelY);

    this.triggered =
      triggeredByDirection || triggeredByIdle || triggeredByIncrease;

    if (this.triggered && _direction) {
      // console.log("triggeredByDirection", triggeredByDirection);
      // console.log("triggeredByIdle", triggeredByIdle);
      console.log("triggeredByIncrease", triggeredByIncrease);

      this.onWheel(_direction);

      _recentlyTriggered = true;

      // Clear current timeout
      if (_lastTriggerTimeout) {
        window.clearTimeout(_lastTriggerTimeout);
      }

      _lastTriggerTimeout = window.setTimeout(() => {
        _recentlyTriggered = false;
      }, 200);
    }
  }

  testWheelByDirection(value) {
    let result = false;

    if (value) {
      // Get direction
      const direction = value > 0 ? 1 : value < 0 ? -1 : 0;

      // Direction changed
      if (direction !== _direction) {
        result = true;
      }

      // Save direction
      _direction = direction;
    }

    return result;
  }

  testWheelByIdle() {
    let result = false;

    // Clear current timeout
    if (_idleTimeout) {
      window.clearTimeout(_idleTimeout);
    }

    // Start new timeout
    _idleTimeout = window.setTimeout(() => {
      _wheeling = false;
    }, 200);

    if (!_wheeling) {
      result = true;
    }
    _wheeling = true;

    return result;
  }

  testWheelByIncrease(value) {
    let result = false;
    const sign = value > 0 ? 1 : value < 0 ? -1 : 0;

    if (!_recentlyTriggered) {
      if (sign > 0 && value > _previousValue * 2) {
        result = true;
      }

      if (sign < 0 && value < _previousValue * 2) {
        result = true;
      }
    }

    _previousValue = value;

    return result;
  }

  onWheel(direction) {
    this.trigger("wheel", [direction]);
  }

  destructor() {
    document.removeEventListener(this.eventName, this.onMouseWheel);
  }
}
