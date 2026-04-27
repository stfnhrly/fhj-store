export const HARDCODED_GAMES = [
  {
    id: "mobile-legends",
    name: "Mobile Legends: Bang Bang",
    publisher: "Moonton",
    coverImage: "https://i.imgur.com/MejUlho.png",
    bannerImage: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200",
    slug: "mobile-legends",
    requiresServerId: true,
  },
  {
    id: "free-fire",
    name: "Free Fire",
    publisher: "Garena",
    coverImage: "https://i.imgur.com/8tny77n.png",
    bannerImage: "https://images.unsplash.com/photo-1614027164847-1b28cfe1df60?q=80&w=1200",
    slug: "free-fire",
    requiresServerId: false,
  },
  {
    id: "pubg-mobile",
    name: "PUBG Mobile",
    publisher: "Tencent",
    coverImage: "https://i.imgur.com/jeOfyj2.png",
    bannerImage: "https://images.unsplash.com/photo-1506506456073-7e452932906d?q=80&w=1200",
    slug: "pubg-mobile",
    requiresServerId: false,
  },
  {
    id: "valorant",
    name: "Valorant",
    publisher: "Riot Games",
    coverImage: "https://i.imgur.com/DH3PJON.png",
    bannerImage: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200",
    slug: "valorant",
    requiresServerId: false,
  },
  {
    id: "genshin-impact",
    name: "Genshin Impact",
    publisher: "HoYoverse",
    coverImage: "https://i.imgur.com/Gn4UuHm.png",
    bannerImage: "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=1200",
    slug: "genshin-impact",
    requiresServerId: true,
  },
  {
    id: "honkai-star-rail",
    name: "Honkai: Star Rail",
    publisher: "HoYoverse",
    coverImage: "https://i.imgur.com/lnLYTg5.png",
    bannerImage: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1200",
    slug: "honkai-star-rail",
    requiresServerId: true,
  },
  {
    id: "call-of-duty-mobile",
    name: "Call of Duty Mobile",
    publisher: "Activision",
    coverImage: "https://i.imgur.com/4wrfNPA.png",
    bannerImage: "https://images.unsplash.com/photo-1505506874771-fa55c48dc2eb?q=80&w=1200",
    slug: "call-of-duty-mobile",
    requiresServerId: false,
  },
  {
    id: "roblox",
    name: "Roblox",
    publisher: "Roblox Corporation",
    coverImage: "https://i.imgur.com/sraR5DV.png",
    bannerImage: "https://images.unsplash.com/photo-1585802102175-69dd443729ac?q=80&w=1200",
    slug: "roblox",
    requiresServerId: false,
  }
];

export const HARDCODED_PRODUCTS = [
  // Mobile Legends
  { id: "ml-1", gameId: "mobile-legends", name: "86 Diamonds", price: 20000, sortOrder: 1 },
  { id: "ml-2", gameId: "mobile-legends", name: "172 Diamonds", price: 38000, originalPrice: 40000, promoLabel: "Best Seller", sortOrder: 2 },
  { id: "ml-3", gameId: "mobile-legends", name: "257 Diamonds", price: 60000, sortOrder: 3 },
  { id: "ml-4", gameId: "mobile-legends", name: "514 Diamonds", price: 110000, originalPrice: 120000, promoLabel: "Hemat", sortOrder: 4 },

  // Free Fire
  { id: "ff-1", gameId: "free-fire", name: "70 Diamonds", price: 10000, sortOrder: 1 },
  { id: "ff-2", gameId: "free-fire", name: "140 Diamonds", price: 18000, originalPrice: 20000, promoLabel: "🔥 Promo", sortOrder: 2 },
  { id: "ff-3", gameId: "free-fire", name: "355 Diamonds", price: 50000, sortOrder: 3 },
  { id: "ff-4", gameId: "free-fire", name: "720 Diamonds", price: 90000, originalPrice: 100000, promoLabel: "Best Seller", sortOrder: 4 },

  // PUBG Mobile
  { id: "pubg-1", gameId: "pubg-mobile", name: "60 UC", price: 15000, sortOrder: 1 },
  { id: "pubg-2", gameId: "pubg-mobile", name: "325 UC", price: 70000, originalPrice: 75000, promoLabel: "Best Seller", sortOrder: 2 },
  { id: "pubg-3", gameId: "pubg-mobile", name: "660 UC", price: 140000, originalPrice: 150000, promoLabel: "Hemat", sortOrder: 3 },

  // Valorant
  { id: "val-1", gameId: "valorant", name: "125 VP", price: 15000, sortOrder: 1 },
  { id: "val-2", gameId: "valorant", name: "420 VP", price: 45000, originalPrice: 50000, promoLabel: "🔥 Promo", sortOrder: 2 },
  { id: "val-3", gameId: "valorant", name: "700 VP", price: 80000, sortOrder: 3 },

  // Genshin Impact
  { id: "gi-1", gameId: "genshin-impact", name: "60 Genesis Crystals", price: 15000, sortOrder: 1 },
  { id: "gi-2", gameId: "genshin-impact", name: "300 Genesis Crystals", price: 68000, originalPrice: 75000, promoLabel: "Hemat", sortOrder: 2 },
  { id: "gi-3", gameId: "genshin-impact", name: "980 Genesis Crystals", price: 250000, sortOrder: 3 },

  // Honkai Star Rail
  { id: "hsr-1", gameId: "honkai-star-rail", name: "60 Oneiric Shards", price: 15000, sortOrder: 1 },
  { id: "hsr-2", gameId: "honkai-star-rail", name: "300 Oneiric Shards", price: 69000, originalPrice: 75000, promoLabel: "🔥 Promo", sortOrder: 2 },

  // Call of Duty Mobile
  { id: "codm-1", gameId: "call-of-duty-mobile", name: "80 CP", price: 15000, sortOrder: 1 },
  { id: "codm-2", gameId: "call-of-duty-mobile", name: "420 CP", price: 65000, originalPrice: 75000, promoLabel: "Best Seller", sortOrder: 2 },

  // Roblox
  { id: "rblx-1", gameId: "roblox", name: "80 Robux", price: 15000, sortOrder: 1 },
  { id: "rblx-2", gameId: "roblox", name: "400 Robux", price: 70000, originalPrice: 75000, promoLabel: "Hemat", sortOrder: 2 },
];
