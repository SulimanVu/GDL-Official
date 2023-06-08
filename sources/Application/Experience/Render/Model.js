import * as THREE from "three";
import Ola from "ola";
import gsap from "gsap";

import Application from "../../Application.js";
import Experience from "../Experience.js";
import Render from "./Render.js";
import Iridescent from "./Iridescent.js";
import GlowMaterial from "./Materials/GlowMaterial.js";

export default class Model {
  constructor(_models, _name) {
    this.application = Application.instance;
    this.experience = Experience.instance;
    this.render = new Render();
    this.debug = this.experience.debug;
    this.time = this.experience.time;
    this.viewport = this.experience.viewport;
    this.mouse = this.experience.mouse;
    this.resources = this.experience.resources;
    this.scene = this.render.scene;
    this.domElement = this.experience.domElement;
    this.camera = this.render.camera;

    this.models = _models;
    this.name = _name;
    this.hideDistance = 11;
    this.shown = false;
    this.onScreen = false;

    this.groupA = new THREE.Group();
    this.models.groupC.add(this.groupA);

    this.groupB = new THREE.Group();

    const scale =
      1 /
      Math.max(
        1,
        (this.viewport.elementHeight / this.viewport.elementWidth) * 0.7
      );

    this.groupB.scale.set(scale, scale, scale);
    this.groupA.add(this.groupB);

    this.position = { x: 0, y: -this.hideDistance, z: 0 };
    this.rotation = { x: 0, y: 0 };

    this.olaPosition = Ola({ ...this.position }, 1000);
    this.olaRotation = Ola({ ...this.rotation }, 1000);

    this.autoRotate = true;

    this.setCursorParallax();
    this.setPlaceholder();
    this.setFocusPoint();

    this.resources.on("groupEnd", (_group) => {
      if (_group.name === this.name) {
        this.handleAssets(_group);
        this.setDebug();
      }
    });
  }

  handleAssets(_group) {
    this.assets = _group.items;

    this.setTextures();
    this.setMaterials();
    this.setBoxModel();

    this.placeholder.hide();
  }

  setCursorParallax() {
    this.cursorParallax = {};
    this.cursorParallax.easing = 5;
    this.cursorParallax.rotationAmplitude = { x: 0.3, y: 0.6 };
    this.cursorParallax.positionAmplitude = { x: -0.3, y: -0 };
  }

  setPlaceholder() {
    this.placeholder = {};

    this.placeholder.hide = () => {
      this.placeholder.mesh.visible = false;
    };

    this.placeholder.mesh = new THREE.Mesh(
      new THREE.CircleGeometry(0.25, 32),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );
    this.groupB.add(this.placeholder.mesh);
  }

  // Не трогать/ ни на что не влияет
  setFocusPoint() {
    this.focusPoint = {};
    this.focusPoint.screenPosition = new THREE.Vector2();

    // Object
    this.focusPoint.object = new THREE.Object3D();
    this.focusPoint.object.position.x = 1.5;

    // Dummy
    this.focusPoint.dummy = new THREE.Mesh(
      new THREE.BoxGeometry(0.25, 0.25, 0.25),
      new THREE.MeshBasicMaterial({ color: "red", wireframe: true })
    );
    // this.focusPoint.object.add(this.focusPoint.dummy);

    // Element
    this.focusPoint.element = document.querySelector(
      `.js-focus-point.is-${this.name}`
    );
  }

