document.addEventListener("DOMContentLoaded", () => {
  const html = document.documentElement;
  const header = document.querySelector(".header");
  const nav = document.querySelector(".nav");
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelectorAll(".nav a");
  const smoothLinks = document.querySelectorAll('a[href^="#"]');
  const revealItems = document.querySelectorAll(".reveal");
  const tiltCards = document.querySelectorAll(".tilt-card");
  const themeToggle = document.querySelector(".theme-toggle");
  const progressBar = document.querySelector(".scroll-progress");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)");

  const getSavedTheme = () => localStorage.getItem("site-lift-theme");

  const applyTheme = (theme) => {
    html.setAttribute("data-theme", theme);
    if (themeToggle) {
      const isDark = theme === "dark";
      themeToggle.setAttribute("aria-pressed", String(isDark));
      themeToggle.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
    }
  };

  const initTheme = () => {
    const savedTheme = getSavedTheme();
    if (savedTheme === "light" || savedTheme === "dark") {
      applyTheme(savedTheme);
    } else {
      applyTheme(systemDark.matches ? "dark" : "light");
    }
  };

  initTheme();

  themeToggle?.addEventListener("click", () => {
    const current = html.getAttribute("data-theme") === "dark" ? "dark" : "light";
    const next = current === "dark" ? "light" : "dark";
    localStorage.setItem("site-lift-theme", next);
    applyTheme(next);
  });

  systemDark.addEventListener("change", (event) => {
    if (!getSavedTheme()) {
      applyTheme(event.matches ? "dark" : "light");
    }
  });

  const updateHeader = () => {
    header?.classList.toggle("scrolled", window.scrollY > 10);
  };

  const updateProgress = () => {
    if (!progressBar) return;
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = `${progress}%`;
  };

  const closeMenu = () => {
    nav?.classList.remove("open");
    navToggle?.classList.remove("active");
    navToggle?.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  };

  /* 🔥 NEW FUNCTION */
  const setActiveNavLink = (targetId) => {
    navLinks.forEach((navLink) => {
      navLink.classList.toggle("active-link", navLink.getAttribute("href") === targetId);
    });
  };

  updateHeader();
  updateProgress();

  window.addEventListener("scroll", () => {
    updateHeader();
    updateProgress();
  }, { passive: true });

  navToggle?.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    navToggle.classList.toggle("active", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
    document.body.style.overflow = isOpen ? "hidden" : "";
  });

  /* 🔥 UPDATED NAV CLICK */
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      const targetId = link.getAttribute("href");
      setActiveNavLink(targetId);
      closeMenu();
    });
  });

  /* 🔥 UPDATED SCROLL */
  smoothLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");
      if (!targetId || targetId === "#") return;

      const target = document.querySelector(targetId);
      if (!target) return;

      event.preventDefault();
      const offset = (header?.offsetHeight || 0) - 4;

      const targetTop =
        targetId === "#top"
          ? 0
          : target.getBoundingClientRect().top + window.pageYOffset - offset;

      window.scrollTo({
        top: targetTop < 0 ? 0 : targetTop,
        behavior: prefersReducedMotion ? "auto" : "smooth"
      });
    });
  });

  if (!prefersReducedMotion && "IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -40px 0px"
      }
    );

    revealItems.forEach((item, index) => {
      item.style.transitionDelay = `${Math.min(index * 70, 280)}ms`;
      revealObserver.observe(item);
    });
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  if (!prefersReducedMotion) {
    tiltCards.forEach((card) => {
      const maxTilt = 9;

      const resetTilt = () => {
        card.style.transform = "perspective(1100px) rotateX(0deg) rotateY(0deg) translateZ(0)";
      };

      card.addEventListener("mousemove", (event) => {
        const rect = card.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateY = ((x - centerX) / centerX) * maxTilt;
        const rotateX = ((centerY - y) / centerY) * maxTilt;

        card.style.transform = `perspective(1100px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(0)`;
      });

      card.addEventListener("mouseleave", resetTilt);
      card.addEventListener("blur", resetTilt, true);
    });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });
});
