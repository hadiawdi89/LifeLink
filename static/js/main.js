//1. Page loader (the red drop screen that hides on load) 
// 2. Footer year
// 4. Navbar changes + back-to-top button on scroll
// 5. Mobile menu (the hamburger button)
//6. (removed) Live emergency ticker
//7. Animated number counters in the statistics section
// 8. Blood compatibility checker
//9. Testimonials slider (fixed example stories)
//10. Reveal-on-scroll animations + timeline line
 

document.addEventListener("DOMContentLoaded", function () {

  // 1. PAGE LOADER
  var loader = document.getElementById("loader");

  window.addEventListener("load", function () {
    setTimeout(function () {
      loader.classList.add("hidden");
    }, 600);
  });

  // Safety net: hide it anyway after 1.8s in case "load" already happened
  setTimeout(function () {
    loader.classList.add("hidden");
  }, 1800);


  //2. FOOTER YEAR
 
  document.getElementById("year").textContent = new Date().getFullYear();



  // 4. NAVBAR ON SCROLL
  var navbar = document.getElementById("navbar");

  function handleScroll() {
    var y = window.scrollY; // how far down the page we are

    // Give the navbar a background after scrolling a little
    if (y > 40) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }

    showRevealElements();   // animate things into view (section 10)
  }

  window.addEventListener("scroll", handleScroll);




  // Close the menu when any link inside it is clicked
  var menuLinks = navLinks.querySelectorAll("a");
  for (var i = 0; i < menuLinks.length; i++) {
    menuLinks[i].addEventListener("click", function () {
      navLinks.classList.remove("open");
      menuBtn.classList.remove("open");
    });
  }




  //7. ANIMATED NUMBER COUNTERS

  function countUp(element) {
    var target = Number(element.getAttribute("data-count"));
    var suffix = element.getAttribute("data-suffix");
    if (!suffix) {
      suffix = ""; // some numbers have no "+" sign
    }

    var current = 0;
    var step = Math.ceil(target / 60); 

    var timer = setInterval(function () {
      current = current + step;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }

      if (current === target) {
        element.textContent = current.toLocaleString() + suffix;
      } else {
        element.textContent = current.toLocaleString();
      }
    }, 25);
  }


  //8. BLOOD COMPATIBILITY CHECKER

  var bloodTypes = ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"];

  var typeGrid = document.getElementById("typeGrid");
  var selectedTypeEl = document.getElementById("selectedType");
  var donorTypesEl = document.getElementById("donorTypes");
  var compatMetaEl = document.getElementById("compatMeta");

  // Create one button for every blood type
  for (var t = 0; t < bloodTypes.length; t++) {
    var type = bloodTypes[t];
    var button = document.createElement("button");
    button.className = "type-btn";
    button.textContent = type;
    button.setAttribute("aria-label", "Blood type " + type);

    // When this button is clicked, show its compatible donors
    button.addEventListener("click", makeClickHandler(type, button));

    typeGrid.appendChild(button);
  }


  function makeClickHandler(type, button) {
    return function () {
      selectType(type, button);
    };
  }

  // Returns the list of donor types that can give to "type"
  function compatibleDonors(type) {
    switch (type) {
      case "O-":  return ["O-"];
      case "O+":  return ["O-", "O+"];
      case "A-":  return ["O-", "A-"];
      case "A+":  return ["O-", "O+", "A-", "A+"];
      case "B-":  return ["O-", "B-"];
      case "B+":  return ["O-", "O+", "B-", "B+"];
      case "AB-": return ["O-", "A-", "B-", "AB-"];
      case "AB+": return ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"];
      default:    return [];
    }
  }

  // How many donors of one blood type are available right now
  function donorsAvailableForType(type) {
    switch (type) {
      case "O-":  return 142;
      case "O+":  return 612;
      case "A-":  return 98;
      case "A+":  return 430;
      case "B-":  return 64;
      case "B+":  return 256;
      case "AB-": return 22;
      case "AB+": return 71;
      default:    return 0;
    }
  }

  // Runs when a blood type button is clicked
  function selectType(type, button) {
    // Remove the highlight from all buttons, then highlight this one
    var allButtons = document.querySelectorAll(".type-btn");
    for (var a = 0; a < allButtons.length; a++) {
      allButtons[a].classList.remove("active");
    }
    button.classList.add("active");

    selectedTypeEl.textContent = type;

    // Get the compatible donor types
    var donors = compatibleDonors(type);

    // Build a small coloured chip for each donor type
    var chipsHTML = "";
    for (var c = 0; c < donors.length; c++) {
      var delay = c * 60; // makes them pop in one after another
      chipsHTML += '<span class="donor-chip" style="animation-delay:' + delay + 'ms">' + donors[c] + "</span>";
    }
    donorTypesEl.innerHTML = chipsHTML;

    // Add up how many donors are available across those types
    var totalAvailable = 0;
    for (var d = 0; d < donors.length; d++) {
      totalAvailable = totalAvailable + donorsAvailableForType(donors[d]);
    }

    // Build the little summary line under the chips
    var meta = "<b>" + donors.length + "</b> compatible blood type";
    if (donors.length > 1) {
      meta = meta + "s";
    }
    meta = meta + " · <b>" + totalAvailable.toLocaleString() + "</b> donors currently available nearby";

    if (type === "AB+") {
      meta = meta + " · <b>Universal recipient</b>";
    }
    if (type === "O-") {
      meta = meta + " · <b>Hardest to match</b>";
    }
    compatMetaEl.innerHTML = meta;
  }


 


  //10. REVEAL ON SCROLL + COUNTERS + TIMELINE

  function showRevealElements() {
    var windowHeight = window.innerHeight;


    var reveals = document.querySelectorAll(".reveal");
    for (var r = 0; r < reveals.length; r++) {
      var box = reveals[r].getBoundingClientRect(); 
      if (box.top < windowHeight - 40) {
        reveals[r].classList.add("show");
      }
    }

    // Start the number counters when the statistics scroll into view
    var numbers = document.querySelectorAll(".stat-num");
    for (var n = 0; n < numbers.length; n++) {
      var numberBox = numbers[n].getBoundingClientRect();
      var alreadyDone = numbers[n].getAttribute("data-done") === "yes";
      if (numberBox.top < windowHeight - 40 && !alreadyDone) {
        numbers[n].setAttribute("data-done", "yes"); // only run once
        countUp(numbers[n]);
      }
    }

    // Draw the timeline progress line when the timeline appears
    var timeline = document.querySelector(".timeline");
    if (timeline) {
      var timelineBox = timeline.getBoundingClientRect();
      if (timelineBox.top < windowHeight - 60) {
        timeline.classList.add("in-view");
      }
    }
  }


 


  // RUN ONCE AT START
  handleScroll();

});
