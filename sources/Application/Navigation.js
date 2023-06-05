import gsap from "gsap";

import Application from "./Application.js";
import Experience from "./Experience/Experience.js";
import Render from "./Experience/Render/Render.js";
import Wheel from "./Wheel.js";

export default class Navigation {
  constructor() {
    this.application = new Application();
    this.experience = new Experience();
    this.render = new Render();
    this.mouse = this.application.mouse;
    this.viewport = this.application.viewport;
    this.time = this.application.time;

    this.index = null;
    this.section = null;
    this.focused = false;
    this.canNavigate = false;
    this.isBaseLoaded = false;
    this.isFinalLoaded = false;
    this.started = false;
    this.navigatedOnce = false;
    this.focusedOnce = false;

    this.setMainIntro();
    this.setCursors();
    this.setMainLogo();
    this.setJoin();
    this.setDropDown();
    this.setFavicons();

    this.experience.resources.on("groupEnd", (_group) => {
      if (_group.name === "base") {
        this.isBaseLoaded = true;

        this.setSections();
        this.setKeyboard();
        this.setWheel();
        this.setSwipe();
        this.setFocusPoints();
        this.setScrollDown();
        this.goToIndex(0, true);

        this.tryStart();
      }
    });

    this.experience.resources.on("end", (_group) => {
      this.isFinalLoaded = true;
    });
  }

  tryStart() {
    // Already started
    if (this.started) return;

    // Intro not ended or base not loaded
    if (!this.intro.ended || !this.isBaseLoaded) return;

    this.started = true;

    this.cursors.box.updateBounding();

    this.intro.leave();

    gsap.delayedCall(0.6, () => {
      this.render.models.show();
    });

    gsap.delayedCall(1.7, () => {
      this.canNavigate = true;
      document.documentElement.classList.add("is-can-navigate");

      this.scrollDown.show();
    });

    gsap.delayedCall(1.2, () => {
      this.mainLogo.headerContainer.appendChild(this.mainLogo.element);
      this.mainLogo.headerContainer.classList.add("is-visible");
      this.join.element.classList.add("is-visible");
      this.drop_down.element.classList.add("is-visible");
    });
  }

  setMainIntro() {
    this.intro = {};
    this.intro.element = document.querySelector(".js-main-intro");
    this.intro.ended = false;

    this.intro.enter = () => {
      document.documentElement.classList.add("is-intro-entering");
    };

    this.intro.leave = () => {
      document.documentElement.classList.add("is-intro-leaving");
    };

    this.intro.end = () => {
      this.intro.ended = true;
      this.tryStart();
    };

    gsap.delayedCall(1, this.intro.enter);
    gsap.delayedCall(this.experience.debug.active ? 1.5 : 4, this.intro.end);
  }

  setSections() {
    const sectionElements = [...document.querySelectorAll(".js-section")];

    this.sectionsElement = document.querySelector(".js-sections");

    this.sections = [
      // {
      //   name: "intro",
      //   canFocus: false,
      //   element: sectionElements.find((_element) =>
      //     _element.classList.contains("is-intro")
      //   ),
      //   model: this.render.models.items.get("intro"),
      // },
      {
        name: "crew",
        color: "a48bff",
        canFocus: true,
        element: sectionElements.find((_element) =>
          _element.classList.contains("is-crew")
        ),
        model: this.render.models.items.get("crew"),
      },
      {
        name: "privatekey",
        color: "85a5ff",
        canFocus: true,
        element: sectionElements.find((_element) =>
          _element.classList.contains("is-privatekey")
        ),
        model: this.render.models.items.get("privatekey"),
      },
      {
        name: "onscout",
        color: "ffffff",
        canFocus: true,
        element: sectionElements.find((_element) =>
          _element.classList.contains("is-onscout")
        ),
        model: this.render.models.items.get("onscout"),
      },
      {
        name: "isonline",
        color: "f2acf2",
        canFocus: true,
        element: sectionElements.find((_element) =>
          _element.classList.contains("is-isonline")
        ),
        model: this.render.models.items.get("isonline"),
      },
      {
        name: "ideasby",
        color: "f9d77f",
        canFocus: true,
        element: sectionElements.find((_element) =>
          _element.classList.contains("is-ideasby")
        ),
        model: this.render.models.items.get("ideasby"),
      },
      {
        name: "takemeto",
        color: "ffffff",
        canFocus: true,
        element: sectionElements.find((_element) =>
          _element.classList.contains("is-takemeto")
        ),
        model: this.render.models.items.get("takemeto"),
      },
    ];
  }

