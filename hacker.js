/* ==========================================================================
   Abhishek Kumar — Hacker Mode interactions
   Vanilla JavaScript. Progressive enhancement only.
   ========================================================================== */

(function () {
  "use strict";

  
  /* -----------------------------------------------------------------------
     Web Audio API SoundFX Synthesizer (Zero External Assets)
     ----------------------------------------------------------------------- */

  var SoundFX = (function () {
    var ctx = null;
    var enabled = false;

    var getContext = function () {
      if (!ctx && (window.AudioContext || window.webkitAudioContext)) {
        var AudioCtx = window.AudioContext || window.webkitAudioContext;
        ctx = new AudioCtx();
      }
      if (ctx && ctx.state === "suspended") {
        ctx.resume();
      }
      return ctx;
    };

    return {
      init: function () {
        try {
          var saved = window.localStorage.getItem("ak-sound-enabled");
          enabled = saved === "true";
        } catch (e) {
          enabled = false;
        }
        return enabled;
      },
      toggle: function () {
        enabled = !enabled;
        if (enabled) {
          getContext();
        }
        try {
          window.localStorage.setItem("ak-sound-enabled", String(enabled));
        } catch (e) {}
        return enabled;
      },
      isEnabled: function () {
        return enabled;
      },
      playKeyClick: function () {
        if (!enabled) return;
        var c = getContext();
        if (!c) return;
        try {
          var osc = c.createOscillator();
          var gain = c.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(1400 + Math.random() * 300, c.currentTime);
          osc.frequency.exponentialRampToValueAtTime(300, c.currentTime + 0.012);
          gain.gain.setValueAtTime(0.035, c.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.012);
          osc.connect(gain);
          gain.connect(c.destination);
          osc.start();
          osc.stop(c.currentTime + 0.014);
        } catch (e) {}
      },
      playCommandBlip: function () {
        if (!enabled) return;
        var c = getContext();
        if (!c) return;
        try {
          var osc = c.createOscillator();
          var gain = c.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(440, c.currentTime);
          osc.frequency.exponentialRampToValueAtTime(880, c.currentTime + 0.06);
          gain.gain.setValueAtTime(0.08, c.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.08);
          osc.connect(gain);
          gain.connect(c.destination);
          osc.start();
          osc.stop(c.currentTime + 0.085);
        } catch (e) {}
      },
      playModalOpen: function () {
        if (!enabled) return;
        var c = getContext();
        if (!c) return;
        try {
          var osc = c.createOscillator();
          var gain = c.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(220, c.currentTime);
          osc.frequency.exponentialRampToValueAtTime(660, c.currentTime + 0.12);
          gain.gain.setValueAtTime(0.06, c.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.14);
          osc.connect(gain);
          gain.connect(c.destination);
          osc.start();
          osc.stop(c.currentTime + 0.15);
        } catch (e) {}
      }
    };
  })();

  SoundFX.init();

  var CONTACT_ENDPOINT =
    "https://script.google.com/macros/s/AKfycbxemCV2xYrBEPRo8WWQym7PHUsKiBPFtcHsrq0GJukbaA2hJ2_7m1x1oWitPtVlEJtL/exec";

  var motionQuery = window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)")
    : null;
  var prefersReducedMotion = Boolean(motionQuery && motionQuery.matches);
  var finePointer = Boolean(
    window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches
  );

  var $ = function (selector, root) {
    return (root || document).querySelector(selector);
  };

  var $$ = function (selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  };

  var escapeHtml = function (value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  };

  // If a later feature throws, make sure reveal animations never trap content.
  window.addEventListener("error", function () {
    document.documentElement.classList.remove("reveal-ready");
  });

  /* -----------------------------------------------------------------------
     Current year and clocks
     ----------------------------------------------------------------------- */

  var year = document.getElementById("year");
  if (year) {
    year.textContent = String(new Date().getFullYear());
  }

  var clock = document.getElementById("clock");
  var footerClock = document.getElementById("footer-clock");

  var updateClock = function () {
    var time;
    try {
      time = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      }).format(new Date());
    } catch (error) {
      time = new Date().toTimeString().slice(0, 5);
    }

    if (clock) {
      clock.textContent = time;
    }
    if (footerClock) {
      footerClock.textContent = time;
    }
  };

  updateClock();
  window.setInterval(updateClock, 30000);

  /* -----------------------------------------------------------------------
     Boot sequence (once per session, skipped for reduced motion)
     ----------------------------------------------------------------------- */

  var boot = document.getElementById("boot-screen");
  var bootProgress = document.getElementById("boot-progress");
  var bootTimer = null;
  var bootDone = false;

  var finishBoot = function () {
    if (!boot || bootDone) {
      return;
    }

    bootDone = true;
    window.clearInterval(bootTimer);

    try {
      window.sessionStorage.setItem("ak-hacker-boot", "1");
    } catch (error) {
      /* Storage can be unavailable in private or file contexts. */
    }

    boot.classList.add("is-leaving");
    window.setTimeout(function () {
      boot.hidden = true;
      boot.classList.remove("is-leaving");
    }, 380);
  };

  if (boot) {
    var bootSeen = false;

    try {
      bootSeen = window.sessionStorage.getItem("ak-hacker-boot") === "1";
    } catch (error) {
      bootSeen = false;
    }

    if (bootSeen || prefersReducedMotion) {
      boot.hidden = true;
    } else {
      boot.hidden = false;
      var bootValue = 0;

      bootTimer = window.setInterval(function () {
        bootValue = Math.min(100, bootValue + 3 + Math.random() * 7);
        if (bootProgress) {
          bootProgress.style.width = bootValue + "%";
        }

        if (bootValue >= 100) {
          window.clearInterval(bootTimer);
          window.setTimeout(finishBoot, 260);
        }
      }, 90);

      boot.addEventListener("click", finishBoot);
      document.addEventListener("keydown", finishBoot, { once: true });
      window.setTimeout(finishBoot, 2600);
    }
  }

  /* -----------------------------------------------------------------------
     Mobile navigation
     ----------------------------------------------------------------------- */

  var navToggle = $(".nav-toggle");
  var navClose = $(".nav-close");
  var navDrawer = document.getElementById("nav-menu");
  var navBackdrop = $(".nav-backdrop");
  var navLinks = $$("#nav-menu .nav-link");

  var navIsOpen = function () {
    return document.body.classList.contains("nav-open");
  };

  var getNavFocusable = function () {
    if (!navDrawer) {
      return [];
    }

    return $$("a[href], button:not([disabled])", navDrawer).filter(function (element) {
      return element.offsetWidth > 0 || element.offsetHeight > 0;
    });
  };

  var openNav = function () {
    if (!navDrawer || !navToggle) {
      return;
    }

    document.body.classList.add("nav-open");
    navToggle.setAttribute("aria-expanded", "true");
    navToggle.setAttribute("aria-label", "Close menu");

    window.setTimeout(function () {
      if (navClose && navIsOpen()) {
        navClose.focus();
      }
    }, 80);
  };

  var closeNav = function (returnFocus) {
    if (!navDrawer || !navToggle) {
      return;
    }

    document.body.classList.remove("nav-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open menu");

    if (returnFocus) {
      navToggle.focus();
    }
  };

  if (navToggle && navClose && navDrawer) {
    navToggle.addEventListener("click", function () {
      if (navIsOpen()) {
        closeNav(true);
      } else {
        openNav();
      }
    });

    navClose.addEventListener("click", function () {
      closeNav(true);
    });

    if (navBackdrop) {
      navBackdrop.addEventListener("click", function () {
        closeNav(true);
      });
    }

    navLinks.forEach(function (link) {
      link.addEventListener("click", function () {
        var href = link.getAttribute("href");
        closeNav(false);

        if (href && href.charAt(0) === "#") {
          var target = document.querySelector(href);
          var heading = target ? target.querySelector("h1, h2") : null;

          if (heading) {
            heading.setAttribute("tabindex", "-1");
            window.setTimeout(function () {
              heading.focus({ preventScroll: true });
            }, 0);
          }
        }
      });
    });

    document.addEventListener("keydown", function (event) {
      if (!navIsOpen()) {
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        closeNav(true);
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      var focusable = getNavFocusable();
      if (!focusable.length) {
        return;
      }

      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      var active = document.activeElement;

      if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && (active === first || active === navToggle)) {
        event.preventDefault();
        last.focus();
      } else if (!focusable.includes(active)) {
        event.preventDefault();
        first.focus();
      }
    });

    var desktopQuery = window.matchMedia("(min-width: 981px)");
    var handleBreakpoint = function (event) {
      if (event.matches && navIsOpen()) {
        closeNav(false);
      }
    };

    if (desktopQuery.addEventListener) {
      desktopQuery.addEventListener("change", handleBreakpoint);
    } else if (desktopQuery.addListener) {
      desktopQuery.addListener(handleBreakpoint);
    }
  }

  /* -----------------------------------------------------------------------
     Reveal on scroll
     ----------------------------------------------------------------------- */

  var revealItems = $$("[data-reveal]");

  if (revealItems.length && !prefersReducedMotion && "IntersectionObserver" in window) {
    document.documentElement.classList.add("reveal-ready");

    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.06 }
    );

    revealItems.forEach(function (item) {
      revealObserver.observe(item);
    });
  } else {
    revealItems.forEach(function (item) {
      item.classList.add("is-visible");
    });
  }

  /* -----------------------------------------------------------------------
     Typing role
     ----------------------------------------------------------------------- */

  var typedRole = $(".typed-role");

  if (typedRole) {
    var phrases = [
      "AI/ML Engineer",
      "Speech · Vision · GenAI",
      "RAG & GraphRAG Builder",
      "Production AI, shipped."
    ];
    var phraseIndex = 0;
    var characterIndex = 0;
    var typeDelay = 82;
    var eraseDelay = 38;

    var typeNext = function () {
      var phrase = phrases[phraseIndex];

      if (characterIndex < phrase.length) {
        typedRole.textContent = phrase.slice(0, characterIndex + 1);
        characterIndex += 1;
        window.setTimeout(typeNext, typeDelay);
      } else {
        window.setTimeout(eraseNext, 2100);
      }
    };

    var eraseNext = function () {
      if (characterIndex > 0) {
        characterIndex -= 1;
        typedRole.textContent = phrases[phraseIndex].slice(0, characterIndex);
        window.setTimeout(eraseNext, eraseDelay);
      } else {
        phraseIndex = (phraseIndex + 1) % phrases.length;
        window.setTimeout(typeNext, 260);
      }
    };

    if (prefersReducedMotion) {
      typedRole.textContent = phrases[0];
    } else {
      typedRole.textContent = "";
      window.setTimeout(typeNext, 520);
    }
  }

  /* -----------------------------------------------------------------------
     Scroll progress and scroll spy
     ----------------------------------------------------------------------- */

  var progressBar = document.getElementById("scroll-progress-bar");
  var spySections = $$("#home, #about, #terminal, #experience, #projects, #contact");
  var spyLinks = $$(".nav-link[href^='#']");
  var scrollTicking = false;

  var setActiveSection = function (currentId) {
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

  var updateScrollState = function () {
    var scrollTop = window.scrollY || window.pageYOffset;
    var scrollable = document.documentElement.scrollHeight - window.innerHeight;

    if (progressBar) {
      progressBar.style.transform =
        "scaleX(" + (scrollable > 0 ? Math.min(1, scrollTop / scrollable) : 0) + ")";
    }

    if (!spySections.length) {
      return;
    }

    var marker = scrollTop + window.innerHeight * 0.33;
    var currentId = spySections[0].id;

    spySections.forEach(function (section) {
      if (section.offsetTop <= marker) {
        currentId = section.id;
      }
    });

    setActiveSection(currentId);
  };

  var requestScrollUpdate = function () {
    if (scrollTicking) {
      return;
    }

    scrollTicking = true;
    window.requestAnimationFrame(function () {
      updateScrollState();
      scrollTicking = false;
    });
  };

  window.addEventListener("scroll", requestScrollUpdate, { passive: true });
  window.addEventListener("resize", requestScrollUpdate);
  updateScrollState();

  /* -----------------------------------------------------------------------
     Skill and project filters
     ----------------------------------------------------------------------- */

  var skillButtons = $$("[data-skill-filter]");
  var skillItems = $$("#skill-grid .skill");
  var skillStatus = document.getElementById("skill-status");

  var applySkillFilter = function (category) {
    var count = 0;

    skillItems.forEach(function (item) {
      var show = category === "all" || item.getAttribute("data-cat") === category;
      item.hidden = !show;

      if (show) {
        count += 1;
      }
    });

    skillButtons.forEach(function (button) {
      var active = button.getAttribute("data-skill-filter") === category;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });

    if (skillStatus) {
      skillStatus.textContent =
        "Showing " + count + (category === "all" ? " capabilities" : " " + category + " capabilities");
    }
  };

  skillButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      applySkillFilter(button.getAttribute("data-skill-filter"));
    });
  });

  var projectButtons = $$("[data-project-filter]");
  var projectItems = $$(".project-grid .project");
  var projectStatus = document.getElementById("project-status");

  var applyProjectFilter = function (category) {
    var count = 0;

    projectItems.forEach(function (item) {
      var show = category === "all" || item.getAttribute("data-cat") === category;
      item.hidden = !show;

      if (show) {
        count += 1;
      }
    });

    projectButtons.forEach(function (button) {
      var active = button.getAttribute("data-project-filter") === category;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });

    if (projectStatus) {
      projectStatus.textContent =
        "Showing " + count + " case file" + (count === 1 ? "" : "s");
    }
  };

  projectButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      applyProjectFilter(button.getAttribute("data-project-filter"));
    });
  });

  /* -----------------------------------------------------------------------
     Toast and clipboard
     ----------------------------------------------------------------------- */

  var toast = document.getElementById("toast");
  var toastTimer = null;

  var showToast = function (message) {
    if (!toast) {
      return;
    }

    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add("is-visible");

    toastTimer = window.setTimeout(function () {
      toast.classList.remove("is-visible");
    }, 2800);
  };

  var copyText = function (text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }

    return new Promise(function (resolve, reject) {
      var field = document.createElement("textarea");
      field.value = text;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.left = "-9999px";
      document.body.appendChild(field);
      field.select();

      try {
        var copied = document.execCommand("copy");
        document.body.removeChild(field);

        if (copied) {
          resolve();
        } else {
          reject(new Error("Copy command failed"));
        }
      } catch (error) {
        document.body.removeChild(field);
        reject(error);
      }
    });
  };

  var copyEmail = function () {
    copyText("abhishekkumarnwd71@gmail.com")
      .then(function () {
        showToast("email copied to clipboard");
      })
      .catch(function () {
        showToast("copy failed — email: abhishekkumarnwd71@gmail.com");
      });
  };

  $$("[data-copy-email]").forEach(function (button) {
    button.addEventListener("click", copyEmail);
  });

  
  /* -----------------------------------------------------------------------
     Interactive REPL Terminal Controller
     ----------------------------------------------------------------------- */

  var terminalForm = document.getElementById("terminal-form");
  var terminalInput = document.getElementById("terminal-input");
  var terminalScreen = document.getElementById("terminal-screen");
  var cliPills = $$("[data-cli-cmd]");
  var commandHistory = [];
  var historyIndex = -1;

  var appendTerminalOutput = function (htmlContent) {
    if (!terminalScreen) return;
    var line = document.createElement("div");
    line.className = "terminal-line";
    line.innerHTML = htmlContent;
    terminalScreen.appendChild(line);
    terminalScreen.scrollTop = terminalScreen.scrollHeight;
  };

  var executeReplCommand = function (rawCmd) {
    var cmd = rawCmd.trim().toLowerCase();
    if (!cmd) return;

    commandHistory.push(rawCmd);
    historyIndex = commandHistory.length;

    // Echo command
    appendTerminalOutput('<div class="term-cmd-row"><span class="term-prompt">visitor@ai-cluster:~$</span> ' + escapeHtml(rawCmd) + '</div>');
    SoundFX.playCommandBlip();

    var parts = cmd.split(/\s+/);
    var root = parts[0];

    if (root === "help") {
      appendTerminalOutput(
        '<table class="term-table">' +
        '<tr><td>whoami</td><td>Display engineer profile, experience, and background</td></tr>' +
        '<tr><td>skills</td><td>List AI/ML technical skills across Vision, Speech, NLP, and GenAI</td></tr>' +
        '<tr><td>projects / ls</td><td>Showcase 6 production case files with direct open links</td></tr>' +
        '<tr><td>run rag-eval</td><td>Execute Ragas golden benchmark test on Enterprise GraphRAG</td></tr>' +
        '<tr><td>cat resume</td><td>View ATS 100/100 resume summary and download dossier PDF</td></tr>' +
        '<tr><td>audio</td><td>Toggle synthesized mechanical keyboard audio feedback</td></tr>' +
        '<tr><td>contact</td><td>Display direct communication channels (email, phone, LinkedIn)</td></tr>' +
        '<tr><td>clear</td><td>Clear the terminal output buffer</td></tr>' +
        '</table>'
      );
    } else if (root === "whoami") {
      appendTerminalOutput(
        '<span class="term-green">ABHISHEK KUMAR</span> &mdash; AI Native Developer &amp; AI/ML Engineer<br>' +
        '<span class="term-muted">Experience:</span> 2.8+ years deploying production AI systems (Softel Solutions, Azine Web, Phoenix Labs, Atharvo).<br>' +
        '<span class="term-muted">Core Focus:</span> Speech Biometrics, Document Intelligence, GraphRAG &amp; Agentic AI workflows.<br>' +
        '<span class="term-muted">Location:</span> Noida, India &middot; Available for high-impact AI Engineering roles.'
      );
    } else if (root === "skills") {
      appendTerminalOutput(
        '<table class="term-table">' +
        '<tr><td>Audio &amp; Speech:</td><td>Wav2Vec2 &middot; ECAPA-TDNN &middot; Whisper &middot; Bark/Coqui TTS &middot; Speaker Diarization</td></tr>' +
        '<tr><td>Generative AI:</td><td>Enterprise RAG &middot; GraphRAG (Neo4j) &middot; LangChain &middot; Mem0 &middot; Vector Embeddings</td></tr>' +
        '<tr><td>Computer Vision:</td><td>YOLOv11/v8 &middot; OpenCV &middot; RetinaFace &middot; ArcFace &middot; PaddleOCR &middot; Tesseract</td></tr>' +
        '<tr><td>Machine Learning:</td><td>PyTorch &middot; Scikit-learn &middot; DistilBERT &middot; SVM &middot; XGBoost &middot; Random Forest</td></tr>' +
        '<tr><td>DevOps &amp; Data:</td><td>FastAPI &middot; Docker &middot; ChromaDB &middot; Qdrant &middot; Redis RQ &middot; MongoDB &middot; AWS</td></tr>' +
        '</table>'
      );
    } else if (root === "projects" || root === "ls") {
      appendTerminalOutput(
        '<span class="term-cyan">PRODUCTION CASE FILES:</span><br>' +
        '&bull; <a href="#case-graphrag" class="term-green" data-case="case-graphrag"><b>[CASE_005]</b> Enterprise Hybrid RAG &amp; GraphRAG Platform</a> &mdash; 15K+ QPS, -22% hallucinations<br>' +
        '&bull; <a href="#case-roadvision" class="term-green" data-case="case-roadvision"><b>[CASE_001]</b> RoadVision-AI</a> &mdash; 6 parallel YOLOv8 models for NSV road surveys<br>' +
        '&bull; <a href="#case-talk2db" class="term-green" data-case="case-talk2db"><b>[CASE_006]</b> Talk2DB: Autonomous NL-to-Query Agent</a> &mdash; Mem0 schema memory across SQL &amp; Mongo<br>' +
        '&bull; <a href="#case-speaker" class="term-green" data-case="case-speaker"><b>[CASE_003]</b> Real-Time Speaker ID</a> &mdash; 94% accuracy across 250+ speakers (ECAPA-TDNN)<br>' +
        '&bull; <a href="#case-aml" class="term-green" data-case="case-aml"><b>[CASE_002]</b> AML Risk Intelligence</a> &mdash; 30K+ entities screened across 200+ sanctions datasets<br>' +
        '&bull; <a href="#case-document" class="term-green" data-case="case-document"><b>[CASE_004]</b> Document Intelligence</a> &mdash; 95%+ field accuracy with YOLOv11 &amp; PDF417 barcodes'
      );
      $$(".terminal-screen [data-case]").forEach(function (btn) {
        btn.addEventListener("click", function (e) {
          e.preventDefault();
          openCaseDialog(btn.getAttribute("data-case"));
        });
      });
    } else if (root === "run" && parts[1] === "rag-eval") {
      appendTerminalOutput('<span class="term-amber">Executing Ragas evaluation suite against 400-query golden test set...</span>');
      var progressSteps = [
        "[==>------------------]  15% | Fetching ground-truth contexts from Neo4j & ChromaDB...",
        "[=======>--------------]  42% | Calculating Faithfulness & Context Recall vectors...",
        "[===============>------]  78% | Measuring Answer Relevance & Latency percentiles...",
        "[====================] 100% | RAGAS EVALUATION COMPLETED SUCCESSFULLY."
      ];
      var stepIdx = 0;
      var interval = window.setInterval(function () {
        if (stepIdx < progressSteps.length) {
          appendTerminalOutput('<span class="term-muted">' + progressSteps[stepIdx] + '</span>');
          SoundFX.playKeyClick();
          stepIdx++;
        } else {
          window.clearInterval(interval);
          appendTerminalOutput(
            '<table class="term-table">' +
            '<tr><td>Faithfulness:</td><td><span class="term-green">0.942</span> (High context groundedness)</td></tr>' +
            '<tr><td>Answer Relevance:</td><td><span class="term-green">0.921</span> (Direct query alignment)</td></tr>' +
            '<tr><td>Context Recall:</td><td><span class="term-green">0.894</span> (Multi-hop graph coverage)</td></tr>' +
            '<tr><td>Hallucination Rate:</td><td><span class="term-green">-22.4%</span> vs vanilla baseline</td></tr>' +
            '<tr><td>P95 Latency:</td><td><span class="term-green">112ms</span> (Redis RQ cache active)</td></tr>' +
            '</table>'
          );
          SoundFX.playCommandBlip();
        }
      }, 350);
    } else if (root === "cat" && parts[1] === "resume") {
      appendTerminalOutput(
        '<span class="term-cyan">ABHISHEK KUMAR &mdash; ATS 100/100 AUDITED DOSSIER</span><br>' +
        '&bull; Native Vector PDF &middot; 7.45 KB &middot; 2 Full Pages &middot; 798 Words<br>' +
        '&bull; Verified on ATS engines: Contact (10/10), Keywords (15/15), Verbs (10/10), Metrics (10/10)<br>' +
        '<span class="term-green">&rarr; <a href="images/Abhishek_Kumar_CV.pdf" target="_blank" download class="term-green" style="text-decoration: underline;">Download Abhishek_Kumar_CV.pdf</a></span>'
      );
    } else if (root === "audio") {
      toggleFx("audio");
    } else if (root === "contact") {
      appendTerminalOutput(
        '<table class="term-table">' +
        '<tr><td>Email:</td><td><a href="mailto:abhishekkumarnwd71@gmail.com" class="term-green">abhishekkumarnwd71@gmail.com</a></td></tr>' +
        '<tr><td>Phone:</td><td><a href="tel:+919431853882" class="term-green">+91 94318 53882</a></td></tr>' +
        '<tr><td>Location:</td><td>Noida, Uttar Pradesh, India</td></tr>' +
        '<tr><td>GitHub:</td><td><a href="https://github.com/abhish12345" target="_blank" class="term-cyan">github.com/abhish12345</a></td></tr>' +
        '<tr><td>LinkedIn:</td><td><a href="https://linkedin.com/in/abhishek-kumar-a26b3522a" target="_blank" class="term-cyan">linkedin.com/in/abhishek-kumar-a26b3522a</a></td></tr>' +
        '</table>'
      );
    } else if (root === "clear") {
      if (terminalScreen) {
        terminalScreen.innerHTML = '<div class="terminal-line banner-line"><span class="term-green">ABHISHEK KUMAR [AI/ML WORKSTATION v2.6.0]</span> &mdash; Terminal buffer cleared. Type <b>help</b> for command list.</div>';
      }
    } else {
      appendTerminalOutput('<span class="term-pink">command not found: ' + escapeHtml(cmd) + '. Type "help" for a list of available commands.</span>');
    }
  };

  if (terminalForm && terminalInput) {
    terminalForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var val = terminalInput.value;
      if (val.trim()) {
        executeReplCommand(val);
        terminalInput.value = "";
      }
    });

    terminalInput.addEventListener("keydown", function (e) {
      SoundFX.playKeyClick();
      if (e.key === "ArrowUp") {
        if (historyIndex > 0) {
          historyIndex--;
          terminalInput.value = commandHistory[historyIndex];
        }
      } else if (e.key === "ArrowDown") {
        if (historyIndex < commandHistory.length - 1) {
          historyIndex++;
          terminalInput.value = commandHistory[historyIndex];
        } else {
          historyIndex = commandHistory.length;
          terminalInput.value = "";
        }
      }
    });
  }

  cliPills.forEach(function (pill) {
    pill.addEventListener("click", function () {
      var cmd = pill.getAttribute("data-cli-cmd");
      if (cmd) {
        if (terminalInput) {
          terminalInput.value = cmd;
        }
        executeReplCommand(cmd);
      }
    });
  });

  /* -----------------------------------------------------------------------
     Case-file dialogs
     ----------------------------------------------------------------------- */

  var caseDialogs = $$("dialog.case-dialog");
  var caseButtons = $$("[data-case]");

  var syncDialogState = function () {
    var anyOpen = Boolean(document.querySelector("dialog[open]"));
    document.body.classList.toggle("dialog-open", anyOpen);
  };

  var openCaseDialog = function (id) {
    var dialog = document.getElementById(id);

    if (!dialog) {
      return;
    }

    if (typeof dialog.showModal === "function") {
      dialog.showModal();
      SoundFX.playModalOpen();
    } else {
      dialog.setAttribute("open", "");
    }

    syncDialogState();
  };

  var closeCaseDialog = function (dialog) {
    if (!dialog) {
      return;
    }

    if (typeof dialog.close === "function" && dialog.open) {
      dialog.close();
    } else {
      dialog.removeAttribute("open");
    }

    syncDialogState();
  };

  caseButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      openCaseDialog(button.getAttribute("data-case"));
    });
  });

  $$("[data-close-dialog]").forEach(function (button) {
    button.addEventListener("click", function () {
      closeCaseDialog(button.closest("dialog"));
    });
  });

  caseDialogs.forEach(function (dialog) {
    dialog.addEventListener("close", syncDialogState);

    dialog.addEventListener("click", function (event) {
      if (event.target === dialog) {
        closeCaseDialog(dialog);
      }
    });
  });

  /* -----------------------------------------------------------------------
     Command palette
     ----------------------------------------------------------------------- */

  var palette = document.getElementById("command-palette");
  var paletteInput = document.getElementById("palette-search");
  var paletteItems = $$(".palette-item", palette || document);
  var paletteEmpty = document.getElementById("palette-empty");
  var paletteCount = document.getElementById("palette-count");
  var paletteOpeners = $$("[data-open-palette]");
  var paletteTrigger = null;

  var filterPalette = function (query) {
    var normalized = String(query || "").trim().toLowerCase();
    var visible = 0;

    paletteItems.forEach(function (item) {
      var haystack = (
        (item.getAttribute("data-search") || "") +
        " " +
        item.textContent
      ).toLowerCase();
      var show = !normalized || haystack.indexOf(normalized) !== -1;
      item.hidden = !show;

      if (show) {
        visible += 1;
      }
    });

    if (paletteEmpty) {
      paletteEmpty.hidden = visible !== 0;
    }

    if (paletteCount) {
      paletteCount.textContent = visible + " command" + (visible === 1 ? "" : "s");
    }
  };

  var openPalette = function (trigger) {
    if (!palette) {
      return;
    }

    paletteTrigger = trigger || null;

    if (typeof palette.showModal === "function") {
      palette.showModal();
    } else {
      palette.setAttribute("open", "");
    }

    syncDialogState();
    if (paletteInput) {
      paletteInput.value = "";
    }
    filterPalette("");

    window.setTimeout(function () {
      if (paletteInput) {
        paletteInput.focus();
      }
    }, 20);
  };

  var closePalette = function () {
    if (!palette) {
      return;
    }

    if (typeof palette.close === "function" && palette.open) {
      palette.close();
    } else {
      palette.removeAttribute("open");
    }

    syncDialogState();

    if (paletteTrigger) {
      paletteTrigger.focus();
    }
  };

  paletteOpeners.forEach(function (button) {
    button.addEventListener("click", function () {
      openPalette(button);
    });
  });

  if (paletteInput) {
    paletteInput.addEventListener("input", function () {
      filterPalette(paletteInput.value);
    });
  }

  if (palette) {
    palette.addEventListener("close", syncDialogState);

    palette.addEventListener("click", function (event) {
      if (event.target === palette) {
        closePalette();
      }
    });

    palette.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        event.preventDefault();
        closePalette();
        return;
      }

      if (event.key !== "ArrowDown" && event.key !== "ArrowUp" && event.key !== "Home" && event.key !== "End") {
        return;
      }

      var visibleItems = paletteItems.filter(function (item) {
        return !item.hidden;
      });

      if (!visibleItems.length) {
        return;
      }

      event.preventDefault();
      var active = document.activeElement;
      var currentIndex = visibleItems.indexOf(active);
      var nextIndex;

      if (event.key === "Home") {
        nextIndex = 0;
      } else if (event.key === "End") {
        nextIndex = visibleItems.length - 1;
      } else if (active === paletteInput) {
        nextIndex = event.key === "ArrowDown" ? 0 : visibleItems.length - 1;
      } else if (event.key === "ArrowDown") {
        nextIndex = (currentIndex + 1 + visibleItems.length) % visibleItems.length;
      } else {
        nextIndex = (currentIndex - 1 + visibleItems.length) % visibleItems.length;
      }

      visibleItems[nextIndex].focus();
    });
  }

  document.addEventListener("keydown", function (event) {
    var isPaletteShortcut =
      (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k";

    if (!isPaletteShortcut) {
      return;
    }

    event.preventDefault();

    if (palette && palette.open) {
      closePalette();
    } else {
      openPalette(null);
    }
  });

  var goTo = function (selector) {
    var target = document.querySelector(selector);

    if (!target) {
      return;
    }

    var heading = target.querySelector("h1, h2");
    if (heading) {
      heading.setAttribute("tabindex", "-1");
    }

    target.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start"
    });

    if (heading) {
      window.setTimeout(
        function () {
          heading.focus({ preventScroll: true });
        },
        prefersReducedMotion ? 0 : 550
      );
    }
  };

  var openExternal = function (url) {
    var link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  var downloadCv = function () {
    var link = document.createElement("a");
    link.href = "images/Abhishek_Kumar_CV.pdf";
    link.download = "Abhishek_Kumar_CV.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("dossier download started");
  };

  var handlePaletteAction = function (item) {
    var action = item.getAttribute("data-action");
    var target = item.getAttribute("data-target");
    closePalette();

    if (action === "nav") {
      window.setTimeout(function () {
        goTo(target);
      }, 0);
    } else if (action === "case") {
      window.setTimeout(function () {
        openCaseDialog(String(target).replace("#", ""));
      }, 0);
    } else if (action === "cv") {
      downloadCv();
    } else if (action === "copy-email") {
      copyEmail();
    } else if (action === "email") {
      window.location.href = "mailto:abhishekkumarnwd71@gmail.com";
    } else if (action === "github") {
      openExternal("https://github.com/abhish12345");
    } else if (action === "linkedin") {
      openExternal("https://www.linkedin.com/in/abhishek-kumar-a26b3522a/");
    } else if (action === "matrix" || action === "crt" || action === "audio") {
      toggleFx(action);
    } else if (action === "recruiter") {
      window.location.href = "index.html";
    } else if (action === "top") {
      window.setTimeout(function () {
        goTo("#top");
      }, 0);
    }
  };

  paletteItems.forEach(function (item) {
    item.addEventListener("click", function () {
      handlePaletteAction(item);
    });
  });

  /* -----------------------------------------------------------------------
     Matrix rain and CRT toggles
     ----------------------------------------------------------------------- */

  var matrixCanvas = document.getElementById("matrix-canvas");
  var matrixRain = null;

  var updateFxButtons = function (name, on) {
    $$('[data-toggle="' + name + '"]').forEach(function (button) {
      button.setAttribute("aria-pressed", String(on));

      Array.prototype.forEach.call(button.childNodes, function (node) {
        if (node.nodeType === 3 && node.textContent.indexOf(name) !== -1) {
          node.textContent = name + ": " + (on ? "on" : "off");
        }
      });
    });
  };

  var toggleFx = function (name) {
    if (name === "audio") {
      var audioOn = SoundFX.toggle();
      var audioStatus = document.getElementById("audio-status");
      if (audioStatus) {
        audioStatus.textContent = "AUDIO: " + (audioOn ? "ON" : "OFF");
      }
      $$('[data-toggle="audio"]').forEach(function (btn) {
        btn.classList.toggle("is-active", audioOn);
        btn.setAttribute("aria-pressed", String(audioOn));
      });
      if (audioOn) {
        SoundFX.playCommandBlip();
      }
      showToast("mechanical audio FX " + (audioOn ? "enabled" : "disabled"));
      return;
    }

    if (name === "matrix") {
      var matrixOn = !document.documentElement.classList.contains("matrix-on");

      if (matrixOn && prefersReducedMotion) {
        showToast("matrix rain disabled: reduced motion is on");
        return;
      }

      document.documentElement.classList.toggle("matrix-on", matrixOn);

      if (matrixOn && matrixRain) {
        matrixRain.start();
      } else if (matrixRain) {
        matrixRain.stop();
      }

      updateFxButtons("matrix", matrixOn);
      showToast("matrix rain " + (matrixOn ? "enabled" : "disabled"));
      return;
    }

    if (name === "crt") {
      var crtOn = !document.documentElement.classList.contains("crt-off");
      document.documentElement.classList.toggle("crt-off", crtOn);
      updateFxButtons("crt", !crtOn);
      showToast("CRT overlay " + (crtOn ? "disabled" : "enabled"));
    }
  };

  $$("[data-toggle]").forEach(function (button) {
    button.addEventListener("click", function () {
      toggleFx(button.getAttribute("data-toggle"));
    });
  });

  /* -----------------------------------------------------------------------
     Matrix rain
     ----------------------------------------------------------------------- */

  var MatrixRain = function (canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.glyphs =
      "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF<>/\\[]{}=+*#$%&";
    this.fontSize = 16;
    this.columns = 0;
    this.drops = [];
    this.frame = null;
    this.lastDraw = 0;
    this.running = false;
    this.resize = this.resize.bind(this);
    this.tick = this.tick.bind(this);
    window.addEventListener("resize", this.resize);
    this.resize();
  };

  MatrixRain.prototype.resize = function () {
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    var width = window.innerWidth;
    var height = window.innerHeight;

    this.canvas.width = Math.floor(width * dpr);
    this.canvas.height = Math.floor(height * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.width = width;
    this.height = height;
    this.columns = Math.ceil(width / this.fontSize);

    var drops = [];
    for (var i = 0; i < this.columns; i += 1) {
      drops.push(Math.random() * -40);
    }
    this.drops = drops;
  };

  MatrixRain.prototype.clear = function () {
    this.ctx.clearRect(0, 0, this.width, this.height);
  };

  MatrixRain.prototype.draw = function () {
    var ctx = this.ctx;

    ctx.fillStyle = "rgba(3, 8, 6, 0.16)";
    ctx.fillRect(0, 0, this.width, this.height);
    ctx.font = this.fontSize + "px 'JetBrains Mono', monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    for (var i = 0; i < this.columns; i += 1) {
      var x = i * this.fontSize + this.fontSize / 2;
      var y = this.drops[i] * this.fontSize;
      var glyph = this.glyphs.charAt(Math.floor(Math.random() * this.glyphs.length));

      ctx.fillStyle =
        Math.random() > 0.975 ? "#d8fff0" : "rgba(0, 255, 156, 0.72)";
      ctx.fillText(glyph, x, y);

      if (y > this.height && Math.random() > 0.975) {
        this.drops[i] = 0;
      } else {
        this.drops[i] += 1;
      }
    }
  };

  MatrixRain.prototype.tick = function (time) {
    if (!this.running) {
      return;
    }

    this.frame = window.requestAnimationFrame(this.tick);

    if (time - this.lastDraw < 46) {
      return;
    }

    this.lastDraw = time;
    this.draw();
  };

  MatrixRain.prototype.start = function () {
    if (this.running) {
      return;
    }

    this.running = true;
    this.lastDraw = 0;
    this.clear();
    this.frame = window.requestAnimationFrame(this.tick);
  };

  MatrixRain.prototype.stop = function () {
    this.running = false;
    window.cancelAnimationFrame(this.frame);
    this.frame = null;
    this.clear();
  };

  /* -----------------------------------------------------------------------
     Hero neural scene — canvas 3D
     ----------------------------------------------------------------------- */

  var NeuralScene = function (canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.hero = canvas.parentElement;
    this.width = 0;
    this.height = 0;
    this.dpr = 1;
    this.nodes = [];
    this.edges = [];
    this.packets = [];
    this.rotation = { x: -0.14, y: 0.35 };
    this.target = { x: -0.14, y: 0.35 };
    this.running = false;
    this.frame = null;
    this.greenSprite = this.makeSprite("0, 255, 156");
    this.cyanSprite = this.makeSprite("53, 231, 255");
    this.build();
    this.resize = this.resize.bind(this);
    this.tick = this.tick.bind(this);
    this.handlePointer = this.handlePointer.bind(this);
    this.handleLeave = this.handleLeave.bind(this);
    window.addEventListener("resize", this.resize);
    this.resize();
  };

  NeuralScene.prototype.makeSprite = function (rgb) {
    var size = 48;
    var sprite = document.createElement("canvas");
    sprite.width = size;
    sprite.height = size;
    var ctx = sprite.getContext("2d");
    var gradient = ctx.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size / 2
    );

    gradient.addColorStop(0, "rgba(" + rgb + ", 0.95)");
    gradient.addColorStop(0.28, "rgba(" + rgb + ", 0.5)");
    gradient.addColorStop(1, "rgba(" + rgb + ", 0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    return sprite;
  };

  NeuralScene.prototype.build = function () {
    var count =
      window.innerWidth < 560 ? 58 : window.innerWidth < 980 ? 78 : 104;
    var golden = Math.PI * (1 + Math.sqrt(5));
    var nodes = [];

    for (var i = 0; i < count; i += 1) {
      var phi = Math.acos(1 - (2 * (i + 0.5)) / count);
      var theta = golden * i;
      var radius = 0.74 + Math.random() * 0.32;

      nodes.push({
        x: Math.sin(phi) * Math.cos(theta) * radius,
        y: Math.cos(phi) * radius,
        z: Math.sin(phi) * Math.sin(theta) * radius,
        size: 0.8 + Math.random() * 1.5,
        cyan: Math.random() < 0.22,
        phase: Math.random() * Math.PI * 2
      });
    }

    var edges = [];
    var packets = [];
    var maxDistance = 0.58;

    for (var a = 0; a < nodes.length; a += 1) {
      for (var b = a + 1; b < nodes.length; b += 1) {
        var dx = nodes[a].x - nodes[b].x;
        var dy = nodes[a].y - nodes[b].y;
        var dz = nodes[a].z - nodes[b].z;

        if (dx * dx + dy * dy + dz * dz < maxDistance * maxDistance) {
          edges.push([a, b]);
        }
      }
    }

    for (var p = 0; p < Math.min(9, edges.length); p += 1) {
      packets.push({
        edge: edges[Math.floor(Math.random() * edges.length)],
        offset: Math.random()
      });
    }

    this.nodes = nodes;
    this.edges = edges;
    this.packets = packets;
  };

  NeuralScene.prototype.resize = function () {
    var rect = this.canvas.getBoundingClientRect();
    var width = Math.max(1, Math.round(rect.width));
    var height = Math.max(1, Math.round(rect.height));

    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = width;
    this.height = height;
    this.canvas.width = Math.round(width * this.dpr);
    this.canvas.height = Math.round(height * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    if (prefersReducedMotion) {
      this.draw(0);
    }
  };

  NeuralScene.prototype.handlePointer = function (event) {
    if (!this.hero) {
      return;
    }

    var rect = this.hero.getBoundingClientRect();
    var nx = (event.clientX - rect.left) / rect.width - 0.5;
    var ny = (event.clientY - rect.top) / rect.height - 0.5;

    this.target.y = 0.35 + nx * 0.5;
    this.target.x = -0.14 + ny * 0.28;
  };

  NeuralScene.prototype.handleLeave = function () {
    this.target.y = 0.35;
    this.target.x = -0.14;
  };

  NeuralScene.prototype.draw = function (time) {
    var ctx = this.ctx;
    var width = this.width;
    var height = this.height;

    if (!width || !height) {
      return;
    }

    ctx.clearRect(0, 0, width, height);

    if (!prefersReducedMotion) {
      this.rotation.x += (this.target.x - this.rotation.x) * 0.045;
      this.rotation.y += (this.target.y - this.rotation.y) * 0.045;
    }

    var rx =
      this.rotation.x +
      (prefersReducedMotion ? 0 : Math.sin(time * 0.00016) * 0.05);
    var ry =
      this.rotation.y + (prefersReducedMotion ? 0 : time * 0.00006);
    var cosX = Math.cos(rx);
    var sinX = Math.sin(rx);
    var cosY = Math.cos(ry);
    var sinY = Math.sin(ry);
    var cx = width < 980 ? width * 0.5 : width * 0.63;
    var cy = height * 0.5;
    var radius = Math.min(width, height) * 0.36;
    var camera = 3.2;
    var projected = [];
    var i;
    var node;
    var x1;
    var y1;
    var z1;
    var perspective;

    for (i = 0; i < this.nodes.length; i += 1) {
      node = this.nodes[i];
      x1 = node.x * cosY + node.z * sinY;
      z1 = -node.x * sinY + node.z * cosY;
      y1 = node.y * cosX - z1 * sinX;
      z1 = node.y * sinX + z1 * cosX;
      perspective = camera / (camera + z1);

      projected.push({
        x: cx + x1 * radius * perspective,
        y: cy + y1 * radius * perspective,
        scale: perspective,
        alpha: Math.max(0.12, Math.min(1, (perspective - 0.72) * 1.7))
      });
    }

    ctx.lineWidth = 1;

    for (i = 0; i < this.edges.length; i += 1) {
      var edge = this.edges[i];
      var a = projected[edge[0]];
      var b = projected[edge[1]];
      var edgeAlpha = Math.min(a.alpha, b.alpha);

      if (edgeAlpha < 0.16) {
        continue;
      }

      ctx.strokeStyle =
        "rgba(0, 255, 156, " + (edgeAlpha * 0.16).toFixed(3) + ")";
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }

    if (!prefersReducedMotion) {
      for (i = 0; i < this.packets.length; i += 1) {
        var packet = this.packets[i];
        var pa = projected[packet.edge[0]];
        var pb = projected[packet.edge[1]];
        var progress = (time * 0.00008 + packet.offset) % 1;
        var px = pa.x + (pb.x - pa.x) * progress;
        var py = pa.y + (pb.y - pa.y) * progress;
        var packetAlpha = Math.min(pa.alpha, pb.alpha);

        ctx.fillStyle =
          "rgba(216, 255, 240, " + packetAlpha.toFixed(3) + ")";
        ctx.beginPath();
        ctx.arc(px, py, 1.6 * ((pa.scale + pb.scale) / 2), 0, Math.PI * 2);
        ctx.fill();
      }
    }

    for (i = 0; i < projected.length; i += 1) {
      var point = projected[i];
      node = this.nodes[i];
      var sprite = node.cyan ? this.cyanSprite : this.greenSprite;
      var size =
        (5 + node.size * 3) *
        point.scale *
        (prefersReducedMotion
          ? 1
          : 1 + Math.sin(time * 0.001 + node.phase) * 0.12);

      ctx.globalAlpha = point.alpha;
      ctx.drawImage(sprite, point.x - size, point.y - size, size * 2, size * 2);
      ctx.globalAlpha = 1;

      ctx.fillStyle = node.cyan
        ? "rgba(139, 243, 255, 0.9)"
        : "rgba(216, 255, 240, 0.92)";
      ctx.beginPath();
      ctx.arc(
        point.x,
        point.y,
        Math.max(0.8, node.size * 0.8 * point.scale),
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  };

  NeuralScene.prototype.tick = function (time) {
    if (!this.running) {
      return;
    }

    this.frame = window.requestAnimationFrame(this.tick);
    this.draw(time);
  };

  NeuralScene.prototype.start = function () {
    if (this.running || prefersReducedMotion) {
      return;
    }

    this.running = true;
    this.frame = window.requestAnimationFrame(this.tick);
  };

  NeuralScene.prototype.stop = function () {
    this.running = false;
    window.cancelAnimationFrame(this.frame);
    this.frame = null;
  };

  NeuralScene.prototype.init = function () {
    var self = this;

    if (finePointer && !prefersReducedMotion && this.hero) {
      this.hero.addEventListener("pointermove", this.handlePointer, {
        passive: true
      });
      this.hero.addEventListener("pointerleave", this.handleLeave);
    }

    if (prefersReducedMotion) {
      this.draw(0);
      return;
    }

    if ("IntersectionObserver" in window && this.hero) {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              self.start();
            } else {
              self.stop();
            }
          });
        },
        { threshold: 0 }
      );

      observer.observe(this.hero);
    } else {
      this.start();
    }

    if ("ResizeObserver" in window && this.hero) {
      var resizeObserver = new ResizeObserver(function () {
        self.resize();
      });
      resizeObserver.observe(this.hero);
    }
  };

  /* -----------------------------------------------------------------------
     Pointer tilt for portrait and project cards
     ----------------------------------------------------------------------- */

  var tiltTargets = $$("[data-tilt], .project");

  if (finePointer && !prefersReducedMotion && tiltTargets.length) {
    tiltTargets.forEach(function (element) {
      var tiltFrame = null;
      var nextRx = null;
      var nextRy = null;
      var maxTilt = element.classList.contains("project") ? 3.2 : 6;

      var applyTilt = function () {
        tiltFrame = null;

        if (nextRx === null || nextRy === null) {
          return;
        }

        element.style.setProperty("--rx", nextRx);
        element.style.setProperty("--ry", nextRy);
      };

      element.addEventListener(
        "pointermove",
        function (event) {
          if (event.pointerType && event.pointerType !== "mouse") {
            return;
          }

          var rect = element.getBoundingClientRect();
          var x = (event.clientX - rect.left) / rect.width - 0.5;
          var y = (event.clientY - rect.top) / rect.height - 0.5;

          nextRx = (-y * maxTilt).toFixed(2) + "deg";
          nextRy = (x * maxTilt * 1.15).toFixed(2) + "deg";

          if (!tiltFrame) {
            tiltFrame = window.requestAnimationFrame(applyTilt);
          }
        },
        { passive: true }
      );

      element.addEventListener("pointerleave", function () {
        window.cancelAnimationFrame(tiltFrame);
        tiltFrame = null;
        nextRx = null;
        nextRy = null;
        element.style.removeProperty("--rx");
        element.style.removeProperty("--ry");
      });
    });
  }

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
        showStatus(
          "> transmission complete. message received — I'll respond within 24 hours.",
          "success"
        );
        form.reset();
        return;
      }

      showStatus("> transmitting message...", null);

      if (submitButton) {
        submitButton.disabled = true;
      }
      form.setAttribute("aria-busy", "true");

      window
        .fetch(CONTACT_ENDPOINT, {
          method: "POST",
          body: new FormData(form)
        })
        .then(function (response) {
          if (!response.ok) {
            throw new Error("Request failed with status " + response.status);
          }

          form.reset();
          showStatus(
            "> transmission complete. message received — I'll respond within 24 hours.",
            "success"
          );

          statusResetTimer = window.setTimeout(function () {
            showStatus("", null);
          }, 8000);
        })
        .catch(function (error) {
          console.error("Contact form error:", error);
          showStatus(
            "> transmission failed. email abhishekkumarnwd71@gmail.com directly.",
            "error"
          );
        })
        .finally(function () {
          if (submitButton) {
            submitButton.disabled = false;
          }
          form.removeAttribute("aria-busy");
        });
    });
  }

  /* -----------------------------------------------------------------------
     Start canvas effects
     ----------------------------------------------------------------------- */

  if (matrixCanvas) {
    matrixRain = new MatrixRain(matrixCanvas);
  }

  var sceneCanvas = document.getElementById("scene-canvas");

  if (sceneCanvas && sceneCanvas.getContext) {
    var neuralScene = new NeuralScene(sceneCanvas);
    neuralScene.init();
  }
})();
