import gsap from "gsap";

const langs = {
  head: {
    ru: "русский",
    en: "english",
    de: "doitch",
  },
  title: {
    ru: "картельные сговоры не допускают ситуации, при которой сделанные на базе интернет-аналитики выводы будут ассоциативно распределены по отраслям. Как принято считать, независимые государства, превозмогая сложившуюся непростую экономи",
    en: "lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea",
    de: "es ist ein lang erwiesener Fakt, dass ein Leser vom Text abgelenkt wird, wenn er sich ein Layout ansieht. Der Punkt, Lorem Ipsum zu nutzen, ist, dass es mehr oder weniger die normale Anordnung von Buchstaben darstellt und somit Lorem Ipsum als den Standardtext,",
  },
  button: {
    ru: "перейти",
    en: "visit crew",
    de: "gehen",
  },
  lang: {
    ru: "ru",
    en: "en",
    de: "de",
  },
};

const body = document.body;
const divs = document.querySelectorAll(".lng");

divs.forEach((div) => {
  div.addEventListener("click", updateContent);
});

// fetch("./langArr.json")
//   .then((response) => response.json())
//   .then((data) => {} )
//   .catch((error) => console.error("Error:", error));

function updateContent(event) {
  const lang = event.currentTarget.getAttribute("data-lang");
  localStorage.setItem("lang", lang);

  const elements = document.querySelectorAll("[data-key]");
  elements.forEach((elem) => {
    const key = elem.getAttribute("data-key");
    elem.innerHTML = langs[key][lang];
  });
  toggleLangModal(event);
}

// Стили для выподающего меню

let toggle = document.getElementsByClassName("toggle")[0];

toggle.addEventListener("click", toggleLangModal);

function toggleLangModal(e) {
  if (toggle.classList.contains("open")) {
    gsap.to(".list-item", {
      y: -10,
      opacity: 0,
      display: "none",
      stagger: 0.4,
    });
    toggle.classList.remove("open");
  } else {
    gsap.to(".list-item", { y: 0, opacity: 1, display: "block", stagger: 0.4 });
    toggle.classList.add("open");
  }
}
