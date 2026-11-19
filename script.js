/* ==========================================================================
   Abhishek Kumar — Portfolio interactions
   Vanilla JavaScript, progressive enhancement only.
   ========================================================================== */

(function () {
  "use strict";

  var CONTACT_ENDPOINT =
    "https://script.google.com/macros/s/AKfycbwFW7P2FEHgIbzFCveV87XkPJk75qKnA51Dvpd3Ehy7NPnHPzypKFHRxWFRBmA0xRXj_g/exec";

  var prefersReducedMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* -----------------------------------------------------------------------
     Current year
     ----------------------------------------------------------------------- */

  var year = document.getElementById("year");
  if (year) {
    year.textContent = String(new Date().getFullYear());
  }

  /* -----------------------------------------------------------------------
     Mobile navigation
     ----------------------------------------------------------------------- */

  var menuToggle = document.querySelector(".menu-toggle");
  var menuClose = document.querySelector(".menu-close");
  var sideMenu = document.getElementById("sidemenu");
  var menuOverlay = document.querySelector(".menu-overlay");
  var navLinks = Array.prototype.slice.call(
    document.querySelectorAll("#sidemenu .nav-link")
  );

  function isMenuOpen() {
    return document.body.classList.contains("menu-open");
  }

  function openMenu() {
    if (!sideMenu || !menuToggle) {
      return;
    }

    document.body.classList.add("menu-open");
    sideMenu.classList.add("open");
    menuToggle.setAttribute("aria-expanded", "true");

    window.requestAnimationFrame(function () {
      if (menuClose) {
        menuClose.focus();
      }
    });
  }

  function closeMenu(returnFocus) {
    if (!sideMenu || !menuToggle) {
      return;
    }

    document.body.classList.remove("menu-open");
    sideMenu.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");

    if (returnFocus) {
      menuToggle.focus();
    }
  }

  if (menuToggle && menuClose && sideMenu) {
    menuToggle.addEventListener("click", function () {
      if (isMenuOpen()) {
        closeMenu(true);
      } else {
        openMenu();
      }
    });

    menuClose.addEventListener("click", function () {
      closeMenu(true);
    });

    if (menuOverlay) {
      menuOverlay.addEventListener("click", function () {
        closeMenu(true);
      });
    }

    navLinks.forEach(function (link) {
      link.addEventListener("click", function () {
        var href = link.getAttribute("href");
        closeMenu(false);

        if (href && href.charAt(0) === "#") {
          var target = document.querySelector(href);
          var heading = target ? target.querySelector("h1, h2") : null;

          if (heading) {
            heading.setAttribute("tabindex", "-1");

            // Wait for the browser's default fragment navigation to finish before
            // moving focus, otherwise the clicked link can steal it back.
            window.setTimeout(function () {
              heading.focus({ preventScroll: true });
            }, 0);
          }
        }
      });
    });

    document.addEventListener("keydown", function (event) {
      if (!isMenuOpen()) {
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu(true);
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      var focusable = [menuClose].concat(navLinks);
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      var active = document.activeElement;

      if (!event.shiftKey && active === first) {
        event.preventDefault();
        navLinks[0].focus();
      } else if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (event.shiftKey && active === navLinks[0]) {
        event.preventDefault();
        first.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    });

    var desktopQuery = window.matchMedia("(min-width: 821px)");
    var handleMenuBreakpoint = function (event) {
      if (event.matches && isMenuOpen()) {
        closeMenu(false);
      }
    };

    if (desktopQuery.addEventListener) {
      desktopQuery.addEventListener("change", handleMenuBreakpoint);
    } else if (desktopQuery.addListener) {
      desktopQuery.addListener(handleMenuBreakpoint);
    }
  }

  /* -----------------------------------------------------------------------
     Accessible About tabs
     ----------------------------------------------------------------------- */

  var tabButtons = Array.prototype.slice.call(
    document.querySelectorAll(".tab-links")
  );
  var tabPanels = Array.prototype.slice.call(
    document.querySelectorAll(".tab-contents")
  );

  function activateTab(button, moveFocus) {
    var panelId = button.getAttribute("aria-controls");
    var panel = panelId ? document.getElementById(panelId) : null;

    if (!panel) {
      return;
    }

    tabButtons.forEach(function (tab) {
      var isActive = tab === button;
      tab.classList.toggle("active-link", isActive);
      tab.setAttribute("aria-selected", String(isActive));
      tab.setAttribute("tabindex", isActive ? "0" : "-1");
    });

    tabPanels.forEach(function (tabPanel) {
      var isActive = tabPanel === panel;
      tabPanel.classList.toggle("active-tab", isActive);
      tabPanel.hidden = !isActive;
    });

    if (moveFocus) {
      button.focus();
    }
  }

  if (tabButtons.length && tabPanels.length) {
    tabButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        activateTab(button, false);
      });

      button.addEventListener("keydown", function (event) {
        var currentIndex = tabButtons.indexOf(button);
        var nextIndex = null;

        if (event.key === "ArrowRight" || event.key === "ArrowDown") {
          nextIndex = (currentIndex + 1) % tabButtons.length;
        } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
          nextIndex = (currentIndex - 1 + tabButtons.length) % tabButtons.length;
        } else if (event.key === "Home") {
          nextIndex = 0;
        } else if (event.key === "End") {
          nextIndex = tabButtons.length - 1;
        }

        if (nextIndex !== null) {
          event.preventDefault();
          activateTab(tabButtons[nextIndex], true);
        }
      });
    });
  }

  /* -----------------------------------------------------------------------
     Scroll reveal with a no-JS and reduced-motion fallback
     ----------------------------------------------------------------------- */

  var revealItems = Array.prototype.slice.call(
    document.querySelectorAll("[data-aos]")
  );

  if (revealItems.length && !prefersReducedMotion) {
    if ("IntersectionObserver" in window) {
      document.documentElement.classList.add("reveal-ready");

      revealItems.forEach(function (item) {
        var delay = parseInt(item.getAttribute("data-aos-delay"), 10);
        if (!Number.isNaN(delay) && delay > 0) {
          item.style.setProperty("--aos-delay", delay + "ms");
        }
      });

      var revealObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) {
              return;
            }

            entry.target.classList.add("aos-in");
            revealObserver.unobserve(entry.target);
          });
        },
        { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
      );

      revealItems.forEach(function (item) {
        revealObserver.observe(item);
      });
    } else {
      revealItems.forEach(function (item) {
        item.classList.add("aos-in");
      });
    }
  }

  /* -----------------------------------------------------------------------
     Typing animation
     ----------------------------------------------------------------------- */

  var typedText = document.querySelector(".typed-text");
  var cursor = document.querySelector(".cursor");

  if (typedText) {
    var phrases = [
      "Machine Learning & AI Engineer",
      "Speech & Audio AI Specialist",
      "RAG & LLM Developer",
      "Problem Solver"
    ];
    var phraseIndex = 0;
    var characterIndex = 0;
    var typingDelay = 95;
    var erasingDelay = 45;
    var newTextDelay = 2200;

    var typeNextCharacter = function () {
      var phrase = phrases[phraseIndex];

      if (characterIndex < phrase.length) {
        if (cursor) {
          cursor.classList.add("typing");
        }
        typedText.textContent = phrase.slice(0, characterIndex + 1);
        characterIndex += 1;
        window.setTimeout(typeNextCharacter, typingDelay);
      } else {
        if (cursor) {
          cursor.classList.remove("typing");
        }
        window.setTimeout(eraseText, newTextDelay);
      }
    };

    var eraseText = function () {
      var phrase = phrases[phraseIndex];

      if (characterIndex > 0) {
        if (cursor) {
          cursor.classList.add("typing");
        }
        characterIndex -= 1;
        typedText.textContent = phrase.slice(0, characterIndex);
        window.setTimeout(eraseText, erasingDelay);
      } else {
        if (cursor) {
          cursor.classList.remove("typing");
        }
        phraseIndex = (phraseIndex + 1) % phrases.length;
        window.setTimeout(typeNextCharacter, 250);
      }
    };

    if (prefersReducedMotion) {
      typedText.textContent = phrases[0];
    } else {
      typedText.textContent = "";
      window.setTimeout(typeNextCharacter, 500);
    }
  }

  /* -----------------------------------------------------------------------
     Scroll spy for the main navigation
     ----------------------------------------------------------------------- */

  var spySections = Array.prototype.slice.call(
    document.querySelectorAll("#header[id], main > section[id]")
  );
  var spyLinks = Array.prototype.slice.call(
    document.querySelectorAll('#sidemenu a[href^="#"], .nav-link[href^="#"]')
  );

  if (spySections.length && spyLinks.length) {
    var setActiveLink = function (currentId) {
      spyLinks.forEach(function (link) {
        var isActive = link.getAttribute("href") === "#" + currentId;
        link.classList.toggle("active", isActive);

        if (isActive) {
          link.setAttribute("aria-current", "page");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    };

    if ("IntersectionObserver" in window) {
      var spyObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              setActiveLink(entry.target.id);
            }
          });
        },
        { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
      );

      spySections.forEach(function (section) {
        spyObserver.observe(section);
      });
    } else {
      var sectionOffsets = [];

      var measureSections = function () {
        sectionOffsets = spySections.map(function (section) {
          return { id: section.id, top: section.offsetTop };
        });
      };

      var updateActiveLink = function () {
        var marker = window.scrollY + window.innerHeight * 0.3;
        var currentId = spySections[0].id;

        sectionOffsets.forEach(function (section) {
          if (section.top <= marker) {
            currentId = section.id;
          }
        });

        setActiveLink(currentId);
      };

      var scrollTicking = false;
      var handleScroll = function () {
        if (scrollTicking) {
          return;
        }

        scrollTicking = true;
        window.requestAnimationFrame(function () {
          updateActiveLink();
          scrollTicking = false;
        });
      };

      window.addEventListener("scroll", handleScroll, { passive: true });
      window.addEventListener("resize", function () {
        measureSections();
        updateActiveLink();
      });
      measureSections();
      updateActiveLink();
    }
  }

  /* -----------------------------------------------------------------------
     Interactive Project Category Filters
     ----------------------------------------------------------------------- */

  var filterPills = document.querySelectorAll(".filter-pill");
  var projectCards = document.querySelectorAll(".services-list .project-card");

  if (filterPills.length && projectCards.length) {
    filterPills.forEach(function (pill) {
      pill.addEventListener("click", function () {
        var category = pill.getAttribute("data-filter");

        filterPills.forEach(function (p) {
          var active = p === pill;
          p.classList.toggle("is-active", active);
          p.setAttribute("aria-selected", String(active));
        });

        projectCards.forEach(function (card) {
          var cat = card.getAttribute("data-cat");
          var show = category === "all" || cat === category;

          if (show) {
            card.classList.remove("is-hidden");
            card.style.opacity = "0";
            card.style.transform = "translateY(12px)";
            window.requestAnimationFrame(function () {
              card.style.transition = "opacity 280ms ease, transform 280ms ease";
              card.style.opacity = "1";
              card.style.transform = "translateY(0)";
            });
          } else {
            card.classList.add("is-hidden");
          }
        });
      });
    });
  }

  /* -----------------------------------------------------------------------
     Interactive 1-Click Clipboard Copy with Floating Toast
     ----------------------------------------------------------------------- */

  var toastEl = null;
  var toastTimer = null;

  var showToast = function (message) {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.className = "toast-notice";
      toastEl.setAttribute("role", "status");
      toastEl.setAttribute("aria-live", "polite");
      document.body.appendChild(toastEl);
    }

    window.clearTimeout(toastTimer);
    toastEl.innerHTML =
      '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"></polyline></svg> ' +
      message;
    toastEl.classList.add("is-visible");

    toastTimer = window.setTimeout(function () {
      toastEl.classList.remove("is-visible");
    }, 2800);
  };

  var copyContactItems = document.querySelectorAll('.contact-item[href^="mailto:"], .contact-item[href^="tel:"]');
  copyContactItems.forEach(function (item) {
    item.addEventListener("click", function () {
      var href = item.getAttribute("href");
      var textToCopy = "";
      var label = "";

      if (href.startsWith("mailto:")) {
        textToCopy = href.replace("mailto:", "");
        label = "Email address";
      } else if (href.startsWith("tel:")) {
        textToCopy = href.replace("tel:", "");
        label = "Phone number";
      }

      if (textToCopy && navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(textToCopy).then(function () {
          showToast(label + " copied to clipboard!");
        }).catch(function () {});
      }
    });
  });

  /* -----------------------------------------------------------------------
     Contact form
     ----------------------------------------------------------------------- */

  var form = document.getElementById("contact-form");
  var formStatus = document.getElementById("msg");

  if (form && formStatus) {
    var submitButton = form.querySelector('button[type="submit"]');
    var honeypot = form.elements.namedItem("Website");
    var statusResetTimer = null;

    var showStatus = function (message, type) {
      window.clearTimeout(statusResetTimer);
      formStatus.textContent = message;
      formStatus.classList.remove("is-success", "is-error");

      if (type) {
        formStatus.classList.add("is-" + type);
      }
    };

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      // Bots often fill hidden fields. Pretend the message worked and never send.
      if (honeypot && String(honeypot.value).trim() !== "") {
        showStatus("Message sent successfully. I'll get back to you soon.", "success");
        form.reset();
        return;
      }

      showStatus("Sending your message…", null);

      if (submitButton) {
        submitButton.disabled = true;
      }
      form.setAttribute("aria-busy", "true");

      window
        .fetch(CONTACT_ENDPOINT, {
          method: "POST",
          body: new FormData(form),
          mode: "no-cors"
        })
        .then(function () {
          form.reset();
          showStatus(
            "Message sent successfully. I'll get back to you soon.",
            "success"
          );

          statusResetTimer = window.setTimeout(function () {
            showStatus("", null);
          }, 8000);
        })
        .catch(function (error) {
          console.error("Contact form error, attempting fallback:", error);
          try {
            var iframeName = "hidden_contact_iframe";
            var iframe = document.getElementById(iframeName);
            if (!iframe) {
              iframe = document.createElement("iframe");
              iframe.id = iframeName;
              iframe.name = iframeName;
              iframe.style.display = "none";
              document.body.appendChild(iframe);
            }
            form.action = CONTACT_ENDPOINT;
            form.method = "POST";
            form.target = iframeName;
            form.submit();
            form.reset();
            showStatus(
              "Message sent successfully. I'll get back to you soon.",
              "success"
            );
            statusResetTimer = window.setTimeout(function () {
              showStatus("", null);
            }, 8000);
          } catch (fallbackErr) {
            console.error("Contact fallback error:", fallbackErr);
            showStatus(
              "Sorry, your message could not be sent. Please email abhishekkumarnwd71@gmail.com directly.",
              "error"
            );
          }
        })
        .finally(function () {
          if (submitButton) {
            submitButton.disabled = false;
          }
          form.removeAttribute("aria-busy");
        });
    });
  }
})();