  setTextures() {
    this.textures = {};

    // Add commons
    for (const _textureKey in this.models.textures)
      this.textures[_textureKey] = this.models.textures[_textureKey];

    // Each asset
    for (const _assetKey in this.assets) {
      const asset = this.assets[_assetKey];

      // It's a texture
      if (asset instanceof THREE.Texture) {
        const name = _assetKey.replace("Texture", "");

        // Mipmaps filters
        asset.minFilter = THREE.LinearMipmapLinearFilter;
        asset.magFilter = THREE.LinearFilter;

        // Flip
        asset.flipY = false;

        // Title sticker
        if (
          ["stickerTitle", "stickerDescription"].includes(name) &&
          this.viewport.vertical
        ) {
          asset.minFilter = THREE.LinearFilter;
          asset.magFilter = THREE.LinearFilter;
        }

        // Encoding
        if (
          ["socials", "woodColor", "fabricColor", "switchGradient"].includes(
            name
          )
        ) {
          asset.encoding = THREE.sRGBEncoding;
        } else {
          asset.encoding = THREE.LinearEncoding;
        }

        // Anisitropy
        if (["stickerBottom"].includes(name)) {
          asset.anisotropy = 2;
        }

        // Wrapping
        if (["woodColor"].includes(name)) {
          asset.wrapS = THREE.RepeatWrapping;
          asset.wrapT = THREE.RepeatWrapping;
        } else {
          asset.wrapS = THREE.ClampToEdgeWrapping;
          asset.wrapT = THREE.ClampToEdgeWrapping;
        }

        // Save
        this.textures[name] = asset;
      }
    }
  }

