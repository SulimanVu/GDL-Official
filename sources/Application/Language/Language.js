import gsap from "gsap";

const langs = {
  IT_head: {
    ru: "IT Отдел",
    en: "IT Department",
    de: "IT Abteilung",
  },
  Drei_head: {
    ru: "3D Отдел",
    en: "3D Department",
    de: "3D Abteilung",
  },
  IT_title: {
    ru: "Удобные для пользователей веб-сайты и приложения, которые бесперебойно функционируют на любой платформе, специально разработанные в соответствии с требованиями вашего бизнеса. Получите непревзойденное преимущество на рынке, используя новейшие технологии, запрограммированные нашей командой для вас.",
    en: "User-friendly websites and apps that run smoothly on any platform, custom-designed to meet your business needs. Gain an unrivaled market advantage with the latest technology programmed by our team for you.",
    de: "Benutzerfreundliche Websites und Apps, die auf jeder Plattform reibungslos funktionieren und individuell auf Ihre Geschäftsanforderungen zugeschnitten sind. Verschaffen Sie sich einen unübertroffenen Marktvorteil mit der neuesten Technologie, die unser Team für Sie programmiert.",
  },
  Drei_title: {
    ru: "Выделитесь из толпы с помощью презентаций продуктов. Мощные. Динамичные. Инновационные. Придайте своему бренду неповторимый характер с помощью захватывающих фильмов и анимации",
    en: "Stand out from the crowd with product presentations. Powerful. Dynamic. Innovative. Give your brand a unique character with breathtaking films and animations",
    de: "Heben Sie sich mit Produktpräsentationen von der Masse ab. Kraftvoll. Dynamisch. Innovativ. Verleihen Sie Ihrer Marke mit atemberaubenden Filmen und Animationen einen einzigartigen Charakter",
  },
  features_web: {
    ru: "Веб-сайты",
    en: "Web sites",
    de: "Websites",
  },
  features_mobile: {
    ru: "Мобильные приложения",
    en: "Mobile applications",
    de: "Mobile Anwendungen",
  },
  features_server: {
    ru: "Серверные приложения",
    en: "Server applications",
    de: "Serveranwendungen",
  },
  features_digital: {
    ru: "Цифровое страхование",
    en: "Digital Insurance",
    de: "Digitale Versicherung",
  },
  features_animation: {
    ru: "Анимация продуктов",
    en: "Product Animation",
    de: "Produktanimation",
  },
  features_cartoons: {
    ru: "3D-Мультфильмы",
    en: "3D-Cartoons",
    de: "3D-Cartoons",
  },
  features_films: {
    ru: "Имиджевые фильмы",
    en: "Image films",
    de: "Imagefilme",
  },
  features_social: {
    ru: "Социальные ролики",
    en: "Social videos",
    de: "Soziale Videos",
  },
  btn_consultation: {
    ru: "Консультация",
    en: "Consultation",
    de: "Beratung",
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
  next_prod: {
    ru: "Следующий продукт",
    en: "Next product",
    de: "Nächstes Produkt",
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
