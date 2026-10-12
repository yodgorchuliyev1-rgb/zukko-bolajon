// Gamification Shop & Mini-Market Modal Component
function openShopModal() {
  const state = window.appState;
  let activeFilter = 'all';

  // Create or reuse modal container
  let modalOverlay = document.getElementById('shopModalOverlay');
  if (!modalOverlay) {
    modalOverlay = document.createElement('div');
    modalOverlay.id = 'shopModalOverlay';
    modalOverlay.className = 'fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity';
    document.body.appendChild(modalOverlay);
  } else {
    modalOverlay.classList.remove('hidden');
  }

  const renderModalContent = () => {
    const student = state.student;
    const items = state.shopItems.filter(item => {
      if (activeFilter === 'all') return true;
      if (activeFilter === 'hat') return item.category === 'hat';
      if (activeFilter === 'outfit') return item.category === 'outfit';
      if (activeFilter === 'accessory') return item.category === 'accessory';
      if (activeFilter === 'room') return item.category === 'room';
      return true;
    });

    const equipped = student.equippedItems[student.avatar] || {};

    modalOverlay.innerHTML = `
      <div class="bg-white border-4 border-indigo-100 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative animate-wiggle" style="animation-iteration-count: 1; animation-duration: 0.3s;">
        
        <!-- Close Button -->
        <button id="btnCloseShop" class="absolute top-5 right-5 w-10 h-10 rounded-full bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-600 flex items-center justify-center text-xl font-black transition-colors cursor-pointer">
          ✕
        </button>

        <!-- Shop Header & Balance -->
        <div class="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 mb-6 pr-12">
          <div class="flex items-center gap-3">
            <div class="w-14 h-14 bg-gradient-to-tr from-amber-400 to-yellow-500 rounded-2xl flex items-center justify-center text-3xl shadow-md text-white">
              🛍️
            </div>
            <div>
              <h2 class="text-xl md:text-2xl font-black text-slate-800">Zukko Mini-Market</h2>
              <p class="text-xs md:text-sm font-semibold text-slate-500">
                Darslardan to'plagan tangalaringizga qahramoningizni bezang!
              </p>
            </div>
          </div>

          <!-- Current Balance Badge -->
          <div class="flex items-center gap-2 bg-gradient-to-r from-amber-50 to-yellow-100 border-2 border-amber-300 px-4 py-2 rounded-2xl shadow-sm">
            <span class="text-2xl animate-bounce">🪙</span>
            <div>
              <span class="text-[10px] font-bold text-amber-600 block leading-tight">SIZNING BALANSINGIZ</span>
              <span class="text-lg md:text-xl font-black text-amber-900 leading-tight">${student.coins} Zukko-Tanga</span>
            </div>
          </div>
        </div>

        <!-- Category Filter Tabs -->
        <div class="flex flex-wrap items-center gap-2 mb-6">
          <button class="shop-filter-btn px-4 py-1.5 rounded-xl font-black text-xs transition-all ${activeFilter === 'all' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}" data-filter="all">
            Barchasi
          </button>
          <button class="shop-filter-btn px-4 py-1.5 rounded-xl font-black text-xs transition-all ${activeFilter === 'hat' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}" data-filter="hat">
            🧢 Do'ppilar
          </button>
          <button class="shop-filter-btn px-4 py-1.5 rounded-xl font-black text-xs transition-all ${activeFilter === 'outfit' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}" data-filter="outfit">
            👗 Chopon va Liboslar
          </button>
          <button class="shop-filter-btn px-4 py-1.5 rounded-xl font-black text-xs transition-all ${activeFilter === 'accessory' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}" data-filter="accessory">
            👓 Aksessuarlar
          </button>
          <button class="shop-filter-btn px-4 py-1.5 rounded-xl font-black text-xs transition-all ${activeFilter === 'room' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}" data-filter="room">
            🏠 Xona Buyumlari
          </button>
        </div>

        <!-- Items Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          ${items.map(item => {
            const isEquipped = (item.category === 'hat' && equipped.hat === item.id) ||
                               (item.category === 'outfit' && equipped.outfit === item.id) ||
                               (item.category === 'accessory' && equipped.accessory === item.id);
            const canAfford = student.coins >= item.price;

            return `
              <div class="card-chubby bg-slate-50/70 border-2 ${isEquipped ? 'border-emerald-400 bg-emerald-50/30' : 'border-slate-200'} rounded-2xl p-4 flex flex-col justify-between text-center relative group">
                
                ${isEquipped ? `
                  <span class="absolute top-2 right-2 px-2 py-0.5 bg-emerald-500 text-white text-[10px] font-black rounded-lg shadow-sm">
                    Kiyilgan ✅
                  </span>
                ` : ''}

                <!-- Product Icon -->
                <div class="w-16 h-16 mx-auto mb-2 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 transition-transform">
                  ${item.icon}
                </div>

                <!-- Product Info -->
                <div class="mb-3">
                  <h4 class="text-sm font-black text-slate-800">${item.name}</h4>
                  <p class="text-[11px] text-slate-500 mt-1 leading-snug font-medium line-clamp-2">${item.desc}</p>
                </div>

                <!-- Action Button -->
                <div>
                  ${item.unlocked ? `
                    <button class="btn-shop-action w-full py-2 rounded-xl text-xs font-black shadow-sm transition-all ${isEquipped ? 'bg-slate-200 text-slate-600 cursor-default' : 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'}" data-action="equip" data-id="${item.id}" ${isEquipped ? 'disabled' : ''}>
                      ${isEquipped ? 'Faol Holatda' : 'Kiyish 👕'}
                    </button>
                  ` : `
                    <button class="btn-shop-action btn-bouncy w-full py-2 rounded-xl text-xs font-black shadow-sm flex items-center justify-center gap-1.5 transition-all ${canAfford ? 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-900 cursor-pointer' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}" data-action="buy" data-id="${item.id}">
                      <span>🪙</span>
                      <span>${item.price} Tanga</span>
                    </button>
                  `}
                </div>

              </div>
            `;
          }).join('')}
        </div>

      </div>
    `;

    // Close button
    modalOverlay.querySelector('#btnCloseShop').addEventListener('click', () => {
      modalOverlay.classList.add('hidden');
      if (window.soundEngine) window.soundEngine.playClick();
    });

    // Category filter click
    modalOverlay.querySelectorAll('.shop-filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        activeFilter = e.currentTarget.getAttribute('data-filter');
        if (window.soundEngine) window.soundEngine.playClick();
        renderModalContent();
      });
    });

    // Buy or Equip Action
    modalOverlay.querySelectorAll('.btn-shop-action').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        const action = e.currentTarget.getAttribute('data-action');

        if (action === 'buy' || action === 'equip') {
          const success = state.buyItem(id);
          if (success) {
            renderModalContent();
            // Re-render hero section so new outfit reflects immediately
            const heroMount = document.getElementById('heroSectionMount');
            if (heroMount && window.renderHeroSection) {
              window.renderHeroSection(heroMount);
            }
            // Audio response from hero
            const activeChar = state.characters[state.student.avatar];
            activeChar.speech = "Voy qanday ajoyib yangi kiyim! Menga juda yarashdi, katta rahmat! 🌟";
            if (window.soundEngine) {
              window.soundEngine.speak(activeChar.speech);
            }
          }
        }
      });
    });
  };

  renderModalContent();
}

window.openShopModal = openShopModal;
