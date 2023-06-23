const body = document.body;
const modal = document.querySelector(".request_main");
const form = document.querySelector(".requestModal");
const button = document.querySelector(".openModal");
const submitButton = document.querySelector(".submitButton");
const errors = document.querySelector("error");
const success = document.querySelector(".success");

modal.addEventListener("click", () => {
  modal.style.display = "none";
});

form.addEventListener("click", (event) => {
  event.stopPropagation();
});

submitButton.addEventListener("click", (event) => {
  {
    event.preventDefault();
  }
});
button.addEventListener("click", () => {
  modal.style.display = "block";
});

// Проверка на ввод номера
window.addEventListener("DOMContentLoaded", function () {
  [].forEach.call(document.querySelectorAll("#tel"), function (input) {
    var keyCode;
    function mask(event) {
      event.keyCode && (keyCode = event.keyCode);
      var pos = this.selectionStart;
      if (pos === 3 && (keyCode === 8 || keyCode === 46)) {
        this.value = this.value.slice(0);
        event.preventDefault();
      }
      var matrix = "+_ (___) ___ __ __",
        i = 0,
        def = matrix.replace(/\D/g, ""),
        val = this.value.replace(/\D/g, ""),
        new_value = matrix.replace(/[_\d]/g, function (a) {
          return i < val.length ? val.charAt(i++) || def.charAt(i) : a;
        });
      i = new_value.indexOf("_");
      if (i != -1) {
        i < 5 && (i = 3);
        new_value = new_value.slice(0, i);
      }
      var reg = matrix
        .substr(0, this.value.length)
        .replace(/_+/g, function (a) {
          return "\\d{1," + a.length + "}";
        })
        .replace(/[+()]/g, "\\$&");
      reg = new RegExp("^" + reg + "$");
      if (
        !reg.test(this.value) ||
        this.value.length < 5 ||
        (keyCode > 47 && keyCode < 58)
      )
        this.value = new_value;
      if (event.type == "blur" && this.value.length < 5) this.value = "";
      if (new_value.length != 18) {
        this.classList.add("error");
      } else {
        this.classList.remove("error");
      }
    }

    input.addEventListener("input", mask, false);
    input.addEventListener("focus", mask, false);
    input.addEventListener("blur", mask, false);
  });
});

//Проверка на email
let email = document.querySelector("#email");
email.addEventListener("input", (e) => {
  if (
    e.target.value.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/)
  ) {
    e.target.classList.remove("error");
  } else {
    e.target.classList.add("error");
  }
});

const inputs = form.querySelectorAll("input");
const emailError = document.querySelector(".emailTitle");
const telError = document.querySelector(".telTitle");

submitButton.addEventListener("click", () => {
  let inputsValue = 0;

  for (let i = 0; i < inputs.length; i++) {
    if (inputs[i].getAttribute("class") != "error" && inputs[i].value != "") {
      inputsValue = inputsValue + 1;
    }
    if (inputs[i].getAttribute("class") == "error" || inputs[i].value == "") {
      inputs[i].classList.add("active");
      if (inputs[i].getAttribute("type") == "email") {
        emailError.style.display = "block";
      }
      if (inputs[i].getAttribute("type") == "tel") {
        telError.style.display = "block";
      }
    } else {
      inputs[i].classList.remove("active");
      if (inputs[i].getAttribute("type") == "email") {
        emailError.style.display = "none";
      }
      if (inputs[i].getAttribute("type") == "tel") {
        telError.style.display = "none";
      }
    }
  }
  if (inputsValue === 3) {
    success.style.display = "block";
    form.style.display = "none";
  }
});
