/* 
     1.  Shared parts (loader, year, theme, navbar, menu,
         back-to-top, floating WhatsApp button, reveals)
     2.  The popup notification toasts
     3.  The contact form (floating labels + simple checks)
     4.  The WhatsApp buttons 

    */

document.addEventListener("DOMContentLoaded", function () {

  // 0. WhatsApp number 
  var WHATSAPP_NUMBER = "96178933541";


  //1. SHARED PARTS 
  var loader = document.getElementById("loader");
  window.addEventListener("load", function () {
    setTimeout(function () { loader.classList.add("hidden"); }, 500);
  });
  setTimeout(function () { loader.classList.add("hidden"); }, 1600); // safety net

  document.getElementById("year").textContent = new Date().getFullYear();


  // Navbar background and floating WhatsApp button 
  var navbar = document.getElementById("navbar");
  var waFloat = document.getElementById("waFloat");

  function handleScroll() {
    var y = window.scrollY;

    if (y > 40) { navbar.classList.add("scrolled"); }
    else { navbar.classList.remove("scrolled"); }

    if (waFloat) {
      if (y > 200) { waFloat.classList.add("show"); }
      else { waFloat.classList.remove("show"); }
    }

    showRevealElements();
  }
  window.addEventListener("scroll", handleScroll);



  // Fade elements in once they scroll into view
  function showRevealElements() {
    var reveals = document.querySelectorAll(".reveal");
    for (var r = 0; r < reveals.length; r++) {
      var box = reveals[r].getBoundingClientRect();
      if (box.top < window.innerHeight - 40) {
        reveals[r].classList.add("show");
      }
    }
  }


  /* 
     2. POPUP NOTIFICATION TOASTS
      */
  var toastWrap = document.getElementById("ctToasts");

  function toast(title, message, variant) {
    var toastEl = document.createElement("div");
    var className = "ct-toast";
    if (variant) { className += " ct-toast--" + variant; }
    toastEl.className = className;

    // WhatsApp toasts get a speech icon, others get a check mark
    var icon = (variant === "wa") ? "💬" : "✓";
    toastEl.innerHTML =
      '<span class="ct-toast__icon">' + icon + '</span>' +
      '<div class="ct-toast__body"><strong>' + title + '</strong><span>' + message + '</span></div>';
    toastWrap.appendChild(toastEl);

    // slide it in, then slide it out after a few seconds
    setTimeout(function () { toastEl.classList.add("show"); }, 20);
    setTimeout(function () {
      toastEl.classList.remove("show");
      setTimeout(function () { toastEl.remove(); }, 500);
    }, 4200);
  }


  // 3. THE CONTACT FORM
  var form = document.getElementById("contactForm");
  var urgencyEl = document.getElementById("ctUrgency");
  var successBox = document.getElementById("ctSuccess");
  var successMsg = document.getElementById("ctSuccessMsg");

  // the fields we want to check before sending
  var formFields = ["ctName", "ctEmail", "ctUrgency", "ctMessage"];

  // keep the floating label "up" once a value is chosen in the dropdown
  function syncSelect() {
    if (urgencyEl.value !== "") { urgencyEl.classList.add("filled"); }
    else { urgencyEl.classList.remove("filled"); }
  }
  urgencyEl.addEventListener("change", syncSelect);
  syncSelect();

  // a simple email check (no regular expressions)
  function isValidEmail(value) {
    var v = value.trim();
    if (v.indexOf(" ") !== -1) { return false; }     
    var at = v.indexOf("@");
    if (at < 1) { return false; }                    
    if (v.indexOf("@", at + 1) !== -1) { return false; } 
    var dot = v.indexOf(".", at);
    if (dot === -1) { return false; }                 
    if (dot === at + 1) { return false; }             
    if (dot === v.length - 1) { return false; }      
    return true;
  }

  // is one field filled in correctly? (true / false)
  function fieldLooksValid(id) {
    var value = document.getElementById(id).value;
    if (id === "ctName")    { return value.trim().length >= 2; }
    if (id === "ctEmail")   { return isValidEmail(value); }
    if (id === "ctUrgency") { return value !== ""; }
    if (id === "ctMessage") { return value.trim().length >= 10; }
    return true;
  }

  // the error message to show for a field
  function errorMessageFor(id) {
    if (id === "ctName")    { return "Please enter your full name."; }
    if (id === "ctEmail")   { return "Enter a valid email address."; }
    if (id === "ctUrgency") { return "Please choose an urgency type."; }
    if (id === "ctMessage") { return "Please write at least a short message (10+ characters)."; }
    return "Please check this field.";
  }

  // show / hide the small red error text under a field
  function showError(id, message) {
    var err = document.querySelector('.ct-error[data-for="' + id + '"]');
    var input = document.getElementById(id);
    if (err) { err.textContent = message; err.classList.add("show"); }
    if (input) { input.classList.add("invalid"); }
  }
  function clearError(id) {
    var err = document.querySelector('.ct-error[data-for="' + id + '"]');
    var input = document.getElementById(id);
    if (err) { err.textContent = ""; err.classList.remove("show"); }
    if (input) { input.classList.remove("invalid"); }
  }

  // check one field; returns true if valid, shows an error if not
  function validateField(id) {
    if (fieldLooksValid(id)) {
      clearError(id);
      return true;
    }
    showError(id, errorMessageFor(id));
    return false;
  }

  // remove the error as soon as the user fixes a field
  function watchFieldForFix(id) {
    var el = document.getElementById(id);
    var eventName = (el.tagName === "SELECT") ? "change" : "input";
    el.addEventListener(eventName, function () {
      if (fieldLooksValid(id)) {
        clearError(id);
      }
    });
  }
  for (var w = 0; w < formFields.length; w++) {
    watchFieldForFix(formFields[w]);
  }

  // when the form is sent
  form.addEventListener("submit", function (e) {
    e.preventDefault(); // stop the page from reloading

    // check every field
    var ok = true;
    for (var i = 0; i < formFields.length; i++) {
      if (!validateField(formFields[i])) { ok = false; }
    }
    if (!ok) {
      toast("Check the form", "A few fields need your attention.", "");
      return;
    }

    // use the first name in the thank-you message
    var firstName = document.getElementById("ctName").value.trim().split(" ")[0];
    if (firstName === "") { firstName = "there"; }
    var urgency = urgencyEl.value;

    // for an emergency, open WhatsApp straight away (the fastest channel)
    if (urgency === "Emergency Request") {
      successMsg.textContent = "Thanks " + firstName + "! For an emergency, the fastest channel is WhatsApp — we've opened it for you.";
      openWhatsApp(buildMessage());
    } else {
      successMsg.textContent = "Thank you " + firstName + '! A LifeLink team member will reply to you shortly regarding your "' + urgency + '".';
    }

    // show the success message
    successBox.classList.add("show");
    successBox.setAttribute("aria-hidden", "false");
    toast("Message sent", "We'll get back to you as soon as possible.", "");
  });

  // "Send another" — clear the form and hide the success message
  document.getElementById("ctSendAnother").addEventListener("click", function () {
    form.reset();
    syncSelect();
    for (var i = 0; i < formFields.length; i++) {
      clearError(formFields[i]);
    }
    successBox.classList.remove("show");
    successBox.setAttribute("aria-hidden", "true");
  });


  // 4. THE WHATSAPP BUTTONS

  var waBlood = document.getElementById("waBlood");
  var waLocation = document.getElementById("waLocation");

  // build the pre-filled message from the two little inputs
  function buildMessage() {
    var blood = "__";
    if (waBlood && waBlood.value.trim() !== "") { blood = waBlood.value.trim(); }
    var loc = "__";
    if (waLocation && waLocation.value.trim() !== "") { loc = waLocation.value.trim(); }
    return "Hello LifeLink, I need urgent blood donor assistance. Blood Type: " + blood + " Location: " + loc;
  }

  // open WhatsApp in a new tab with the message
  function openWhatsApp(message) {
    // encodeURIComponent makes the message safe to put inside a web address
    var url = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(message);
    window.open(url, "_blank", "noopener");
  }

  // "Start WhatsApp Chat" button
  var waChatBtn = document.getElementById("waChat");
  if (waChatBtn) {
    waChatBtn.addEventListener("click", function () {
      openWhatsApp(buildMessage());
      toast("Opening WhatsApp", "Your pre-filled message is ready to send.", "wa");
    });
  }

  // "Emergency Support" button
  var waEmergencyBtn = document.getElementById("waEmergency");
  if (waEmergencyBtn) {
    waEmergencyBtn.addEventListener("click", function () {
      openWhatsApp("🚨 EMERGENCY — LifeLink, I need urgent blood donor assistance right now. " + buildMessage());
      toast("Emergency support", "Connecting you on WhatsApp now.", "wa");
    });
  }



  // set up the first view

  handleScroll(); 
});
