import gsap from "gsap";

const langs = {
  flag: {
    ru: "./sources/Application/icons/russia.png",
    en: "./sources/Application/icons/usa.png",
    de: "./sources/Application/icons/germany.png",
  },
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
  Design_head: {
    ru: "Дизайн отдел",
    en: "Design department",
    de: "Design Abteilung",
  },
  Game_head: {
    ru: "Разработка игр",
    en: "Game development",
    de: "Spieleentwicklung",
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
  Design_title: {
    ru: "Поднимите свой бренд на новый уровень и установите прочное доверие с вашими клиентами и сотрудниками. Мы предлагаем комплексные решения для инновационного и увлекательного дизайна - от разработки логотипа до создания маркетинговых материалов и визитных карточек.",
    en: "Take your brand to the next level and build strong trust with your customers and employees. We offer complete solutions for innovative and captivating design - from logo design to marketing materials and business cards.",
    de: "Bringen Sie Ihre Marke auf die nächste Ebene und bauen Sie starkes Vertrauen bei Ihren Kunden und Mitarbeitern auf. Wir bieten Komplettlösungen für innovatives und fesselndes Design – vom Logo-Design über Marketingmaterialien bis hin zu Visitenkarten.",
  },
  Game_title: {
    ru: "Поднимите свой бренд на новый уровень и установите прочное доверие с вашими клиентами и сотрудниками. Мы предлагаем комплексные решения для инновационного и увлекательного дизайна - от разработки логотипа до создания маркетинговых материалов и визитных карточек.",
    en: "Outstanding games with stunning graphics, realistic sound effects and fun gameplay are designed to meet your requirements. You can use product development, training, and scenario modeling in an innovative and strategic way to increase your income.",
    de: "Выдающиеся игры с потрясающей графикой, реалистичными звуковыми эффектами и увлекательным игровым процессом разрабатываются в соответствии с вашими требованиями. Вы можете использовать разработку продуктов, обучение и моделирование сценариев инновационно и стратегически, чтобы увеличить свой доход.",
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
  features_branding: {
    ru: "Брендинг",
    en: "Branding",
    de: "Branding",
  },
  features_logo: {
    ru: "Дизайн лого",
    en: "Logo design",
    de: "Logo design",
  },
  features_web_des: {
    ru: "Веб-дизайн",
    en: "Web design",
    de: "Webdesign",
  },
  features_soc_media: {
    ru: "Графика социальных сетей",
    en: "Social media graphics",
    de: "Social-Media-Grafiken",
  },
  features_modeling: {
    ru: "3D-моделирование",
    en: "3D modeling",
    de: "3D Modellierung",
  },
  features_engines: {
    ru: "Игровые движки",
    en: "Game engines",
    de: "Spiel-Engines",
  },
  features_script: {
    ru: "Скриптинг",
    en: "Scripting",
    de: "Skripterstellung",
  },
  features_sound: {
    ru: "Звуковой дизайн и анимация",
    en: "Sound design and animation",
    de: "Sounddesign und Animation",
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

const divs = document.querySelectorAll(".lng");

divs.forEach((div) => {
  div.addEventListener("click", updateContent);
});

function updateContent(event) {
  const lang = event.currentTarget.getAttribute("data-lang");
  localStorage.setItem("lang", lang);

  const elements = document.querySelectorAll("[data-key]");
  elements.forEach((elem) => {
    const key = elem.getAttribute("data-key");
    elem.innerHTML = langs[key][lang];

    if (elem.getAttribute("class") == "flag") {
      elem.setAttribute("src", langs[key][lang]);
    }
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
