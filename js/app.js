// Main Application Router & Entry Controller
document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('app');
  const state = window.appState;

  function renderApp() {
    if (!root) return;

    if (state.currentView === 'kids') {
      root.className = 'min-h-screen bg-gradient-to-b from-sky-100 via-amber-50/50 to-indigo-100/60 text-slate-800 pb-16';
      root.innerHTML = `
        <!-- Sticky Header & Gamification Bar -->
        <div id="headerMount"></div>

        <!-- Main Kids Container -->
        <main class="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
          
          <!-- Hero Characters Section & Speech Bubble -->
          <div id="heroSectionMount"></div>

          <!-- Lessons Map & Interactive Tools (Alphabet, Math, Words, Canvas) -->
          <div id="lessonsMapMount"></div>

        </main>
      `;

      // Mount Child Components
      const headerMount = document.getElementById('headerMount');
      const heroMount = document.getElementById('heroSectionMount');
      const lessonsMount = document.getElementById('lessonsMapMount');

      if (headerMount && window.renderKidsHeader) {
        window.renderKidsHeader(headerMount);
      }
      if (heroMount && window.renderHeroSection) {
        window.renderHeroSection(heroMount);
      }
      if (lessonsMount && window.renderLessonsMap) {
        window.renderLessonsMap(lessonsMount);
      }

    } else if (state.currentView === 'admin') {
      root.className = 'min-h-screen bg-slate-900 text-slate-100';
      root.innerHTML = `<div id="adminMount"></div>`;
      const adminMount = document.getElementById('adminMount');
      if (adminMount && window.renderAdminPanel) {
        window.renderAdminPanel(adminMount);
      }
    }
  }

  // Subscribe to central state changes for reactive re-render
  state.subscribe(() => {
    renderApp();
  });

  // Initial render
  renderApp();

  // User gesture to initialize AudioContext
  document.addEventListener('pointerdown', () => {
    if (window.soundEngine) {
      window.soundEngine.init();
    }
  }, { once: true });
});