  setMaterials() {
    this.materials = {};

    // this.materials.stickerSide = new THREE.MeshStandardMaterial({
    //   metalness: 0,
    //   roughness: 0.5,
    //   alphaMap: this.textures.stickerSide,
    //   transparent: true,
    //   alphaTest: 0.1,
    // });
    // this.materials.stickerScout = new THREE.MeshStandardMaterial({
    //   metalness: 0,
    //   roughness: 0.5,
    //   alphaMap: this.textures.stickerScout,
    //   transparent: true,
    //   alphaTest: 0.5,
    // });
    // this.materials.stickerScout.userData.updateEncoding = false;
    // this.materials.stickerTitle = new THREE.MeshStandardMaterial({
    //   metalness: 0,
    //   roughness: 0.5,
    //   alphaMap: this.textures.stickerTitle,
    //   transparent: true,
    //   alphaTest: 0.5,
    // });
    // this.materials.stickerDescription = new THREE.MeshStandardMaterial({
    //   metalness: 0,
    //   roughness: 0.5,
    //   alphaMap: this.textures.stickerDescription,
    //   transparent: true,
    //   alphaTest: 0.5,
    // });
    // this.materials.stickerBottom = new THREE.MeshStandardMaterial({
    //   metalness: 0,
    //   roughness: 0.5,
    //   alphaMap: this.textures.stickerBottom,
    //   transparent: true,
    //   alphaTest: 0.5,
    // });
    // this.materials.stickerBottom.userData.updateEncoding = false;

    // const stickerSmileyIridescent = new Iridescent({
    //   debugPath: `models/${this.name}/stickerSmiley`,
    //   texture: this.textures.stickerSmiley,
    //   color: "#7f7f7f",
    //   metalness: 0,
    //   roughness: 0.6,
    //   bumpScale: 0.0001,
    //   fesnelFrequency: 4,
    //   positionFrequency: 4.5,
    //   brightnessFrequency: 0.2,
    //   brightnessOffset: 0.3,
    //   intensity: 2,
    // });
    // this.materials.stickerSmiley = stickerSmileyIridescent.material;
    // this.materials.stickerSmiley.userData.updateEncoding = false;

    // switch (this.name) {
    //   case "crew":
    //     this.materials.stickerSmiley.color.set("#3b2a3c");
    //     this.materials.stickerScout.color.set("#372a7a");
    //     this.materials.stickerBottom.color.set("#372a7a");

    //     const pilIridescent = new Iridescent({
    //       debugPath: `models/${this.name}/pil`,
    //       texture: null,
    //       color: "#1d1aff",
    //       metalness: 1,
    //       roughness: 0.45,
    //       bumpScale: 0.0002,
    //       fesnelFrequency: 2,
    //       positionFrequency: 1.5,
    //       brightnessFrequency: 0,
    //       brightnessOffset: -0.6,
    //       intensity: 1,
    //     });
    //     this.materials.pil = pilIridescent.material;
    //     this.materials.pil.userData.updateEncoding = false;

    //     break;
    //   case "privatekey":
    //     this.materials.stickerSmiley.color.set("#2a3751");
    //     this.materials.stickerScout.color.set("#34469d");
    //     this.materials.stickerBottom.color.set("#34469d");
    //     this.materials.key = new THREE.MeshStandardMaterial({
    //       metalness: 1,
    //       roughness: 0.6,
    //       color: "#696969",
    //     });
    //     break;
    //   case "onscout":
    //     this.materials.stickerSmiley.color.set("#333333");
    //     this.materials.stickerScout.color.set("#ffffff");
    //     this.materials.stickerBottom.color.set("#ffffff");
    //     this.materials.furnitureCouch = new THREE.MeshStandardMaterial({
    //       metalness: 0,
    //       roughness: 1,
    //       map: this.textures.fabricColor,
    //     });
    //     this.materials.furnitureCouchLegs = new THREE.MeshStandardMaterial({
    //       metalness: 0,
    //       roughness: 0.553,
    //       color: "#6D6D6D",
    //     });
    //     this.materials.furniturePlant = new THREE.MeshStandardMaterial({
    //       metalness: 0,
    //       roughness: 0.553,
    //       color: "#3D8058",
    //     });
    //     this.materials.furnitureWhitePlastic = new THREE.MeshStandardMaterial({
    //       metalness: 0,
    //       roughness: 0.553,
    //       color: "#C6C6C6",
    //     });
    //     this.materials.furnitureBlackPlastic = new THREE.MeshStandardMaterial({
    //       metalness: 0,
    //       roughness: 0.5,
    //       color: "#373737",
    //     });
    //     this.materials.furnitureScreen = new THREE.MeshStandardMaterial({
    //       metalness: 0,
    //       roughness: 0.1,
    //       color: "#4E4E4E",
    //     });
    //     this.materials.furnitureWood = new THREE.MeshStandardMaterial({
    //       metalness: 0,
    //       roughness: 0.553,
    //       map: this.textures.woodColor,
    //       color: "#ec8a6a",
    //     });
    //     this.materials.furnitureWood.userData.updateEncoding = false;
    //     break;
    //   case "isonline":
    //     this.materials.stickerSmiley.color.set("#563e4c");
    //     this.materials.stickerScout.color.set("#b63587");
    //     this.materials.stickerBottom.color.set("#b63587");
    //     this.materials.switchBackground = new THREE.MeshStandardMaterial({
    //       metalness: 0,
    //       roughness: 0.5,
    //       map: this.textures.switchGradient,
    //     });
    //     this.materials.switchOutline = new THREE.MeshStandardMaterial({
    //       metalness: 0.5,
    //       roughness: 0.1,
    //       color: "#6B6B6B",
    //     });
    //     this.materials.switchButton = new THREE.MeshStandardMaterial({
    //       metalness: 0.05,
    //       roughness: 0.3,
    //       color: "#ffffff",
    //     });
    //     break;
    // }

    // for (const _materialKey in this.materials) {
    //   const material = this.materials[_materialKey];

    //   if (material.color && material.userData.updateEncoding !== false)
    //     material.color.convertSRGBToLinear();
    // }

    // // Add commons
    // for (const _materialKey in this.models.materials) {
    //   this.materials[_materialKey] = this.models.materials[_materialKey];
    // }

    // for (const _materialKey in this.materials) {
    //   const material = this.materials[_materialKey];
    //   material.userData.regex = new RegExp(`^${_materialKey}`);
    // }
  }