  setKeyboard() {
    window.addEventListener("keydown", (_event) => {
      if (_event.key === "ArrowRight" || _event.key === "ArrowDown")
        this.next();
      else if (_event.key === "ArrowLeft" || _event.key === "ArrowUp")
        this.previous();
      else if (_event.key === "Enter") this.goFocus();
      else if (_event.key === "Escape") this.leaveFocus();
    });
  }

  setWheel() {
    this.wheel = new Wheel();

    this.wheel.on("wheel", (_direction) => {
      if (_direction === 1) this.next();
      else if (_direction === -1) this.previous();
    });
  }

  setSwipe() {
    this.swipe = {};
    this.swipe.minDistance = 20;
    this.swipe.startX = 0;
    this.swipe.startY = 0;
    this.swipe.preventDefault = true;

    // Touch start callback
    this.swipe.touchStart = (_event) => {
      this.swipe.startX = _event.changedTouches[0].screenX;
      this.swipe.startY = _event.changedTouches[0].screenY;

      // Listen to touch events
      document.body.addEventListener("touchmove", this.swipe.touchMove, {
        passive: false,
      });
      document.body.addEventListener("touchend", this.swipe.touchEnd, {
        passive: false,
      });
    };

    // Touch move callback
    this.swipe.touchMove = (_event) => {
      if (this.swipe.preventDefault) _event.preventDefault();

      const x = _event.changedTouches[0].screenX;
      const y = _event.changedTouches[0].screenY;
      const xDistance = this.swipe.startX - x;
      const yDistance = this.swipe.startY - y;

      if (Math.abs(yDistance) < Math.abs(xDistance)) {
        _event.preventDefault();
      }
    };

    // Touch end callback
    this.swipe.touchEnd = (_event) => {
      const x = _event.changedTouches[0].screenX;
      const y = _event.changedTouches[0].screenY;
      const xDistance = this.swipe.startX - x;
      const yDistance = this.swipe.startY - y;

      // Horizontal swipe
      if (Math.abs(xDistance) > Math.abs(yDistance)) {
        // To left / Go right
        if (xDistance > this.swipe.minDistance) {
          this.goFocus();
        }
        // To right / Go left
        else if (xDistance < -this.swipe.minDistance) {
          this.leaveFocus();
        }
      }

      // Vertical swipe
      else {
        if (!this.focused) {
          // To left / Go right
          if (yDistance > this.swipe.minDistance) {
            this.next();
          }
          // To right / Go left
          else if (yDistance < -this.swipe.minDistance) {
            this.previous();
          }
        }
      }

      document.body.removeEventListener("touchmove", this.swipe.touchMove);
      document.body.removeEventListener("touchend", this.swipe.touchEnd);
    };

    // Listen to touchstart event
    document.body.addEventListener("touchstart", this.swipe.touchStart);
  }

  setFocusPoints() {
    this.focusPoints = {};
    this.focusPoints.elements = document.querySelectorAll(".js-focus-point");

    for (const _element of this.focusPoints.elements) {
      _element.addEventListener("click", () => {
        this.goFocus();
      });
    }
  }

  setMainLogo() {
    this.mainLogo = {};
    this.mainLogo.element = document.querySelector(".js-main-logo");
    this.mainLogo.pivotElement =
      this.mainLogo.element.querySelector(".js-pivot");
    this.mainLogo.loaderContainer = document.querySelector(
      ".js-main-logo-loader"
    );
    this.mainLogo.headerContainer = document.querySelector(
      ".js-main-logo-header"
    );
    this.mainLogo.rotateX = 0;
    this.mainLogo.rotateY = 0;
    this.mainLogo.easing = 5;

    this.mainLogo.element.addEventListener("click", (_event) => {
      _event.preventDefault();

      if (this.focused) this.leaveFocus();
      else this.goTo(0);
    });
  }

  setJoin() {
    this.join = {};
    this.join.element = document.querySelector(".js-join");
  }
  setDropDown() {
    this.drop_down = {};
    this.drop_down.element = document.querySelector(".js-drop-down");
  }
  setFavicons() {
    this.favicons = {};
    this.favicons.elements = document.querySelectorAll(".js-favicon");
    this.favicons.update = (_color) => {
      for (const _element of this.favicons.elements) {
        const href = _element.dataset.href.replace("{color}", _color);
        _element.href = href;
      }
    };
  }

  setScrollDown() {
    this.scrollDown = {};
    this.scrollDown.element = document.querySelector(".js-scroll-down");

    this.scrollDown.hide = () => {
      this.scrollDown.element.classList.remove("is-visible");
    };

    this.scrollDown.show = () => {
      this.scrollDown.element.classList.add("is-visible");
    };

    this.scrollDown.element.addEventListener("click", (_event) => {
      _event.preventDefault();
      this.next();
    });
  }

