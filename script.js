/**
 * Siloni V - Student Portfolio & Academic Dashboard Script
 * Handles:
 * 1. Chart.js dynamic initialization & theme-aware re-renders
 * 2. Dark / Light Theme switching with localStorage persistence
 * 3. Semester Accordion Expand / Collapse & Global toggles
 * 4. Real-time Subject Search & Filtering across all semesters
 * 5. Mobile Navigation Drawer & Smooth Scroll Spy
 * 6. Print functionality
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNavigation();
  initCharts();
  initAccordions();
  initSearch();
  initPrint();
});

/* ==========================================================================
   1. Theme Management (Dark / Light)
   ========================================================================== */
let percentageChartInstance = null;
let cgpaChartInstance = null;

function initTheme() {
  const themeToggleBtn = document.getElementById('theme-toggle');
  const htmlRoot = document.documentElement;
  
  // Check persisted preference or default to dark
  const savedTheme = localStorage.getItem('siloni_theme') || 'dark';
  htmlRoot.setAttribute('data-theme', savedTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = htmlRoot.getAttribute('data-theme');
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      htmlRoot.setAttribute('data-theme', newTheme);
      localStorage.setItem('siloni_theme', newTheme);

      // Re-render charts with updated theme color schemes
      if (percentageChartInstance && cgpaChartInstance) {
        updateChartsTheme(newTheme);
      }
    });
  }
}

/* ==========================================================================
   2. Dedicated Tab View Switching & Mobile Drawer
   ========================================================================== */
