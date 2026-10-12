// Hero Characters & AI Voice Speech Bubble Component
function renderHeroSection(container) {
  const state = window.appState;
  const activeCharId = state.student.avatar;
  const char = state.characters[activeCharId];
  const equipped = state.student.equippedItems[activeCharId] || {};

  // Check equipped accessories
  const hasGlasses = equipped.accessory === 'glasses_smart';
  const hasMagicBook = equipped.accessory === 'magic_book';
  const isIroqiHat = equipped.hat === 'doppi_iroqi';
  const isZarChopon = equipped.outfit === 'zar_chopon';

  // SVG for Bilag'on
  const bilagonSVG = `
    <svg viewBox="0 0 200 240" class="w-full h-full drop-shadow-xl transition-transform duration-300 hover:scale-105" xmlns="http://www.w3.org/2000/svg">
      <!-- Shadow -->
      <ellipse cx="100" cy="225" rx="55" ry="10" fill="#cbd5e1" opacity="0.6"/>

      <!-- Body / Torso -->
      <path d="M 60 145 C 55 195, 145 195, 140 145 Z" fill="${isZarChopon ? '#EAB308' : '#38BDF8'}" stroke="#0284C7" stroke-width="3"/>
      
      <!-- Zar Chopon or Nimcha pattern -->
      ${isZarChopon ? `
        <!-- Gold Zar Patterns -->
        <path d="M 70 150 Q 100 170 130 150" fill="none" stroke="#FEF08A" stroke-width="4" stroke-dasharray="3,2"/>
        <path d="M 75 165 Q 100 185 125 165" fill="none" stroke="#FEF08A" stroke-width="3"/>
        <circle cx="100" cy="155" r="4" fill="#991B1B"/>
        <circle cx="100" cy="175" r="4" fill="#991B1B"/>
      ` : `
        <!-- Modern Uzbek Jilet / Nimcha -->
        <path d="M 75 145 L 85 190 L 115 190 L 125 145 Z" fill="#FDE047" stroke="#EAB308" stroke-width="2"/>
        <line x1="100" y1="145" x2="100" y2="190" stroke="#0284C7" stroke-width="2"/>
        <circle cx="100" cy="155" r="3" fill="#0369A1"/>
        <circle cx="100" cy="170" r="3" fill="#0369A1"/>
      `}

      <!-- Hands & Arms -->
      <path d="M 58 148 C 35 165, 40 190, 52 185 C 58 180, 60 165, 62 155 Z" fill="#FDBA74" stroke="#EA580C" stroke-width="2"/>
      <path d="M 142 148 C 165 165, 160 190, 148 185 C 142 180, 140 165, 138 155 Z" fill="#FDBA74" stroke="#EA580C" stroke-width="2"/>

      <!-- Magic Book accessory if equipped -->
      ${hasMagicBook ? `
        <g transform="translate(135, 160) scale(0.65)">
          <rect x="0" y="0" width="40" height="50" rx="6" fill="#6366F1" stroke="#4338CA" stroke-width="2"/>
          <rect x="5" y="5" width="30" height="40" rx="3" fill="#FEF08A"/>
          <text x="12" y="30" font-size="20">✨</text>
        </g>
      ` : ''}

      <!-- Neck -->
      <rect x="90" y="125" width="20" height="20" rx="5" fill="#FDBA74"/>

      <!-- Head -->
      <ellipse cx="100" cy="90" rx="42" ry="46" fill="#FED7AA" stroke="#EA580C" stroke-width="2.5"/>

      <!-- Cheeks -->
      <ellipse cx="72" cy="100" rx="8" ry="5" fill="#F472B6" opacity="0.65"/>
      <ellipse cx="128" cy="100" rx="8" ry="5" fill="#F472B6" opacity="0.65"/>

      <!-- Eyes (Blinking animation) -->
      <g class="animate-wiggle">
        <circle cx="82" cy="85" r="6" fill="#1E293B"/>
        <circle cx="84" cy="83" r="2.2" fill="#FFFFFF"/>
        <circle cx="118" cy="85" r="6" fill="#1E293B"/>
        <circle cx="120" cy="83" r="2.2" fill="#FFFFFF"/>
      </g>

      <!-- Eyebrows -->
      <path d="M 75 75 Q 83 70 91 75" fill="none" stroke="#475569" stroke-width="3" stroke-linecap="round"/>
      <path d="M 109 75 Q 117 70 125 75" fill="none" stroke="#475569" stroke-width="3" stroke-linecap="round"/>

      <!-- Nose -->
      <path d="M 98 88 Q 100 93 103 92" fill="none" stroke="#EA580C" stroke-width="2.5" stroke-linecap="round"/>

      <!-- Smile -->
      <path d="M 85 106 Q 100 120 115 106" fill="#EF4444" stroke="#B91C1C" stroke-width="2" stroke-linecap="round"/>
      <path d="M 90 107 Q 100 115 110 107" fill="#FFFFFF"/>

      <!-- Smart Glasses if equipped -->
      ${hasGlasses ? `
        <g stroke="#1E1B4B" stroke-width="3" fill="none">
          <circle cx="82" cy="85" r="13" fill="rgba(56, 189, 248, 0.2)"/>
          <circle cx="118" cy="85" r="13" fill="rgba(56, 189, 248, 0.2)"/>
          <line x1="95" y1="85" x2="105" y2="85"/>
        </g>
      ` : ''}

      <!-- Ears -->
      <ellipse cx="58" cy="90" rx="6" ry="9" fill="#FED7AA" stroke="#EA580C" stroke-width="2"/>
      <ellipse cx="142" cy="90" rx="6" ry="9" fill="#FED7AA" stroke="#EA580C" stroke-width="2"/>

      <!-- Hair Under Hat -->
      <path d="M 64 68 C 65 52, 135 52, 136 68 Z" fill="#334155"/>

      <!-- HAT: Chust or Iroqi Doppi -->
      ${isIroqiHat ? `
        <!-- Iroqi Doppi (Velvet Floral Pattern) -->
        <g transform="translate(0, 0)">
          <path d="M 62 60 C 65 32, 135 32, 138 60 Z" fill="#991B1B" stroke="#7F1D1D" stroke-width="2.5"/>
          <!-- Velvet Flowers -->
          <circle cx="80" cy="48" r="4" fill="#FDE047"/>
          <circle cx="100" cy="44" r="5" fill="#34D399"/>
          <circle cx="120" cy="48" r="4" fill="#F472B6"/>
          <path d="M 62 60 Q 100 66 138 60" fill="none" stroke="#FEF08A" stroke-width="3"/>
        </g>
      ` : `
        <!-- National Chust Doppi (Black with White Bodom / Pepper ornaments) -->
        <g transform="translate(0, 0)">
          <path d="M 62 60 C 65 34, 135 34, 138 60 Z" fill="#0F172A" stroke="#020617" stroke-width="2.5"/>
          <!-- Chust Bodom Patterns -->
          <path d="M 76 54 C 74 46, 84 45, 87 52 C 86 54, 78 55, 76 54 Z" fill="#FFFFFF"/>
          <path d="M 96 52 C 94 44, 104 43, 107 50 C 106 52, 98 53, 96 52 Z" fill="#FFFFFF"/>
          <path d="M 116 54 C 114 46, 124 45, 127 52 C 126 54, 118 55, 116 54 Z" fill="#FFFFFF"/>
          <!-- White rim edge -->
          <path d="M 62 60 Q 100 66 138 60" fill="none" stroke="#FFFFFF" stroke-width="3"/>
        </g>
      `}
    </svg>
  `;

  // SVG for Zilola
  const zilolaSVG = `
    <svg viewBox="0 0 200 240" class="w-full h-full drop-shadow-xl transition-transform duration-300 hover:scale-105" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- Adras Multi-color Gradient -->
        <linearGradient id="adrasSilk" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#EC4899" />
          <stop offset="25%" stop-color="#F43F5E" />
          <stop offset="50%" stop-color="#FBBF24" />
          <stop offset="75%" stop-color="#38BDF8" />
          <stop offset="100%" stop-color="#8B5CF6" />
        </linearGradient>
      </defs>

      <!-- Shadow -->
      <ellipse cx="100" cy="225" rx="55" ry="10" fill="#cbd5e1" opacity="0.6"/>

      <!-- Girl Dress (Adras Pattern) -->
      <path d="M 60 142 C 45 200, 155 200, 140 142 Z" fill="url(#adrasSilk)" stroke="#BE185D" stroke-width="3"/>

      <!-- Adras waves & collar -->
      <path d="M 70 160 Q 100 175 130 160" fill="none" stroke="#FFFFFF" stroke-width="3" opacity="0.75"/>
      <path d="M 65 180 Q 100 195 135 180" fill="none" stroke="#FFFFFF" stroke-width="2.5" opacity="0.7"/>
      <circle cx="100" cy="148" r="4" fill="#FDE047"/>
      <circle cx="100" cy="162" r="4" fill="#FDE047"/>

      <!-- Hands -->
      <path d="M 60 148 C 40 165, 45 190, 56 185 C 60 180, 62 165, 64 155 Z" fill="#FDBA74" stroke="#EA580C" stroke-width="2"/>
      <path d="M 140 148 C 160 165, 155 190, 144 185 C 140 180, 138 165, 136 155 Z" fill="#FDBA74" stroke="#EA580C" stroke-width="2"/>

      <!-- Magic Book accessory if equipped -->
      ${hasMagicBook ? `
        <g transform="translate(135, 160) scale(0.65)">
          <rect x="0" y="0" width="40" height="50" rx="6" fill="#EC4899" stroke="#BE185D" stroke-width="2"/>
          <rect x="5" y="5" width="30" height="40" rx="3" fill="#FEF08A"/>
          <text x="12" y="30" font-size="20">✨</text>
        </g>
      ` : ''}

      <!-- Neck -->
      <rect x="91" y="123" width="18" height="20" rx="5" fill="#FDBA74"/>

      <!-- Braided Hair (Kokillar) -->
      <path d="M 52 85 C 40 120, 35 160, 42 180 C 46 180, 50 160, 56 125 Z" fill="#1E293B"/>
      <circle cx="42" cy="180" r="5" fill="#EC4899"/>
      <circle cx="44" cy="150" r="4" fill="#FBBF24"/>

      <path d="M 148 85 C 160 120, 165 160, 158 180 C 154 180, 150 160, 144 125 Z" fill="#1E293B"/>
      <circle cx="158" cy="180" r="5" fill="#EC4899"/>
      <circle cx="156" cy="150" r="4" fill="#FBBF24"/>

      <!-- Head -->
      <ellipse cx="100" cy="88" rx="41" ry="44" fill="#FED7AA" stroke="#EA580C" stroke-width="2.5"/>

      <!-- Cheeks -->
      <ellipse cx="72" cy="98" rx="8" ry="6" fill="#F43F5E" opacity="0.6"/>
      <ellipse cx="128" cy="98" rx="8" ry="6" fill="#F43F5E" opacity="0.6"/>

      <!-- Eyes (Gentle & expressive) -->
      <g class="animate-wiggle">
        <circle cx="82" cy="84" r="5.5" fill="#1E293B"/>
        <circle cx="84" cy="82" r="2.2" fill="#FFFFFF"/>
        <!-- Eyelash -->
        <path d="M 75 79 L 71 76" stroke="#1E293B" stroke-width="1.8"/>
        <path d="M 87 79 L 90 76" stroke="#1E293B" stroke-width="1.8"/>

        <circle cx="118" cy="84" r="5.5" fill="#1E293B"/>
        <circle cx="120" cy="82" r="2.2" fill="#FFFFFF"/>
        <!-- Eyelash -->
        <path d="M 113 79 L 110 76" stroke="#1E293B" stroke-width="1.8"/>
        <path d="M 125 79 L 129 76" stroke="#1E293B" stroke-width="1.8"/>
      </g>

      <!-- Eyebrows -->
      <path d="M 75 74 Q 82 70 89 74" fill="none" stroke="#475569" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M 111 74 Q 118 70 125 74" fill="none" stroke="#475569" stroke-width="2.5" stroke-linecap="round"/>

      <!-- Cute Nose -->
      <path d="M 98 87 Q 100 91 102 90" fill="none" stroke="#EA580C" stroke-width="2.2" stroke-linecap="round"/>

      <!-- Gentle Smile -->
      <path d="M 86 104 Q 100 117 114 104" fill="#F43F5E" stroke="#BE123C" stroke-width="1.8"/>
      <path d="M 91 105 Q 100 112 109 105" fill="#FFFFFF"/>

      <!-- Smart Glasses if equipped -->
      ${hasGlasses ? `
        <g stroke="#BE185D" stroke-width="2.8" fill="none">
          <circle cx="82" cy="84" r="13" fill="rgba(244, 114, 182, 0.2)"/>
          <circle cx="118" cy="84" r="13" fill="rgba(244, 114, 182, 0.2)"/>
          <line x1="95" y1="84" x2="105" y2="84"/>
        </g>
      ` : ''}

      <!-- Ears & Earrings -->
      <ellipse cx="59" cy="88" rx="5" ry="8" fill="#FED7AA" stroke="#EA580C" stroke-width="2"/>
      <circle cx="58" cy="98" r="3" fill="#FBBF24"/>
      <ellipse cx="141" cy="88" rx="5" ry="8" fill="#FED7AA" stroke="#EA580C" stroke-width="2"/>
      <circle cx="142" cy="98" r="3" fill="#FBBF24"/>

      <!-- Hair Bangs & Adras Headband -->
      <path d="M 64 68 C 65 48, 135 48, 136 68 Z" fill="#0F172A"/>
      <path d="M 66 62 Q 100 70 134 62" fill="none" stroke="url(#adrasSilk)" stroke-width="9"/>
      <circle cx="100" cy="55" r="7" fill="#FDE047" stroke="#D97706" stroke-width="2"/>
    </svg>
  `;

  const heroSVG = activeCharId === 'bilagon' ? bilagonSVG : zilolaSVG;

  container.innerHTML = `
    <div class="relative bg-gradient-to-r from-amber-50 via-sky-50 to-indigo-50 border-4 border-white rounded-3xl p-5 md:p-7 shadow-xl overflow-hidden">
      <!-- Decorative Background Elements -->
      <div class="absolute -top-10 -right-10 w-40 h-40 bg-yellow-200 rounded-full blur-2xl opacity-40 pointer-events-none"></div>
      <div class="absolute -bottom-10 -left-10 w-44 h-44 bg-pink-200 rounded-full blur-2xl opacity-40 pointer-events-none"></div>

      <div class="flex flex-col md:flex-row items-center gap-6 relative z-10">
        
        <!-- Left: Character Card & Switcher -->
        <div class="flex flex-col items-center flex-shrink-0">
          <!-- Character Avatar Frame -->
          <div class="w-36 h-44 md:w-44 md:h-52 bg-white/80 backdrop-blur-md rounded-3xl border-4 ${activeCharId === 'bilagon' ? 'border-sky-400 shadow-sky-200' : 'border-pink-400 shadow-pink-200'} shadow-2xl p-2 flex items-center justify-center relative group">
            ${heroSVG}
            <!-- Badge -->
            <span class="absolute -bottom-3 px-3 py-1 text-xs font-black tracking-wide text-white uppercase rounded-full shadow-md ${activeCharId === 'bilagon' ? 'bg-sky-500' : 'bg-pink-500'}">
              ${char.badge}
            </span>
          </div>

          <!-- Switcher Buttons -->
          <div class="mt-5 flex gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-inner">
            <button id="btnSelectBilagon" class="px-3.5 py-1.5 rounded-xl text-xs md:text-sm font-extrabold flex items-center gap-1.5 transition-all ${activeCharId === 'bilagon' ? 'bg-sky-500 text-white shadow-md scale-105' : 'text-slate-600 hover:bg-white'}">
              <span>👦</span> Bilag'on
            </button>
            <button id="btnSelectZilola" class="px-3.5 py-1.5 rounded-xl text-xs md:text-sm font-extrabold flex items-center gap-1.5 transition-all ${activeCharId === 'zilola' ? 'bg-pink-500 text-white shadow-md scale-105' : 'text-slate-600 hover:bg-white'}">
              <span>👧</span> Zilola
            </button>
          </div>
        </div>

        <!-- Right: Speech Bubble & Voice Audio -->
        <div class="flex-1 w-full">
          <!-- Speech Bubble Container -->
          <div class="speech-bubble bg-white border-2 border-indigo-100 rounded-3xl p-5 md:p-6 shadow-xl relative">
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></span>
                <span class="text-xs font-bold text-indigo-600 uppercase tracking-wider">AI Ustoz Replikasi</span>
              </div>
              
              <!-- Voice Speak Button -->
              <button id="btnSpeakReplica" class="px-3.5 py-1.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-900 rounded-2xl text-xs md:text-sm font-black flex items-center gap-2 shadow-sm transition-transform active:scale-95 cursor-pointer">
                <span>🔊</span> Tinglash
              </button>
            </div>

            <!-- Replica Text -->
            <p id="speechText" class="text-base md:text-xl font-bold text-slate-800 leading-relaxed">
              "${char.speech}"
            </p>

            <!-- Interactive Praise Prompts -->
            <div class="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-2 items-center">
              <span class="text-xs text-slate-400 font-semibold">Qahramondan so'rash:</span>
              <button class="speech-prompt-btn px-3 py-1 bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold rounded-xl transition-all" data-text="Menga qanday maslahat berasan?">
                💡 Maslahat ber
              </button>
              <button class="speech-prompt-btn px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold rounded-xl transition-all" data-text="Men bugun darslarni yaxshi bajardimmi?">
                ⭐ Meni maqta
              </button>
              <button class="speech-prompt-btn px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-xl transition-all" data-text="Keling, yangi harfni boshlaymiz!">
                🚀 Boshlaymiz!
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  `;

  // Attach Event Listeners
  const btnBilagon = container.querySelector('#btnSelectBilagon');
  const btnZilola = container.querySelector('#btnSelectZilola');
  const btnSpeak = container.querySelector('#btnSpeakReplica');
  const speechTextEl = container.querySelector('#speechText');

  if (btnBilagon) {
    btnBilagon.addEventListener('click', () => {
      state.setCharacter('bilagon');
    });
  }

  if (btnZilola) {
    btnZilola.addEventListener('click', () => {
      state.setCharacter('zilola');
    });
  }

  if (btnSpeak) {
    btnSpeak.addEventListener('click', () => {
      const text = char.speech;
      if (window.soundEngine) {
        window.soundEngine.playClick();
        window.soundEngine.speak(text);
      }
    });
  }

  // Interactive quick prompt buttons
  container.querySelectorAll('.speech-prompt-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const prompt = e.currentTarget.getAttribute('data-text');
      let response = '';

      if (prompt.includes('Maslahat')) {
        response = activeCharId === 'bilagon'
          ? "Qalamni to'g'ri va yengil ushla, shunda harflar xuddi qushdek ravon chiziladi! ✏️"
          : "Har bir harf va sonni mehr bilan yozsang, ular sening eng yaqin do'stingga aylanadi! 🌸";
      } else if (prompt.includes('maqta')) {
        const quotes = char.quotesSuccess;
        response = quotes[Math.floor(Math.random() * quotes.length)];
      } else {
        response = activeCharId === 'bilagon'
          ? "Qani ketdik! Alifbe bo'limidan bitta harfni tanla va AI doskasida chizib ko'r! 🚀"
          : "Juda yaxshi qaror! Keling, Alifbe yoki Matematika bo'limiga o'tamiz! 📚";
      }

      char.speech = response;
      if (speechTextEl) {
        speechTextEl.innerText = `"${response}"`;
      }
      if (window.soundEngine) {
        window.soundEngine.playClick();
        window.soundEngine.speak(response);
      }
    });
  });
}

window.renderHeroSection = renderHeroSection;