  setCursors() {
    this.cursors = {};
    this.cursors.element = document.querySelector(".js-cursor");
    this.cursors.x = this.viewport.width * 0.8;
    this.cursors.y = this.viewport.height * 0.4;

    // Links
    const linksElements = document.querySelectorAll(".js-link");

    for (const linkElement of linksElements) {
      linkElement.addEventListener("mouseenter", () => {
        document.documentElement.classList.add("is-hovering-link");
      });

      linkElement.addEventListener("mouseleave", () => {
        document.documentElement.classList.remove("is-hovering-link");
      });
    }

    // Box
    this.cursors.box = {};
    this.cursors.box.bounding = null;

    this.cursors.box.updateBounding = () => {
      this.cursors.box.bounding =
        this.cursors.box.areaElement.getBoundingClientRect();

      if (this.application.isMouse) {
        this.cursors.box.areaElement.classList.add("is-pending");

        window.addEventListener(
          "mousemove",
          () => {
            this.cursors.box.areaElement.classList.remove("is-pending");
          },
          { once: true }
        );
      }
    };

    window.addEventListener("resize", this.cursors.box.updateBounding);

    this.cursors.box.areaElement = document.querySelector(".js-box-area");
    this.cursors.box.hovered = false;
    this.cursors.box.enter = () => {
      this.cursors.box.hovered = true;
    };
    this.cursors.box.leave = () => {
      this.cursors.box.hovered = false;
    };

    this.cursors.box.areaElement.addEventListener(
      "mouseenter",
      this.cursors.box.enter
    );
    this.cursors.box.areaElement.addEventListener(
      "mouseleave",
      this.cursors.box.leave
    );

    this.cursors.box.areaElement.addEventListener("click", () => {
      if (!this.focused) this.goFocus();
      else this.leaveFocus();
    });

    this.cursors.box.updateBounding();
  }

  goToName(_name) {
    const index = this.sections.findIndex(
      (_section) => _section.name === _name
    );

    if (index === -1) return false;

    this.goToIndex(index);
  }

  goToIndex(_index, _force = false, _forward = null) {
    if (!this.canNavigate && !_force) return;

    if (this.index === _index && !_force) return;

    // Lock navigation
    if (!_force) {
      this.canNavigate = false;
      document.documentElement.classList.remove("is-can-navigate");

      gsap.delayedCall(1, () => {
        this.canNavigate = true;
        document.documentElement.classList.add("is-can-navigate");
      });
    }

    // Indexes and direction
    const oldIndex = this.index;
    const newIndex = _index;
    const forward =
      _forward !== null ? _forward : oldIndex === null || newIndex > oldIndex;

    // Leave potential focus
    this.leaveFocus();

    // Scroll
    this.scrollDown.hide();

    /**
     * Old
     */
    if (oldIndex !== null) {
      // Section
      const oldSection = this.sections[oldIndex];
      oldSection.model.hide(forward);

      // HTML class
      document.documentElement.classList.remove(
        `is-section-${oldSection.name}`
      );
    }

    /**
     * New
     */
    const newSection = this.sections[newIndex];
    newSection.model.show(forward);

    // HTML class
    document.documentElement.classList.add(`is-section-${newSection.name}`);

    // Favicon
    gsap.delayedCall(0.75, () => {
      this.favicons.update(newSection.color);
    });

    this.index = newIndex;
    this.section = newSection;
  }

  goTo(_target) {
    if (typeof _target === "string") return this.goToName(_target);

    if (typeof _target === "number") return this.goToIndex(_target);
  }

  next() {
    if (this.index >= this.sections.length - 1) return;

    // First navigation
    if (!this.navigatedOnce) {
      this.navigatedOnce = true;
      document.documentElement.classList.add("is-navigated-once");
    }

    this.goToIndex((this.index + 1) % this.sections.length, false, true);
  }

  previous() {
    if (this.index === 0) return;

    // First navigation
    if (!this.navigatedOnce) {
      this.navigatedOnce = true;
      document.documentElement.classList.add("is-navigated-once");
    }

    this.goToIndex(
      this.index - 1 < 0 ? this.sections.length - 1 : this.index - 1,
      false,
      false
    );
  }