function switchTab(tabId) {
  if (!['profile', 'academics', 'transport'].includes(tabId)) {
    tabId = 'profile';
  }

  // 1. Toggle tab-view visibility
  const allTabs = document.querySelectorAll('.tab-view');
  allTabs.forEach(tab => {
    tab.classList.remove('active');
  });

  const activeSection = document.getElementById(tabId);
  if (activeSection) {
    activeSection.classList.add('active');
  }

  // 2. Update navigation active states (desktop + mobile)
  const allNavLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
  allNavLinks.forEach(link => {
    if (link.getAttribute('data-tab') === tabId) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // 3. Update URL hash without page jumps
  history.replaceState(null, null, '#' + tabId);

  // 4. If switching to academics, trigger Chart.js resize
  if (tabId === 'academics') {
    setTimeout(() => {
      if (percentageChartInstance) percentageChartInstance.resize();
      if (cgpaChartInstance) cgpaChartInstance.resize();
    }, 60);
  }

  // 5. Scroll smoothly to top of view
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

window.switchTab = switchTab;

function initNavigation() {
  const mobileToggle = document.getElementById('mobile-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');

  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener('click', () => {
      mobileDrawer.classList.toggle('open');
    });
  }

  // Handle URL hash on initial page load
  const initialHash = window.location.hash.replace('#', '');
  if (['profile', 'academics', 'transport'].includes(initialHash)) {
    switchTab(initialHash);
  } else {
    switchTab('profile');
  }

  // Listen to browser forward/backward navigation
  window.addEventListener('popstate', () => {
    const hash = window.location.hash.replace('#', '');
    if (['profile', 'academics', 'transport'].includes(hash)) {
      switchTab(hash);
    } else {
      switchTab('profile');
    }
  });
}

// Globally accessible for inline onclick in mobile drawer links
window.closeMobileMenu = function() {
  const mobileDrawer = document.getElementById('mobile-drawer');
  if (mobileDrawer) {
    mobileDrawer.classList.remove('open');
  }
};

/* ==========================================================================
   3. Chart.js Visualizations (Percentage & CGPA)
   ========================================================================== */
function initCharts() {
  const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
  
  const ctxPercent = document.getElementById('percentageChart');
  const ctxCgpa = document.getElementById('cgpaChart');

  if (!ctxPercent || !ctxCgpa) return;

  const fontOptions = {
    family: "'Plus Jakarta Sans', sans-serif",
    size: 12,
    weight: '600'
  };

  // 1. Percentage Progress Chart (Area/Line)
  const percentCtx2d = ctxPercent.getContext('2d');
  const percentGradient = percentCtx2d.createLinearGradient(0, 0, 0, 260);
  percentGradient.addColorStop(0, 'rgba(99, 102, 241, 0.45)');
  percentGradient.addColorStop(1, 'rgba(99, 102, 241, 0.01)');

  percentageChartInstance = new Chart(ctxPercent, {
    type: 'line',
    data: {
      labels: ['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4'],
      datasets: [{
        label: 'Semester Percentage (%)',
        data: [73.86, 78.43, 76.86, 80.50],
        borderColor: '#6366f1',
        borderWidth: 3.5,
        pointBackgroundColor: '#818cf8',
        pointBorderColor: isDark ? '#111827' : '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 9,
        pointHoverBackgroundColor: '#4f46e5',
        pointHoverBorderColor: '#ffffff',
        tension: 0.38,
        fill: true,
        backgroundColor: percentGradient
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          titleColor: isDark ? '#f8fafc' : '#0f172a',
          bodyColor: isDark ? '#94a3b8' : '#334155',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          borderWidth: 1,
          padding: 12,
          boxPadding: 6,
          titleFont: { family: "'Outfit', sans-serif", size: 14, weight: '700' },
          bodyFont: fontOptions,
          callbacks: {
            label: function(context) {
              return ` Score: ${context.parsed.y}%`;
            },
            afterLabel: function(context) {
              const diffs = ['Starting baseline', '+4.57% increase', '-1.57% dip', '+3.64% highest peak'];
              return ` Trend: ${diffs[context.dataIndex]}`;
            }
          }
        }
      },
      scales: {
        y: {
          min: 65,
          max: 88,
          ticks: {
            stepSize: 5,
            color: isDark ? '#94a3b8' : '#64748b',
            font: fontOptions,
            callback: value => `${value}%`
          },
          grid: {
            color: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.06)',
            drawBorder: false
          }
        },
        x: {
          ticks: {
            color: isDark ? '#94a3b8' : '#64748b',
            font: fontOptions
          },
          grid: {
            display: false
          }
        }
      }
    }
  });

  // 2. CGPA Progress Chart (Gradient Bar)
  const cgpaCtx2d = ctxCgpa.getContext('2d');
  const cgpaBarGradient = cgpaCtx2d.createLinearGradient(0, 0, 0, 240);
  cgpaBarGradient.addColorStop(0, '#0ea5e9');
  cgpaBarGradient.addColorStop(1, '#10b981');

  cgpaChartInstance = new Chart(ctxCgpa, {
    type: 'bar',
    data: {
      labels: ['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4'],
      datasets: [{
        label: 'Semester CGPA',
        data: [7.83, 8.32, 8.14, 8.27],
        backgroundColor: [
          'rgba(56, 189, 248, 0.85)',
          'rgba(16, 185, 129, 0.85)',
          'rgba(139, 92, 246, 0.85)',
          'rgba(99, 102, 241, 0.9)'
        ],
        borderRadius: 8,
        borderSkipped: false,
        barPercentage: 0.55
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
          titleColor: isDark ? '#f8fafc' : '#0f172a',
          bodyColor: isDark ? '#94a3b8' : '#334155',
          borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
          borderWidth: 1,
          padding: 12,
          boxPadding: 6,
          titleFont: { family: "'Outfit', sans-serif", size: 14, weight: '700' },
          bodyFont: fontOptions,
          callbacks: {
            label: function(context) {
              return ` CGPA: ${context.parsed.y} / 10.0`;
            },
            afterLabel: function(context) {
              const status = ['First Class', 'Distinction', 'Distinction', 'Distinction'];
              return ` Status: ${status[context.dataIndex]}`;
            }
          }
        }
      },
      scales: {
        y: {
          min: 6.0,
          max: 10.0,
          ticks: {
            stepSize: 1.0,
            color: isDark ? '#94a3b8' : '#64748b',
            font: fontOptions,
            callback: value => value.toFixed(1)
          },
          grid: {
            color: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.06)',
            drawBorder: false
          }
        },
        x: {
          ticks: {
            color: isDark ? '#94a3b8' : '#64748b',
            font: fontOptions
          },
          grid: {
            display: false
          }
        }
      }
    }
  });
}

function updateChartsTheme(theme) {
  const isDark = theme === 'dark';
  const textColor = isDark ? '#94a3b8' : '#64748b';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.06)';
  const tooltipBg = isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)';
  const tooltipTitle = isDark ? '#f8fafc' : '#0f172a';
  const tooltipBody = isDark ? '#94a3b8' : '#334155';

  [percentageChartInstance, cgpaChartInstance].forEach(chart => {
    if (!chart) return;
    chart.options.scales.x.ticks.color = textColor;
    chart.options.scales.y.ticks.color = textColor;
    chart.options.scales.y.grid.color = gridColor;
    chart.options.plugins.tooltip.backgroundColor = tooltipBg;
    chart.options.plugins.tooltip.titleColor = tooltipTitle;
    chart.options.plugins.tooltip.bodyColor = tooltipBody;
    chart.update();
  });
}

