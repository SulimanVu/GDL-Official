import * as THREE from "three";

import Experience from "../Experience.js";
import Render from "./Render.js";

export default class Iridescent {
  constructor(_options) {
    this.experience = Experience.instance;
    this.render = new Render();
    this.debug = this.experience.debug;
    this.time = this.experience.time;
    this.resources = this.experience.resources;

    // Options
    this.debugPath = _options.debugPath;
    this.texture = _options.texture;
    this.color = _options.color ?? "#ffffff";
    this.iridescentColor = new THREE.Color(
      _options.iridescentColor ?? "#ffffff"
    );
    this.metalness = _options.metalness ?? 1;
    this.roughness = _options.roughness ?? 0.2;
    this.bumpScale = _options.bumpScale ?? 0.0002;
    this.fesnelFrequency = _options.fesnelFrequency ?? 2;
    this.positionFrequency = _options.positionFrequency ?? 4.5;
    this.brightnessFrequency = _options.brightnessFrequency ?? 0.6;
    this.brightnessOffset = _options.brightnessOffset ?? 0.3;
    this.intensity = _options.intensity ?? 1;

    this.setGradient();
    this.setBumpTexture();
    this.setMaterial();
    this.setDebug();
  }

  setGradient() {
    this.gradient = {};

    this.gradient.canvas = document.createElement("canvas");
    this.gradient.canvas.width = 1;
    this.gradient.canvas.height = 32;

    this.gradient.context = this.gradient.canvas.getContext("2d");

    this.gradient.colors = ["#ff0000", "#00ff00", "#0000ff"];

    this.gradient.update = () => {
      const gradient = this.gradient.context.createLinearGradient(
        0,
        0,
        0,
        this.gradient.canvas.height
      );
      gradient.addColorStop(0, this.gradient.colors[0]);
      gradient.addColorStop(0.33, this.gradient.colors[1]);
      gradient.addColorStop(0.66, this.gradient.colors[2]);
      gradient.addColorStop(1, this.gradient.colors[0]);

      this.gradient.context.fillStyle = gradient;
      this.gradient.context.fillRect(
        0,
        0,
        this.gradient.canvas.width,
        this.gradient.canvas.height
      );

      if (this.gradient.texture) this.gradient.texture.needsUpdate = true;
      else {
        this.gradient.texture = new THREE.CanvasTexture(
          this.gradient.canvas,
          THREE.UVMapping,
          THREE.RepeatWrapping,
          THREE.RepeatWrapping
        );

        this.gradient.texture.minFilter = THREE.LinearFilter;
        this.gradient.texture.magFilter = THREE.LinearFilter;
      }
    };

    this.gradient.update();
  }

  setBumpTexture() {
    // this.bumpTexture = this.resources.items.blueNoise32x32Texture;
    // this.bumpTexture.wrapS = THREE.RepeatWrapping;
    // this.bumpTexture.wrapT = THREE.RepeatWrapping;
    // this.bumpTexture.needsUpdate = true;
  }

