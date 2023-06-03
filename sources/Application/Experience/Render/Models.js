import * as THREE from "three";
import gsap from "gsap";

import Experience from "../Experience.js";
import Render from "./Render.js";
import Model from "./Model.js";
import Iridescent from "./Iridescent.js";

export default class Models {
  constructor() {
    this.experience = Experience.instance;
    this.render = new Render();
    this.debug = this.experience.debug;
    this.time = this.experience.time;
    this.viewport = this.experience.viewport;
    this.resources = this.experience.resources;
    this.renderer = this.render.renderer;
    this.scene = this.render.scene;

    this.wireframe = false;

    this.scrollGroup = new THREE.Group();
    this.scene.add(this.scrollGroup);

    this.groupB = new THREE.Group();
    this.groupB.position.y = -4;
    this.scrollGroup.add(this.groupB);

    this.groupC = new THREE.Group();
    this.groupB.add(this.groupC);

    this.setScroll();
    this.setOffset();
    this.setTextures();
    this.setMaterials();
    this.setItems();
    this.setDebug();
  }

  show() {
    gsap.to(this.groupB.position, {
      y: 0,
      duration: 1.5,
      ease: "power2.inOut",
    });
  }

  setScroll() {
    this.scroll = {};
    this.scroll.value = 0;
    this.scroll.target = 0;
    this.scroll.multiplier = 0.004;
    this.scroll.easing = 8;
  }

  setOffset() {
    this.offset = {};
    this.offset.value = 0;
    this.offset.rotationMultiplier = -0.1;

    this.offset.go = () => {
      gsap.to(this.offset, { value: -2, duration: 1, ease: "power2.inOut" });
    };

    this.offset.leave = () => {
      gsap.to(this.offset, {
        value: 0,
        duration: 0.7,
        delay: 0.25,
        ease: "power2.inOut",
      });
    };
  }

  setTextures() {
    // this.textures = {};
    // this.textures.stickerScout = this.resources.items.stickerScoutTexture;
    // this.textures.stickerSide = this.resources.items.stickerSideTexture;
    // this.textures.stickerSmiley = this.resources.items.stickerSmileyTexture;
    // this.textures.stickerOnscout = this.resources.items.stickerOnscoutTexture;
    // for (const _textureKey in this.textures) {
    //   const texture = this.textures[_textureKey];
    //   texture.minFilter = THREE.LinearMipmapLinearFilter;
    //   texture.magFilter = THREE.LinearFilter;
    //   texture.wrapS = THREE.ClampToEdgeWrapping;
    //   texture.wrapT = THREE.ClampToEdgeWrapping;
    //   texture.flipY = false;
    // }
    // this.textures.stickerScout.anisotropy = 4;
    // this.textures.stickerSide.anisotropy = 4;
  }

  setMaterials() {
    this.materials = {};

    /**
     * Iridescents
     */
    const stickerCornerIridescent = new Iridescent({
      //   debugPath: `models/materials/stickerCorner`,
      //   texture: this.textures.stickerOnscout,
      color: "#ffffff",
      iridescentColor: "#7a7a7a",
      metalness: 1,
      roughness: 0.2,
      bumpScale: 0.0, // 0002
      fesnelFrequency: 2,
      positionFrequency: 4.5,
      brightnessFrequency: 0.2,
      brightnessOffset: 0.3,
      intensity: 1,
    });
    (this.materials.stickerCorner = stickerCornerIridescent.material),
      (this.materials.stickerCorner.wireframe = this.wireframe);

    /**
     * Others
     */
    this.materials.plasticCover = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      metalness: 1,
      roughness: 0.25,
      opacity: 0.2,
      transparent: true,
    });
    this.materials.mold = new THREE.MeshStandardMaterial({
      metalness: 0.2,
      roughness: 0.5,
      color: "#353437",
    });
    this.materials.base = new THREE.MeshStandardMaterial({
      metalness: 0.2,
      roughness: 0.5,
      color: "#353437",
    });

    this.materials.plasticCover.wireframe = this.wireframe;
    this.materials.mold.wireframe = this.wireframe;
    this.materials.base.wireframe = this.wireframe;

    for (const _materialKey in this.materials) {
      const material = this.materials[_materialKey];

      if (material.userData.encodeColor !== false)
        material.color.convertSRGBToLinear();
    }
  }

  setItems() {
    this.items = new Map();

    this.items.set("crew", new Model(this, "crew"));
    this.items.set("privatekey", new Model(this, "privatekey"));
    this.items.set("onscout", new Model(this, "onscout"));
    this.items.set("isonline", new Model(this, "isonline"));
    this.items.set("ideasby", new Model(this, "ideasby"));
    this.items.set("takemeto", new Model(this, "takemeto"));
  }

  setDebug() {
    const debug = this.experience.debug;

    if (!debug.active) return;

    // General
    const folder = debug.ui.getFolder(`models`);
    folder.open();

    folder.add(this, "wireframe").onChange(() => {
      this.scene.traverse((_child) => {
        if (_child.isMesh) {
          _child.material.wireframe = this.wireframe;
        }
      });
    });

    // Plastic cover Material
    const plasticCoverMaterialfolder = debug.ui.getFolder(
      `models/materials/plasticCover`
    );
    plasticCoverMaterialfolder.open();

    plasticCoverMaterialfolder
      .addColor(this.materials.plasticCover, "color")
      .name("color");
    plasticCoverMaterialfolder
      .add(this.materials.plasticCover, "metalness")
      .min(0)
      .max(1)
      .step(0.001)
      .name("metalness");
    plasticCoverMaterialfolder
      .add(this.materials.plasticCover, "roughness")
      .min(0)
      .max(1)
      .step(0.001)
      .name("roughness");
    plasticCoverMaterialfolder
      .add(this.materials.plasticCover, "opacity")
      .min(0)
      .max(1)
      .step(0.001)
      .name("opacity");
  }

  update() {
    // Offset
    if (this.viewport.vertical) {
      this.groupB.position.x = 0;
      this.groupC.position.y = 0.15 - this.offset.value * 0.7;
    } else {
      const ratio = this.viewport.width / this.viewport.height;
      this.groupB.position.x = this.offset.value * ratio;

      this.groupC.position.y = -2;
      // this.groupC.position.y = 0;
    }

    this.groupC.rotation.y = this.offset.value * this.offset.rotationMultiplier;

    // Scroll
    const scrollTarget = this.scroll.target * this.scroll.multiplier;
    this.scrollGroup.position.y +=
      (scrollTarget - this.scrollGroup.position.y) *
      this.scroll.easing *
      this.time.delta;

    // Items
    for (const [_key, _item] of this.items) {
      _item.update();
    }
  }

  resize() {
    // Items
    for (const [_key, _item] of this.items) {
      _item.resize();
    }
  }
}
