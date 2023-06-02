import * as THREE from "three";

import Experience from "../Experience.js";
import Render from "./Render.js";

export default class Model {
  constructor() {
    this.experience = Experience.instance;
    this.render = new Render();
    this.renderer = this.render.renderer;
    this.time = this.experience.time;
    this.resources = this.experience.resources;
    this.scene = this.render.scene;

    this.intensity = 0.7;
    this.mode = "sceneTexture";
    this.asBackground = false;
    this.pmremGenerator = new THREE.PMREMGenerator(this.renderer.instance);

    this.setDummies();
    this.setFileTexture();
    this.setSceneTexture();
    this.setDebug();
    this.updateScene();
  }

  setFileTexture() {
    this.fileTexture = {};
    this.fileTexture.initialised = false;

    this.fileTexture.initialise = () => {
      if (this.fileTexture.initialised) return;

      this.fileTexture.initialised = true;

      this.pmremGenerator.compileEquirectangularShader();

      this.fileTexture.renderTarget = this.pmremGenerator.fromEquirectangular(
        this.resources.items.environmentMap
      );
      this.fileTexture.texture = this.fileTexture.renderTarget.texture;
    };
  }

  setSceneTexture() {
    this.sceneTexture = {};
    this.sceneTexture.blur = 0.0064; // 0.041
    this.sceneTexture.lightColor = new THREE.Color(0x90b0da);
    this.sceneTexture.lightMultiplier = 0.3;
    this.sceneTexture.initialised = false;

    this.sceneTexture.update = () => {
      this.sceneTexture.scene.traverse((_child) => {
        if (_child.isPointLight) {
          _child.intensity =
            _child.userData.intensity * this.sceneTexture.lightMultiplier;
        }
      });

      this.sceneTexture.renderTarget = this.pmremGenerator.fromScene(
        this.sceneTexture.scene,
        this.sceneTexture.blur
      );
      this.sceneTexture.texture = this.sceneTexture.renderTarget.texture;
    };

    this.sceneTexture.initialise = () => {
      if (this.sceneTexture.initialised) return;

      this.sceneTexture.initialised = true;

      this.sceneTexture.scene = new THREE.Scene();
      this.sceneTexture.scene.add(this.resources.items.environmentModel.scene);

      this.sceneTexture.scene.traverse((_child) => {
        if (_child.isPointLight) {
          _child.color = this.sceneTexture.lightColor;
          _child.userData.intensity = _child.intensity;
        }
        if (_child.name.match(/^areaLight/)) {
          const areaLight = new THREE.RectAreaLight(
            0xffffff,
            200 * this.sceneTexture.lightMultiplier,
            _child.scale.x,
            _child.scale.z
          );
          areaLight.color = this.sceneTexture.lightColor;
          areaLight.rotation.x = -Math.PI * 0.5;
          _child.add(areaLight);
        }
      });

      this.sceneTexture.update();
    };
  }

  setDummies() {
    this.dummies = {};
    this.dummies.autoRotate = true;

    // Group
    this.dummies.group = new THREE.Group();
    this.dummies.group.position.z = 2.5;
    this.dummies.group.visible = false;
    this.scene.add(this.dummies.group);

    // Material
    this.dummies.material = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 0,
      roughness: 0.5,
      side: THREE.DoubleSide,
    });

    // Cone
    this.dummies.cone = new THREE.Mesh(
      new THREE.ConeGeometry(0.5, 0.75, 32),
      this.dummies.material
    );
    this.dummies.cone.position.x = -2.25;

    // Box
    this.dummies.box = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      this.dummies.material
    );
    this.dummies.box.position.x = -0.75;

    // Sphere
    this.dummies.sphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.5, 32, 32),
      this.dummies.material
    );
    this.dummies.sphere.position.x = 0.75;

    // Circle
    this.dummies.circle = new THREE.Mesh(
      new THREE.CircleGeometry(0.5, 32),
      this.dummies.material
    );
    this.dummies.circle.position.x = 2.25;

    this.dummies.group.add(this.dummies.sphere);
    this.dummies.group.add(this.dummies.cone);
    this.dummies.group.add(this.dummies.box);
    this.dummies.group.add(this.dummies.circle);
  }

  updateScene() {
    this[this.mode].initialise();

    this.scene.traverse((_child) => {
      if (_child.isMesh && _child.material.isMeshStandardMaterial) {
        _child.material.envMap = this.texture;
        _child.material.envMapIntensity = this.intensity;
      }
    });

    this.scene.background = this.asBackground ? this[this.mode].texture : null;
    this.scene.environment = this[this.mode].texture;
  }

  setDebug() {
    const debug = this.experience.debug;

    if (!debug.active) return;

    // General
    const folder = debug.ui.getFolder("environmentMap");
    folder.open()

    const choices = {};
    if (this.resources.items.environmentMap)
      choices.fileTexture = "fileTexture";
    if (this.resources.items.environmentModel)
      choices.fileTexture = "sceneTexture";

    folder
      .add(this, "mode", choices)
      .name("mode")
      .onChange(() => {
        this.updateScene();
      });
    folder
      .add(this, "asBackground")
      .name("asBackground")
      .onChange(() => {
        this.updateScene();
      });
    folder
      .add(this, "intensity")
      .min(0)
      .max(3)
      .step(0.0001)
      .name("intensity")
      .onChange(() => {
        this.updateScene();
      });

    // Scene texture
    const sceneTexture = debug.ui.getFolder("environmentMap/sceneTexture");
    sceneTexture.open();

    sceneTexture
      .addColor(this.sceneTexture, "lightColor")
      .name("lightColor")
      .min(0)
      .max(1)
      .step(0.001)
      .onFinishChange(() => {
        this.sceneTexture.update();
        this.updateScene();
      });
    sceneTexture
      .add(this.sceneTexture, "lightMultiplier")
      .name("lightMultiplier")
      .min(0)
      .max(1)
      .step(0.001)
      .onFinishChange(() => {
        this.sceneTexture.update();
        this.updateScene();
      });
    sceneTexture
      .add(this.sceneTexture, "blur")
      .name("blur")
      .min(0)
      .max(0.041)
      .step(0.0001)
      .onFinishChange(() => {
        this.sceneTexture.update();
        this.updateScene();
      });

    // Dummies
    const dummiesFolder = debug.ui.getFolder("environmentMap/dummies");
    dummiesFolder.open();

    dummiesFolder.add(this.dummies, "autoRotate").name("autoRotate");
    dummiesFolder.add(this.dummies.group, "visible").name("visible");
    dummiesFolder.addColor(this.dummies.material, "color").name("color");
    dummiesFolder
      .add(this.dummies.material, "metalness")
      .min(0)
      .max(1)
      .step(0.001)
      .name("metalness");
    dummiesFolder
      .add(this.dummies.material, "roughness")
      .min(0)
      .max(1)
      .step(0.001)
      .name("roughness");
  }

  update() {
    if (this.dummies.autoRotate) {
      this.dummies.sphere.rotation.x = this.time.elapsed * 0.35;
      this.dummies.sphere.rotation.y = this.time.elapsed * 0.5;

      this.dummies.cone.rotation.x = this.time.elapsed * 0.35;
      this.dummies.cone.rotation.y = this.time.elapsed * 0.5;

      this.dummies.box.rotation.x = this.time.elapsed * 0.35;
      this.dummies.box.rotation.y = this.time.elapsed * 0.5;

      this.dummies.circle.rotation.x = this.time.elapsed * 0.35;
      this.dummies.circle.rotation.y = this.time.elapsed * 0.5;
    }
  }
}
