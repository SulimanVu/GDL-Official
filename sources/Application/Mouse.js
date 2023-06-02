import Application from "./Application.js";

export default class Mouse {
  constructor() {
    this.application = Application.instance;
    this.viewport = this.application.viewport;

    this.screen = {
      x: this.viewport.width * 0.5,
      y: this.viewport.height * 0.5,
    };
    this.normalised = { x: 0, y: 0 };

    window.addEventListener("mousemove", (_event) => {
      this.screen.x = _event.clientX;
      this.screen.y = _event.clientY;

      this.normalised.x = this.screen.x / this.viewport.width - 0.5;
      this.normalised.y = this.screen.y / this.viewport.height - 0.5;
    });
  }
}