  goFocus() {
    if (
      this.focused ||
      !this.section ||
      !this.section.canFocus ||
      !this.canNavigate
    )
      return;

    this.focused = true;

    // Lock navigation
    this.canNavigate = false;
    document.documentElement.classList.remove("is-can-navigate");

    gsap.delayedCall(0.3, () => {
      this.canNavigate = true;
      document.documentElement.classList.add("is-can-navigate");
    });

    // Focused once
    if (!this.focusedOnce) {
      this.focusedOnce = true;
      document.documentElement.classList.add("is-focused-once");
    }

    // Swipe
    this.swipe.preventDefault = false;

    // Wheel
    if (this.viewport.vertical) this.wheel.preventDefault = false;

    // Update HTML class
    document.documentElement.classList.add("is-focused");

    // Update section class
    this.section.element.classList.add("is-active");
    this.sectionsElement.scrollTop = 0;

    // Update scroll
    this.sectionsElement.classList.add("is-scrollable");

    // Move model
    this.experience.render.models.offset.go();

    // Update box
    this.cursors.box.hovered = false;
    this.cursors.box.updateBounding();

    if (this.viewport.vertical) {
      gsap.to(this.cursors, {
        duration: 0.6,
        ease: "power2.inOut",
        x: this.viewport.width * 0.85,
        y: this.viewport.height * 0.075,
      });
    }

    // Scroll down
    this.scrollDown.hide();

    // Header
    this.mainLogo.headerContainer.classList.add("is-leaving");

    // Join
    this.join.element.classList.add("is-leaving");
    this.drop_down.element.classList.add("is-leaving");
  }

  leaveFocus() {
    if (!this.focused) return;

    this.focused = false;

    // Lock navigation
    this.canNavigate = false;
    document.documentElement.classList.remove("is-can-navigate");

    gsap.delayedCall(0.3, () => {
      this.canNavigate = true;
      document.documentElement.classList.add("is-can-navigate");
    });

    // Swipe
    this.swipe.preventDefault = true;

    // Wheel
    this.wheel.preventDefault = true;

    // Update HTML class
    document.documentElement.classList.remove("is-focused");

    // Update section class
    this.section.element.classList.remove("is-active");

    // Move model
    this.experience.render.models.offset.leave();
    gsap.to(this.render.models.scroll, {
      target: 0,
      duration: 0.7,
      delay: 0.25,
      ease: "power2.inOut",
    });

    // Update box
    this.cursors.box.hovered = false;
    this.cursors.box.updateBounding();

    if (this.viewport.vertical) {
      gsap.to(this.cursors, {
        duration: 0.6,
        ease: "power2.inOut",
        x: this.viewport.width * 0.8,
        y: this.viewport.height * 0.4,
      });
    }
    gsap.delayedCall(0.6, () => {
      // Update scroll
      this.sectionsElement.classList.remove("is-scrollable");

      // Header
      this.mainLogo.headerContainer.classList.remove("is-leaving");

      // Join
      this.join.element.classList.remove("is-leaving");
      this.drop_down.element.classList.remove("is-leaving");

      // Scroll down
      if (!this.navigatedOnce) this.scrollDown.show();
    });
  }

  update() {
    /**
     * Cursors
     */
    if (this.viewport.vertical) {
      if (this.focused) {
        this.cursors.x = this.viewport.width - 80;
        this.cursors.y = 80;
      } else {
        this.cursors.x = this.viewport.width - 80;
        this.cursors.y = this.viewport.height * 0.4;
      }
    } else {
      this.cursors.x = this.mouse.screen.x;
      this.cursors.y = this.mouse.screen.y;
    }

    this.cursors.element.style.transform = `translate(${this.cursors.x}px, ${this.cursors.y}px)`;

    if (this.cursors.box.hovered)
      document.documentElement.classList.add("is-hovering-box");
    else document.documentElement.classList.remove("is-hovering-box");

    /**
     * Main logo
     */
    if (this.mainLogo && this.application.isMouse) {
      const rotateX = -this.mouse.normalised.y * 20 - 15;
      const rotateY = this.mouse.normalised.x * 25;

      this.mainLogo.rotateX +=
        (rotateX - this.mainLogo.rotateX) *
        this.mainLogo.easing *
        this.time.delta;
      this.mainLogo.rotateY +=
        (rotateY - this.mainLogo.rotateY) *
        this.mainLogo.easing *
        this.time.delta;
      this.mainLogo.pivotElement.style.transform = `rotateY(${this.mainLogo.rotateY}deg) rotateX(${this.mainLogo.rotateX}deg)`;
    }

    if (this.focused && this.viewport.vertical && this.sectionsElement) {
      this.render.models.scroll.target = this.sectionsElement.scrollTop;
      // console.log(this.render.models.scroll.target)
    }
  }
}
