/* =========================================================
   AgentHazard — main.js
   Nav, animations, BibTeX copy
   ========================================================= */

document.addEventListener('DOMContentLoaded', function () {

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

});
