import React, { useState, useEffect } from 'react';
import { Copy, Sparkles, Wand2, CheckCircle2, Shirt, Footprints, Briefcase, Layers, LayoutGrid, Camera, UploadCloud, Scissors, Ghost, Palette, Gamepad2, Smartphone } from 'lucide-react';

// --- HELPER FUNGSI WARNA ---
function hslToHex(h, s, l) {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = n => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

const generateSensiblePalette = () => {
  const baseHue = Math.floor(Math.random() * 360);
  const isDark = Math.random() > 0.5;
  const baseL = isDark ? 15 + Math.random() * 20 : 75 + Math.random() * 15; 
  const baseS = 30 + Math.random() * 50; 
  const color1 = hslToHex(baseHue, baseS, baseL);
  const secHue = (baseHue + (Math.random() > 0.5 ? 30 : -30) + 360) % 360;
  const secS = 10 + Math.random() * 20; 
  const secL = isDark ? 65 + Math.random() * 20 : 25 + Math.random() * 20; 
  const color2 = hslToHex(secHue, secS, secL);
  const accentHue = (baseHue + 180 + (Math.random() * 40 - 20)) % 360; 
  const accentS = 70 + Math.random() * 30; 
  const accentL = 45 + Math.random() * 15; 
  const color3 = hslToHex(accentHue, accentS, accentL);
  return [color1, color2, color3];
};

// --- DATA & KONSTANTA ---

const FASHION_CATEGORIES = {
  "Luxury": { description: "Elegant, premium materials, high-end couture finish", brands: ['Versace', 'Louis Vuitton', 'Balenciaga', 'Gucci', 'Prada', 'Dior', 'Hermès', 'Chanel', 'Goyard', 'Coach', 'Tumi', 'MCM', 'Fendi', 'Givenchy', 'YSL'] },
  "Sport": { description: "Athletic, aerodynamic, functional sportswear materials", brands: ['Nike', 'Adidas', 'Puma', 'New Balance', 'Reebok', 'Asics', 'Under Armour', 'Salomon'] },
  "Streetwear": { description: "Urban, hype, contemporary streetwear, dystopian earth-tones", brands: ['Yeezy', 'Air Jordan', 'Crocs', 'Off-White', 'Supreme', 'Palace', 'Thrasher', 'Mastermind Japan', 'Stussy', 'BAPE', 'Fear of God', 'Converse', 'Vans', 'Dr. Martens'] },
  "Cyber / Tech": { description: "Futuristic utility, tactical streetwear, cyberpunk aesthetic", brands: ['Machine 56', 'Acronym', 'HAMCUS', 'NILmance', 'Y-3'] },
  "Outdoor / Gorpcore": { description: "Utilitarian gorpcore, weather-ready, rugged survival aesthetic", brands: ['The North Face', 'Patagonia', 'Stone Island', "Arc'teryx", 'Timberland', 'Eiger', 'Kalibre', 'Arei'] },
  "Local Pride": { description: "Indonesian local pride, quality craftsmanship, urban street style", brands: ['Compass', 'Brodo', 'Ventela', 'Piero', 'Geoff Max', 'Patrobas', 'Nah Project', 'Wakai', 'Ortuseight', '910 Nineten', 'League', 'Mills'] }
};

const ALL_BRANDS = Object.values(FASHION_CATEGORIES).flatMap(c => c.brands).sort();

const COLLAB_ARTISTS = {
  "None": "",
  "Takashi Murakami": "featuring Takashi Murakami's signature smiling flower motifs, vibrant superflat pop-art patterns",
  "KAWS": "featuring KAWS signature 'XX' eyes motifs, companion character graphics, pop-art streetwear vibe",
  "Travis Scott": "Travis Scott Cactus Jack aesthetic, grungy earthy tones, iconic paisley bandana patterns, reverse logo elements",
  "Virgil Abloh": "Virgil Abloh design language, deconstructed elements, signature zip-ties, quotation marks typography",
  "Michael Jordan": "classic Michael Jordan heritage, iconic elephant print panels, varsity athletic elements",
  "Kanye West": "Kanye West minimalist dystopian aesthetic, monochromatic heavy fabrics, avant-garde mysterious vibe",
  "Pharrell Williams": "Pharrell Williams Human Race aesthetic, bold typography, vibrant color blocking",
  "Hiroshi Fujiwara": "Hiroshi Fujiwara Fragment Design aesthetic, minimalist styling, signature lightning bolt logo",
  "John Varvatos": "John Varvatos rock 'n' roll aesthetic, distressed vintage leather textures, dark rebellious edge, antique hardware elements"
};

const COLLAB_IPS = {
  "None": [],
  "Custom IP (Type Manual)": [],
  "Naruto": ["Naruto Sage Mode Robes", "Sasuke Uchiha Rogue Ninja Outfit", "Akatsuki Cloak Aesthetic", "Kakashi Anbu Tactical Gear", "Jiraiya Toad Sage Kabuki Outfit", "Itachi Uchiha Akatsuki Cloak", "Madara Uchiha Samurai Armor"],
  "One Piece": ["Monkey D. Luffy Gear 5 White Aesthetic", "Roronoa Zoro Green Samurai Robes", "Trafalgar Law Heart Pirates Coat", "Kaido Beast Pirates Overcoat", "Sanji Raid Suit Stealth Black", "Nami Thief Cat Outfit", "Shanks Pirate Captain Cloak"],
  "Star Wars": ["Darth Vader Sith Armor", "Stormtrooper Plasteel Armor", "Mandalorian Beskar Armor", "Jedi Knight Desert Robes", "Boba Fett Bounty Hunter Armor", "Kylo Ren Supreme Leader Outfit", "Darth Maul Sith Robes & Tattoos", "Ahsoka Tano Rebel Outfit", "Obi-Wan Kenobi Jedi Master Robes"],
  "Marvel": ["Spider-Man Webbed Suit", "Iron Man Tech Armor", "Venom Symbiote Texture", "Deadpool Mercenary Suit", "Captain America Super Soldier Uniform", "Thor Asgardian Armor", "Black Panther Vibranium Habit", "Wolverine Yellow/Blue X-Men Suit", "Ghost Rider Flaming Leather Jacket", "Punisher Skull Vest Aesthetic"],
  "DC": ["Batman Batsuit Armor", "The Joker Purple Suit Aesthetic", "Superman Kryptonian Suit", "The Flash Speedster Suit", "Wonder Woman Themyscira Armor", "Aquaman Atlantean Scale Mail", "Green Lantern Power Ring Suit", "Cyborg Apokoliptian Tech Armor", "Nightwing Blüdhaven Suit"],
  "The Simpsons": ["Homer Simpson Donut Motif", "Bart Simpson Graffiti", "Krusty Burger Uniform"],
  "Pokemon": ["Pikachu Electric Volt", "Charizard Flame", "Gengar Ghost Shadow", "Mewtwo Psychic"],
  "Digimon": ["Agumon / Greymon Evolution", "Omegamon Holy Knight", "Angemon Divine"],
  "NASA": ["Space Shuttle Spacesuit", "Apollo Astronaut", "NASA Jet Propulsion Lab"],
  "RTFKT": ["Clone X Avatar", "MNLTH Sneaker Box", "RTFKT Cyberpunk Entity"],
  "Gundam": ["Gundam RX-78-2", "Zaku II", "Rick Dom", "Sazabi", "Sinanju", "Unicorn Gundam", "ASW-G-08 Gundam Barbatos", "GN-001 Gundam Exia", "ZGMF-X10A Freedom Gundam"],
  "Automotive & Racing": ["Porsche Design", "BMW M Motorsport", "Scuderia Ferrari", "Gulf Racing", "Martini Racing", "Harley-Davidson", "Ducati Corse", "Mooneyes", "Liberty Walk (LBWK)"],
  "Energy Drinks": ["Red Bull Racing", "Monster Energy", "Rockstar Energy"],
  "Assassin's Creed": ["Ezio Auditore Renaissance Robes", "Altaïr Levantine Assassin Robes", "Connor Kenway Colonial Assassin Robes", "Edward Kenway Pirate Assassin Coat", "Kassandra Misthios Spartan Armor", "Eivor Raven Clan Armor", "Basim Hidden Ones Robes", "Evie Frye Victorian Assassin Outfit", "Jacob Frye Syndicate Coat", "Aya Master Assassin Outfit", "Bayek of Siwa Medjay Gear", "Arno Dorian French Revolution Robes", "Shay Cormac Templar Overcoat", "Desmond Miles Modern Assassin Hoodie"],
  "Resident Evil": ["Leon S. Kennedy R.P.D. Tactical Uniform", "Leon S. Kennedy Bomber Jacket", "Claire Redfield Red Leather Jacket", "Chris Redfield BSAA Tactical Gear", "Jill Valentine S.T.A.R.S. Uniform", "Ada Wong Red Dress Aesthetic", "Albert Wesker Midnight Trench Coat", "Nemesis T-Type Restraint Gear", "Lady Dimitrescu Vintage White Gown", "Mr. X Tyrant Fedora & Trench Coat", "Tyrant T-103", "Licker Exposed Muscle Aesthetic", "Hunter Bio-Weapon Texture", "William Birkin G-Virus Mutation"],
  "Final Fantasy": ["Cloud Strife SOLDIER Uniform", "Sephiroth Silver Hair & Black Coat", "Aerith Gainsborough Pink Dress Aesthetic", "Tifa Lockhart Brawler Outfit", "Barret Wallace AVALANCHE Vest", "Zack Fair SOLDIER 1st Class Uniform", "Vincent Valentine Crimson Cloak", "Yuffie Kisaragi Ninja Gear", "Cid Highwind Pilot Goggles & Jacket", "Red XIII Cosmo Beast Aesthetic", "Cait Sith Fortune Teller Look", "Reno Turks Suit & Goggles", "Rude Turks Suit & Sunglasses", "Elena Turks Uniform"]
};

// DATABASE WARNA IP CHARACTERS
const IP_CHARACTER_COLOR_DNA = {
  "Naruto Sage Mode Robes": ['#FF4500', '#000000', '#FF0000'], "Sasuke Uchiha Rogue Ninja Outfit": ['#4B0082', '#000000', '#C0C0C0'], "Akatsuki Cloak Aesthetic": ['#000000', '#FF0000', '#FFFFFF'], "Kakashi Anbu Tactical Gear": ['#2F4F4F', '#000000', '#808080'], "Jiraiya Toad Sage Kabuki Outfit": ['#FF0000', '#F5DEB3', '#008000'], "Itachi Uchiha Akatsuki Cloak": ['#000000', '#FF0000', '#800000'], "Madara Uchiha Samurai Armor": ['#00008B', '#000000', '#191970'],
  "Monkey D. Luffy Gear 5 White Aesthetic": ['#FFFFFF', '#FFD700', '#8A2BE2'], "Roronoa Zoro Green Samurai Robes": ['#006400', '#000000', '#FFFFFF'], "Trafalgar Law Heart Pirates Coat": ['#000000', '#FFFF00', '#FFFFFF'], "Kaido Beast Pirates Overcoat": ['#8B0000', '#000000', '#4B0082'], "Sanji Raid Suit Stealth Black": ['#000000', '#FFFF00', '#FF4500'], "Nami Thief Cat Outfit": ['#FFA500', '#00FFFF', '#FFFFFF'], "Shanks Pirate Captain Cloak": ['#000000', '#FFFFFF', '#FF0000'],
  "Darth Vader Sith Armor": ['#000000', '#2F4F4F', '#FF0000'], "Stormtrooper Plasteel Armor": ['#FFFFFF', '#000000', '#808080'], "Mandalorian Beskar Armor": ['#C0C0C0', '#808080', '#8B4513'], "Jedi Knight Desert Robes": ['#F5F5DC', '#8B4513', '#00FF00'], "Boba Fett Bounty Hunter Armor": ['#556B2F', '#8B4513', '#FF4500'], "Kylo Ren Supreme Leader Outfit": ['#000000', '#FF0000', '#C0C0C0'], "Darth Maul Sith Robes & Tattoos": ['#FF0000', '#000000', '#8B0000'], "Ahsoka Tano Rebel Outfit": ['#FFA500', '#FFFFFF', '#0000FF'], "Obi-Wan Kenobi Jedi Master Robes": ['#F5DEB3', '#8B4513', '#0000FF'],
  "Spider-Man Webbed Suit": ['#FF0000', '#0000FF', '#000000'], "Iron Man Tech Armor": ['#8B0000', '#FFD700', '#C0C0C0'], "Venom Symbiote Texture": ['#000000', '#FFFFFF', '#4B0082'], "Deadpool Mercenary Suit": ['#FF0000', '#000000', '#808080'], "Captain America Super Soldier Uniform": ['#0000FF', '#FF0000', '#FFFFFF'], "Thor Asgardian Armor": ['#C0C0C0', '#0000FF', '#FFD700'], "Black Panther Vibranium Habit": ['#000000', '#800080', '#C0C0C0'], "Wolverine Yellow/Blue X-Men Suit": ['#FFFF00', '#000000', '#FF0000'], "Ghost Rider Flaming Leather Jacket": ['#FF4500', '#000000', '#C0C0C0'], "Punisher Skull Vest Aesthetic": ['#000000', '#FFFFFF', '#808080'],
  "Batman Batsuit Armor": ['#000000', '#404040', '#FFFF00'], "The Joker Purple Suit Aesthetic": ['#4B0082', '#32CD32', '#FFFFFF'], "Superman Kryptonian Suit": ['#0000FF', '#FF0000', '#FFD700'], "The Flash Speedster Suit": ['#FF0000', '#FFD700', '#FFFFFF'], "Wonder Woman Themyscira Armor": ['#FF0000', '#0000FF', '#FFD700'], "Aquaman Atlantean Scale Mail": ['#008000', '#FFA500', '#FFD700'], "Green Lantern Power Ring Suit": ['#008000', '#000000', '#FFFFFF'], "Cyborg Apokoliptian Tech Armor": ['#C0C0C0', '#000000', '#FF0000'], "Nightwing Blüdhaven Suit": ['#000000', '#0000FF', '#FFFFFF']
};

const BRAND_PATTERNS = {
  "Louis Vuitton": ["Monogram Canvas", "Damier Ebene", "Damier Azur", "Epi Leather", "Multicolore Monogram"],
  "Gucci": ["GG Supreme Canvas", "Guccissima Leather", "Flora Print", "Web Stripe Ribbon"],
  "Dior": ["Dior Oblique Canvas", "Cannage Stitching", "Toile de Jouy"],
  "Goyard": ["Goyardine Chevron Canvas"],
  "Chanel": ["Classic Diamond Quilting", "Chevron Quilting", "Tweed Texture"],
  "Prada": ["Saffiano Leather Texture", "Tessuto Nylon", "Symbole Jacquard"],
  "Versace": ["Baroque Print", "Greca Pattern", "Medusa Amplified"],
  "Coach": ["Signature C Canvas", "Pebbled Leather"],
  "BAPE": ["1st Camo", "ABC Camo", "Color Camo", "Baby Milo Monogram"],
  "MCM": ["Visetos Monogram Canvas"],
  "Fendi": ["Zucca FF Monogram", "Pequin Stripe"],
  "Givenchy": ["4G Monogram"],
  "YSL": ["Chevron Quilted Leather", "Cassandre YSL Logo Pattern"],
  "Palace": ["Tri-Ferg Logo Repeat", "Palace Linear Typography"],
  "Thrasher": ["Skategoat Pentagram", "Flame Logo Print"]
};

const ARTIST_PATTERNS = {
  "Travis Scott": ["Cactus Jack Paisley Bandana", "Mocha Camouflage", "Cactus Jack Cross Motif"],
  "Takashi Murakami": ["Smiling Flowers All-Over", "Superflat Skulls", "Jellyfish Eyes Camo"],
  "KAWS": ["Companion XX Monogram", "Chum Character Pattern", "Tension Abstract Motif"],
  "Virgil Abloh": ["Diagonal Hazard Stripes", "Quotation Marks Monogram", "Arrow Cross Pattern"],
  "Hiroshi Fujiwara": ["Fragment Lightning Bolt Monogram"]
};

const GLOBAL_PATTERNS = {
  "Basic & Modern": [
    "Solid Color (No Pattern)", "Adaptive Camouflage", "Digital Camouflage", "Tie-Dye"
  ],
  "Nusantara (Indonesia)": [
    "Batik Megamendung Motif", "Batik Kawung Pattern", "Batik Parang Rusak", "Tenun Ikat Weave", "Songket Palembang Gold Thread", "Gorga Batak Carving Motif", "Minangkabau Carving Pattern", "Toraja Wood Carving Motif", "Dayak Borneo Tribal Pattern", "Papuan Asmat Tribal Motif"
  ],
  "Asian Traditional": [
    "Japanese Seigaiha Wave", "Japanese Asa-no-ha Hemp Leaf", "Chinese Dragon Motif", "Classic Paisley Pattern", "Mandala Sacred Geometry"
  ],
  "European Heritage": [
    "Tartan Plaid Checkered", "Classic Houndstooth", "Herringbone Tweed Pattern", "Damask Floral Pattern", "Argyle Diamond Pattern", "Fleur-de-lis Motif"
  ],
  "Native Americas": [
    "Navajo Geometric Pattern", "Aztec Stepped Motif", "Pendleton Tribal Native", "Chimayo Woven Textile"
  ],
  "African & Middle East": [
    "Kente Cloth Geometric", "Mudcloth (Bogolanfini) Abstract", "Moroccan Arabesque Tile", "Kilim Woven Geometric"
  ]
};

const BRAND_COLOR_DNA = {
  'Versace': ['#000000', '#D4AF37', '#FFFFFF'], 'Yeezy': ['#C2B280', '#556B2F', '#8B4513'], 'Off-White': ['#FFFFFF', '#000000', '#FFD700'], 
  'Supreme': ['#DA291C', '#FFFFFF', '#000000'], 'Mastermind Japan': ['#000000', '#FFFFFF', '#404040'], 'Balenciaga': ['#000000', '#39FF14', '#C0C0C0'], 
  'Gucci': ['#175E36', '#B22222', '#D4AF37'], 'Louis Vuitton': ['#5C4033', '#C2B280', '#D4AF37'], 'Dior': ['#B0C4DE', '#808080', '#FFFFFF'], 
  'Prada': ['#000000', '#FFFFFF', '#FF0000'], 'Adidas': ['#000000', '#FFFFFF', '#0047AB'], 'Nike': ['#FF6600', '#000000', '#FFFFFF'], 
  'Puma': ['#000000', '#FFFFFF', '#DA291C'], 'New Balance': ['#808080', '#C0C0C0', '#000000'], 'Reebok': ['#FFFFFF', '#000000', '#E21A2C'], 'Asics': ['#000000', '#FFFFFF', '#00529B'], 'Under Armour': ['#000000', '#808080', '#FF0000'], 'Salomon': ['#8B4513', '#A9A9A9', '#2F4F4F'], 
  'Stussy': ['#000000', '#FFFFFF', '#FF69B4'], 'BAPE': ['#556B2F', '#8B4513', '#FFFF00'], 'Fear of God': ['#F5F5DC', '#808080', '#000000'], 'Converse': ['#FFFFFF', '#000000', '#FF0000'], 'Vans': ['#000000', '#FFFFFF', '#FF0000'], 'Dr. Martens': ['#000000', '#FFC000', '#8B0000'], 'Air Jordan': ['#CE1141', '#000000', '#FFFFFF'], 'Crocs': ['#000000', '#808080', '#FFFFFF'],
  'Compass': ['#F5F5DC', '#000000', '#C19A6B'], 'Brodo': ['#8B4513', '#000000', '#FFFFFF'], 'Ventela': ['#000000', '#FFFFFF', '#FFD700'], 'Piero': ['#000000', '#FFFFFF', '#FF0000']
};

const ARTIST_COLOR_DNA = {
  "Takashi Murakami": ['#FF69B4', '#00FFFF', '#FFFF00'], "KAWS": ['#808080', '#000000', '#FF007F'], "Travis Scott": ['#624C3C', '#F8CCDF', '#E51C2B'], 
  "Virgil Abloh": ['#FFFFFF', '#000000', '#FF4500'], "Michael Jordan": ['#CE1141', '#000000', '#FFFFFF'], "Kanye West": ['#8B8682', '#4A4A4A', '#000000']
};

const AESTHETIC_COLOR_DNA = {
  "Opiumcore": ['#000000', '#2E0014', '#C0C0C0'], "Gothic": ['#000000', '#8A0303', '#FFFFFF'], "Vampirecore": ['#8B0000', '#000000', '#4A0000'], "Witchcore": ['#301934', '#000000', '#228B22'], "Decadentcore": ['#F7E7CE', '#FFFFFF', '#BDB76B'], "Heroin Chic": ['#EAEAEA', '#1A1A1A', '#808080'],
  "Angelcore": ['#FFFFFF', '#FFD700', '#AFEEEE'], "Fairycore": ['#98FB98', '#C8A2C8', '#FFB6C1'], "Etherealcore": ['#F5F5F5', '#E6E6FA', '#C0C0C0'], "Dreamcore": ['#FFB6C1', '#87CEEB', '#9370DB'],
  "Cottagecore": ['#FFFDD0', '#8A9A5B', '#F5DEB3'], "Farmcore": ['#1560BD', '#E4D96F', '#CB4154'], "Goblincore": ['#4A5D23', '#654321', '#D2B48C'], "Forestpunk": ['#4A3728', '#228B22', '#FFFFF0'], "Desertcore": ['#C2B280', '#E2725B', '#F4A460'],
  "Dark Academia": ['#4B3621', '#36454F', '#013220'], "Light Academia": ['#F5F5DC', '#E0D6C8', '#A0522D'], "Royalcore": ['#9E1B32', '#D4AF37', '#4169E1'], "Regencycore": ['#98FF98', '#FFDAB9', '#FFFDD0'], "Old Money": ['#000080', '#FFFDD0', '#228B22'], "Coquette / Lolita": ['#F4C2C2', '#FFFFFF', '#FF6961'],
  "Cyberpunk": ['#00FFFF', '#FF00FF', '#C0C0C0'], "Synthwave / Retrowave": ['#FF00FF', '#00FFFF', '#301934'], "AIcore": ['#FFFFFF', '#00BFFF', '#C0C0C0'], "Glitchcore": ['#B0FF00', '#FF00FF', '#FFFF00'], "Frutiger Aero": ['#00FFFF', '#00FF00', '#FFFFFF'],
  "Y2K": ['#C0C0C0', '#FF69B4', '#89CFF0'], "Pastel Goth": ['#C8A2C8', '#000000', '#F4C2C2'], "Art Hoe": ['#FFDB58', '#EAE6CA', '#1560BD'], "Kidcore": ['#FF0000', '#0000FF', '#FFFF00'], "Clowncore": ['#FF0000', '#FFFF00', '#000000'], "Weirdcore": ['#E6E600', '#808080', '#8B0000']
};

const AESTHETIC_THEMES = {
  "None (Standard Fashion)": null,
  "Opiumcore": { group: "🖤 Tema Gelap & Gotik", clothing: "Renda hitam transparan, korset beludru, kain satin gelap, mutiara", lighting: "Sinematik, moody, bayangan lembut dengan sorotan keemasan", makeup: "Melankolis namun menggoda, eyeliner luntur, bibir merah tua/plum", background: "Sarang opium abad ke-19 berpadu gotik modern (botol opium, cermin antik, lilin)" },
  "Gothic": { group: "🖤 Tema Gelap & Gotik", clothing: "Renda hitam, kerah tinggi, perhiasan salib perak, sepatu bot era Victoria", lighting: "Cahaya lilin redup atau cahaya bulan yang menciptakan bayangan dalam", makeup: "Tegas dan kuat, alas bedak pucat, eyeliner dramatis, lipstik gelap", background: "Reruntuhan katedral atau manor gotik (lengkungan gotik, tengkorak, kaca patri)" },
  "Vampirecore": { group: "🖤 Tema Gelap & Gotik", clothing: "Beludru merah darah, jubah hitam, korset, perhiasan gotik perak", lighting: "Dramatis dan berbayang, seperti cahaya bulan menembus tirai renda", makeup: "Memikat dan berbahaya, kulit porselen, smokey eyes, bibir merah tua", background: "Kastil gotik atau kamar vampir kuno (kandelabra, lukisan tua, tirai merah)" },
  "Witchcore": { group: "🖤 Tema Gelap & Gotik", clothing: "Jubah gelap menjuntai, kain berlapis, topi lebar, perhiasan jimat", lighting: "Cahaya lilin dengan pendaran magis", makeup: "Misterius, eyeliner gelap, lukisan wajah berbentuk rune (simbol)", background: "Sarang penyihir atau apotek magis (bola kristal, buku mantra, rempah-rempah)" },
  "Decadentcore": { group: "🖤 Tema Gelap & Gotik", clothing: "Jubah sutra, sarung tangan bernoda sampanye, syal bulu, perhiasan antik", lighting: "Mewah dan keemasan, tersaring melalui tirai", makeup: "Penuh kenikmatan namun kelelahan, shimmer emas, pipi merona", background: "Perkebunan bangsawan yang runtuh (gelas anggur setengah kosong, mawar layu)" },
  "Heroin Chic": { group: "🖤 Tema Gelap & Gotik", clothing: "Slip dress kedodoran, jaket kulit, atasan jaring, sepatu bot usang", lighting: "Fotografi flash kontras tinggi dengan nuansa grunge urban", makeup: "Linglung dan cuek, bayangan di bawah mata, kulit pucat, riasan luntur", background: "Loft kota bawah tanah era 90-an (dinding grafiti, kasur berantakan)" },

  "Angelcore": { group: "✨ Tema Fantasi & Surgawi", clothing: "Gaun sutra putih, aksesori bulu, kerudung halus, perhiasan perak", lighting: "Surgawi dan berpendar lembut (efek halo)", makeup: "Damai, kulit bercahaya, kilauan warna-warni, bibir merah muda pucat", background: "Alam surgawi atau katedral (motif awan, bulu beterbangan)" },
  "Fairycore": { group: "✨ Tema Fantasi & Surgawi", clothing: "Rok sifon pastel, sayap berkilau, mahkota bunga, atasan iridescent", lighting: "Cahaya peri alami yang lembut dan seperti mimpi", makeup: "Penuh rasa ingin tahu, aksen bintang/bunga di wajah, riasan berkilau", background: "Hutan ajaib (lingkaran jamur, lentera bercahaya, bunga liar)" },
  "Etherealcore": { group: "✨ Tema Fantasi & Surgawi", clothing: "Kain tipis melambai, jubah warna-warni, kerudung bersulam, kristal", lighting: "Backlight yang berpendar lembut, efek halo surealis", makeup: "Tenang, sorotan holografik, kelopak mata berkilau, bibir pucat glossy", background: "Alam mimpi atau kosmik (bola melayang, kabut perak, rune bercahaya)" },
  "Dreamcore": { group: "✨ Tema Fantasi & Surgawi", clothing: "Baju tidur, jubah melambai, motif surealis, aksesori aneh", lighting: "Lembut namun surealis (cahaya bulan atau merah muda berkabut)", makeup: "Jauh dan bernostalgia, permata berbentuk air mata, kilau lembut", background: "Ruang mimpi jernih (lucid dream) atau ruang liminal (kasur awan, objek aneh)" },

  "Cottagecore": { group: "🌿 Tema Alam & Pedesaan", clothing: "Gaun motif bunga yang mengalir, celemek linen, topi jerami, blus renda", lighting: "Alami dan lembut seperti sinar matahari golden hour", makeup: "Hangat, pipi merona, bintik-bintik (freckles), bibir glossy", background: "Pondok pedesaan yang vintage (bunga liar, perabot kayu)" },
  "Farmcore": { group: "🌿 Tema Alam & Pedesaan", clothing: "Overall denim, kemeja kotak-kotak, sepatu bot karet, topi jerami", lighting: "Sinar mentari pagi yang cerah dan hangat", makeup: "Ceria dan membumi, sedikit kecokelatan (tan), riasan minimalis", background: "Peternakan pedesaan (tumpukan jerami, kandang ayam, sayuran segar)" },
  "Goblincore": { group: "🌿 Tema Alam & Pedesaan", clothing: "Pakaian berlapis warna lumut, kain perca, perhiasan bertema kumbang", lighting: "Redup dan membumi (hijau dan cokelat lembut)", makeup: "Jahil, pipi bernoda tanah, warna kulit alami", background: "Sudut hutan yang berantakan (batu, tulang, lumut, barang temuan mengkilap)" },
  "Forestpunk": { group: "🌿 Tema Alam & Pedesaan", clothing: "Jubah berlumut, baju zirah mirip kulit kayu, aksesori tanduk", lighting: "Cahaya hutan yang belang-belang dengan bayangan dalam", makeup: "Liar dan primitif, cat wajah warna bumi, tekstur kulit kayu", background: "Kuil hutan kuno atau hutan druid (cabang tumbang, kabut, batu berjamur)" },
  "Desertcore": { group: "🌿 Tema Alam & Pedesaan", clothing: "Linen cokelat longgar, syal gurun, perhiasan tulang, sabuk kulit", lighting: "Sinar matahari keemasan yang terik dengan filter berdebu", makeup: "Tangguh, sorotan berdebu pasir, kulit kecokelatan karena matahari", background: "Reruntuhan gurun atau kemah nomaden (tulang, tanaman kering, batu pasir)" },

  "Dark Academia": { group: "🏛️ Tema Akademis & Klasik", clothing: "Mantel wol, turtleneck, celana lipit, tas kulit, sepatu Oxford", lighting: "Hangat berona kuning, meniru lampu meja antik", makeup: "Penuh pikiran, riasan minimalis bernuansa natural", background: "Perpustakaan universitas klasik (buku tua, meja berlilin, patung dada)" },
  "Light Academia": { group: "🏛️ Tema Akademis & Klasik", clothing: "Kardigan krem, rok lipit, blus linen, sepatu kulit lembut", lighting: "Sinar matahari hangat yang menembus jendela (golden hour)", makeup: "Cerdas dan suka melamun, blush on tipis, bibir lembut", background: "Ruang belajar bercahaya atau sekolah seni (buku catatan, bunga pres)" },
  "Royalcore": { group: "🏛️ Tema Akademis & Klasik", clothing: "Gaun berornamen, kain brokat, tiara emas, jubah bersulam", lighting: "Megah dan bercahaya seperti sinar dari kaca patri", makeup: "Mulia dan tenang, klasik dengan kilau emas dan bibir merah", background: "Istana atau ruang dansa fantasi sejarah (takhta, lampu gantung, beludru)" },
  "Regencycore": { group: "🏛️ Tema Akademis & Klasik", clothing: "Gaun empire-waist, sarung tangan panjang, kipas renda, sepatu hak", lighting: "Cahaya lilin yang lembut dan lampu gantung keemasan", makeup: "Elegan, kulit dibedaki, pipi merona, bibir natural", background: "Perkebunan ala serial Bridgerton (lantai dansa, set teh)" },
  "Old Money": { group: "🏛️ Tema Akademis & Klasik", clothing: "Blazer tailored, sweter kasmir, mutiara, sepatu loafer kulit", lighting: "Lembut dan mewah dengan nuansa emas antik", makeup: "Tenang dan anggun, kulit mulus, glamor yang minimal", background: "Perkebunan pribadi atau kapal pesiar (lantai marmer, botol kristal)" },
  "Coquette / Lolita": { group: "🏛️ Tema Akademis & Klasik", clothing: "Blus berenda, pita satin, lengan puff, kaus kaki renda, korset vintage", lighting: "Siang hari yang lembut dengan filter kemerahan", makeup: "Pemalu tapi genit, kulit dewy, pipi sangat merona, bibir glossy", background: "Kamar tidur vintage (cermin bentuk hati, bantal empuk, surat cinta)" },

  "Cyberpunk": { group: "💻 Tema Futuristik & Cyber", clothing: "Jaket kulit beraksen neon, visor reflektif, setelan jaring, aksesori teknologi", lighting: "Lampu neon tajam, bayangan keras, rona biru-merah muda yang dingin", makeup: "Intens, sorotan holografik, eyeliner tebal dengan aksen menyala", background: "Gang neon yang kotor atau lab mode berteknologi tinggi (layar LED, hologram)" },
  "Synthwave / Retrowave": { group: "💻 Tema Futuristik & Cyber", clothing: "Jaket neon, sarung tangan buntung, stoking pola grid, kacamata hitam 80-an", lighting: "Gradien merah muda dan biru neon dengan pantulan lantai berpola grid", makeup: "Keren dan cuek, lip gloss mengkilap, kontur gaya 80-an", background: "Arkade retro-futuristik (monitor CRT, synthesizer, pohon palem di bawah neon)" },
  "AIcore": { group: "💻 Tema Futuristik & Cyber", clothing: "Bodysuit monokrom, sirkuit sebagai perhiasan, zirah siber minimalis", lighting: "Putih klinis yang dingin dengan aksen neon biru", makeup: "Tanpa emosi, ramping, rona metalik dingin, implan pipi bercahaya", background: "Lab AI futuristik atau ruang server (dinding kaca steril, aliran data)" },
  "Glitchcore": { group: "💻 Tema Futuristik & Cyber", clothing: "Cetakan berpiksel, desain asimetris, visor augmented", lighting: "Kedipan RGB yang rusak (glitchy) dan overlay yang terdistorsi", makeup: "Terfragmentasi, efek pecahan kaca, pemisahan kanal warna di kulit", background: "Ruang virtual atau sistem yang rusak (crash zone, layar korup)" },
  "Frutiger Aero": { group: "💻 Tema Futuristik & Cyber", clothing: "Jaket puffer glossy, aksesori plastik, motif bertema langit/air", lighting: "Terang, bersih, dan seperti korporat", makeup: "Terlihat di-airbrush, sangat generik dengan kilau khas Y2K", background: "Iklan teknologi tahun 2000-an (tetesan air, bola mengambang, tanaman hijau)" },

  "Y2K": { group: "🎨 Pop Culture & Surealisme", clothing: "Jeans low-rise, crop top mengkilap, tas mini, sepatu kets platform", lighting: "Flash yang kuat, glossy, dengan filter kilauan (sparkle)", makeup: "Trendi dan riang, perona mata frosted, bibir mengkilap, berlian imitasi", background: "Pemotretan majalah remaja tahun 2000-an (ponsel lipat, jepit kupu-kupu)" },
  "Pastel Goth": { group: "🎨 Pop Culture & Surealisme", clothing: "Rok pastel, atasan jaring motif gaib, sepatu platform, choker berduri", lighting: "Neon pastel dan ungu lembut, moody tapi imut", makeup: "Main-main tapi seram, eyeliner hitam pekat bersayap kelelawar, lipstik hitam", background: "Ruang hantu kawaii (tengkorak pastel, pentagram, boneka bertaring)" },
  "Art Hoe": { group: "🎨 Pop Culture & Surealisme", clothing: "Overall berbercak cat, kaus kebesaran, tote bag kanvas, aksesori cerah", lighting: "Sinar matahari yang masuk melalui jendela studio", makeup: "Ekspresif, minimalis dengan titik-titik cat di wajah", background: "Studio seni atau asrama kreatif (kanvas, kuas, cetakan Van Gogh)" },
  "Kidcore": { group: "🎨 Pop Culture & Surealisme", clothing: "Overall warna primer, kemeja kartun, perhiasan manik-manik, sepatu velcro", lighting: "Terang dan tersaturasi tinggi seperti kartun era 90-an", makeup: "Penuh sukacita, riasan mata warna-warni, stiker, glitter", background: "Ruang bermain anak 90-an (mainan, krayon, poster alfabet)" },
  "Clowncore": { group: "🎨 Pop Culture & Surealisme", clothing: "Setelan polkadot kebesaran, kerutan berlebih, stoking garis, hidung merah", lighting: "Lampu sorot sirkus atau warna-warna mencolok (garish)", makeup: "Joy yang kacau atau kesedihan yang menghantui, cat wajah, air mata glitter", background: "Sirkus surealis (balon, tenda bergaris, instrumen mainan)" },
  "Weirdcore": { group: "🎨 Pop Culture & Surealisme", clothing: "Pola tidak serasi, cetakan surealis, barang bekas vintage", lighting: "Tidak wajar dan menakutkan dengan pendaran ruang liminal", makeup: "Canggung (uncanny), overlay glitch, simetri ganjil, warna tak wajar", background: "Kehampaan atau ruang liminal (lorong kosong, papan tanda aneh)" }
};

const ALL_MATS = ['Cotton / Canvas', 'Fleece / Terry', 'Heavy Drill', 'Denim', 'Corduroy', 'Leather / Faux Leather', 'Silk / Satin', 'Knit / Crochet', 'Nylon / Parachute', 'Tech-Knit / Spandex', 'Lace / Sheer Mesh', 'Ballistic Nylon', 'Carbon Fiber / Kevlar', 'Suede', 'Rubber / TPU', 'Translucent TPU / Mesh'];
const UNRESTRICTED_MATS = ALL_MATS;
const SHEER_MATS = ['Lace / Sheer Mesh', 'Silk / Satin', 'Translucent TPU / Mesh']; 
const HARD_MATS = ['Leather / Faux Leather', 'Ballistic Nylon', 'Carbon Fiber / Kevlar', 'Suede', 'Rubber / TPU', 'Cotton / Canvas', 'Denim', 'Translucent TPU / Mesh'];
const SPORT_MATS = ['Tech-Knit / Spandex', 'Nylon / Parachute', 'Rubber / TPU', 'Knit / Crochet', 'Translucent TPU / Mesh'];

// --- RESTORED SINGLE GARMENT DATABASE ---
const PRODUCTS = {
  "Apparel": {
    "Casual Wear": [
      { name: "Oversized T-Shirt", traits: "Dropped shoulders, wide boxy fit, thick collar rib, relaxed drape", allowedMats: ['Cotton / Canvas', 'Tech-Knit / Spandex', 'Knit / Crochet'] },
      { name: "Classic T-Shirt", traits: "Standard tubular fit, crewneck, comfortable everyday wear", allowedMats: ['Cotton / Canvas', 'Tech-Knit / Spandex'] },
      { name: "Polo Shirt", traits: "Ribbed collar, two or three-button placket, sporty casual fit", allowedMats: ['Cotton / Canvas', 'Tech-Knit / Spandex', 'Knit / Crochet'] },
      { name: "Button-Up Shirt (Kemeja)", traits: "Structured collar, full front button placket, cuffs, versatile silhouette", allowedMats: ['Cotton / Canvas', 'Silk / Satin', 'Denim', 'Heavy Drill'] },
      { name: "Utility Jumpsuit / Boilersuit", traits: "Full-body unified silhouette, front zip closure, structured waist, utilitarian aesthetic", allowedMats: UNRESTRICTED_MATS }
    ],
    "Bottoms (Bawahan)": [
      { name: "Tailored Trousers", traits: "High-waisted, sharp front pleats, wide straight leg", allowedMats: ['Heavy Drill', 'Cotton / Canvas', 'Silk / Satin'] },
      { name: "Cargo Pants", traits: "Baggy fit, multiple utilitarian side pockets, drawcord hems", allowedMats: ['Nylon / Parachute', 'Heavy Drill', 'Cotton / Canvas'] },
      { name: "Denim Jeans", traits: "Classic 5-pocket design, relaxed straight cut, vintage styling", allowedMats: ['Denim'] },
      { name: "Overalls / Dungarees (Baju Monyet)", traits: "Bib front, adjustable shoulder straps, full torso coverage", allowedMats: ['Denim', 'Heavy Drill', 'Corduroy'] },
      { name: "Pleated Skirt (Rok Lipit)", traits: "Sharp knife pleats, A-line flow, structured waist", allowedMats: ['Heavy Drill', 'Cotton / Canvas', 'Silk / Satin'] },
      { name: "Mini Skirt", traits: "High thigh-skimming cut, structured fitted shape", allowedMats: ['Denim', 'Leather / Faux Leather', 'Heavy Drill'] },
      { name: "Hot Pants", traits: "Ultra-short cut, bold summery aesthetic, form-fitting", allowedMats: ['Denim', 'Cotton / Canvas', 'Tech-Knit / Spandex'] },
      { name: "Maxi Skirt", traits: "Floor-sweeping length, dramatic flow, elegant drape", allowedMats: ['Silk / Satin', 'Cotton / Canvas', 'Lace / Sheer Mesh'] },
      { name: "Shorts / Bermuda", traits: "Knee-length relaxed cut, casual summer vibe", allowedMats: ['Cotton / Canvas', 'Fleece / Terry', 'Denim'] },
      { name: "Sweatpants / Joggers", traits: "Elastic waist, cuffed ankles, slouchy relaxed fit", allowedMats: ['Fleece / Terry', 'Tech-Knit / Spandex', 'Cotton / Canvas'] },
      { name: "Wide-Leg Palazzo Pants", traits: "Flowing extra wide leg, elegant high-fashion drape", allowedMats: ['Silk / Satin', 'Cotton / Canvas'] },
      { name: "Leather Pants", traits: "Sleek form-fitting or straight cut, bold glossy or matte texture", allowedMats: ['Leather / Faux Leather'] }
    ],
    "Resort & Swimwear": [
      { name: "High-Fashion One-Piece Swimwear", traits: "Form-fitting sleek bodysuit silhouette, high-fashion resort aesthetic, structured athletic cut", allowedMats: ['Tech-Knit / Spandex', 'Nylon / Parachute', 'Rubber / TPU'] },
      { name: "Resort Two-Piece Swim Set", traits: "Matching athletic top and high-waisted bottom set, chic summer resort wear, structured support", allowedMats: ['Tech-Knit / Spandex', 'Nylon / Parachute'] },
      { name: "Flowy Beach Cover-Up Robe", traits: "Lightweight draped open-front robe, relaxed summer fit, breezy movement", allowedMats: ['Silk / Satin', 'Lace / Sheer Mesh', 'Cotton / Canvas', 'Translucent TPU / Mesh'] }
    ],
    "Nusantara (Indonesia)": [
      { name: "Baju Koko", traits: "Mandarin collar, subtle front embroidery, loose tunic fit", allowedMats: UNRESTRICTED_MATS },
      { name: "Beskap / Jas", traits: "Asymmetrical button front, stiff high collar", allowedMats: UNRESTRICTED_MATS },
      { name: "Kebaya", traits: "Fitted sheer-like structure, V-neck lapel", allowedMats: SHEER_MATS },
      { name: "Baju Bodo", traits: "Boxy top silhouette, short loose sleeves, semi-transparent", allowedMats: SHEER_MATS }
    ],
    "Asia & Modest": [
      { name: "Hanbok", traits: "Korean traditional attire, jeogori top with V-neck overlapping collar, wide flowing chima skirt or baji", allowedMats: UNRESTRICTED_MATS },
      { name: "Cheongsam / Qipao", traits: "Mandarin collar, asymmetrical fastening, side slits", allowedMats: UNRESTRICTED_MATS },
      { name: "Gamis / Jubbah", traits: "Long structured robe, flowing silhouette", allowedMats: UNRESTRICTED_MATS },
      { name: "Abaya / Kaftan", traits: "Floor-length flowing maxi dress, batwing wide sleeves", allowedMats: UNRESTRICTED_MATS },
      { name: "Kimono / Yukata", traits: "Wide draped sleeves, crossed overlapping collar, wide obi belt", allowedMats: UNRESTRICTED_MATS }
    ],
    "Modern & Tactical": [
      { name: "Oversized Puffer Jacket", traits: "Quilted voluminous structure, thick insulation", allowedMats: UNRESTRICTED_MATS },
      { name: "Puffer Vest (Gilet)", traits: "Sleeveless insulated vest, high neck, techwear zippers", allowedMats: ['Nylon / Parachute', 'Fleece / Terry', 'Leather / Faux Leather'] },
      { name: "Biker / Moto Jacket", traits: "Asymmetrical zip, wide lapels, metallic hardware", allowedMats: ['Leather / Faux Leather', 'Denim'] },
      { name: "Tactical Utility Vest", traits: "Multiple cargo pockets, heavy straps, buckles", allowedMats: UNRESTRICTED_MATS },
      { name: "Military Combat Jacket", traits: "Rugged army look, tactical webbing, durable", allowedMats: UNRESTRICTED_MATS }
    ],
    "Classic Outerwear": [
      { name: "Bomber Jacket (MA-1)", traits: "Nylon shell, ribbed collar and cuffs, relaxed fit", allowedMats: UNRESTRICTED_MATS },
      { name: "Heavyweight Hoodie", traits: "Thick oversized hood, kangaroo pocket", allowedMats: ['Fleece / Terry', 'Heavy Drill', 'Tech-Knit / Spandex'] },
      { name: "Windbreaker", traits: "Lightweight weather-resistant shell, hooded, elastic cuffs", allowedMats: ['Nylon / Parachute'] },
      { name: "Trucker Jacket", traits: "Point collar, button front, chest flap pockets, structured fit", allowedMats: ['Denim', 'Corduroy', 'Suede'] },
      { name: "Varsity Jacket", traits: "Contrast leather sleeves, ribbed striped collar/cuffs, chenille patches", allowedMats: ['Fleece / Terry', 'Leather / Faux Leather'] }
    ],
    "Sport & Athletics": [
      { name: "Tracktop / Tracksuit", traits: "Zip-up athletic jacket, stand collar, contrast side stripes", allowedMats: SPORT_MATS },
      { name: "Athletic Compression Top", traits: "Tight performance fabric, sporty crop silhouette, high support", allowedMats: SPORT_MATS },
      { name: "Basketball Jersey", traits: "Sleeveless breathable mesh, deep armholes, athletic cut", allowedMats: SPORT_MATS },
      { name: "Soccer Jersey", traits: "Performance fit, V-neck or crew neck, moisture-wicking tech fabric", allowedMats: SPORT_MATS }
    ]
  },
  "Footwear": {
    "New Model (Generic)": [
      { name: "Chunky Dad Sneaker", traits: "Thick oversized sole, complex multi-panel upper, retro runner vibe", allowedMats: HARD_MATS },
      { name: "Minimalist Low-Top", traits: "Clean sleek profile, flat sole, unbranded clean upper", allowedMats: HARD_MATS },
      { name: "Slip-On / Slides", traits: "Laceless open back, molded footbed, wide top strap", allowedMats: ['Rubber / TPU', 'Leather / Faux Leather', 'Fleece / Terry'] }
    ],
    "Outdoor & Tactical": [
      { name: "Gorpcore Hiking Boots", traits: "Lugged vibram outsole, quick-lace system, reinforced toe cap", allowedMats: ['Ballistic Nylon', 'Leather / Faux Leather', 'Rubber / TPU'] },
      { name: "Tactical Combat Boots", traits: "High calf cut, side zipper, heavy-duty military styling", allowedMats: HARD_MATS },
      { name: "Technical Trail Runner", traits: "Aggressive tread, aerodynamic shape, toggle laces", allowedMats: SPORT_MATS }
    ]
  },
  "Accessories": {
    "New Model (Generic)": [
      { name: "Custom Shape (Type Manual)", traits: "Unconventional custom shape", allowedMats: ALL_MATS },
      { name: "Everyday Crossbody Bag", traits: "Compact rectangular pouch, adjustable strap", allowedMats: ALL_MATS },
      { name: "Minimalist Tote Bag", traits: "Large open-top shopper bag, twin shoulder straps", allowedMats: ALL_MATS },
      { name: "Standard Duffle Bag", traits: "Cylindrical gym bag shape, top handles, side pockets", allowedMats: ALL_MATS }
    ],
    "Outdoor & Tactical": [
      { name: "Mountaineering Backpack", traits: "Large capacity, top lid, multiple hiking straps and buckles", allowedMats: ALL_MATS },
      { name: "Tactical Chest Rig", traits: "Military chest pouch, adjustable webbing straps, molle system", allowedMats: ALL_MATS },
      { name: "Obi Belt Bag", traits: "Wide waist sash integrating a sleek storage pouch, kimono styling", allowedMats: ALL_MATS }
    ]
  }
};

const ICONIC_DB = {
  "Footwear": {
    "Nike": [
      { name: "Air Force 1", traits: "Classic low-top court sneaker, perforated toe box, thick flat sole", allowedMats: HARD_MATS },
      { name: "Air Max 95", traits: "Layered anatomical upper, gradient panels, visible forefoot and heel air units", allowedMats: SPORT_MATS },
      { name: "Dunk (High / Low)", traits: "Classic hoops silhouette, paneled leather upper, flat sole", allowedMats: HARD_MATS }
    ],
    "Adidas": [
      { name: "Superstar", traits: "Iconic shell toe, leather upper, thick rubber cupsole, 3-stripes", allowedMats: HARD_MATS },
      { name: "Samba", traits: "Low-profile retro indoor soccer shoe, T-toe design, gum sole", allowedMats: HARD_MATS },
      { name: "NMD (R1)", traits: "Sock-like upper, boost midsole with colored EVA plugs", allowedMats: SPORT_MATS }
    ],
    "New Balance": [
      { name: "990 (v1-v6)", traits: "Premium suede/mesh overlays, chunky ENCAP sole, iconic dad shoe aesthetic", allowedMats: HARD_MATS },
      { name: "550", traits: "Vintage basketball low-top, perforated leather, bulky retro shape", allowedMats: HARD_MATS },
      { name: "2002R", traits: "Y2K tech runner aesthetic, intricate mesh/synthetic overlays, N-ergy sole", allowedMats: SPORT_MATS }
    ],
    "Yeezy": [
      { name: "Boost 350 V2", traits: "Minimalist slip-on runner, ribbed wide midsole, sleek primeknit shape", allowedMats: SPORT_MATS },
      { name: "Boost 700 (Wave Runner)", traits: "Chunky dad shoe profile, wavy midsole, layered suede and mesh", allowedMats: HARD_MATS },
      { name: "Foam Runner", traits: "Alien-like porous structure, single-piece molded foam design", allowedMats: ['Rubber / TPU'] }
    ],
    "Air Jordan": [
      { name: "Air Jordan 1", traits: "Iconic 85 basketball silhouette, paneled leather, wings logo, flat sole", allowedMats: HARD_MATS },
      { name: "Air Jordan 4", traits: "Mesh netting panels, plastic support wings, visible heel air", allowedMats: HARD_MATS }
    ],
    "Vans": [
      { name: "Old Skool", traits: "Iconic side stripe (jazz stripe), suede toe and heel, padded collar", allowedMats: ['Cotton / Canvas', 'Suede', 'Leather / Faux Leather'] },
      { name: "Classic Slip-On", traits: "Laceless design, elastic side accents, iconic checkerboard pattern option", allowedMats: ['Cotton / Canvas', 'Leather / Faux Leather'] }
    ],
    "Converse": [
      { name: "Chuck Taylor All Star", traits: "Classic canvas shape, rubber toe cap, flat vulcanized sole", allowedMats: ['Cotton / Canvas', 'Denim', 'Leather / Faux Leather', 'Suede'] },
      { name: "Run Star Hike", traits: "Chunky platform sole, jagged two-tone outsole, classic upper", allowedMats: HARD_MATS }
    ],
    "Balenciaga": [
      { name: "Triple S", traits: "Massive triple-stacked chunky sole, distressed oversized upper", allowedMats: HARD_MATS },
      { name: "Speed Trainer", traits: "High-top sock sneaker, minimalist elastic upper, sculpted sole", allowedMats: SPORT_MATS }
    ],
    "Crocs": [
      { name: "Classic Clog", traits: "Iconic porous foam clog, heel strap, bulky round toe, jibbitz holes", allowedMats: ['Rubber / TPU'] },
      { name: "Pollex Clog", traits: "Organic fingerprint ridge pattern, exoskeleton molded foam, utilitarian strap", allowedMats: ['Rubber / TPU'] }
    ],
    "Compass": [
      { name: "Gazelle", traits: "Classic vintage canvas sneaker, signature side wave logo, vulcanized sole", allowedMats: ['Cotton / Canvas', 'Denim', 'Suede'] }
    ]
  },
  "Accessories": {
    "Louis Vuitton": [
      { name: "Speedy", traits: "Classic doctor's bag shape, rolled leather handles, Monogram canvas", allowedMats: ALL_MATS },
      { name: "Keepall Trunk", traits: "Classic structured duffle/koper, reinforced corners, rounded handles", allowedMats: ALL_MATS }
    ],
    "Gucci": [
      { name: "Jackie 1961", traits: "Curved hobo shape, signature piston hardware closure", allowedMats: ALL_MATS },
      { name: "Dionysus", traits: "Structured accordion shape, textured tiger head spur closure, sliding chain", allowedMats: ALL_MATS }
    ],
    "Prada": [
      { name: "Re-Edition 2005", traits: "Utilitarian parachute nylon material, baguette shape, woven strap with mini pouch", allowedMats: ALL_MATS },
      { name: "Galleria", traits: "Structured rectangular shape, Saffiano leather texture, dual top handles", allowedMats: ALL_MATS }
    ],
    "Balenciaga": [
      { name: "City Bag (Motorcycle)", traits: "Slouchy shape, long leather tassels, studded hardware details", allowedMats: ALL_MATS },
      { name: "Hourglass Bag", traits: "Curved rigid bottom, sharp structural lines, top handle, B logo clasp", allowedMats: ALL_MATS }
    ],
    "The North Face": [
      { name: "Base Camp Duffel", traits: "Cylindrical heavy-duty expedition bag, alpine shoulder straps", allowedMats: ALL_MATS },
      { name: "Borealis Backpack", traits: "Bungee cord front system, multiple compartments, padded straps", allowedMats: ALL_MATS }
    ]
  }
};

const getGarmentMenuCategories = (pType) => {
  if (pType === 'Apparel') return Object.keys(PRODUCTS["Apparel"]);
  return ["Iconic Silhouette", "New Model (Generic)", "Outdoor & Tactical"];
};

const getGarmentsList = (pType, mCat, bName) => {
  if (pType === 'Apparel') {
    return PRODUCTS["Apparel"][mCat] || PRODUCTS["Apparel"]["Casual Wear"];
  } else {
    if (mCat === 'Iconic Silhouette') {
      const brandIcons = ICONIC_DB[pType]?.[bName];
      if (brandIcons && brandIcons.length > 0) return brandIcons;
      return [{ 
        name: `${bName} Signature Silhouette`, 
        traits: `Iconic and recognizable ${bName} design language and structural shape`, 
        allowedMats: HARD_MATS 
      }];
    }
    return PRODUCTS[pType][mCat] || PRODUCTS[pType]["New Model (Generic)"];
  }
};

const DYNAMIC_FITS = {
  "Apparel": ["Regular Fit", "Oversize / Baggy", "Slim Fit / Tailored", "Crop / Shortened"],
  "Footwear": ["Standard Profile", "Chunky / Oversized Sole", "Sleek / Aerodynamic", "High-Top / Boot Cut"],
  "Accessories": ["Standard Utility Size", "Oversized / Massive", "Mini / Micro / Compact", "Structured / Rigid"]
};

const DESIGN_COMPONENTS = {
  "Apparel": ["None (Standard Cut)", "Sleeveless / Vest-Cut", "Oversized Hooded", "Asymmetrical Hem", "Multiple Cargo Pockets", "Exposed Zippers / Techwear Hardware", "Distressed / Ripped Details"],
  "Footwear": ["None (Standard Structure)", "Clear Outsole", "Gum Sole", "Vibram Sole", "Zipper System / Zip-Up Shroud", "Ankle Strap / Velcro Support", "Visible Air/Gel Pods", "Platform / Stacked Sole"],
  "Accessories": ["None (Standard Detail)", "Heavy Chain Links", "Multiple Utility Pouches Attached", "Oversized Buckles / Clasps", "Bungee Cord / Webbing System"]
};

const DESIGN_STYLES = {
  "Minimalist / Clean": "Sleek, minimalist modern interpretation, solid colors, NO busy patterns.",
  "Authentic & Ornate": "Rich motifs, heavy detailed embroidery, bold graphics.",
  "Techwear / Tactical": "Futuristic utility, tactical straps, cargo pockets."
};

const BACKGROUND_STYLES = {
  "Auto (Match Aesthetic)": "AUTO",
  "Clean Studio": "Clean seamless white studio background.", 
  "Urban / Street": "Urban city street background, dynamic neon lighting.",
  "White Sand Beach": "Beautiful white sand beach, clear blue sky, tropical aesthetic."
};

const GENDERS = ['Female', 'Female (with Hijab)', 'Female (Plus Size)', 'Male', 'Androgynous'];
const ASPECT_RATIOS = {
  "16:9 (Desktop/Landscape)": { ratio: "--ar 16:9", layoutType: "triptych", productOnly: false },
  "16:9 (Diptych - Product Only)": { ratio: "--ar 16:9", layoutType: "diptych-horizontal", productOnly: true }, 
  "9:16 (TikTok/Reels)": { ratio: "--ar 9:16", layoutType: "diptych-vertical", productOnly: false }
};

export default function App() {
  // --- STATE: PRODUCT SELECTION ---
  const [productType, setProductType] = useState('Apparel'); 
  const [category, setCategory] = useState('Streetwear');
  const [brand, setBrand] = useState('Off-White');
  const [coBrandCat, setCoBrandCat] = useState('All');
  const [coBrand, setCoBrand] = useState('None'); 
  const [collabType, setCollabType] = useState('Artist');
  const [collabArtist, setCollabArtist] = useState('None'); 
  const [collabIP, setCollabIP] = useState('None');
  const [collabCharacter, setCollabCharacter] = useState('');
  const [customIPText, setCustomIPText] = useState(''); 

  const [menuCategory, setMenuCategory] = useState('Casual Wear');
  const [availableGarments, setAvailableGarments] = useState(getGarmentsList('Apparel', 'Casual Wear', 'Off-White'));
  const [baseGarment, setBaseGarment] = useState(availableGarments[0]); 
  const [customShapeText, setCustomShapeText] = useState(''); 
  
  const [materials, setMaterials] = useState(['Cotton / Canvas']); 
  const [fitStyle, setFitStyle] = useState('Regular Fit');
  const [designComponent1, setDesignComponent1] = useState('None (Standard Cut)');
  const [designComponent2, setDesignComponent2] = useState('None (Standard Cut)');
  const [designComponent3, setDesignComponent3] = useState('None (Standard Structure)'); 
  
  const [selectedAesthetic, setSelectedAesthetic] = useState('None (Standard Fashion)');
  const [designStyle, setDesignStyle] = useState('Authentic & Ornate');
  const [selectedPattern, setSelectedPattern] = useState("Solid Color (No Pattern)");
  const [backgroundStyle, setBackgroundStyle] = useState('Auto (Match Aesthetic)');
  
  const [gender, setGender] = useState('Female');
  const [aspectRatio, setAspectRatio] = useState("16:9 (Desktop/Landscape)");
  const [layoutPos, setLayoutPos] = useState('Center'); 
  const [whiteLabel, setWhiteLabel] = useState(false);
  const [useUploadedDesign, setUseUploadedDesign] = useState(false);
  const [strictFaceMode, setStrictFaceMode] = useState(false); // Cref Strict Mode

  // --- STATE: COLORS (WITH INDIVIDUAL TOGGLES) ---
  const [colorMode, setColorMode] = useState('Brand'); 
  const [colors, setColors] = useState(['#FFFFFF', '#000000', '#FF0000']);
  const [c1Active, setC1Active] = useState(true);
  const [c2Active, setC2Active] = useState(true);
  const [c3Active, setC3Active] = useState(true);

  const [prompt, setPrompt] = useState('');
  const [copied, setCopied] = useState(false);

  // --- EFFECTS ---
  useEffect(() => {
    if (colorMode === 'Aesthetic' && selectedAesthetic !== "None (Standard Fashion)") {
      const aesColor = AESTHETIC_COLOR_DNA[selectedAesthetic];
      if (aesColor) {
        setColors([aesColor[0], aesColor[1], aesColor[2]]);
        setC1Active(true); setC2Active(true); setC3Active(true);
      }
    }
  }, [selectedAesthetic, colorMode]);

  // --- HANDLERS ---
  const handleProductTypeChange = (type) => {
    setProductType(type);
    setFitStyle(DYNAMIC_FITS[type][0]);
    setDesignComponent1(DESIGN_COMPONENTS[type][0]);
    setDesignComponent2(DESIGN_COMPONENTS[type][0]);
    setDesignComponent3(DESIGN_COMPONENTS[type][0]);
    setCustomShapeText('');
    const newMenus = getGarmentMenuCategories(type);
    const newMenuCat = type === 'Apparel' ? "Casual Wear" : "Iconic Silhouette";
    setMenuCategory(newMenuCat);
    
    const newGarments = getGarmentsList(type, newMenuCat, brand);
    setAvailableGarments(newGarments);
    setBaseGarment(newGarments[0]);
    
    const validMaterials = materials.filter(m => newGarments[0].allowedMats.includes(m));
    if (validMaterials.length === 0) setMaterials([newGarments[0].allowedMats[0]]);
    else setMaterials(validMaterials);
  };

  const handleMenuCategoryChange = (mCat) => {
    setMenuCategory(mCat);
    const newGarments = getGarmentsList(productType, mCat, brand);
    setAvailableGarments(newGarments);
    setBaseGarment(newGarments[0]);
    setCustomShapeText('');
    
    const validMaterials = materials.filter(m => newGarments[0].allowedMats.includes(m));
    if (validMaterials.length === 0) setMaterials([newGarments[0].allowedMats[0]]);
    else setMaterials(validMaterials);
  };

  const handleBrandChange = (bName) => {
    setBrand(bName);
    setSelectedPattern("Solid Color (No Pattern)");
    if (BRAND_COLOR_DNA[bName]) applyAutoColors(bName, coBrand);
    
    if (productType !== 'Apparel' && menuCategory === 'Iconic Silhouette') {
      const newGarments = getGarmentsList(productType, 'Iconic Silhouette', bName);
      setAvailableGarments(newGarments);
      setBaseGarment(newGarments[0]);
      setCustomShapeText('');
      
      const validMaterials = materials.filter(m => newGarments[0].allowedMats.includes(m));
      if (validMaterials.length === 0) setMaterials([newGarments[0].allowedMats[0]]);
      else setMaterials(validMaterials);
    }
  };

  const handleGarmentChange = (gName) => {
    const selected = availableGarments.find(g => g.name === gName);
    if(selected) {
        setBaseGarment(selected);
        setCustomShapeText('');
        const validMaterials = materials.filter(m => selected.allowedMats.includes(m));
        if (validMaterials.length === 0) setMaterials([selected.allowedMats[0]]);
        else setMaterials(validMaterials);
    }
  };

  const toggleMaterial = (mat) => {
    if (materials.includes(mat)) {
      if (materials.length > 1) setMaterials(materials.filter(m => m !== mat));
    } else {
      if (materials.length < 3) setMaterials([...materials, mat]);
    }
  };

  // --- COLOR SYSTEM HANDLERS ---
  const applyAutoColors = (currentBrand = brand, currentCoBrand = coBrand) => {
    setColorMode('Auto');
    let bColor = BRAND_COLOR_DNA[currentBrand];
    let cbColor = currentCoBrand !== "None" ? BRAND_COLOR_DNA[currentCoBrand] : null;
    
    if (collabType === 'Artist' && collabArtist !== "None") bColor = ARTIST_COLOR_DNA[collabArtist] || bColor;
    else if (collabType === 'IP' && collabCharacter !== "") bColor = IP_CHARACTER_COLOR_DNA[collabCharacter] || bColor;

    if (bColor) {
        setColors([bColor[0], bColor[1] || '#FFFFFF', cbColor ? cbColor[0] : (bColor[2] || '#000000')]);
        setC1Active(true); setC2Active(true); setC3Active(true);
    }
  };

  const handleColorChange = (index, value) => {
    const newColors = [...colors];
    newColors[index] = value;
    setColors(newColors);
    setColorMode('Custom');
    // Auto turn on if changed
    if (index===0) setC1Active(true);
    if (index===1) setC2Active(true);
    if (index===2) setC3Active(true);
  };

  const applyRandomPalette = () => {
    setColorMode('Random');
    const newColors = generateSensiblePalette();
    setColors([newColors[0], newColors[1], newColors[2]]);
    setC1Active(true); setC2Active(true); setC3Active(true);
  };

  const getCoBrandList = () => {
    if (coBrandCat === 'All') return ALL_BRANDS.filter(b => b !== brand);
    return FASHION_CATEGORIES[coBrandCat].brands.filter(b => b !== brand);
  };

  const smartRandomize = () => {
    const types = ["Apparel", "Footwear", "Accessories"];
    const randType = types[Math.floor(Math.random() * types.length)];

    const cats = Object.keys(FASHION_CATEGORIES);
    const randCat = cats[Math.floor(Math.random() * cats.length)];
    const brands = FASHION_CATEGORIES[randCat].brands;
    const randBrand = brands[Math.floor(Math.random() * brands.length)];
    
    const randCoBrand = Math.random() > 0.8 ? ALL_BRANDS[Math.floor(Math.random() * ALL_BRANDS.length)] : "None";
    
    const isIP = Math.random() > 0.5;
    setCollabType(isIP ? 'IP' : 'Artist');
    let randArtist = "None"; 
    let randIP = "None";
    if (isIP) {
        const ips = Object.keys(COLLAB_IPS).filter(k => k !== 'None' && k !== 'Custom IP (Type Manual)');
        randIP = Math.random() > 0.5 ? ips[Math.floor(Math.random() * ips.length)] : "None";
        setCollabIP(randIP);
        if (randIP !== "None") setCollabCharacter(COLLAB_IPS[randIP][0]);
        setCollabArtist("None");
        setCustomIPText('');
    } else {
        const artists = Object.keys(COLLAB_ARTISTS).filter(k => k !== 'None');
        randArtist = Math.random() > 0.6 ? artists[Math.floor(Math.random() * artists.length)] : "None"; 
        setCollabArtist(randArtist);
        setCollabIP("None");
    }
    
    const menus = getGarmentMenuCategories(randType);
    const randMenu = menus[Math.floor(Math.random() * menus.length)];
    let items = getGarmentsList(randType, randMenu, randBrand);
    let finalGarment = items[Math.floor(Math.random() * items.length)];
    
    const shuffledMats = [...(finalGarment.allowedMats || UNRESTRICTED_MATS)].sort(() => 0.5 - Math.random());
    const randMaterials = shuffledMats.slice(0, Math.floor(Math.random() * 3) + 1);

    const fits = DYNAMIC_FITS[randType];
    const randFit = fits[Math.floor(Math.random() * fits.length)];
    
    const components = DESIGN_COMPONENTS[randType];
    const randComp1 = Math.random() > 0.4 ? components[Math.floor(Math.random() * components.length)] : components[0];
    const randComp2 = Math.random() > 0.6 && randComp1 !== components[0] ? components[Math.floor(Math.random() * components.length)] : components[0];

    const aesthetics = Object.keys(AESTHETIC_THEMES);
    const randAes = Math.random() > 0.3 ? aesthetics[Math.floor(Math.random() * aesthetics.length)] : "None (Standard Fashion)";
    
    setProductType(randType); setCategory(randCat); setBrand(randBrand); 
    setCoBrandCat('All'); setCoBrand(randCoBrand); 
    setGender(GENDERS[Math.floor(Math.random() * GENDERS.length)]);
    setMenuCategory(randMenu); setAvailableGarments(getGarmentsList(randType, randMenu, randBrand));
    setBaseGarment(finalGarment); setMaterials(randMaterials); 
    setFitStyle(randFit);
    setDesignComponent1(randComp1); setDesignComponent2(randComp2);
    setSelectedAesthetic(randAes); setDesignStyle(Object.keys(DESIGN_STYLES)[Math.floor(Math.random() * 3)]);
    setBackgroundStyle('Auto (Match Aesthetic)');
    
    // Randomize active colors
    const activeCount = Math.floor(Math.random() * 3) + 1; // 1 to 3
    setC1Active(true);
    setC2Active(activeCount >= 2);
    setC3Active(activeCount === 3);

    setTimeout(() => applyAutoColors(randBrand, randCoBrand), 50);
  };

  const generatePrompt = () => {
    const brandStyle = FASHION_CATEGORIES[category].description;
    const coBrandText = coBrand !== "None" ? ` x ${coBrand}` : '';
    
    let collabText = "";
    let collabDetails = "";
    if (collabType === 'Artist' && collabArtist !== "None") {
        collabText = ` x ${collabArtist.split(' ')[0]}`;
        collabDetails = `Aesthetic Injection: ${COLLAB_ARTISTS[collabArtist]}.`;
    } else if (collabType === 'IP' && collabIP !== "None") {
        const ipName = collabIP === "Custom IP (Type Manual)" ? customIPText : collabCharacter;
        collabText = ` x ${ipName}`;
        collabDetails = `Pop-Culture Injection: Heavily themed around ${ipName}, integrating iconic character colorways, motifs, and graphic elements into the design structure.`;
    }
    
    let materialText = "";
    if (materials.length === 1) materialText = `${materials[0]}`;
    else if (materials.length === 2) materialText = `a mixed-material paneling of ${materials[0]} and ${materials[1]}`;
    else materialText = `a complex patchwork construction of ${materials[0]}, ${materials[1]}, and ${materials[2]}`;

    // --- INDIVIDUAL COLOR LOGIC ---
    let activeColorsList = [];
    if (c1Active) activeColorsList.push(colors[0]);
    if (c2Active) activeColorsList.push(colors[1]);
    if (c3Active) activeColorsList.push(colors[2]);

    let colorPrompt = "";
    if (activeColorsList.length === 1) {
        colorPrompt = `Color Palette: Monochromatic styling focusing purely on ${activeColorsList[0]}.`;
    } else if (activeColorsList.length === 2) {
        colorPrompt = `Color Palette: Two-tone styling featuring ${activeColorsList[0]} and ${activeColorsList[1]}.`;
    } else if (activeColorsList.length === 3) {
        colorPrompt = `Color Palette: Main base ${activeColorsList[0]}, Secondary ${activeColorsList[1]}, Accent ${activeColorsList[2]}.`;
    }

    let compList = [];
    if (designComponent1 && !designComponent1.includes("None")) compList.push(designComponent1.toLowerCase());
    if (designComponent2 && !designComponent2.includes("None") && designComponent2 !== designComponent1) compList.push(designComponent2.toLowerCase());
    if (productType === 'Footwear' && designComponent3 && !designComponent3.includes("None") && designComponent3 !== designComponent1 && designComponent3 !== designComponent2) compList.push(designComponent3.toLowerCase());
    
    let componentText = compList.length > 0 ? ` Structurally modified with ${compList.join(' and ')} features.` : "";

    let patternText = "";
    if (selectedPattern !== "Solid Color (No Pattern)") {
        patternText = ` Featuring prominent all-over ${selectedPattern} pattern adapted to the design.`;
    }

    const currentLayoutData = ASPECT_RATIOS[aspectRatio];
    const isProductOnly = currentLayoutData.productOnly;

    let garmentSilhouette = baseGarment.name;
    let garmentTraits = baseGarment.traits;
    let accessoryTypeStr = "bag accessory"; 

    if (productType === 'Accessories') {
        if (baseGarment.name === "Custom Shape (Type Manual)" && customShapeText.trim() !== "") {
             garmentSilhouette = customShapeText.trim();
             garmentTraits = `avant-garde, literal and functional ${customShapeText.toLowerCase()} structural form`;
             accessoryTypeStr = customShapeText.toLowerCase();
        } else if (!baseGarment.name.toLowerCase().includes('bag') && !baseGarment.name.toLowerCase().includes('backpack') && !baseGarment.name.toLowerCase().includes('tote')) {
             accessoryTypeStr = "accessory";
        }
    }

    // --- WHITE LABEL LOGIC ---
    let whiteLabelPrompt = "";
    if (whiteLabel) {
        let antiBrandText = `(Remove ALL ${brand} insignias)`;
        if (coBrand !== "None") antiBrandText = `(Remove ALL ${brand} and ${coBrand} insignias)`;
        whiteLabelPrompt = `CRITICAL INSTRUCTION: NO BRAND LOGOS, NO TEXT, NO GRAPHIC TYPOGRAPHY. Keep the design completely unbranded (white-label). Replicate the silhouette and vibe ONLY, strip all visible trademarks or logos ${antiBrandText}.`;
    } else {
        whiteLabelPrompt = `Feature signature branding prominently.`;
    }

    let negativePrompt = "--no floating text, watermarks, captions, borders, UI elements";
    if (whiteLabel) {
        negativePrompt += `, clothing typography, brand logos, graphic text, ${brand} logo`;
        if (coBrand !== "None") negativePrompt += `, ${coBrand} logo`;
    }
    if (isProductOnly) negativePrompt += ", humans, models, people, faces, bodies"; 

    // --- STRICT FACE MODE & UPLOAD ---
    let refInst = useUploadedDesign ? `\nINSTRUCTION: Accommodate the custom graphics from the uploaded image reference perfectly.` : "";
    if (strictFaceMode && !isProductOnly) {
        refInst += `\nCRITICAL PERSONALIZATION: Maintain STRICT facial consistency of the subject from the reference image. Use --cref to lock facial identity. ONLY adapt wardrobe, pose, and background. Do not alter the core facial structure.`;
    }

    const isHijabi = gender.includes('Hijab');
    const modelGender = gender.includes('Plus Size') ? `plus-size curvy ${gender.split(' ')[0].toLowerCase()}` : gender.toLowerCase().replace(' (with hijab)', '');
    const hijabPrompt = isHijabi ? ' wearing a matching high-fashion sleek hijab (modest styling),' : '';

    let aestheticContext = "";
    let aestheticModelVibe = "";
    let finalBackground = BACKGROUND_STYLES[backgroundStyle];

    if (selectedAesthetic !== "None (Standard Fashion)") {
        const aes = AESTHETIC_THEMES[selectedAesthetic];
        if (aes) { 
            aestheticContext = `Aesthetic Core: ${selectedAesthetic}. Overall Vibe & Wardrobe context: ${aes.clothing}. Lighting & Atmosphere: ${aes.lighting}.`;
            aestheticModelVibe = `Model Expression & Makeup: ${aes.makeup}.`;
            if (backgroundStyle === "Auto (Match Aesthetic)") finalBackground = `Setting & Decor: ${aes.background}.`;
        }
    } else {
        if (backgroundStyle === "Auto (Match Aesthetic)") finalBackground = BACKGROUND_STYLES["Clean Studio"];
    }

    // --- LAYOUT ASSEMBLY ---
    let panelFront, panelBack, panelModel;

    if (productType === 'Apparel') {
        panelFront = `Front view flat lay / tech pack of the garment, highly detailed, clean white background, showing the front tailoring, ${fitStyle.toLowerCase()}, focusing on the ${garmentSilhouette} silhouette. Constructed using ${materialText}.${patternText}${componentText}`;
        panelBack = `Back view flat lay / tech pack of the garment, detailing the back tailoring and complex fabric paneling.`;
        panelModel = `A high-fashion lookbook full-body shot of a stunning ${modelGender} model${hijabPrompt} wearing the fusion garment. ${aestheticModelVibe} ${finalBackground}`;
    } else if (productType === 'Footwear') {
        panelFront = `Lateral (outer side) profile view of the footwear, highly detailed studio shot, clean white background, highlighting the ${fitStyle.toLowerCase()} styling and ${garmentSilhouette}. Crafted primarily from ${materialText}.${patternText}${componentText}`;
        panelBack = `Top-down and sole detail view of the footwear, showcasing the material textures, tread patterns, and complex construction.`;
        panelModel = `A high-fashion dynamic lookbook shot focusing on a ${modelGender} model's feet wearing the fusion sneakers/shoes. The model is standing in frame. ${aestheticModelVibe} ${finalBackground}`;
    } else { 
        panelFront = `Front facing highly detailed product shot of the ${garmentSilhouette}, clean white background, highlighting its ${fitStyle.toLowerCase()} structure. Crafted from ${materialText}.${patternText}${componentText}`;
        panelBack = `Alternative angle product shot showing intricate structural details, functional elements, or back paneling of the ${accessoryTypeStr}.`;
        panelModel = `A high-fashion lookbook shot of a ${modelGender} model${hijabPrompt} prominently displaying, carrying, or interacting with the fusion ${accessoryTypeStr}. ${aestheticModelVibe} ${finalBackground}`;
    }

    let layoutPrompt = "";
    if (currentLayoutData.layoutType === 'diptych-vertical') {
        layoutPrompt = `layout split horizontally into 2 vertical panels (Top and Bottom).\nTop Panel: ${panelModel}\nBottom Panel: ${panelFront}`;
    } else if (currentLayoutData.layoutType === 'diptych-horizontal') {
        layoutPrompt = `layout split vertically into 2 perfectly equal horizontal panels (Left and Right).\nLeft Panel: ${panelFront}\nRight Panel: ${panelBack}`;
    } else {
        let leftPanel, centerPanel, rightPanel;
        if (layoutPos === 'Center') { leftPanel = panelFront; centerPanel = panelModel; rightPanel = panelBack; } 
        else if (layoutPos === 'Left') { leftPanel = panelModel; centerPanel = panelFront; rightPanel = panelBack; } 
        else { leftPanel = panelFront; centerPanel = panelBack; rightPanel = panelModel; }
        
        layoutPrompt = `triptych layout split perfectly into 3 vertical panels.\nLeft Panel: ${leftPanel}\nCenter Panel: ${centerPanel}\nRight Panel: ${rightPanel}`;
    }

    let conceptBrandStr = whiteLabel ? "an unbranded high-fashion" : `${brand}${coBrandText}`;

    const basePrompt = `A stunning product and fashion editorial photography, ${layoutPrompt}

Concept: A crossover ${productType.toLowerCase()} design combining ${conceptBrandStr}${collabText} (${category} style: ${brandStyle}) with the structural silhouette of ${garmentSilhouette} (${garmentTraits}). 
${aestheticContext}
${collabDetails}
Primary Materials: ${materialText}.
Design Fit/Structure: ${fitStyle}.
Design Approach: ${DESIGN_STYLES[designStyle]}
${colorPrompt}
${whiteLabelPrompt} ${refInst}

Style details: Ultra-detailed material textures, photorealistic, 8k resolution, fashion magazine aesthetic, industrial product design, award-winning photography, ${currentLayoutData.ratio} --v 6.0 ${negativePrompt}`;

    setPrompt(basePrompt);
    setCopied(false);
  };

  const copyToClipboard = () => {
    if (prompt) {
      const el = document.createElement('textarea');
      el.value = prompt;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const renderVisualPreview = () => {
    const currentLayoutData = ASPECT_RATIOS[aspectRatio];
    let bgStyleStr = '#e5e5e5';
    
    if (selectedAesthetic !== "None (Standard Fashion)") {
        const aesName = selectedAesthetic.toLowerCase();
        if (aesName.includes('opium') || aesName.includes('cyber') || aesName.includes('dark')) bgStyleStr = 'linear-gradient(to bottom, #1a0b16, #000000)';
        else if (aesName.includes('cottage') || aesName.includes('forest')) bgStyleStr = 'linear-gradient(to bottom, #dcedc8, #aed581)';
        else if (aesName.includes('y2k') || aesName.includes('fairy')) bgStyleStr = 'linear-gradient(to bottom, #ff4081, #7c4dff)';
    } else {
        if (backgroundStyle === 'Cyberpunk City') bgStyleStr = 'linear-gradient(to bottom, #2b0b3a, #0f172a)';
        if (backgroundStyle === 'Urban / Street') bgStyleStr = 'linear-gradient(to bottom, #1a1a2e, #0f172a)';
        if (backgroundStyle === 'White Sand Beach') bgStyleStr = 'linear-gradient(to bottom, #00BFFF, #F5DEB3)';
    }

    const ProductIcon = productType === 'Footwear' ? Footprints : productType === 'Accessories' ? Briefcase : Shirt;

    const ModelNode = (
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 shadow-[0_0_30px_rgba(0,0,0,0.5)]" style={{ background: bgStyleStr }}>
        <span className={`absolute text-[9px] font-bold bottom-2 tracking-widest ${backgroundStyle === 'Clean Studio' ? 'text-neutral-500' : 'text-red-400 mix-blend-difference'}`}>MODEL / LIFESTYLE</span>
        <div className={`w-8 h-20 md:h-24 rounded-full flex items-center justify-center ${backgroundStyle === 'Clean Studio' ? 'bg-neutral-300' : 'bg-white/20 border border-white/50 shadow-lg relative'}`}>
            📸
            {strictFaceMode && <span className="absolute -top-2 -right-2 text-[10px]" title="Strict Face Protection">🔒</span>}
        </div>
      </div>
    );

    const FrontNode = (
      <div className="flex-1 border-neutral-800/50 flex flex-col items-center justify-center relative bg-white/5 border-r border-t">
        <span className="absolute text-[9px] font-bold text-neutral-500 bottom-2 tracking-widest">PRODUCT</span>
        <ProductIcon className="w-8 h-8 text-neutral-600 opacity-50" />
      </div>
    );

    const BackNode = (
      <div className="flex-1 border-neutral-800/50 flex flex-col items-center justify-center relative bg-white/5 border-l">
        <span className="absolute text-[9px] font-bold text-neutral-500 bottom-2 tracking-widest">DETAIL</span>
        <div className="w-8 h-8 md:w-10 md:h-10 border-2 border-dashed border-neutral-600 rounded-md opacity-40"></div>
      </div>
    );

    if (currentLayoutData.layoutType === 'diptych-vertical') {
        return (
            <div className="aspect-[9/16] w-[160px] md:w-[200px] mx-auto bg-neutral-950 border border-neutral-800 rounded-2xl mb-5 flex flex-col overflow-hidden shadow-inner">
                {ModelNode}
                {FrontNode}
            </div>
        );
    } else if (currentLayoutData.layoutType === 'diptych-horizontal') {
        return (
            <div className="aspect-[16/9] w-full bg-neutral-950 border border-neutral-800 rounded-2xl mb-5 flex overflow-hidden shadow-inner">
                {FrontNode}
                {BackNode}
            </div>
        );
    }

    const getNodes = () => {
        if (layoutPos === 'Center') return [FrontNode, ModelNode, BackNode];
        if (layoutPos === 'Left') return [ModelNode, FrontNode, BackNode];
        return [FrontNode, BackNode, ModelNode];
    };

    return (
        <div className="aspect-[16/9] w-full bg-neutral-950 border border-neutral-800 rounded-2xl mb-5 flex overflow-hidden shadow-inner">
            {getNodes().map((node, i) => React.cloneElement(node, { key: i }))}
        </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-100 p-2 md:p-6 font-sans selection:bg-red-500/30">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4 bg-neutral-900/50 p-4 rounded-2xl border border-neutral-800">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20 hidden md:flex">
                <Gamepad2 className="w-6 h-6 text-red-500" />
            </div>
            <div>
                <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">Fashion Gen <span className="text-red-500">v65</span></h1>
                <p className="text-neutral-400 text-[11px] md:text-xs font-medium">Single Garment Detail Engine & Strict Cref Focus</p>
            </div>
          </div>
          <button onClick={smartRandomize} className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white px-5 py-2.5 rounded-xl font-bold text-xs transition-all active:scale-95 shadow-[0_0_15px_rgba(239,68,68,0.4)]">
            <Sparkles className="w-4 h-4" /> SMART RANDOMIZE
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <div className="lg:col-span-8 space-y-5 bg-[#0a0a0a] border border-neutral-800 p-4 lg:p-6 rounded-[2rem] shadow-2xl">
            
            {/* TABS: PRODUCT TYPE */}
            <div className="flex bg-neutral-900 p-1.5 rounded-2xl border border-neutral-800">
              {['Apparel', 'Footwear', 'Accessories'].map(type => (
                <button key={type} onClick={() => handleProductTypeChange(type)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all ${
                    productType === type ? 'bg-red-500 text-white shadow-md' : 'text-neutral-500 hover:text-white hover:bg-neutral-800'
                  }`}>
                  {type === 'Apparel' && <Shirt className="w-4 h-4"/>}
                  {type === 'Footwear' && <Footprints className="w-4 h-4"/>}
                  {type === 'Accessories' && <Briefcase className="w-4 h-4"/>}
                  {type}
                </button>
              ))}
            </div>

            {/* STEP 1: Brand & Collab */}
            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-red-500/20 flex items-center justify-center text-[9px] text-red-500">1</span>
                    Brand Concept & Collab
                    </label>
                    <label className="flex items-center cursor-pointer gap-1.5 bg-neutral-900 px-2 py-1 rounded border border-neutral-800" title="Matikan logo brand">
                        <span className="text-[9px] font-bold text-neutral-500 flex items-center gap-1"><Ghost className="w-3 h-3"/> WHITE LABEL</span>
                        <div className="relative">
                            <input type="checkbox" className="sr-only" checked={whiteLabel} onChange={() => setWhiteLabel(!whiteLabel)} />
                            <div className={`block w-6 h-3 rounded-full transition-colors ${whiteLabel ? 'bg-red-500' : 'bg-neutral-700'}`}></div>
                            <div className={`dot absolute left-[2px] top-[2px] bg-white w-2 h-2 rounded-full transition-transform ${whiteLabel ? 'transform translate-x-3' : ''}`}></div>
                        </div>
                    </label>
                </div>
                
                <div className="grid grid-cols-2 lg:grid-cols-6 gap-1 p-1 bg-neutral-900 rounded-xl border border-neutral-800 mb-2">
                  {Object.keys(FASHION_CATEGORIES).map(cat => (
                    <button key={cat} onClick={() => { setCategory(cat); handleBrandChange(FASHION_CATEGORIES[cat].brands[0]); }}
                      className={`text-[10px] font-bold py-2 px-1 rounded-lg transition-all text-center ${
                        category === cat ? 'bg-neutral-800 text-white shadow border border-neutral-700' : 'text-neutral-500 hover:text-neutral-300'
                      }`}>
                      {cat.split('/')[0].trim()}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {/* MAIN BRAND & CO-BRAND */}
                  <div className="flex flex-col gap-2">
                      <select value={brand} onChange={(e) => handleBrandChange(e.target.value)} 
                        className="w-full bg-neutral-900 border border-neutral-800 text-white text-sm font-bold rounded-xl focus:ring-red-500 p-2.5">
                        {FASHION_CATEGORIES[category].brands.map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                      
                      <div className="flex gap-1">
                          <select value={coBrandCat} onChange={(e) => { setCoBrandCat(e.target.value); setCoBrand("None"); }} className="w-1/3 bg-neutral-900 border border-neutral-800 text-neutral-400 text-[10px] font-bold rounded-xl focus:ring-red-500 p-2.5 text-center">
                              <option value="All">All Cats</option>
                              {Object.keys(FASHION_CATEGORIES).map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                          <select value={coBrand} onChange={(e) => setCoBrand(e.target.value)} className="w-2/3 bg-neutral-900 border border-neutral-800 text-neutral-300 text-xs font-bold rounded-xl focus:ring-red-500 p-2.5 pl-4">
                            <option value="None">-- No Co-Brand --</option>
                            {getCoBrandList().map(b => <option key={b} value={b}>{b}</option>)}
                          </select>
                      </div>
                  </div>

                  {/* IP / ARTIST COLLAB */}
                  <div className="bg-red-950/10 border border-red-500/20 rounded-xl p-2 flex flex-col gap-2">
                      <div className="flex bg-neutral-950 rounded-lg p-0.5">
                        <button onClick={() => setCollabType('Artist')} className={`flex-1 text-[10px] font-bold py-1.5 rounded-md transition-all ${collabType === 'Artist' ? 'bg-red-500 text-white' : 'text-neutral-500'}`}>Designer / Artist</button>
                        <button onClick={() => setCollabType('IP')} className={`flex-1 text-[10px] font-bold py-1.5 rounded-md transition-all ${collabType === 'IP' ? 'bg-blue-500 text-white' : 'text-neutral-500'}`}>Pop-Culture IP</button>
                      </div>
                      
                      {collabType === 'Artist' ? (
                          <select value={collabArtist} onChange={(e) => setCollabArtist(e.target.value)} className="w-full bg-neutral-900 border border-neutral-800 text-red-300 text-xs font-bold rounded-lg focus:ring-red-500 p-2">
                              {Object.keys(COLLAB_ARTISTS).map(c => <option key={c} value={c} className="text-white">{c}</option>)}
                          </select>
                      ) : (
                          <div className="flex flex-col gap-1">
                              <div className="flex gap-1">
                                  <select value={collabIP} onChange={(e) => { setCollabIP(e.target.value); if(e.target.value !== "None" && e.target.value !== "Custom IP (Type Manual)") setCollabCharacter(COLLAB_IPS[e.target.value][0]); }} className="w-1/2 bg-neutral-900 border border-neutral-800 text-blue-300 text-xs font-bold rounded-lg focus:ring-blue-500 p-2">
                                      <option value="None">-- No IP --</option>
                                      {Object.keys(COLLAB_IPS).filter(k => k !== "None").map(ip => <option key={ip} value={ip} className="text-white">{ip}</option>)}
                                  </select>
                                  <select value={collabCharacter} onChange={(e) => setCollabCharacter(e.target.value)} disabled={collabIP === "None" || collabIP === "Custom IP (Type Manual)"} className={`w-1/2 bg-neutral-900 border border-neutral-800 text-blue-300 text-[10px] font-bold rounded-lg focus:ring-blue-500 p-2 ${(collabIP === "None" || collabIP === "Custom IP (Type Manual)") ? 'opacity-50' : ''}`}>
                                      {collabIP !== "None" && collabIP !== "Custom IP (Type Manual)" && COLLAB_IPS[collabIP].map(char => <option key={char} value={char} className="text-white">{char}</option>)}
                                      {collabIP === "None" && <option>Select IP First</option>}
                                      {collabIP === "Custom IP (Type Manual)" && <option>Custom Entry</option>}
                                  </select>
                              </div>
                              {collabIP === "Custom IP (Type Manual)" && (
                                  <input 
                                    type="text" 
                                    value={customIPText} 
                                    onChange={(e) => setCustomIPText(e.target.value)} 
                                    placeholder="Type character or IP name (e.g., Optimus Prime)" 
                                    className="w-full bg-neutral-900 border border-blue-500/50 text-white text-xs p-2 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                  />
                              )}
                          </div>
                      )}
                  </div>
                </div>
            </div>

            <div className="h-px w-full bg-neutral-800/50"></div>

            {/* STEP 2: Base Inspiration */}
            <div className="space-y-3">
               <label className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center text-[10px] text-red-500">2</span>
                  Base Inspiration ({productType})
                </label>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <select value={menuCategory} onChange={(e) => handleMenuCategoryChange(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 text-white text-xs font-bold rounded-xl focus:ring-red-500 p-3">
                    {getGarmentMenuCategories(productType).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                  <select value={baseGarment?.name || ""} onChange={(e) => handleGarmentChange(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 text-white text-xs font-semibold rounded-xl focus:ring-red-500 p-3">
                    {availableGarments.map(g => {
                      return <option key={g.name} value={g.name}>{g.name}</option>
                    })}
                  </select>
                </div>
                
                {productType === 'Accessories' && baseGarment?.name === "Custom Shape (Type Manual)" && (
                  <input 
                    type="text" 
                    value={customShapeText} 
                    onChange={(e) => setCustomShapeText(e.target.value)} 
                    placeholder="Describe custom shape (e.g., Brick Shape, Plastic Bag, Helmet)" 
                    className="w-full bg-neutral-950 border border-orange-500/50 text-orange-200 font-bold text-xs p-3 rounded-xl focus:ring-orange-500"
                  />
                )}
            </div>

            {/* STEP 3: Multi-Material */}
            <div className="space-y-3 bg-neutral-900/50 p-4 rounded-2xl border border-neutral-800">
               <div className="flex justify-between items-center">
                 <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-red-500/30 flex items-center justify-center text-[10px] text-red-500">3</span>
                    Mixed Materials (Max 3)
                  </label>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded ${materials.length === 3 ? 'bg-red-500 text-white' : 'bg-neutral-800 text-neutral-400'}`}>
                    {materials.length} / 3
                  </span>
               </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                  {ALL_MATS.map(mat => {
                    const isAllowed = baseGarment?.allowedMats?.includes(mat) ?? false;
                    const isSelected = materials.includes(mat);
                    const isMaxedOut = !isSelected && materials.length >= 3;
                    const isDisabled = !isAllowed || isMaxedOut;

                    return (
                      <button key={mat} onClick={() => toggleMaterial(mat)} disabled={isDisabled}
                        className={`text-left text-[10px] p-2 rounded-lg border transition-all ${
                          isSelected ? 'border-red-500 bg-red-500/20 text-white shadow-[0_0_10px_rgba(239,68,68,0.3)]' : 
                          isDisabled ? 'border-neutral-800/50 bg-neutral-950 text-neutral-600 cursor-not-allowed opacity-30' :
                          'border-neutral-800 bg-neutral-900 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                        }`}>
                        <div className="flex items-center justify-between">
                            <span className="font-bold block truncate">{mat}</span>
                            {isSelected && <CheckCircle2 className="w-3 h-3 text-red-500 flex-shrink-0" />}
                        </div>
                      </button>
                    )
                  })}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-red-500/20 flex items-center justify-center text-[9px] text-red-500">4</span>
                  Structure & Components
                </label>
                <div className="grid grid-cols-2 gap-1.5 mb-2">
                  {DYNAMIC_FITS[productType].map(fit => {
                    return (
                      <button key={fit} onClick={() => setFitStyle(fit)}
                        className={`text-left text-[10px] p-2.5 rounded-xl border transition-all ${
                          fitStyle === fit ? 'border-red-500 bg-red-500/10 text-white' : 'border-neutral-800 bg-neutral-900 text-neutral-400 hover:border-neutral-700'
                        }`}>
                        <span className="block font-bold">{fit}</span>
                      </button>
                    )
                  })}
                </div>
                
                <div className={`grid gap-2 ${productType === 'Footwear' ? 'grid-cols-3' : 'grid-cols-2'}`}>
                    <select value={designComponent1} onChange={(e) => setDesignComponent1(e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-800 text-white text-[10px] font-bold rounded-xl focus:ring-red-500 p-2 truncate">
                        {DESIGN_COMPONENTS[productType].map(comp => <option key={comp} value={comp}>Add: {comp}</option>)}
                    </select>
                    <select value={designComponent2} onChange={(e) => setDesignComponent2(e.target.value)}
                        className="w-full bg-neutral-900 border border-neutral-800 text-white text-[10px] font-bold rounded-xl focus:ring-red-500 p-2 truncate">
                        {DESIGN_COMPONENTS[productType].map(comp => <option key={comp} value={comp}>Add: {comp}</option>)}
                    </select>
                    {productType === 'Footwear' && (
                        <select value={designComponent3} onChange={(e) => setDesignComponent3(e.target.value)}
                            className="w-full bg-neutral-900 border border-neutral-800 text-white text-[10px] font-bold rounded-xl focus:ring-red-500 p-2 truncate">
                            {DESIGN_COMPONENTS[productType].map(comp => <option key={comp} value={comp}>Add: {comp}</option>)}
                        </select>
                    )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-red-500/20 flex items-center justify-center text-[9px] text-red-500">5</span>
                  Aesthetic & Pattern
                </label>
                <select value={selectedAesthetic} onChange={(e) => { setSelectedAesthetic(e.target.value); applyAutoColors(); }}
                    className="w-full bg-indigo-950 border border-indigo-500/50 text-indigo-200 text-xs font-bold rounded-xl focus:ring-indigo-500 p-2.5">
                    <option value="None (Standard Fashion)">Select Aesthetic: None (Standard)</option>
                    {Object.values(AESTHETIC_THEMES).reduce((acc, aes) => {
                        if (!aes) return acc;
                        if (!acc.includes(aes.group)) acc.push(aes.group);
                        return acc;
                    }, []).map(group => (
                        <optgroup key={group} label={group}>
                            {Object.entries(AESTHETIC_THEMES).filter(([k,v]) => v && v.group === group).map(([k,v]) => (
                                <option key={k} value={k}>{k}</option>
                            ))}
                        </optgroup>
                    ))}
                </select>

                <select value={designStyle} onChange={(e) => setDesignStyle(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 text-white text-xs font-bold rounded-xl focus:ring-red-500 p-2.5 mt-2">
                    {Object.keys(DESIGN_STYLES).map(style => <option key={style} value={style}>{style}</option>)}
                </select>

                <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-800 rounded-xl p-2 mt-2">
                     <Palette className="w-4 h-4 text-red-500 flex-shrink-0 ml-1" />
                     <select value={selectedPattern} onChange={(e) => setSelectedPattern(e.target.value)} className="w-full bg-transparent text-xs text-red-300 font-bold focus:ring-0 p-1 truncate">
                         {Object.entries(GLOBAL_PATTERNS).map(([region, patterns]) => (
                             <optgroup key={region} label={`Global: ${region}`}>
                                 {patterns.map(p => <option key={p} value={p} className="bg-neutral-900 text-white">{p}</option>)}
                             </optgroup>
                         ))}
                         {BRAND_PATTERNS[brand] && (
                             <optgroup label={`${brand} Iconic Patterns`}>
                                 {BRAND_PATTERNS[brand].map(p => <option key={p} value={p} className="bg-neutral-900 text-white">{p}</option>)}
                             </optgroup>
                         )}
                         {coBrand !== "None" && BRAND_PATTERNS[coBrand] && (
                             <optgroup label={`${coBrand} (Co-Brand) Patterns`}>
                                 {BRAND_PATTERNS[coBrand].map(p => <option key={p} value={p} className="bg-neutral-900 text-yellow-300">{p}</option>)}
                             </optgroup>
                         )}
                         {collabType === 'Artist' && collabArtist !== "None" && ARTIST_PATTERNS[collabArtist] && (
                             <optgroup label={`${collabArtist} Patterns`}>
                                 {ARTIST_PATTERNS[collabArtist].map(p => <option key={p} value={p} className="bg-neutral-900 text-cyan-300">{p}</option>)}
                             </optgroup>
                         )}
                     </select>
                </div>
              </div>
            </div>

            <div className="h-px w-full bg-neutral-800/50"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* WARNA DENGAN CHECKBOX INDIVIDUAL */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-red-500/20 flex items-center justify-center text-[9px] text-red-500">6</span>
                    Intelligent Color Logic
                  </label>
                </div>
                
                <div className="bg-neutral-900 p-2 rounded-xl border border-neutral-800 flex flex-col gap-2">
                  <div className="flex flex-wrap gap-1 bg-neutral-950 p-1 rounded-lg">
                     <button onClick={() => applyAutoColors()} className="flex-1 text-[9px] font-bold py-1.5 rounded bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500 hover:text-white transition-colors border border-indigo-500/30">Auto Sync</button>
                     <button onClick={applyRandomPalette} className="flex-1 text-[9px] font-bold py-1.5 rounded bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500 hover:text-white transition-colors border border-emerald-500/30">Random</button>
                  </div>
                  
                  <div className="flex justify-around py-2">
                    {/* COLOR 1 */}
                    <div className="flex flex-col items-center gap-2">
                        <input type="checkbox" checked={c1Active} onChange={(e) => setC1Active(e.target.checked)} className="w-3 h-3 rounded border-neutral-700 text-red-500 bg-neutral-950 cursor-pointer" title="Toggle Main Color" />
                        <input type="color" value={colors[0]} onChange={(e) => handleColorChange(0, e.target.value)} className={`w-10 h-10 rounded-full cursor-pointer bg-transparent border-0 p-0 shadow-sm transition-transform hover:scale-110 ${!c1Active ? 'opacity-20 grayscale' : ''}`} />
                    </div>
                    {/* COLOR 2 */}
                    <div className="flex flex-col items-center gap-2">
                        <input type="checkbox" checked={c2Active} onChange={(e) => setC2Active(e.target.checked)} className="w-3 h-3 rounded border-neutral-700 text-red-500 bg-neutral-950 cursor-pointer" title="Toggle Secondary Color" />
                        <input type="color" value={colors[1]} onChange={(e) => handleColorChange(1, e.target.value)} className={`w-10 h-10 rounded-full cursor-pointer bg-transparent border-0 p-0 shadow-sm transition-transform hover:scale-110 ${!c2Active ? 'opacity-20 grayscale' : ''}`} />
                    </div>
                    {/* COLOR 3 */}
                    <div className="flex flex-col items-center gap-2">
                        <input type="checkbox" checked={c3Active} onChange={(e) => setC3Active(e.target.checked)} className="w-3 h-3 rounded border-neutral-700 text-red-500 bg-neutral-950 cursor-pointer" title="Toggle Accent Color" />
                        <input type="color" value={colors[2]} onChange={(e) => handleColorChange(2, e.target.value)} className={`w-10 h-10 rounded-full cursor-pointer bg-transparent border-0 p-0 shadow-sm transition-transform hover:scale-110 ${!c3Active ? 'opacity-20 grayscale' : ''}`} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-red-500/20 flex items-center justify-center text-[9px] text-red-500">7</span>
                  Layout & Personalization
                </label>
                
                <select value={backgroundStyle} onChange={(e) => setBackgroundStyle(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 text-white text-xs font-bold rounded-xl p-3 mb-2">
                  {Object.keys(BACKGROUND_STYLES).map(bg => <option key={bg} value={bg}>{bg}</option>)}
                </select>

                <div className="flex gap-2">
                    <select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)}
                    className="w-1/2 bg-orange-500/10 border border-orange-500/30 text-orange-300 text-xs font-bold rounded-xl p-2.5">
                    {Object.keys(ASPECT_RATIOS).map(ar => <option key={ar} value={ar}>{ar.split(' ')[0]}</option>)}
                    </select>
                    
                    {ASPECT_RATIOS[aspectRatio].layoutType === 'triptych' && (
                    <select value={layoutPos} onChange={(e) => setLayoutPos(e.target.value)}
                        className="w-1/2 bg-neutral-900 border border-neutral-800 text-white text-xs rounded-xl p-2.5">
                        <option value="Left">Model Left</option>
                        <option value="Center">Model Center</option>
                        <option value="Right">Model Right</option>
                    </select>
                    )}
                </div>

                {productType === 'Apparel' && !ASPECT_RATIOS[aspectRatio].productOnly && (
                  <select value={gender} onChange={(e) => setGender(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 text-red-400 text-xs font-bold rounded-xl p-2.5 mt-2">
                    {GENDERS.map(g => <option key={g} value={g}>Model: {g}</option>)}
                  </select>
                )}

                <div className="flex gap-2 mt-2">
                  <label className={`flex-1 flex items-center justify-center cursor-pointer gap-2 p-2.5 rounded-xl border transition-all ${useUploadedDesign ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300' : 'bg-neutral-900 border-neutral-800 text-neutral-400'}`}>
                    <input type="checkbox" checked={useUploadedDesign} onChange={(e) => setUseUploadedDesign(e.target.checked)} className="sr-only" />
                    <UploadCloud className="w-3 h-3" /> <span className="text-[9px] font-bold">Sync Image</span>
                  </label>

                  <label className={`flex-1 flex items-center justify-center cursor-pointer gap-2 p-2.5 rounded-xl border transition-all ${strictFaceMode ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300' : 'bg-neutral-900 border-neutral-800 text-neutral-400'}`} title="Lock facial identity using --cref">
                    <input type="checkbox" checked={strictFaceMode} onChange={(e) => setStrictFaceMode(e.target.checked)} className="sr-only" />
                    <Camera className="w-3 h-3" /> <span className="text-[9px] font-bold">Strict Face (--cref)</span>
                  </label>
                </div>
              </div>
            </div>

            <button onClick={generatePrompt}
              className="w-full py-4 mt-2 bg-gradient-to-r from-red-600 to-orange-500 text-white hover:opacity-90 rounded-2xl font-black flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-[0_0_20px_rgba(239,68,68,0.3)] text-sm tracking-widest">
              <Wand2 className="w-4 h-4" /> GENERATE MASTERPIECE
            </button>
          </div>

          {/* RIGHT PANEL: RESULT */}
          <div className="lg:col-span-4 h-full flex flex-col gap-4">
            <div className="bg-[#0a0a0a] border border-neutral-800 p-4 rounded-3xl shadow-2xl flex flex-col items-center justify-center min-h-[250px]">
               {renderVisualPreview()}
            </div>

            <div className="bg-[#0a0a0a] border border-neutral-800 p-4 rounded-3xl shadow-2xl flex-1 flex flex-col relative overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <label className="text-[11px] font-black text-red-500 uppercase tracking-widest flex items-center gap-2">
                  <Sparkles className="w-3 h-3" /> RESULT
                </label>
                {prompt && (
                  <button onClick={copyToClipboard}
                    className="text-[9px] font-bold flex items-center gap-1 bg-neutral-800 text-white border border-neutral-700 px-3 py-1.5 rounded-lg hover:text-red-400 transition-colors">
                    {copied ? <CheckCircle2 className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                    {copied ? 'COPIED' : 'COPY'}
                  </button>
                )}
              </div>
              
              {prompt ? (
                <div className="flex-1 bg-black border border-neutral-800 rounded-2xl p-3 font-mono text-[10px] text-neutral-300 leading-relaxed overflow-y-auto custom-scrollbar shadow-inner relative whitespace-pre-wrap">
                  {prompt}
                </div>
              ) : (
                <div className="flex-1 border-2 border-dashed border-neutral-800 rounded-2xl flex flex-col items-center justify-center text-neutral-600 p-6 text-center bg-black">
                  <Shirt className="w-8 h-8 mb-2 opacity-20 text-red-500" />
                  <p className="text-[10px] font-bold tracking-wide uppercase">Waiting for input</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}