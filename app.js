(function(){
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  // Efek ketebalan huruf mengikuti kursor pada nama
  var h1 = document.getElementById("name");
  if (h1 && fine && !reduce) {
    var text = h1.textContent;
    h1.textContent = "";
    var letters = [];
    for (var i = 0; i < text.length; i++) {
      var s = document.createElement("span");
      s.setAttribute("aria-hidden", "true");
      s.textContent = text[i] === " " ? "\u00A0" : text[i];
      h1.appendChild(s);
      letters.push(s);
    }
    var base = 300;
    letters.forEach(function(l){ l.style.fontVariationSettings = '"wght" ' + base; });
    window.addEventListener("pointermove", function(e){
      letters.forEach(function(l){
        var r = l.getBoundingClientRect();
        var dx = e.clientX - (r.left + r.width / 2);
        var dy = e.clientY - (r.top + r.height / 2);
        var d = Math.sqrt(dx * dx + dy * dy);
        var w = Math.max(base, 800 - d * 1.6);
        l.style.fontVariationSettings = '"wght" ' + Math.round(w);
      });
    });
  }

  // Parallax: teks background dan foto proyek bergerak saat scroll / kursor
  var stages = document.querySelectorAll(".stage");
  if (!reduce) {
    var sRoot = document.documentElement, sTick = false;
    var updateScroll = function(){
      sRoot.style.setProperty("--sy", window.scrollY);
      var vh = window.innerHeight;
      stages.forEach(function(st){
        var r = st.getBoundingClientRect();
        var c = (r.top + r.height / 2 - vh / 2) / (vh / 2);
        st.style.setProperty("--sp", Math.max(-1.2, Math.min(1.2, c)).toFixed(3));
      });
      sTick = false;
    };
    window.addEventListener("scroll", function(){
      if (!sTick) { sTick = true; requestAnimationFrame(updateScroll); }
    }, { passive: true });
    updateScroll();
    if (fine) {
      stages.forEach(function(st){
        st.addEventListener("pointermove", function(e){
          var r = st.getBoundingClientRect();
          st.style.setProperty("--px", (((e.clientX - r.left) / r.width - 0.5) * 2).toFixed(3));
          st.style.setProperty("--py", (((e.clientY - r.top) / r.height - 0.5) * 2).toFixed(3));
        });
        st.addEventListener("pointerleave", function(){
          st.style.setProperty("--px", 0);
          st.style.setProperty("--py", 0);
        });
      });
    }
  }

  // Muncul perlahan saat di-scroll
  document.documentElement.classList.add("js");
  var rv = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.15 });
    rv.forEach(function(el){ io.observe(el); });
  } else {
    rv.forEach(function(el){ el.classList.add("in"); });
  }

  // Filter proyek
  var buttons = document.querySelectorAll(".filters button");
  var items = document.querySelectorAll(".projects .project");
  buttons.forEach(function(b){
    b.addEventListener("click", function(){
      buttons.forEach(function(x){ x.setAttribute("aria-pressed", String(x === b)); });
      var f = b.getAttribute("data-filter");
      items.forEach(function(it){
        it.hidden = !(f === "all" || it.getAttribute("data-tag") === f);
      });
    });
  });

  // Perbesar gambar proyek
  var lb = document.getElementById("lightbox");
  if (lb && lb.showModal) {
    var lbImg = lb.querySelector("img"), group = [], idx = 0;
    var showAt = function(i){
      idx = (i + group.length) % group.length;
      lbImg.src = group[idx].src;
      lbImg.alt = group[idx].alt;
    };
    document.querySelectorAll(".zoom").forEach(function(btn){
      btn.addEventListener("click", function(){
        var img = btn.querySelector("img");
        group = Array.prototype.slice.call(btn.closest(".stage").querySelectorAll("img"));
        showAt(group.indexOf(img));
        lb.showModal();
      });
    });
    lb.addEventListener("click", function(e){
      var act = e.target.getAttribute && e.target.getAttribute("data-act");
      if (act === "close" || e.target === lb) lb.close();
      else if (act === "prev") showAt(idx - 1);
      else if (act === "next") showAt(idx + 1);
    });
    lb.addEventListener("keydown", function(e){
      if (e.key === "ArrowLeft") showAt(idx - 1);
      if (e.key === "ArrowRight") showAt(idx + 1);
    });
  }

  // Salin email
  var toast = document.getElementById("toast");
  document.getElementById("copy").addEventListener("click", function(){
    var mail = "jayvano655@gmail.com";
    var done = function(msg){ toast.textContent = msg; setTimeout(function(){ toast.textContent = ""; }, 2000); };
    try {
      navigator.clipboard.writeText(mail).then(function(){ done("Email disalin"); }, function(){ done("Gagal menyalin"); });
    } catch (err) { done("Gagal menyalin"); }
  });

  // Tema
  var root = document.documentElement;
  document.getElementById("theme").addEventListener("click", function(){
    var dark = getComputedStyle(root).getPropertyValue("--bg").trim().toUpperCase() === "#000000";
    root.setAttribute("data-theme", dark ? "light" : "dark");
  });

  document.getElementById("year").textContent = "© " + new Date().getFullYear();
})();
