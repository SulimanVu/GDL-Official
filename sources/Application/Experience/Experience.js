import * as THREE from "three";
import { getGPUTier } from "detect-gpu";

import Application from "../Application.js";
import Resources from "./Resources.js";
import assets from "./assets.js";
import Render from "./Render/Render.js";
import EventEmitter from "../EventEmitter.js";
import Debug from "./Debug/Debug.js";

export default class Experience extends EventEmitter {
  static instance;

  constructor(_options) {
    super();

    // Singleton
    if (Experience.instance) {
      return Experience.instance;
    }
    Experience.instance = this;

    this.application = new Application();

    // Options
    this.domElement = _options.domElement;

    // Ready
    this.ready = false;

    // Renderer
    this.rendererInstance = new THREE.WebGLRenderer({
      // alpha: false,
      antialias: true,
      // stencil: false,
      powerPreference: "high-performance",
    });

    // GPU
    const promise = getGPUTier({
      glContext: this.rendererInstance.getContext(),
    });
    promise.then((gpuInfo) => {
      this.ready = true;
      this.quality = gpuInfo.tier < 3 ? "low" : "high";

      this.time = this.application.time;
      this.viewport = this.application.viewport;
      this.mouse = this.application.mouse;
      this.debug = new Debug();
      this.resources = new Resources(this.rendererInstance, assets);
      this.render = new Render();

      window.addEventListener("resize", () => {
        this.resize();
      });

      this.trigger("ready");
    });
  }

  update() {
    if (!this.ready) return;

    this.debug.update();
    this.render.update();
  }

  resize() {
    if (!this.ready) return;

    this.viewport.update();
    this.render.resize();
  }
}
