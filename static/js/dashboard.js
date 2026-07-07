/* 

   The dashboard now shows only real numbers from the database.
   This file does three small things:
     1. Navbar background on scroll
     2. Mobile menu (the hamburger button)
     3. Count-up animation for the statistic numbers

*/

document.addEventListener("DOMContentLoaded", function () {

  //1. NAVBAR ON SCROLL
  var navbar = document.getElementById("navbar");

  function handleScroll() {
    if (!navbar) { return; }
    if (window.scrollY > 40) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  }

  window.addEventListener("scroll", handleScroll);
  handleScroll(); // run once at the start





  //3. COUNT-UP NUMBERS
  function countUp(element) {
    var target = Number(element.getAttribute("data-count"));
    if (!target) { target = 0; } 

    var current = 0;
    var step = Math.ceil(target / 60); 
    if (step < 1) { step = 1; }

    var timer = setInterval(function () {
      current = current + step;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      
      element.textContent = current.toLocaleString();
    }, 25);
  }

  var statNums = document.querySelectorAll(".db-stat__num");
  for (var i = 0; i < statNums.length; i++) {
    countUp(statNums[i]);
  }

});
