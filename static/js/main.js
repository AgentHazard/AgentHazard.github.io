/* =========================================================
   AgentHazard — main.js
   Nav, animations, BibTeX copy
   ========================================================= */

document.addEventListener('DOMContentLoaded', function () {
  var siteNav = document.querySelector('.site-nav');
  var navToggle = document.querySelector('.site-nav__toggle');
  var navMenu = document.getElementById('site-nav-links');

  function closeNavMenu() {
    if (!siteNav || !navToggle) return;
    siteNav.setAttribute('data-menu-open', 'false');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open navigation menu');
  }

  function openNavMenu() {
    if (!siteNav || !navToggle) return;
    siteNav.setAttribute('data-menu-open', 'true');
    navToggle.setAttribute('aria-expanded', 'true');
    navToggle.setAttribute('aria-label', 'Close navigation menu');
  }

  function isPhoneNav() {
    return window.matchMedia('(max-width: 480px)').matches;
  }

  closeNavMenu();

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function () {
      var isOpen = siteNav.getAttribute('data-menu-open') === 'true';
      if (isOpen) {
        closeNavMenu();
      } else {
        openNavMenu();
      }
    });

    document.addEventListener('click', function (event) {
      if (!isPhoneNav()) return;
      if (!siteNav.contains(event.target)) {
        closeNavMenu();
      }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        closeNavMenu();
      }
    });

    window.addEventListener('resize', function () {
      if (!isPhoneNav()) {
        closeNavMenu();
      }
    });
  }

  /* -------------------------------------------------------
     1. Smooth scroll for anchor links
        (accounts for sticky nav height)
     ------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      var navHeight = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue('--nav-height'),
        10
      ) || 52;
      var top = target.getBoundingClientRect().top + window.scrollY - navHeight - 8;
      window.scrollTo({ top: top, behavior: 'smooth' });
      closeNavMenu();
    });
  });

  /* -------------------------------------------------------
     2. Nav active-section highlight
     ------------------------------------------------------- */
  var sections = document.querySelectorAll('section[id], header[id]');
  var navLinks = document.querySelectorAll('.site-nav__links a');

  var sectionObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var id = entry.target.getAttribute('id');
        navLinks.forEach(function (link) {
          link.classList.toggle('active', link.getAttribute('href') === '#' + id);
        });
      }
    });
  }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });

  sections.forEach(function (section) {
    sectionObserver.observe(section);
  });

  /* -------------------------------------------------------
     3. Scroll-triggered fade-in animations
        Respects prefers-reduced-motion
     ------------------------------------------------------- */
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var animatables = document.querySelectorAll('.animate-on-scroll');

  if (prefersReducedMotion) {
    animatables.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var fadeObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          fadeObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });

    animatables.forEach(function (el) { fadeObserver.observe(el); });
  }

  /* -------------------------------------------------------
     4. BibTeX copy to clipboard
     ------------------------------------------------------- */
  document.querySelectorAll('[data-copy-target]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var targetId = btn.getAttribute('data-copy-target');
      var source = document.getElementById(targetId);
      if (!source) return;

      var text = source.textContent.trim();

      navigator.clipboard.writeText(text).then(function () {
        btn.textContent = 'Copied!';
        btn.classList.add('copied');
        setTimeout(function () {
          btn.textContent = 'Copy';
          btn.classList.remove('copied');
        }, 2000);
      }).catch(function () {
        // Fallback for browsers without clipboard API
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        btn.textContent = 'Copied!';
        btn.classList.add('copied');
        setTimeout(function () {
          btn.textContent = 'Copy';
          btn.classList.remove('copied');
        }, 2000);
      });
    });
  });

  /* -------------------------------------------------------
     5. Teaser carousel
     ------------------------------------------------------- */
  document.querySelectorAll('[data-carousel]').forEach(function (carousel) {
    var track = carousel.querySelector('.teaser-carousel__track');
    var slides = carousel.querySelectorAll('.teaser-slide');
    var dots = carousel.querySelectorAll('[data-carousel-dot]');
    var prev = carousel.querySelector('[data-carousel-prev]');
    var next = carousel.querySelector('[data-carousel-next]');
    var currentIndex = 0;
    var touchStartX = 0;
    var touchDeltaX = 0;

    function render(index) {
      currentIndex = (index + slides.length) % slides.length;
      track.style.transform = 'translateX(' + (-100 * currentIndex) + '%)';

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === currentIndex);
      });

      dots.forEach(function (dot, dotIndex) {
        var isActive = dotIndex === currentIndex;
        dot.classList.toggle('is-active', isActive);
        dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });
    }

    if (prev) {
      prev.addEventListener('click', function () {
        render(currentIndex - 1);
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        render(currentIndex + 1);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        render(dotIndex);
      });
    });

    carousel.addEventListener('touchstart', function (event) {
      touchStartX = event.changedTouches[0].clientX;
      touchDeltaX = 0;
    }, { passive: true });

    carousel.addEventListener('touchmove', function (event) {
      touchDeltaX = event.changedTouches[0].clientX - touchStartX;
    }, { passive: true });

    carousel.addEventListener('touchend', function () {
      if (Math.abs(touchDeltaX) < 40) return;
      render(currentIndex + (touchDeltaX < 0 ? 1 : -1));
    });

    render(0);
  });

});
