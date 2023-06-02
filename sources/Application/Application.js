import Experience from "./Experience/Experience.js";
import Navigation from "./Navigation.js";
import Viewport from "./Viewport.js";
import Mouse from "./Mouse.js";
import Time from "./Time.js";

export default class Application {
  static instance;

  constructor() {
    // Singleton
    if (Application.instance) {
      return Application.instance;
    }
    Application.instance = this;

    this.viewport = new Viewport({
      domElement: document.querySelector(".experience"),
    });
    this.mouse = new Mouse();
    this.time = new Time();
    this.experience = new Experience({
      domElement: document.querySelector(".experience"),
    });
    this.experience.on("ready", () => {
      this.navigation = new Navigation();
    });

    this.setTouch();
    this.update();
  }

  setTouch() {
    this.isTouch = false;
    this.isMouse = false;

    window.addEventListener(
      "touchstart",
      () => {
        this.isTouch = true;
        document.documentElement.classList.add("is-touch");
      },
      { once: true, passive: true }
    );

    window.addEventListener(
      "mousemove",
      () => {
        if (!this.isTouch) {
          this.isMouse = true;
          document.documentElement.classList.add("is-mouse");
        }
      },
      { once: true, passive: true }
    );
  }

  update() {
    if (this.experience.ready) {
      this.experience.update();
      this.navigation.update();
    }

    window.requestAnimationFrame(() => {
      this.update();
    });
  }
}
