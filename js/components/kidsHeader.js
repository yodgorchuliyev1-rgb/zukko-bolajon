// Kids Platform Header & Profile Bar
function renderKidsHeader(container) {
  const state = window.appState;
  const student = state.student;
  const xpPercent = Math.min(100, Math.round((student.xp / student.nextLevelXp) * 100));

  container.innerHTML = `
    <header class="bg-white/95 backdrop-blur-md border-b-2 border-indigo-100 sticky top-0 z-40 px-4 py-3 shadow-sm">
      <div class="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        
        <!-- Logo & Branding -->
        <div class="flex items-center gap-3 cursor-pointer" id="brandLogo">
          <div class="w-11 h-11 bg-gradient-to-tr from-amber-400 to-pink-500 rounded-2xl flex items-center justify-center text-white text-2xl shadow-md transform hover:rotate-6 transition-transform">
            🌟
          </div>
          <div>
            <div class="flex items-center gap-1.5">
              <span class="text-xl md:text-2xl font-black text-indigo-900 tracking-tight">ZUKKO</span>
              <span class="text-xl md:text-2xl font-black text-pink-500 tracking-tight">BOLAJON</span>
            </div>
            <span class="text-[11px] font-bold text-slate-500 uppercase tracking-widest block -mt-1">6-10 Yoshli Bolalar Maktabi</span>
          </div>
        </div>

        <!-- Middle Gamification Badges: Streak & Zukko-Coins -->
        <div class="flex items-center gap-3">
          
          <!-- Streak Badge -->
          <div class="flex items-center gap-2 bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 px-3.5 py-1.5 rounded-2xl shadow-sm hover:scale-105 transition-transform" title="Kunlik dars seriyasi">
            <span class="text-2xl animate-bounce">🔥</span>
            <div>
              <span class="text-xs font-bold text-orange-500 block leading-none">STREAK</span>
              <span class="text-sm md:text-base font-black text-slate-800 leading-none">${student.streak} Kun!</span>
            </div>
          </div>

          <!-- Zukko-Coins Balance -->
          <div id="coinBalanceBadge" class="flex items-center gap-2 bg-gradient-to-r from-amber-50 to-yellow-100 border-2 border-amber-300 px-4 py-1.5 rounded-2xl shadow-sm hover:scale-105 transition-transform" title="Zukko-tangalar balansi">
            <span class="text-2xl animate-spin" style="animation-duration: 6s;">🪙</span>
            <div>
              <span class="text-xs font-bold text-amber-600 block leading-none">ZUKKO-TANGA</span>
              <span id="headerCoinCount" class="text-base md:text-lg font-black text-amber-900 leading-none">${student.coins}</span>
            </div>
          </div>

          <!-- Shop Button -->
          <button id="btnOpenShop" class="btn-bouncy flex items-center gap-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-3.5 py-2 rounded-2xl font-black text-xs md:text-sm shadow-md hover:from-indigo-600 hover:to-purple-700 cursor-pointer">
            <span class="text-base">🛍️</span> Do'kon
          </button>
        </div>

        <!-- Right Side: Student Profile & Admin Switcher -->
        <div class="flex items-center gap-3">
          
          <!-- Student Avatar & XP Level -->
          <div class="flex items-center gap-2.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-2xl">
            <div class="w-10 h-10 rounded-xl ${student.avatar === 'bilagon' ? 'bg-sky-100 border-2 border-sky-400' : 'bg-pink-100 border-2 border-pink-400'} flex items-center justify-center text-xl shadow-inner">
              ${student.avatar === 'bilagon' ? '👦' : '👧'}
            </div>
            <div class="hidden sm:block text-left">
              <div class="flex items-center gap-2">
                <span class="text-xs md:text-sm font-extrabold text-slate-800">${student.name}</span>
                <span class="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-black rounded-lg">Lv. ${student.level}</span>
              </div>
              <!-- Mini XP Progress -->
              <div class="w-24 bg-slate-200 h-2 rounded-full overflow-hidden mt-1">
                <div class="bg-gradient-to-r from-emerald-400 to-teal-500 h-full rounded-full transition-all duration-500" style="width: ${xpPercent}%"></div>
              </div>
            </div>
          </div>

          <!-- Mute / Unmute Audio Button -->
          <button id="btnToggleSound" class="w-10 h-10 rounded-2xl border-2 border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors text-lg" title="Ovozni yoqish/o'chirish">
            <span id="soundIcon">${window.soundEngine && window.soundEngine.isMuted ? '🔇' : '🔊'}</span>
          </button>

          <!-- Admin Panel Switcher -->
          <button id="btnSwitchToAdmin" class="btn-bouncy flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-amber-300 border-2 border-amber-400/40 px-3.5 py-2 rounded-2xl text-xs md:text-sm font-black shadow-lg cursor-pointer">
            <span>⚙️</span>
            <span class="hidden md:inline">Admin Panel</span>
          </button>
        </div>

      </div>
    </header>
  `;

  // Attach Event Listeners
  const btnLogo = container.querySelector('#brandLogo');
  const btnShop = container.querySelector('#btnOpenShop');
  const btnSound = container.querySelector('#btnToggleSound');
  const soundIcon = container.querySelector('#soundIcon');
  const btnAdmin = container.querySelector('#btnSwitchToAdmin');

  if (btnLogo) {
    btnLogo.addEventListener('click', () => {
      state.setActiveTab('alphabet');
      if (window.soundEngine) window.soundEngine.playClick();
    });
  }

  if (btnShop) {
    btnShop.addEventListener('click', () => {
      if (window.openShopModal) {
        window.openShopModal();
      }
    });
  }

  if (btnSound) {
    btnSound.addEventListener('click', () => {
      const isMuted = window.soundEngine.toggleMute();
      soundIcon.textContent = isMuted ? '🔇' : '🔊';
    });
  }

  if (btnAdmin) {
    btnAdmin.addEventListener('click', () => {
      if (window.soundEngine) window.soundEngine.playClick();
      state.setView('admin');
    });
  }
}

window.renderKidsHeader = renderKidsHeader;