  setBoxModel(_model) {
    this.boxModel = this.assets.model.scene;

    this.boxModel.rotation.order = "YXZ";
    this.boxModel.rotation.x = Math.PI * 0.4;

    this.groupB.add(this.boxModel);

    this.boxModel.traverse((_child) => {
      if (_child.isMesh) {
        for (const _materialKey in this.materials) {
          const material = this.materials[_materialKey];

          if (material.userData.regex.test(_child.name))
            _child.material = material;
        }

        // Shadow
        if (
          !_child.name.match(/^plasticCover/) &&
          !_child.name.match(/^bulbGlass/) &&
          !_child.name.match(/^bulbGlow/) &&
          !_child.name.match(/^bulbPin/)
        ) {
          _child.castShadow = true;
          _child.receiveShadow = true;
        }

        // Bulb glass
        if (_child.name.match(/^bulbGlass/)) {
          const parent = _child.parent;
          window.requestAnimationFrame(() => {
            parent.add(_child);
          });
        }

        // Plastic cover
        if (_child.name.match(/^plasticCover/)) {
          const parent = _child.parent;
          window.requestAnimationFrame(() => {
            window.requestAnimationFrame(() => {
              parent.add(_child);
            });
          });
        }

        // Bulb glow
        if (_child.name.match(/^bulbGlow/)) {
          const parent = _child.parent;
          window.requestAnimationFrame(() => {
            _child.removeFromParent();
            window.requestAnimationFrame(() => {
              window.requestAnimationFrame(() => {
                parent.add(_child);
              });
            });
          });
        }

        // Wireframe
        _child.material.wireframe = this.models.wireframe;

        // Force render
        _child.frustumCulled = false;
        window.requestAnimationFrame(() => {
          _child.frustumCulled = true;
        });
      }
    });
  }

  setDebug() {
    const debug = this.experience.debug;
    if (!debug.active) return;
    // General
    const folder = debug.ui.getFolder(`models/${this.name}`);
    folder.open();

    folder
      .addColor(this.materials.stickerScout, "color")
      .name("stickerScoutColor");
    if (this.materials.furnitureWood)
      folder
        .addColor(this.materials.furnitureWood, "color")
        .name("furnitureWoodColor");
    if (this.materials.bulbGlow) {
      folder
        .add(this.materials.bulbGlow.uniforms.uFresnelOffset, "value")
        .min(-2)
        .max(2)
        .step(0.01)
        .name("uFresnelOffset");
      folder
        .add(this.materials.bulbGlow.uniforms.uFresnelScale, "value")
        .min(0)
        .max(2)
        .step(0.01)
        .name("uFresnelScale");
      folder
        .add(this.materials.bulbGlow.uniforms.uFresnelPower, "value")
        .min(1)
        .max(4)
        .step(1)
        .name("uFresnelPower");
    }
    if (this.materials.bulbGlow) {
      folder
        .add(this.materials.bulbGlass, "metalness")
        .min(0)
        .max(1)
        .step(0.001)
        .name("metalness");
      folder
        .add(this.materials.bulbGlass, "roughness")
        .min(0)
        .max(1)
        .step(0.001)
        .name("roughness");
      folder
        .add(this.materials.bulbGlass, "opacity")
        .min(0)
        .max(1)
        .step(0.001)
        .name("opacity");
    }
  }

  show(forward = true) {
    if (this.shown) return;

    this.shown = true;

    const delay = 0.5;

    // Reset current animations
    gsap.killTweensOf(this.position);
    gsap.killTweensOf(this.rotation);

    if (forward) {
      if (this.position.y > 0) {
        this.olaPosition._y.current = -this.hideDistance;
        this.olaPosition._y.from = -this.hideDistance;
        this.olaPosition._y.to = -this.hideDistance;
      }
    } else {
      if (this.position.y < 0) {
        this.olaPosition._y.current = this.hideDistance;
        this.olaPosition._y.from = this.hideDistance;
        this.olaPosition._y.to = this.hideDistance;
      }
    }

    // Position
    gsap.fromTo(
      this.position,
      {
        y: forward ? -this.hideDistance : this.hideDistance,
      },
      {
        y: this.viewport.width < 400 ? 0 : 2,
        duration: 1,
        ease: "power2.out",
        delay: delay,
      }
    );

    // Rotation
    gsap.fromTo(
      this.rotation,
      {
        y: forward ? Math.PI * 0.5 : -Math.PI * 0.5,
        x: forward ? -Math.PI * 0.5 : Math.PI * 0.5,
        duration: 1,
        ease: "power2.out",
        delay: delay,
      },
      {
        y: 0,
        x: 0,
      }
    );
  }

