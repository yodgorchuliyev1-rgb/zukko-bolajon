// Central Reactive Application State
class AppState {
  constructor() {
    this.currentView = 'kids'; // 'kids' or 'admin'
    this.activeTab = 'alphabet'; // 'alphabet', 'math', 'words', 'canvas'
    this.activeAdminTab = 'analytics'; // 'analytics', 'cms', 'shop'

    // Student Profile
    this.student = {
      name: 'Azizbek',
      level: 3,
      title: 'Zukko Bilimdon',
      xp: 340,
      nextLevelXp: 500,
      coins: 120,
      streak: 5,
      avatar: 'bilagon', // 'bilagon' or 'zilola'
      equippedItems: {
        bilagon: { hat: 'doppi_chust', outfit: 'nimcha_blue', accessory: 'none' },
        zilola: { hat: 'none', outfit: 'adras_dress', accessory: 'none' }
      },
      inventory: ['doppi_chust', 'adras_dress', 'nimcha_blue']
    };

    // Characters definition
    this.characters = {
      bilagon: {
        id: 'bilagon',
        name: "Bilag'on",
        badge: "Quvnoq va Chaqqon",
        gender: 'boy',
        speech: "Salom, Zukko do'stim! Bugun yangi harflar va sonlarni birga kashf etamizmi? Qani, boshladik! 🚀",
        quotesSuccess: [
          "Ofarin! Qaloming xuddi sehrgarning tayoqchasiday chaqqon! 🌟",
          "Barakalla! Sen haqiqiy bilimdon chempionsan! +10 tanga berildi! 🪙",
          "Ajoyib natija! Xuddi shunday shijoat bilan davom etamiz! 👏",
          "Qoyilmaqom! Sening zehn va diqqating juda o'tkir! 💡"
        ],
        quotesTryAgain: [
          "Deyarli uddalading! Keling, birgalikda yana bir bor sinab ko'ramiz! 💪",
          "Hechqisi yo'q, xatolar bizni yanada kuchli qiladi! Yana bir harakat! ✨",
          "Juda yaqin kelding! Qalamni biroz erkinroq yurgizib ko'rchi! ✏️"
        ]
      },
      zilola: {
        id: 'zilola',
        name: "Zilola",
        badge: "Ziyrak va Mehribon",
        gender: 'girl',
        speech: "Assalomu alaykum, bilimdon do'stim! Bugun bilimlar olamiga sayohat qilamiz! Men senga doim yordamga tayyorman! 🌸",
        quotesSuccess: [
          "Qoyil! Yozganing xuddi san'at asaridek chiroyli va tekis chiqdi! 🎨",
          "Balli, aqlli do'stim! Zukko-tangalaring yanada ko'paydi! 💎",
          "A'lo darajada bajarding! Sen bilan judayam faxrlanaman! 💖",
          "Har bir topshiriqni mehr va qunt bilan bajaryapsan, ofarin! 🌈"
        ],
        quotesTryAgain: [
          "Harakating tahsinga loyiq! Biroz sabr bilan yana bir bor urinib ko'ramizmi? 🌷",
          "Juda ozgina qoldi! Diqqat bilan chiziqlar ustidan yurgiz! 🌟",
          "Xavotir olma, birgalikda mashq qilsak albatta mukammal bo'ladi! 💫"
        ]
      }
    };

    // Active Canvas Task
    this.activeTask = {
      id: 'task_a',
      title: 'A harfini yozish',
      char: 'A',
      word: 'Anor',
      emoji: '🍎',
      category: 'alphabet',
      reward: 10,
      guideType: 'letter' // 'letter', 'number', 'shape'
    };

    // Lessons Database (Managed by Admin CMS)
    this.lessons = [
      { id: 'l_1', char: 'A', title: 'A harfi', word: 'Anor', emoji: '🍎', category: 'alphabet', difficulty: 'Oson', reward: 10, status: 'Active' },
      { id: 'l_2', char: 'B', title: 'B harfi', word: 'Baliq', emoji: '🐟', category: 'alphabet', difficulty: 'Oson', reward: 10, status: 'Active' },
      { id: 'l_3', char: 'D', title: 'D harfi', word: 'Daraxt', emoji: '🌳', category: 'alphabet', difficulty: 'Oson', reward: 10, status: 'Active' },
      { id: 'l_4', char: 'E', title: 'E harfi', word: 'Echkilar', emoji: '🐐', category: 'alphabet', difficulty: 'Oson', reward: 10, status: 'Active' },
      { id: 'l_5', char: 'K', title: 'K harfi', word: 'Kitob', emoji: '📖', category: 'alphabet', difficulty: "O'rta", reward: 10, status: 'Active' },
      { id: 'l_6', char: 'M', title: 'M harfi', word: 'Mushuk', emoji: '🐱', category: 'alphabet', difficulty: "O'rta", reward: 10, status: 'Active' },
      { id: 'l_7', char: 'O', title: 'O harfi', word: 'Olma', emoji: '🍏', category: 'alphabet', difficulty: 'Oson', reward: 10, status: 'Active' },
      { id: 'l_8', char: 'SH', title: 'SH harfi', word: 'Shar', emoji: '🎈', category: 'alphabet', difficulty: 'Murakkab', reward: 15, status: 'Active' },
      { id: 'l_9', char: 'G\'', title: 'G\' harfi', word: 'G\'oz', emoji: '🪿', category: 'alphabet', difficulty: 'Murakkab', reward: 15, status: 'Active' }
    ];

    // Math Challenges
    this.mathChallenges = [
      {
        id: 'm_1',
        title: 'Mevalarni hisoblash',
        question: '3 ta olma + 2 ta olma = nechta olma?',
        visual: '🍎🍎🍎 + 🍎🍎',
        options: ['4', '5', '6'],
        answer: '5',
        charToDraw: '5',
        reward: 10
      },
      {
        id: 'm_2',
        title: 'Sehrli ayirish',
        question: '7 ta yulduzchadan 3 tasi uchib ketdi. Nechta qoldi?',
        visual: '⭐⭐⭐⭐⭐⭐⭐ - ⭐⭐⭐',
        options: ['3', '4', '5'],
        answer: '4',
        charToDraw: '4',
        reward: 10
      },
      {
        id: 'm_3',
        title: 'Shaklni toping',
        question: '3 ta burchagi bor bo\'lgan shakl qaysi?',
        visual: '📐 🔺 🔷',
        options: ['Kvadrat', 'Uchburchak', 'Aylana'],
        answer: 'Uchburchak',
        charToDraw: '▲',
        reward: 15
      },
      {
        id: 'm_4',
        title: 'Shirinliklar soni',
        question: '4 ta muzqaymoq + 4 ta muzqaymoq = ?',
        visual: '🍦🍦🍦🍦 + 🍦🍦🍦🍦',
        options: ['6', '7', '8'],
        answer: '8',
        charToDraw: '8',
        reward: 10
      }
    ];

    // Word Builder Puzzles
    this.wordPuzzles = [
      {
        id: 'w_1',
        targetWord: 'KITOB',
        scrambled: ['T', 'K', 'B', 'I', 'O'],
        hint: 'Bilim manbai bo\'lgan buyum',
        emoji: '📖',
        reward: 15
      },
      {
        id: 'w_2',
        targetWord: 'OLMA',
        scrambled: ['M', 'O', 'A', 'L'],
        hint: 'Shirin va vitaminli meva',
        emoji: '🍎',
        reward: 15
      },
      {
        id: 'w_3',
        targetWord: 'VATAN',
        scrambled: ['N', 'V', 'T', 'A', 'A'],
        hint: 'Biz sevadigan ona yurtimiz: O\'zbekiston!',
        emoji: '🇺🇿',
        reward: 20
      },
      {
        id: 'w_4',
        targetWord: 'QUYOSH',
        scrambled: ['Y', 'Q', 'S', 'U', 'H', 'O'],
        hint: 'Ertalab osmonda porlab chiqadigan nur',
        emoji: '☀️',
        reward: 20
      }
    ];

    // Gamification Shop Catalog
    this.shopItems = [
      {
        id: 'doppi_chust',
        name: "Chust Do'ppisi",
        category: 'hat',
        price: 30,
        icon: '🧢',
        desc: "Milliy naqshli, g'urur bag'ishlovchi chust do'ppi",
        unlocked: true,
        equipped: true,
        targetChar: 'bilagon'
      },
      {
        id: 'doppi_iroqi',
        name: "Iroqi Baxmal Do'ppi",
        category: 'hat',
        price: 50,
        icon: '👑',
        desc: "Yorqin gulli va zar ipli go'zal do'ppicha",
        unlocked: false,
        equipped: false,
        targetChar: 'all'
      },
      {
        id: 'adras_dress',
        name: "Zamonaviy Adras Libos",
        category: 'outfit',
        price: 70,
        icon: '👗',
        desc: "Kamalak rangli xonatlas va adras uyg'unligi",
        unlocked: true,
        equipped: true,
        targetChar: 'zilola'
      },
      {
        id: 'zar_chopon',
        name: "Zar Chopon",
        category: 'outfit',
        price: 90,
        icon: '👘',
        desc: "Oltin naqshli shohona milliy chopon",
        unlocked: false,
        equipped: false,
        targetChar: 'all'
      },
      {
        id: 'glasses_smart',
        name: "Zukko Ko'zoynagi",
        category: 'accessory',
        price: 25,
        icon: '👓',
        desc: "Aqlli va zukko ko'rinish beruvchi doiraviy ko'zoynak",
        unlocked: false,
        equipped: false,
        targetChar: 'all'
      },
      {
        id: 'magic_book',
        name: "Sehrli Qo'lyozma",
        category: 'accessory',
        price: 40,
        icon: '✨',
        desc: "O'zidan nur taratuvchi qadimiy bilim kitobi",
        unlocked: false,
        equipped: false,
        targetChar: 'all'
      },
      {
        id: 'carpet_uzb',
        name: "O'zbek Gilamchasi",
        category: 'room',
        price: 45,
        icon: '🧶',
        desc: "Qahramonlar xonasi uchun qadimiy naqshli gilam",
        unlocked: false,
        equipped: false,
        targetChar: 'room'
      },
      {
        id: 'samovar_gold',
        name: "Chiroqli Samovar",
        category: 'room',
        price: 35,
        icon: '🫖',
        desc: "Xonani fayzli qiluvchi shirin choy samovari",
        unlocked: false,
        equipped: false,
        targetChar: 'room'
      }
    ];

    // Admin Analytics State
    this.analytics = {
      totalStudents: 1420,
      activeToday: 832,
      totalChecks: 8640,
      avgAccuracy: 89.4,
      accuracyChange: '+4.2%',
      studentGrowth: '+18.5%',
      // Error statistics for letters & math challenges
      problematicItems: [
        { item: "G' harfi", errors: 342, failRate: '28%', reason: "Tutuq belgisini noto'g'ri joylashtirish" },
        { item: "O' harfi", errors: 310, failRate: '25%', reason: "Belgini teskari chizish" },
        { item: "7 - 4 misoli", errors: 285, failRate: '23%', reason: "Barmoq bilan sanashda chalkashish" },
        { item: "SH harfi", errors: 240, failRate: '19%', reason: "Ikkala harfni qo'shib yozishda oraliq" },
        { item: "Q harfi", errors: 195, failRate: '16%', reason: "O'rta chiziqchasini unutish" }
      ],
      // Weekly checks trend (Mon - Sun)
      weeklyTrends: [
        { day: 'Dush', checks: 980, correct: 870 },
        { day: 'Sesh', checks: 1120, correct: 1005 },
        { day: 'Chor', checks: 1250, correct: 1130 },
        { day: 'Pay', checks: 1190, correct: 1070 },
        { day: 'Juma', checks: 1340, correct: 1210 },
        { day: 'Shan', checks: 1480, correct: 1320 },
        { day: 'Yak', checks: 1280, correct: 1145 }
      ]
    };

    this.listeners = [];
  }

