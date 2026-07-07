/* 
   Sends real donation requests using a normal HTML form
  */

document.addEventListener("DOMContentLoaded", function () {

  //1. SHARED PARTS 

  var loader = document.getElementById("loader");
  window.addEventListener("load", function () {
    setTimeout(function () { loader.classList.add("hidden"); }, 500);
  });
  setTimeout(function () { loader.classList.add("hidden"); }, 1600);

  document.getElementById("year").textContent = new Date().getFullYear();

 

  var navbar = document.getElementById("navbar");
  function handleScroll() {
    var y = window.scrollY;
    if (y > 40) navbar.classList.add("scrolled");
    else navbar.classList.remove("scrolled");
    showRevealElements();
  }
  window.addEventListener("scroll", handleScroll);


  var menuLinks = navLinks.querySelectorAll("a");
  for (var m = 0; m < menuLinks.length; m++) {
    menuLinks[m].addEventListener("click", function () {
      navLinks.classList.remove("open");
      menuBtn.classList.remove("open");
    });
  }

  function showRevealElements() {
    var reveals = document.querySelectorAll(".reveal");
    for (var r = 0; r < reveals.length; r++) {
      var box = reveals[r].getBoundingClientRect();
      if (box.top < window.innerHeight - 40) reveals[r].classList.add("show");
    }
  }

  //2. READ DONOR DATA FROM HIDDEN SEED
  var seedEl = document.getElementById("donorSeed");

  function readList(name) {
    if (!seedEl) return [];
    var raw = seedEl.getAttribute("data-" + name);
    return raw ? raw.split("|") : [];
  }
  function readNumbers(name) {
    var words = readList(name);
    var numbers = [];
    for (var i = 0; i < words.length; i++) numbers.push(Number(words[i]));
    return numbers;
  }
  function readBooleans(name) {
    var words = readList(name);
    var flags = [];
    for (var i = 0; i < words.length; i++) flags.push(words[i] === "true");
    return flags;
  }

  var donorIds = readNumbers("ids");        //  donor database IDs
  var donorNames = readList("names");
  var donorBlood = readList("blood");
  var donorCity = readList("city");
  var donorStatus = readList("status");
  var donorLast = readNumbers("days");
  var donorResp = readNumbers("response");
  var donorRapid = readBooleans("rapid");
  var donorDonations = readNumbers("donations");

  //3. HELPER FUNCTIONS 
  function listHas(list, value) {
    for (var i = 0; i < list.length; i++) if (list[i] === value) return true;
    return false;
  }
  function compatibleDonors(type) {
    switch (type) {
      case "O-": return ["O-"];
      case "O+": return ["O-", "O+"];
      case "A-": return ["O-", "A-"];
      case "A+": return ["O-", "O+", "A-", "A+"];
      case "B-": return ["O-", "B-"];
      case "B+": return ["O-", "O+", "B-", "B+"];
      case "AB-": return ["O-", "A-", "B-", "AB-"];
      case "AB+": return ["O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+"];
      default: return [];
    }
  }
  function statusLabel(status) {
    if (status === "available") return "Available now";
    if (status === "maybe") return "Maybe available";
    if (status === "unavailable") return "Unavailable";
    return "";
  }
  function statusOrder(status) {
    if (status === "available") return 0;
    if (status === "maybe") return 1;
    if (status === "unavailable") return 2;
    return 3;
  }
  var mapCities = ["Tripoli", "Byblos", "Jounieh", "Beirut", "Baalbek", "Zahle", "Saida", "Nabatieh", "Tyre"];
  function cityX(city) {
    var map = { Tripoli:44, Byblos:31, Jounieh:28, Beirut:24, Baalbek:70, Zahle:64, Saida:26, Nabatieh:41, Tyre:24 };
    return map[city] || 50;
  }
  function cityY(city) {
    var map = { Tripoli:11, Byblos:31, Jounieh:41, Beirut:50, Baalbek:33, Zahle:52, Saida:64, Nabatieh:74, Tyre:81 };
    return map[city] || 50;
  }
  function donorInitials(i) {
    var words = donorNames[i].split(" ");
    var letters = "";
    for (var w = 0; w < words.length; w++) if (words[w].length) letters += words[w][0];
    return letters.slice(0,2).toUpperCase();
  }

  //mem7ye////////////////////////////////////////////////////////////////
  function donorPhone(i) {
    var seed = 70 + (i*13)%30;
    var partA = 100 + i*7;
    var partB = (200 + i*11)%900;
    return "+961 " + seed + " " + partA + " " + partB;
  }
  function donorEmail(i) {
    return donorNames[i].toLowerCase().split(" ").join(".") + "@lifelink.lb";
  }
///////////////////////////////////////////////////////////////////////////////////


  function daysToText(days) {
    if (days < 30) return days + " days ago";
    var months = Math.round(days/30);
    return months === 1 ? "1 month ago" : months + " months ago";
  } 
  function pretty(type) {
    return type.replace("-", "\u2212");
  }

  // 4.     CITY DROPDOWN + ANIMATED NUMBERS
  var cityFilter = document.getElementById("cityFilter");
  var cities = [];
  for (var c = 0; c < donorCity.length; c++) {
    if (!listHas(cities, donorCity[c])) cities.push(donorCity[c]);
  }
  cities.sort();
  for (var ci = 0; ci < cities.length; ci++) {
    var option = document.createElement("option");
    option.value = cities[ci];
    option.textContent = cities[ci];
    cityFilter.appendChild(option);
  }

  var availableCount = 0;
  for (var a = 0; a < donorStatus.length; a++) if (donorStatus[a] === "available") availableCount++;
  var totalResp = 0;
  for (var rr = 0; rr < donorResp.length; rr++) totalResp += donorResp[rr];
  var avgResp = Math.round(totalResp / donorResp.length);

  function animateNum(element, target) {
    if (!element) return;
    var current = 0;
    var step = Math.ceil(target / 40);
    if (step < 1) step = 1;
    var timer = setInterval(function () {
      current += step;
      if (current >= target) { current = target; clearInterval(timer); }
      element.textContent = current;
    }, 30);
  }
  animateNum(document.getElementById("statAvailable"), availableCount);
  animateNum(document.getElementById("statTotal"), donorNames.length);
  animateNum(document.getElementById("statCities"), cities.length);
  animateNum(document.getElementById("statResponse"), avgResp);
  animateNum(document.getElementById("onlineNow"), availableCount);

  // 5. FILTERING & SORTING 

  var searchInput = document.getElementById("searchInput");
  var searchClear = document.getElementById("searchClear");
  var bloodFilter = document.getElementById("bloodFilter");
  var urgencyFilter = document.getElementById("urgencyFilter");
  var availFilter = document.getElementById("availFilter");
  var sortSelect = document.getElementById("sortSelect");
  var compatToggle = document.getElementById("compatToggle");
  var grid = document.getElementById("donorGrid");
  var emptyState = document.getElementById("emptyState");
  var resultCount = document.getElementById("resultCount");
  var resultNote = document.getElementById("resultNote");

  function getFilteredIndexes() {
    var text = searchInput.value.trim().toLowerCase();
    var blood = bloodFilter.value;
    var city = cityFilter.value;
    var urgency = urgencyFilter.value;
    var avail = availFilter.value;
    var patientMode = compatToggle.checked;

    var compatList = null;
    if (patientMode && blood !== "all") compatList = compatibleDonors(blood);

    var matches = [];
    for (var i = 0; i < donorNames.length; i++) {
      if (text !== "") {
        var name = donorNames[i].toLowerCase();
        var place = donorCity[i].toLowerCase();
        if (name.indexOf(text) === -1 && place.indexOf(text) === -1) continue;
      }
      if (blood !== "all") {
        if (compatList) { if (!listHas(compatList, donorBlood[i])) continue; }
        else if (donorBlood[i] !== blood) continue;
      }
      if (city !== "all" && donorCity[i] !== city) continue;
      if (avail !== "all" && donorStatus[i] !== avail) continue;
      if (urgency === "standard" && donorStatus[i] === "unavailable") continue;
      if (urgency === "urgent" && donorStatus[i] !== "available") continue;
      if (urgency === "critical" && !(donorStatus[i] === "available" && donorRapid[i])) continue;
      matches.push(i);
    }
    return matches;
  }

  function sortScore(i) {
    var by = sortSelect.value;
    if (by === "availability") return statusOrder(donorStatus[i]);
    if (by === "response") return donorResp[i];
    if (by === "rested") return -donorLast[i];
    return 0;
  }
  function sortIndexes(indexes) {
    var arr = indexes.slice();
    for (var x = 0; x < arr.length; x++) {
      var best = x;
      for (var y = x+1; y < arr.length; y++) {
        if (sortScore(arr[y]) < sortScore(arr[best])) best = y;
      }
      var temp = arr[x];
      arr[x] = arr[best];
      arr[best] = temp;
    }
    return arr;
  }

  function describeFilters() {
    var bits = [];
    if (bloodFilter.value !== "all") {
      if (compatToggle.checked) bits.push("patient mode");
      else bits.push(pretty(bloodFilter.value));
    }
    if (cityFilter.value !== "all") bits.push(cityFilter.value);
    if (availFilter.value !== "all") bits.push(statusLabel(availFilter.value));
    if (urgencyFilter.value !== "any") {
      var label = urgencyFilter.options[urgencyFilter.selectedIndex].text;
      bits.push(label.split("\u00b7")[0].trim());
    }
    return bits.length === 0 ? "Showing all registered donors" : "Filtered by " + bits.join(" \u00b7 ");
  }

  function donorCard(i, position) {
    var card = document.createElement("article");
    card.className = "donor-card is-" + donorStatus[i];
    card.style.setProperty("--delay", (position*0.05)+"s");

    var tags = [];
    if (donorBlood[i] === "O-") tags.push("\ud83c\udf0d Universal donor");
    if (donorDonations[i] >= 12) tags.push("\ud83c\udfc5 " + donorDonations[i] + " donations");
    var tagsHTML = "";
    if (tags.length) {
      var inner = "";
      for (var t=0; t<tags.length; t++) inner += '<span class="donor-tag">'+tags[t]+'</span>';
      tagsHTML = '<div class="donor-card__tags">'+inner+'</div>';
    }
    var btnLabel = (donorStatus[i] === "unavailable") ? "View profile" : "Quick contact";

    // Build the card HTML by joining small text pieces 
    var html = "";
    html += '<div class="donor-card__top">';
    html +=   '<div class="donor-card__avatar">' + donorInitials(i) + '<span class="status-dot dot--' + donorStatus[i] + '"></span></div>';
    html +=   '<div class="donor-card__id">';
    html +=     '<span class="donor-card__name">' + donorNames[i] + '</span>';
    html +=     '<span class="donor-card__city"><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>' + donorCity[i] + '</span>';
    html +=   '</div>';
    html +=   '<div class="donor-card__blood">' + pretty(donorBlood[i]) + '</div>';
    html += '</div>';
    html += '<span class="avail-chip"><span class="dot dot--' + donorStatus[i] + '"></span>' + statusLabel(donorStatus[i]) + '</span>';
    html += '<div class="donor-card__meta">';
    html +=   '<div class="donor-meta-row"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>Last donated <b>' + daysToText(donorLast[i]) + '</b></div>';
    html +=   '<div class="donor-meta-row"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="m13 2-9 11h7l-1 9 9-11h-7l1-9Z"/></svg>Avg. response <b>~' + donorResp[i] + ' min</b></div>';
    html += '</div>';
    html += tagsHTML;
    html += '<div class="donor-card__foot"><button class="btn btn--glow donor-card__btn" type="button">' + btnLabel + '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button></div>';
    card.innerHTML = html;
    var button = card.querySelector(".donor-card__btn");
    button.addEventListener("click", makeOpenModal(i));
    return card;
  }
  function makeOpenModal(i) { return function() { openModal(i); }; }

  function render() {
    var matches = getFilteredIndexes();
    var ordered = sortIndexes(matches);
    var compatNote = "";
    if (compatToggle.checked && bloodFilter.value !== "all") compatNote = " compatible with <b>"+pretty(bloodFilter.value)+"</b> patients";
    if (ordered.length) {
      var word = ordered.length===1 ? "donor" : "donors";
      resultCount.innerHTML = "<b>"+ordered.length+"</b> "+word+" found"+compatNote;
      resultNote.textContent = describeFilters();
    } else {
      resultCount.innerHTML = "No donors found";
      resultNote.textContent = "";
    }
    grid.classList.add("is-filtering");
    setTimeout(function() {
      grid.innerHTML = "";
      if (ordered.length===0) emptyState.hidden = false;
      else {
        emptyState.hidden = true;
        for (var i=0; i<ordered.length; i++) grid.appendChild(donorCard(ordered[i], i));
      }
      grid.classList.remove("is-filtering");
    }, 160);
    updateMap(matches);
  }

  //6. MAP

  var mapMarkers = document.getElementById("mapMarkers");
  function bestStatus(indexes) {
    var hasAvailable=false, hasMaybe=false;
    for (var i=0;i<indexes.length;i++) {
      if (donorStatus[indexes[i]]==="available") hasAvailable=true;
      if (donorStatus[indexes[i]]==="maybe") hasMaybe=true;
    }
    if (hasAvailable) return "available";
    if (hasMaybe) return "maybe";
    return "unavailable";
  }
  function updateMap(matches) {
    mapMarkers.innerHTML = "";
    for (var c=0; c<mapCities.length; c++) {
      var city = mapCities[c];
      var here = [];
      for (var i=0; i<matches.length; i++) if (donorCity[matches[i]]===city) here.push(matches[i]);
      if (here.length===0) continue;
      var status = bestStatus(here);
      var marker = document.createElement("button");
      marker.type = "button";
      var className = "map-marker map-marker--"+status;
      if (cityFilter.value===city) className += " is-active";
      marker.className = className;
      marker.style.left = cityX(city)+"%";
      marker.style.top = cityY(city)+"%";
      marker.setAttribute("aria-label", city+": "+here.length+" donors");
      var donorWord = here.length===1 ? "donor" : "donors";
      marker.innerHTML = '<span class="map-marker__label">'+city+" \u00b7 "+here.length+" "+donorWord+'</span><span class="map-marker__pin"><span>'+here.length+'</span></span>';
      marker.addEventListener("click", makeMarkerHandler(city));
      mapMarkers.appendChild(marker);
    }
  }
  function makeMarkerHandler(city) {
    return function() {
      if (cityFilter.value===city) cityFilter.value = "all";
      else cityFilter.value = city;
      render();
      
    };
  }

  // 7.(QUICK CONTACT)  SENDING
 
  var modal = document.getElementById("modal");
  var modalBody = document.getElementById("modalBody");
  var modalClose = document.getElementById("modalClose");
  var modalOverlay = document.getElementById("modalOverlay");

  function openModal(i) {
    var compatLine = "";
    if (compatToggle.checked && bloodFilter.value !== "all") {
      compatLine = '<div class="modal-stat"><span>Match</span><strong>\u2713 Compatible with '+pretty(bloodFilter.value)+'</strong></div>';
    }
    var lastStat = compatLine;
    var note = donorStatus[i]==="unavailable" ? "This donor is currently resting between donations. We'll notify them of your request." : "Contact details are shared responsibly. Please reach out only for genuine medical need.";
    // Build the modal HTML by joining small text pieces with "+".
    var html = "";
    html += '<div class="modal-head">';
    html +=   '<div class="modal-avatar">' + donorInitials(i) + '<span class="status-dot dot--' + donorStatus[i] + '"></span></div>';
    html +=   '<div><h3>' + donorNames[i] + '</h3><span class="modal-sub"><span class="dot dot--' + donorStatus[i] + '" style="width:9px;height:9px;border-radius:50%"></span>' + statusLabel(donorStatus[i]) + '</span></div>';
    html +=   '<div class="modal-blood">' + pretty(donorBlood[i]) + '</div>';
    html += '</div>';
    html += '<div class="modal-stats">';
    html +=   '<div class="modal-stat"><span>City</span><strong>\ud83d\udccd ' + donorCity[i] + '</strong></div>';
    html +=   '<div class="modal-stat"><span>Avg. response</span><strong>~' + donorResp[i] + ' min</strong></div>';
    html +=   '<div class="modal-stat"><span>Total donations</span><strong>\ud83e\ude78 ' + donorDonations[i] + '</strong></div>';
    html +=   lastStat;
    html += '</div>';

    // A normal HTML form. When the user clicks Send urgent request
    // the browser posts these fields to send-request on its own

    html += '<form method="POST" action="/send-request" style="margin:0">';
    html +=   '<input type="hidden" name="donor_id" value="' + donorIds[i] + '">';
    html +=   '<input type="hidden" name="blood_type" value="' + donorBlood[i] + '">';
    html +=   '<div class="modal-field">';
    html +=     '<label for="requestMessage">Optional message (e.g., hospital, urgency)</label>';
    html +=     '<textarea id="requestMessage" name="message" rows="2" placeholder="Patient in ICU, need ' + donorBlood[i] + ' within 2 hours..."></textarea>';
    html +=   '</div>';
    html +=   '<div class="modal-contact">';
    html +=     '<button class="btn btn--glow" type="submit">Send urgent request<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2"><path d="m22 2-7 20-4-9-9-4 20-7Z"/></svg></button>';
    html +=     '<p class="modal-note">' + note + '</p>';
    html +=   '</div>';
    html += '</form>';
    modalBody.innerHTML = html;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = "";
  }
  modalClose.addEventListener("click", closeModal);
  modalOverlay.addEventListener("click", closeModal);
  document.addEventListener("keydown", function(e) {
    if (e.key === "Escape" && !modal.hidden) closeModal();
  });

  var toast = document.getElementById("toast");
  var toastTimer;
  function showToast(message) {
    clearTimeout(toastTimer);
    toast.innerHTML = '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M20 6 9 17l-5-5"/></svg>' + message;
    toast.hidden = false;
    setTimeout(function() { toast.classList.add("show"); }, 10);
    toastTimer = setTimeout(function() {
      toast.classList.remove("show");
      setTimeout(function() { toast.hidden = true; }, 300);
    }, 3600);
  }

  //8. CONNECT INPUTS & RESET

  searchInput.addEventListener("input", function() {
    searchClear.hidden = (searchInput.value === "");
    render();
  });
  searchClear.addEventListener("click", function() {
    searchInput.value = "";
    searchClear.hidden = true;
    searchInput.focus();
    render();
  });
  bloodFilter.addEventListener("change", render);
  cityFilter.addEventListener("change", render);
  urgencyFilter.addEventListener("change", render);
  availFilter.addEventListener("change", render);
  sortSelect.addEventListener("change", render);
  compatToggle.addEventListener("change", render);

  function resetAll() {
    searchInput.value = "";
    searchClear.hidden = true;
    bloodFilter.value = "all";
    cityFilter.value = "all";
    urgencyFilter.value = "any";
    availFilter.value = "all";
    sortSelect.value = "availability";
    compatToggle.checked = false;
    render();
  }
  document.getElementById("resetBtn").addEventListener("click", resetAll);
  document.getElementById("emptyReset").addEventListener("click", resetAll);

  handleScroll();
  render();
});