  hide(forward = true) {
    if (!this.shown) return;

    this.shown = false;

    // Reset current animations
    gsap.killTweensOf(this.position);
    gsap.killTweensOf(this.rotation);

    // Position
    gsap.to(this.position, {
      y: forward ? this.hideDistance : -this.hideDistance,
      duration: 1,
      ease: "power2.in",
    });

    // Rotation
    gsap.fromTo(
      this.rotation,
      {
        y: 0,
        x: 0,
        duration: 1,
        ease: "power2.in",
      },
      {
        y: forward ? -Math.PI * 0.5 : Math.PI * 0.5,
        x: forward ? Math.PI * 0.5 : -Math.PI * 0.5,
        duration: 1,
        ease: "power2.in",
      }
    );
  }

  update() {
    // Ola interpolation
    this.olaPosition.set({
      x: this.position.x,
      y: this.position.y,
      z: this.position.z,
    });
    this.olaRotation.set({ x: this.rotation.x, y: this.rotation.y });

    // Group position and rotation
    this.groupA.position.x = this.olaPosition.x;
    this.groupA.position.y = this.olaPosition.y;
    this.groupA.position.z = this.olaPosition.z;

    this.groupA.rotation.x = this.olaRotation.x;
    this.groupA.rotation.y = this.olaRotation.y;

    // On screen
    this.onScreen =
      this.groupA.position.y < this.hideDistance * 0.9 &&
      this.groupA.position.y > -this.hideDistance * 0.9;

    if (this.onScreen) {
      // Permanent rotation
      if (this.autoRotate && this.boxModel) {
        this.boxModel.rotation.y =
          0.2 +
          Math.sin(this.time.elapsed * 0.654) *
            Math.sin(this.time.elapsed * 0.789) *
            0.15;
        this.boxModel.rotation.x =
          0.2 +
          Math.sin(this.time.elapsed * 0.456) *
            Math.sin(this.time.elapsed * 0.123) *
            0.07;
      }

      // Cursor parallax
      let rotationX = 0;
      let rotationY = 0;

      let positionX = 0;
      let positionY = 0;

      if (this.application.isMouse) {
        rotationX =
          this.mouse.normalised.y * this.cursorParallax.rotationAmplitude.x;
        rotationY =
          this.mouse.normalised.x * this.cursorParallax.rotationAmplitude.y;

        positionX =
          this.mouse.normalised.x * this.cursorParallax.positionAmplitude.x;
        positionY =
          this.mouse.normalised.y * this.cursorParallax.positionAmplitude.y;
      }

      this.groupB.rotation.x +=
        (rotationX - this.groupB.rotation.x) *
        this.cursorParallax.easing *
        this.time.delta;
      this.groupB.rotation.y +=
        (rotationY - this.groupB.rotation.y) *
        this.cursorParallax.easing *
        this.time.delta;

      this.groupB.position.x +=
        (positionX - this.groupB.position.x) *
        this.cursorParallax.easing *
        this.time.delta;
      this.groupB.position.y +=
        (positionY - this.groupB.position.y) *
        this.cursorParallax.easing *
        this.time.delta;

      // Bulb glow
      if (this.materials && this.materials.bulbGlow) {
        this.materials.bulbGlow.uniforms.uFresnelScale.value =
          1.5 + (Math.random() - 0.5) * 0.4;
      }
      //
      //
      //
      //
      //
      //
      //
      // // Focus point
      const screenPosition = new THREE.Vector3();
      this.focusPoint.object.getWorldPosition(screenPosition);

      screenPosition.project(this.camera.instance);
      screenPosition.x =
        (screenPosition.x * 0.5 + 0.5) * this.viewport.elementWidth;
      screenPosition.y =
        this.viewport.elementHeight -
        (screenPosition.y * 0.5 + 0.5) * this.viewport.elementHeight;

      screenPosition.x = Math.round(screenPosition.x);
      screenPosition.y = Math.round(screenPosition.y);

      // this.focusPoint.element.style.top = `${screenPosition.y}px`
      // this.focusPoint.element.style.left = `${screenPosition.x}px`
    }
  }

  resize() {
    const scale =
      1 /
      Math.max(
        1,
        (this.viewport.elementHeight / this.viewport.elementWidth) * 0.7
      );
    this.groupB.scale.set(scale, scale, scale);
  }
}