  // Subscribe to state changes
  subscribe(fn) {
    this.listeners.push(fn);
  }

  notify() {
    this.listeners.forEach(fn => fn(this));
  }

  // Switch between Kids mode and Admin mode
  setView(viewName) {
    this.currentView = viewName;
    this.notify();
  }

  setActiveTab(tabName) {
    this.activeTab = tabName;
    this.notify();
  }

  setActiveAdminTab(tabName) {
    this.activeAdminTab = tabName;
    this.notify();
  }

  // Select Hero Character (Bilagon or Zilola)
  setCharacter(charId) {
    if (this.characters[charId]) {
      this.student.avatar = charId;
      if (window.soundEngine) {
        window.soundEngine.playClick();
      }
      this.notify();
    }
  }

  // Select Task to Practice on Canvas
  selectTask(task) {
    this.activeTask = task;
    this.activeTab = 'canvas';
    if (window.soundEngine) {
      window.soundEngine.playClick();
    }
    this.notify();
  }

  // Reward Coins & XP
  addReward(coins = 10, xp = 20) {
    this.student.coins += coins;
    this.student.xp += xp;

    // Check level up
    if (this.student.xp >= this.student.nextLevelXp) {
      this.student.level += 1;
      this.student.xp -= this.student.nextLevelXp;
      this.student.nextLevelXp = Math.floor(this.student.nextLevelXp * 1.4);
      if (window.soundEngine) {
        window.soundEngine.playLevelUp();
      }
    } else {
      if (window.soundEngine) {
        window.soundEngine.playCoin();
      }
    }

    this.analytics.totalChecks += 1;
    this.notify();
  }