  setMaterial() {
    this.material = new THREE.MeshStandardMaterial({
      color: this.color,
      metalness: this.metalness,
      roughness: this.roughness,
      bumpMap: this.bumpTexture,
      bumpScale: this.bumpScale,
    });

    this.material.userData.encodeColor = false;

    this.uniforms = {};
    this.uniforms.uIridescentFresnelFrequency = { value: this.fesnelFrequency };
    this.uniforms.uIridescentPositionFrequency = {
      value: this.positionFrequency,
    };
    this.uniforms.uIridescentBrightnessFrequency = {
      value: this.brightnessFrequency,
    };
    this.uniforms.uIridescentBrightnessOffset = {
      value: this.brightnessOffset,
    };
    this.uniforms.uIridescentIntensity = { value: this.intensity };
    this.uniforms.uIridescentGradientTexture = { value: this.gradient.texture };
    this.uniforms.uIridescentMapTexture = { value: this.texture };

    this.material.customProgramCacheKey = () => {
      return Math.random();
    };

    this.material.onBeforeCompile = (shader) => {
      for (const uniformKey in this.uniforms)
        shader.uniforms[uniformKey] = this.uniforms[uniformKey];

      shader.vertexShader = shader.vertexShader.replace(
        "#include <common>",
        `
                    #include <common>

                    varying vec3 vWorldPosition;
                `
      );

      shader.vertexShader = shader.vertexShader.replace(
        "#include <worldpos_vertex>",
        `
                    #include <worldpos_vertex>

                    vWorldPosition = worldPosition.xyz;
                `
      );

      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <common>",
        `
                    #include <common>

                    uniform float uIridescentFresnelFrequency;
                    uniform float uIridescentPositionFrequency;
                    uniform float uIridescentIntensity;
                    uniform float uIridescentBrightnessFrequency;
                    uniform float uIridescentBrightnessOffset;
                    uniform sampler2D uIridescentGradientTexture;
                    uniform sampler2D uIridescentMapTexture;

                    varying vec3 vWorldPosition;
                `
      );

      shader.fragmentShader = shader.fragmentShader.replace(
        "vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;",
        `
                    // Base
                    vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
                    vec3 grayOutgoingLight = vec3((outgoingLight.r + outgoingLight.g + outgoingLight.b) / 3.0);

                    // Iridescent color
                    vec3 viewDirection = normalize(vWorldPosition.xyz - cameraPosition);
                    float fresnel = (1.0 + dot(viewDirection, normal));
                    float brightness = length(outgoingLight) / 3.0;

                    float iridescentPicker = fresnel * uIridescentFresnelFrequency + distance(vec3(-20.0, 6.0, 0.0), vWorldPosition) * uIridescentPositionFrequency + brightness * uIridescentBrightnessFrequency;
                    iridescentPicker = fract(iridescentPicker);

                    vec3 iridescentGradientColor = texture2D(uIridescentGradientTexture, vec2(0.5, iridescentPicker)).rgb;

                    vec3 iridescentColor = mix(outgoingLight, grayOutgoingLight, 0.0) * (1.0 + (iridescentGradientColor - 0.5) * uIridescentIntensity * (brightness + uIridescentBrightnessOffset));

                    // Map
                    float iridescentIntensity = 1.0 - texture2D(uIridescentMapTexture, vUv).r;
                    // float iridescentIntensity = 1.0;

                    // Final color
                    outgoingLight = mix(outgoingLight * 0.3, iridescentColor, iridescentIntensity);
                    // outgoingLight = vec3(iridescentPicker);
                `
      );
    };
  }

  setDebug() {
    const debug = this.experience.debug;

    if (!debug.active) return;

    General;
    const folder = debug.ui.getFolder(this.debugPath);
    folder.open();

    folder.addColor(this.material, "color").name("color");
    folder
      .add(this.material, "metalness")
      .min(0)
      .max(1)
      .step(0.001)
      .name("metalness");
    folder
      .add(this.material, "roughness")
      .min(0)
      .max(1)
      .step(0.001)
      .name("roughness");
    folder
      .add(this.material, "bumpScale")
      .min(0)
      .max(0.002)
      .step(0.00001)
      .name("bumpScale");

    folder
      .addColor(this.gradient.colors, "0")
      .name("iridescentColor0")
      .onChange(this.gradient.update);
    folder
      .addColor(this.gradient.colors, "1")
      .name("iridescentColor1")
      .onChange(this.gradient.update);
    folder
      .addColor(this.gradient.colors, "2")
      .name("iridescentColor2")
      .onChange(this.gradient.update);

    folder
      .add(this.uniforms.uIridescentFresnelFrequency, "value")
      .min(1)
      .max(10)
      .step(0.001)
      .name("uIridescentFresnelFrequency");
    folder
      .add(this.uniforms.uIridescentPositionFrequency, "value")
      .min(0)
      .max(20)
      .step(0.001)
      .name("uIridescentPositionFrequency");
    folder
      .add(this.uniforms.uIridescentBrightnessFrequency, "value")
      .min(0)
      .max(10)
      .step(0.001)
      .name("uIridescentBrightnessFrequency");
    folder
      .add(this.uniforms.uIridescentBrightnessOffset, "value")
      .min(-1)
      .max(1)
      .step(0.001)
      .name("uIridescentBrightnessOffset");
    folder
      .add(this.uniforms.uIridescentIntensity, "value")
      .min(0)
      .max(2)
      .step(0.001)
      .name("uIridescentIntensity");
  }
}