/* ==========================================================================
   4. Semester Accordions (Expand / Collapse)
   ========================================================================== */
function initAccordions() {
  const accordionHeaders = document.querySelectorAll('.accordion-header');
  const expandAllBtn = document.getElementById('expand-all-btn');
  const collapseAllBtn = document.getElementById('collapse-all-btn');

  accordionHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const targetId = header.getAttribute('data-target');
      const body = document.getElementById(targetId);
      const isExpanded = header.getAttribute('aria-expanded') === 'true';

      if (isExpanded) {
        header.setAttribute('aria-expanded', 'false');
        body.classList.remove('active');
      } else {
        header.setAttribute('aria-expanded', 'true');
        body.classList.add('active');
      }
    });
  });

  if (expandAllBtn) {
    expandAllBtn.addEventListener('click', () => {
      accordionHeaders.forEach(header => {
        const targetId = header.getAttribute('data-target');
        const body = document.getElementById(targetId);
        header.setAttribute('aria-expanded', 'true');
        if (body) body.classList.add('active');
      });
    });
  }

  if (collapseAllBtn) {
    collapseAllBtn.addEventListener('click', () => {
      accordionHeaders.forEach(header => {
        const targetId = header.getAttribute('data-target');
        const body = document.getElementById(targetId);
        header.setAttribute('aria-expanded', 'false');
        if (body) body.classList.remove('active');
      });
    });
  }
}

/* ==========================================================================
   5. Real-Time Subject Search & Multi-Semester Filtering
   ========================================================================== */
function initSearch() {
  const searchInput = document.getElementById('subject-search-input');
  const clearBtn = document.getElementById('clear-search-btn');
  const feedback = document.getElementById('search-feedback-text');
  const rows = document.querySelectorAll('.marks-table tbody .subject-row');

  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim().toLowerCase();

    if (query.length > 0) {
      if (clearBtn) clearBtn.style.display = 'flex';
      let matchCount = 0;

      rows.forEach(row => {
        const subjectTitle = row.querySelector('.subject-title')?.textContent.toLowerCase() || '';
        const gradeText = row.querySelector('.grade-badge')?.textContent.toLowerCase() || '';
        const isMatch = subjectTitle.includes(query) || gradeText.includes(query);

        if (isMatch) {
          row.classList.remove('search-hidden');
          row.classList.add('search-highlight');
          matchCount++;

          // Auto-expand the parent semester so the user instantly sees the found item
          const parentAccordion = row.closest('.semester-accordion-item');
          if (parentAccordion) {
            const header = parentAccordion.querySelector('.accordion-header');
            const body = parentAccordion.querySelector('.accordion-body');
            if (header && body) {
              header.setAttribute('aria-expanded', 'true');
              body.classList.add('active');
            }
          }
        } else {
          row.classList.add('search-hidden');
          row.classList.remove('search-highlight');
        }
      });

      if (feedback) {
        feedback.textContent = matchCount === 0 ? 'No matching subjects found' : `Found ${matchCount} matching subject${matchCount > 1 ? 's' : ''}`;
      }
    } else {
      resetSearch();
    }
  });

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      searchInput.value = '';
      resetSearch();
      searchInput.focus();
    });
  }

  function resetSearch() {
    if (clearBtn) clearBtn.style.display = 'none';
    if (feedback) feedback.textContent = '';
    rows.forEach(row => {
      row.classList.remove('search-hidden');
      row.classList.remove('search-highlight');
    });
  }
}

/* ==========================================================================
   6. Print Support
   ========================================================================== */
function initPrint() {
  const printBtn = document.getElementById('print-page-btn');
  if (printBtn) {
    printBtn.addEventListener('click', () => {
      // Ensure all accordions are expanded before printing
      const accordionHeaders = document.querySelectorAll('.accordion-header');
      accordionHeaders.forEach(header => {
        const targetId = header.getAttribute('data-target');
        const body = document.getElementById(targetId);
        header.setAttribute('aria-expanded', 'true');
        if (body) body.classList.add('active');
      });

      window.print();
    });
  }
}
