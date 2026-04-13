/* =========================================================
   AgentHazard — main.js
   Nav, animations, BibTeX copy, table computation
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

      navigator.clipboard.writeText(source.textContent.trim()).then(function () {
        btn.textContent = 'Copied!';
        btn.classList.add('copied');
        setTimeout(function () {
          btn.textContent = 'Copy';
          btn.classList.remove('copied');
        }, 2000);
      }).catch(function () {
        // Fallback for older browsers
        var ta = document.createElement('textarea');
        ta.value = source.textContent.trim();
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
     5. Table 1 (LLM comparison): compute Score column
        Score = avg of (Acc_safe - Acc_attack + MR) per model
     ------------------------------------------------------- */
  function formatNum(value) {
    if (typeof value !== 'number') return value;
    return value.toFixed(1);
  }

  var llmTable = document.getElementById('llm-table');
  if (llmTable) {
    var modelData = new Map();
    var rows = Array.from(llmTable.querySelectorAll('tbody tr'));

    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      var modelCell = row.querySelector('.cell-group-header');

      if (!modelCell) continue;

      var modelName = modelCell.textContent.trim().replace(/\s+/g, ' ');
      if (!modelData.has(modelName)) {
        modelData.set(modelName, { scores: [], totalScore: 0, count: 0 });
      }

      var accSafe   = parseFloat(row.querySelector('td:nth-child(3)').textContent);
      var accAttack = parseFloat(row.querySelector('td:nth-child(4)').textContent);
      var mr        = parseFloat(row.querySelector('td:nth-child(5)').textContent);

      if (!isNaN(accSafe) && !isNaN(accAttack) && !isNaN(mr)) {
        var score = accSafe - accAttack + mr;
        var data = modelData.get(modelName);
        data.scores.push(score);
        data.totalScore += score;
        data.count += 1;
      }

      // Process continuation rows covered by rowspan
      if (modelCell.hasAttribute('rowspan')) {
        var rowspan = parseInt(modelCell.getAttribute('rowspan'), 10);
        for (var j = 1; j < rowspan; j++) {
          var nextRow = rows[i + j];
          if (!nextRow) continue;
          var cells = nextRow.querySelectorAll('td');
          var nAccSafe   = parseFloat(cells[0].textContent);
          var nAccAttack = parseFloat(cells[1].textContent);
          var nMr        = parseFloat(cells[2].textContent);

          if (!isNaN(nAccSafe) && !isNaN(nAccAttack) && !isNaN(nMr)) {
            var nScore = nAccSafe - nAccAttack + nMr;
            var nd = modelData.get(modelName);
            nd.scores.push(nScore);
            nd.totalScore += nScore;
            nd.count += 1;
          }
        }
        i += rowspan - 1;
      }
    }

    // Write average scores back into the Score column cells
    modelData.forEach(function (data, modelName) {
      if (data.count > 0) {
        var avg = data.totalScore / data.count;
        llmTable.querySelectorAll('td.cell-group-header').forEach(function (cell) {
          if (cell.textContent.trim().replace(/\s+/g, ' ') === modelName) {
            var scoreCell = cell.parentElement.querySelector('td:nth-child(6)');
            if (scoreCell) {
              scoreCell.textContent = formatNum(avg);
              scoreCell.title = 'Avg Score: ' + formatNum(avg);
            }
          }
        });
      }
    });
  }

  /* -------------------------------------------------------
     6. Table 2 (agent results): highlight most-negative ΔSR
        per row — marks the agent most hurt by each attack type
     ------------------------------------------------------- */
  var agentTable = document.getElementById('agent-table');
  if (agentTable) {
    agentTable.querySelectorAll('tbody tr').forEach(function (row) {
      var metricCells = Array.from(row.querySelectorAll('td')).filter(function (td) {
        return td.textContent.trim() === 'ΔSR';
      });

      if (metricCells.length > 0) {
        var dataCells = Array.from(row.querySelectorAll('td')).slice(3);
        var negatives = dataCells
          .map(function (cell) { return { cell: cell, value: parseFloat(cell.textContent) }; })
          .filter(function (item) { return !isNaN(item.value) && item.value < 0; });

        if (negatives.length > 0) {
          var minItem = negatives.reduce(function (min, cur) {
            return cur.value < min.value ? cur : min;
          });
          minItem.cell.classList.add('cell-danger');
          minItem.cell.title = 'Most negative ΔSR: ' + minItem.value;
        }
      }
    });
  }

});
