(function(){
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  // Nama: pecah jadi huruf (animasi masuk + efek ketebalan mengikuti kursor)
  var h1 = document.getElementById("name");
  if (h1 && !reduce) {
    var text = h1.textContent;
    h1.textContent = "";
    var letters = [];
    for (var i = 0; i < text.length; i++) {
      var s = document.createElement("span");
      s.setAttribute("aria-hidden", "true");
      s.style.setProperty("--n", i);
      s.textContent = text[i] === " " ? "\u00A0" : text[i];
      h1.appendChild(s);
      letters.push(s);
    }
    if (fine) {
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
  }

  // Intro saat halaman dibuka
  var rootEl = document.documentElement;
  var intro = document.querySelector(".intro");
  if (intro && rootEl.classList.contains("intro-active")) {
    rootEl.classList.add("intro-lock");
    var numEl = document.getElementById("introNum");
    var t0 = performance.now(), dur = 1700, finished = false;
    var finish = function(){
      if (finished) return;
      finished = true;
      intro.classList.add("done");
      rootEl.classList.add("loaded");
      rootEl.classList.remove("intro-lock");
      setTimeout(function(){ rootEl.classList.remove("intro-active"); }, 1100);
    };
    var step = function(now){
      if (finished) return;
      var k = Math.min(1, (now - t0) / dur);
      var e = 1 - Math.pow(1 - k, 3);
      intro.style.setProperty("--p", (e * 100).toFixed(1) + "%");
      numEl.textContent = Math.round(e * 100);
      if (k < 1) requestAnimationFrame(step); else setTimeout(finish, 250);
    };
    requestAnimationFrame(step);
    intro.addEventListener("click", finish);
  } else {
    rootEl.classList.add("loaded");
  }

  // Parallax: teks background dan foto proyek bergerak saat scroll / kursor
  var stages = document.querySelectorAll(".stage, .scene");
  if (!reduce) {
    var sRoot = document.documentElement, sTick = false;
    var updateScroll = function(){
      sRoot.style.setProperty("--sy", window.scrollY);
      var maxY = document.documentElement.scrollHeight - window.innerHeight;
      sRoot.style.setProperty("--prog", maxY > 0 ? (window.scrollY / maxY).toFixed(4) : 0);
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

  // Tombol magnetik (sedikit tertarik ke arah kursor)
  if (!reduce) {
    if (fine) {
      document.querySelectorAll(".btn, .filters button").forEach(function(el){
        el.addEventListener("pointermove", function(e){
          var r = el.getBoundingClientRect();
          var dx = (e.clientX - (r.left + r.width / 2)) * 0.3;
          var dy = (e.clientY - (r.top + r.height / 2)) * 0.3;
          el.style.translate = dx.toFixed(1) + "px " + dy.toFixed(1) + "px";
        });
        el.addEventListener("pointerleave", function(){ el.style.translate = ""; });
      });
    }
  }

  // Kolom pesan di Kontak
  var msg = document.getElementById("msg");
  if (msg) {
    document.querySelectorAll("[data-fill]").forEach(function(b){
      b.addEventListener("click", function(){ msg.value = b.getAttribute("data-fill"); msg.focus(); });
    });
    var getText = function(){ return msg.value.trim() || "Halo Ibrahimovic, aku melihat portofoliomu."; };
    var wa = document.getElementById("sendWa"), ml = document.getElementById("sendMail");
    if (wa) wa.addEventListener("click", function(){
      window.open("https://wa.me/6281331708609?text=" + encodeURIComponent(getText()), "_blank", "noopener");
    });
    if (ml) ml.addEventListener("click", function(){
      window.location.href = "mailto:jayvano655@gmail.com?subject=" + encodeURIComponent("Halo dari portofolio") + "&body=" + encodeURIComponent(getText());
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

  document.getElementById("year").textContent = "© " + new Date().getFullYear();
})();
