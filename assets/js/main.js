// Jmix site: header state, reading progress, table of contents, copy links, back to top
(function () {
  "use strict";

  var header = document.querySelector(".site-header");
  var progress = document.querySelector(".progress");
  var toTop = document.querySelector(".to-top");
  var toc = document.querySelector(".toc");
  var tocLinks = toc ? Array.prototype.slice.call(toc.querySelectorAll("ol a")) : [];
  var sections = tocLinks
    .map(function (link) {
      return document.getElementById(link.getAttribute("href").slice(1));
    })
    .filter(Boolean);

  // Year in the footer
  Array.prototype.forEach.call(document.querySelectorAll("[data-year]"), function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  // Scroll: header border, progress bar, back to top button
  var ticking = false;

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    var max = document.documentElement.scrollHeight - window.innerHeight;

    if (header) {
      header.classList.toggle("is-scrolled", y > 8);
    }

    if (progress) {
      progress.style.transform = "scaleX(" + (max > 0 ? Math.min(y / max, 1) : 0) + ")";
    }

    if (toTop) {
      toTop.classList.toggle("is-visible", y > 600);
    }

    updateActive();
    ticking = false;
  }

  window.addEventListener(
    "scroll",
    function () {
      if (!ticking) {
        window.requestAnimationFrame(onScroll);
        ticking = true;
      }
    },
    { passive: true }
  );
  onScroll();

  if (toTop) {
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0 });
    });
  }

  // Highlight the section that is currently being read:
  // the last one whose top has passed the line under the header
  var activeId = null;

  function updateActive() {
    if (!sections.length) {
      return;
    }

    var line = (header ? header.offsetHeight : 0) + 120;
    var current = sections[0];
    var atBottom = window.innerHeight + (window.scrollY || window.pageYOffset) >= document.documentElement.scrollHeight - 4;

    sections.forEach(function (section) {
      if (section.getBoundingClientRect().top <= line) {
        current = section;
      }
    });

    if (atBottom) {
      current = sections[sections.length - 1];
    }

    if (current.id === activeId) {
      return;
    }

    activeId = current.id;
    tocLinks.forEach(function (link) {
      link.classList.toggle("is-active", link.getAttribute("href") === "#" + activeId);
    });
  }

  // Collapsible contents on small screens
  var tocToggle = document.querySelector(".toc-toggle");

  if (tocToggle && toc) {
    tocToggle.addEventListener("click", function () {
      var open = toc.classList.toggle("is-open");
      tocToggle.setAttribute("aria-expanded", String(open));
    });

    tocLinks.forEach(function (link) {
      link.addEventListener("click", function () {
        if (window.matchMedia("(max-width: 900px)").matches) {
          toc.classList.remove("is-open");
          tocToggle.setAttribute("aria-expanded", "false");
        }
      });
    });
  }

  // Copy a direct link to a section
  var toast = document.querySelector(".toast");
  var toastTimer;

  function showToast(text) {
    if (!toast) {
      return;
    }

    toast.textContent = text;
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toast.classList.remove("is-visible");
    }, 1800);
  }

  Array.prototype.forEach.call(document.querySelectorAll(".anchor"), function (button) {
    button.addEventListener("click", function () {
      var section = button.closest(".section");

      if (!section) {
        return;
      }

      var url = window.location.origin + window.location.pathname + "#" + section.id;

      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(url).then(
          function () {
            showToast("Link copied");
          },
          function () {
            window.location.hash = section.id;
          }
        );
      } else {
        window.location.hash = section.id;
      }
    });
  });
})();