  // Buy Shop Item
  buyItem(itemId) {
    const item = this.shopItems.find(i => i.id === itemId);
    if (!item) return false;

    if (item.unlocked) {
      // Toggle equip
      this.equipItem(item);
      return true;
    }

    if (this.student.coins >= item.price) {
      this.student.coins -= item.price;
      item.unlocked = true;
      this.equipItem(item);
      if (window.soundEngine) {
        window.soundEngine.playSuccess();
      }
      this.notify();
      return true;
    } else {
      if (window.soundEngine) {
        window.soundEngine.playTryAgain();
      }
      return false;
    }
  }

  equipItem(item) {
    const char = this.student.avatar;
    if (item.category === 'hat') {
      this.student.equippedItems[char].hat = item.id;
    } else if (item.category === 'outfit') {
      this.student.equippedItems[char].outfit = item.id;
    } else if (item.category === 'accessory') {
      this.student.equippedItems[char].accessory = item.id;
    }
    this.notify();
  }

  // Add Lesson via Admin CMS
  addLesson(lessonData) {
    const newLesson = {
      id: 'l_' + Date.now(),
      ...lessonData,
      status: 'Active'
    };
    this.lessons.push(newLesson);
    this.notify();
    return newLesson;
  }

  // Delete Lesson
  deleteLesson(id) {
    this.lessons = this.lessons.filter(l => l.id !== id);
    this.notify();
  }

  // Update Shop Item Price
  updateShopPrice(itemId, newPrice) {
    const item = this.shopItems.find(i => i.id === itemId);
    if (item) {
      item.price = parseInt(newPrice, 10) || item.price;
      this.notify();
    }
  }

  // Add Shop Item
  addShopItem(itemData) {
    const newItem = {
      id: 'item_' + Date.now(),
      ...itemData,
      price: parseInt(itemData.price, 10) || 20,
      unlocked: false,
      equipped: false
    };
    this.shopItems.push(newItem);
    this.notify();
    return newItem;
  }
}

window.appState = new AppState();
