(function () {
  const cursor = document.getElementById("cursor");
  const ring = document.getElementById("cursorRing");
  let mx = 0,
    my = 0,
    rx = 0,
    ry = 0;

  if (cursor && ring) {
    document.addEventListener("mousemove", function (e) {
      mx = e.clientX;
      my = e.clientY;
      cursor.style.left = mx + "px";
      cursor.style.top = my + "px";
    });
    function animRing() {
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      ring.style.left = rx + "px";
      ring.style.top = ry + "px";
      requestAnimationFrame(animRing);
    }
    animRing();
  }

  const nav = document.getElementById("mainNav");
  if (nav) {
    window.addEventListener("scroll", function () {
      nav.classList.toggle("scrolled", window.scrollY > 60);
    });
  }

  /* UX journey: progress bar */
  const progressTrack = document.createElement("div");
  progressTrack.id = "pageProgressTrack";
  const progressBar = document.createElement("div");
  progressBar.id = "pageProgressBar";
  progressTrack.appendChild(progressBar);
  document.body.appendChild(progressTrack);

  function updateProgress() {
    const doc = document.documentElement;
    const scrollTop = window.scrollY || doc.scrollTop || 0;
    const max = Math.max(doc.scrollHeight - window.innerHeight, 1);
    const pct = Math.min(100, Math.max(0, (scrollTop / max) * 100));
    progressBar.style.width = pct + "%";
  }
  updateProgress();
  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress);

  const mobileToggle = nav ? nav.querySelector(".nav-mobile-toggle") : null;
  const desktopLinks = nav ? nav.querySelector(".nav-links") : null;
  const desktopCta = nav ? nav.querySelector(".nav-cta") : null;
  let mobileBackdrop = null;
  let mobileDrawer = null;

  function closeMobileMenu() {
    if (!nav || !mobileBackdrop || !mobileDrawer) return;
    nav.classList.remove("mobile-open");
    mobileBackdrop.classList.remove("open");
    mobileDrawer.classList.remove("open");
    document.body.classList.remove("mobile-menu-open");
    if (mobileToggle) {
      mobileToggle.setAttribute("aria-expanded", "false");
      mobileToggle.textContent = "Menu";
    }
  }

  if (nav && mobileToggle && desktopLinks && desktopCta) {
    mobileToggle.removeAttribute("onclick");
    mobileToggle.setAttribute("role", "button");
    mobileToggle.setAttribute("tabindex", "0");
    mobileToggle.setAttribute("aria-label", "Open mobile menu");
    mobileToggle.setAttribute("aria-expanded", "false");

    mobileBackdrop = document.createElement("div");
    mobileBackdrop.className = "mobile-menu-backdrop";

    mobileDrawer = document.createElement("aside");
    mobileDrawer.className = "mobile-menu-drawer";
    mobileDrawer.setAttribute("aria-label", "Mobile menu");

    const linksClone = desktopLinks.cloneNode(true);
    linksClone.classList.add("mobile-nav-links");
    linksClone.classList.remove("nav-links");

    const ctaClone = desktopCta.cloneNode(true);
    ctaClone.classList.add("mobile-nav-cta");
    ctaClone.classList.remove("nav-cta");

    mobileDrawer.appendChild(linksClone);
    mobileDrawer.appendChild(ctaClone);
    document.body.appendChild(mobileBackdrop);
    document.body.appendChild(mobileDrawer);

    function openMobileMenu() {
      nav.classList.add("mobile-open");
      mobileBackdrop.classList.add("open");
      mobileDrawer.classList.add("open");
      document.body.classList.add("mobile-menu-open");
      mobileToggle.setAttribute("aria-expanded", "true");
      mobileToggle.textContent = "Close";
    }

    mobileToggle.addEventListener("click", function () {
      const isOpen = nav.classList.contains("mobile-open");
      if (isOpen) closeMobileMenu();
      else openMobileMenu();
    });

    mobileToggle.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        mobileToggle.click();
      }
    });

    mobileBackdrop.addEventListener("click", closeMobileMenu);
    mobileDrawer.querySelectorAll("a").forEach(function (anchor) {
      anchor.addEventListener("click", closeMobileMenu);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMobileMenu();
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 900) closeMobileMenu();
    });
  }

  /* Framer-style fly-in motion system (vanilla) */
  const motionSelectors = [
    ".bento-cell",
    ".bento-material-cell",
    ".bento-project-cell",
    ".service-card",
    ".material-tier",
    ".project-row",
    ".contact-block",
    ".timeline-deep-item",
    ".page-section",
    ".vision-section",
    ".vision-divider",
  ];
  const motionPattern = ["up", "left", "right", "up", "pop"];
  let motionIndex = 0;

  motionSelectors.forEach(function (selector) {
    const nodes = document.querySelectorAll(selector);
    nodes.forEach(function (node) {
      if (!node.classList.contains("motion-fly")) {
        node.classList.add("reveal", "motion-fly");
        if (!node.dataset.fly) {
          node.dataset.fly = motionPattern[motionIndex % motionPattern.length];
        }
        motionIndex += 1;
      }
    });
  });

  const reveals = document.querySelectorAll(".reveal");
  if (reveals.length) {
    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
    );
    reveals.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* GSAP ScrollTrigger pinned horizontal carousel (process section) */
  if (window.gsap && window.ScrollTrigger) {
    window.gsap.registerPlugin(window.ScrollTrigger);
    if (typeof window.ScrollTrigger.normalizeScroll === "function") {
      window.ScrollTrigger.normalizeScroll(true);
    }

    const carouselSection = document.querySelector(".process-carousel-section");
    const carouselTrack = document.querySelector(".process-carousel-track");

    if (carouselSection && carouselTrack) {
      const getDistance = function () {
        return Math.max(0, carouselTrack.scrollWidth - window.innerWidth);
      };

      const setupHorizontalPin = function () {
        const distance = getDistance();
        if (distance <= 0) return;

        window.gsap.to(carouselTrack, {
          x: function () {
            return -getDistance();
          },
          ease: "none",
          scrollTrigger: {
            trigger: carouselSection,
            start: "top top",
            end: function () {
              return "+=" + getDistance();
            },
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });
      };

      setupHorizontalPin();
    }
  }

  const track = document.getElementById("materialTrack");
  if (track) {
    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;
    track.addEventListener("mousedown", function (e) {
      isDown = true;
      track.style.cursor = "grabbing";
      startX = e.pageX - track.offsetLeft;
      scrollLeft = track.scrollLeft;
    });
    track.addEventListener("mouseleave", function () {
      isDown = false;
      track.style.cursor = "";
    });
    track.addEventListener("mouseup", function () {
      isDown = false;
      track.style.cursor = "";
    });
    track.addEventListener("mousemove", function (e) {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - track.offsetLeft;
      track.scrollLeft = scrollLeft - (x - startX) * 1.5;
    });
  }
})();
