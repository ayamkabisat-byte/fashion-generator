import React, { useState, useEffect } from 'react';
import { Copy, Sparkles, Wand2, CheckCircle2, Shirt, Crown, Smartphone, Combine, Ghost, Footprints, Briefcase, Tent, Gamepad2, Palette, Dices, UploadCloud } from 'lucide-react';

// --- HELPER FUNGSI WARNA (HSL ke HEX) ---
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
  "Naruto Sage Mode Robes": ['#FF4500', '#000000', '#FF0000'], 
  "Sasuke Uchiha Rogue Ninja Outfit": ['#4B0082', '#000000', '#C0C0C0'], 
  "Akatsuki Cloak Aesthetic": ['#000000', '#FF0000', '#FFFFFF'], 
  "Kakashi Anbu Tactical Gear": ['#2F4F4F', '#000000', '#808080'], 
  "Jiraiya Toad Sage Kabuki Outfit": ['#FF0000', '#F5DEB3', '#008000'],
  "Itachi Uchiha Akatsuki Cloak": ['#000000', '#FF0000', '#800000'],
  "Madara Uchiha Samurai Armor": ['#00008B', '#000000', '#191970'],
  "Monkey D. Luffy Gear 5 White Aesthetic": ['#FFFFFF', '#FFD700', '#8A2BE2'], 
  "Roronoa Zoro Green Samurai Robes": ['#006400', '#000000', '#FFFFFF'], 
  "Trafalgar Law Heart Pirates Coat": ['#000000', '#FFFF00', '#FFFFFF'], 
  "Kaido Beast Pirates Overcoat": ['#8B0000', '#000000', '#4B0082'], 
  "Sanji Raid Suit Stealth Black": ['#000000', '#FFFF00', '#FF4500'],
  "Nami Thief Cat Outfit": ['#FFA500', '#00FFFF', '#FFFFFF'],
  "Shanks Pirate Captain Cloak": ['#000000', '#FFFFFF', '#FF0000'],
  "Darth Vader Sith Armor": ['#000000', '#2F4F4F', '#FF0000'], 
  "Stormtrooper Plasteel Armor": ['#FFFFFF', '#000000', '#808080'], 
  "Mandalorian Beskar Armor": ['#C0C0C0', '#808080', '#8B4513'], 
  "Jedi Knight Desert Robes": ['#F5F5DC', '#8B4513', '#00FF00'], 
  "Boba Fett Bounty Hunter Armor": ['#556B2F', '#8B4513', '#FF4500'],
  "Kylo Ren Supreme Leader Outfit": ['#000000', '#FF0000', '#C0C0C0'],
  "Darth Maul Sith Robes & Tattoos": ['#FF0000', '#000000', '#8B0000'],
  "Ahsoka Tano Rebel Outfit": ['#FFA500', '#FFFFFF', '#0000FF'],
  "Obi-Wan Kenobi Jedi Master Robes": ['#F5DEB3', '#8B4513', '#0000FF'],
  "Spider-Man Webbed Suit": ['#FF0000', '#0000FF', '#000000'], 
  "Iron Man Tech Armor": ['#8B0000', '#FFD700', '#C0C0C0'], 
  "Venom Symbiote Texture": ['#000000', '#FFFFFF', '#4B0082'], 
  "Deadpool Mercenary Suit": ['#FF0000', '#000000', '#808080'], 
  "Captain America Super Soldier Uniform": ['#0000FF', '#FF0000', '#FFFFFF'],
  "Thor Asgardian Armor": ['#C0C0C0', '#0000FF', '#FFD700'],
  "Black Panther Vibranium Habit": ['#000000', '#800080', '#C0C0C0'],
  "Wolverine Yellow/Blue X-Men Suit": ['#FFFF00', '#000000', '#FF0000'],
  "Ghost Rider Flaming Leather Jacket": ['#FF4500', '#000000', '#C0C0C0'],
  "Punisher Skull Vest Aesthetic": ['#000000', '#FFFFFF', '#808080'],
  "Batman Batsuit Armor": ['#000000', '#404040', '#FFFF00'], 
  "The Joker Purple Suit Aesthetic": ['#4B0082', '#32CD32', '#FFFFFF'], 
  "Superman Kryptonian Suit": ['#0000FF', '#FF0000', '#FFD700'], 
  "The Flash Speedster Suit": ['#FF0000', '#FFD700', '#FFFFFF'], 
  "Wonder Woman Themyscira Armor": ['#FF0000', '#0000FF', '#FFD700'],
  "Aquaman Atlantean Scale Mail": ['#008000', '#FFA500', '#FFD700'],
  "Green Lantern Power Ring Suit": ['#008000', '#000000', '#FFFFFF'],
  "Cyborg Apokoliptian Tech Armor": ['#C0C0C0', '#000000', '#FF0000'],
  "Nightwing Blüdhaven Suit": ['#000000', '#0000FF', '#FFFFFF'],
  "Homer Simpson Donut Motif": ['#FF69B4', '#F5DEB3', '#00FFFF'], 
  "Bart Simpson Graffiti": ['#FF0000', '#0000FF', '#FFFF00'], 
  "Krusty Burger Uniform": ['#FF0000', '#FFFFFF', '#FF1493'], 
  "Pikachu Electric Volt": ['#FFFF00', '#000000', '#FF0000'], 
  "Charizard Flame": ['#FF8C00', '#FF4500', '#00CED1'], 
  "Gengar Ghost Shadow": ['#4B0082', '#8A2BE2', '#FF0000'], 
  "Mewtwo Psychic": ['#E6E6FA', '#8A2BE2', '#4B0082'], 
  "Agumon / Greymon Evolution": ['#FFA500', '#0000FF', '#FF0000'], 
  "Omegamon Holy Knight": ['#FFFFFF', '#FF0000', '#0000FF'], 
  "Angemon Divine": ['#FFFFFF', '#FFD700', '#0000FF'],
  "Space Shuttle Spacesuit": ['#FFFFFF', '#FFA500', '#000000'],
  "Apollo Astronaut": ['#FFFFFF', '#C0C0C0', '#000000'],
  "NASA Jet Propulsion Lab": ['#0033A0', '#E31937', '#FFFFFF'],
  "Clone X Avatar": ['#00FFFF', '#FF00FF', '#000000'],
  "MNLTH Sneaker Box": ['#C0C0C0', '#000000', '#8A2BE2'],
  "RTFKT Cyberpunk Entity": ['#FF0055', '#00FFCC', '#111111'],
  "Gundam RX-78-2": ['#FFFFFF', '#0000FF', '#FF0000'],
  "Zaku II": ['#4B5320', '#556B2F', '#000000'],
  "Rick Dom": ['#000000', '#800080', '#FF0000'],
  "Sazabi": ['#FF0000', '#8B0000', '#FFD700'],
  "Sinanju": ['#FF0000', '#000000', '#FFD700'],
  "Unicorn Gundam": ['#FFFFFF', '#FF0055', '#C0C0C0'],
  "ASW-G-08 Gundam Barbatos": ['#FFFFFF', '#00008B', '#FFD700'],
  "GN-001 Gundam Exia": ['#FFFFFF', '#0000FF', '#00FF00'],
  "ZGMF-X10A Freedom Gundam": ['#FFFFFF', '#0000FF', '#FF0000'],
  "Porsche Design": ['#000000', '#1A1A1A', '#FF2800'], 
  "BMW M Motorsport": ['#FFFFFF', '#0033A0', '#E32221'], 
  "Scuderia Ferrari": ['#FF2800', '#FFF200', '#000000'], 
  "Gulf Racing": ['#87CEEB', '#FF4500', '#000000'], 
  "Martini Racing": ['#FFFFFF', '#00008B', '#FF0000'], 
  "Harley-Davidson": ['#000000', '#FF6600', '#C0C0C0'],
  "Ducati Corse": ['#CC0000', '#FFFFFF', '#000000'],
  "Mooneyes": ['#FFFF00', '#000000', '#FFFFFF'],
  "Liberty Walk (LBWK)": ['#000000', '#FFFFFF', '#FF0000'],
  "Red Bull Racing": ['#001A30', '#E32221', '#FFD700'], 
  "Monster Energy": ['#000000', '#39FF14', '#404040'], 
  "Rockstar Energy": ['#000000', '#FFD700', '#FFFFFF'],
  "Ezio Auditore Renaissance Robes": ['#FFFFFF', '#FF0000', '#000000'],
  "Altaïr Levantine Assassin Robes": ['#FFFFFF', '#808080', '#000000'],
  "Connor Kenway Colonial Assassin Robes": ['#FFFFFF', '#0000FF', '#FF0000'],
  "Edward Kenway Pirate Assassin Coat": ['#0000FF', '#FFFFFF', '#8B4513'],
  "Kassandra Misthios Spartan Armor": ['#FF0000', '#FFFFFF', '#FFD700'],
  "Eivor Raven Clan Armor": ['#000000', '#C0C0C0', '#FF0000'],
  "Basim Hidden Ones Robes": ['#000000', '#808080', '#FFFFFF'],
  "Evie Frye Victorian Assassin Outfit": ['#000000', '#FFFFFF', '#FF0000'],
  "Jacob Frye Syndicate Coat": ['#000000', '#FFFFFF', '#FF0000'],
  "Aya Master Assassin Outfit": ['#FF0000', '#FFFFFF', '#FFD700'],
  "Bayek of Siwa Medjay Gear": ['#8B4513', '#FFFFFF', '#FFD700'],
  "Arno Dorian French Revolution Robes": ['#0000FF', '#FFFFFF', '#FF0000'],
  "Shay Cormac Templar Overcoat": ['#000000', '#FFFFFF', '#FF0000'],
  "Desmond Miles Modern Assassin Hoodie": ['#000000', '#FFFFFF', '#FF0000'],
  "Leon S. Kennedy R.P.D. Tactical Uniform": ['#000080', '#C0C0C0', '#000000'],
  "Leon S. Kennedy Bomber Jacket": ['#8B4513', '#F5F5DC', '#000000'],
  "Claire Redfield Red Leather Jacket": ['#FF0000', '#FFFFFF', '#000000'],
  "Chris Redfield BSAA Tactical Gear": ['#006400', '#C0C0C0', '#000000'],
  "Jill Valentine S.T.A.R.S. Uniform": ['#0000FF', '#FFFFFF', '#000000'],
  "Ada Wong Red Dress Aesthetic": ['#FF0000', '#000000', '#FFFFFF'],
  "Albert Wesker Midnight Trench Coat": ['#000000', '#FF0000', '#C0C0C0'],
  "Nemesis T-Type Restraint Gear": ['#808080', '#FF0000', '#000000'],
  "Lady Dimitrescu Vintage White Gown": ['#FFFFFF', '#000000', '#FFD700'],
  "Mr. X Tyrant Fedora & Trench Coat": ['#A9A9A9', '#000000', '#FF0000'],
  "Tyrant T-103": ['#808080', '#000000', '#FF0000'],
  "Licker Exposed Muscle Aesthetic": ['#FF0000', '#000000', '#FFFFFF'],
  "Hunter Bio-Weapon Texture": ['#008000', '#000000', '#FFFFFF'],
  "William Birkin G-Virus Mutation": ['#8B0000', '#000000', '#FFFFFF'],
  "Cloud Strife SOLDIER Uniform": ['#000000', '#C0C0C0', '#0000FF'],
  "Sephiroth Silver Hair & Black Coat": ['#000000', '#C0C0C0', '#FFFFFF'],
  "Aerith Gainsborough Pink Dress Aesthetic": ['#FFC0CB', '#008000', '#FFFFFF'],
  "Tifa Lockhart Brawler Outfit": ['#000000', '#FFFFFF', '#FF0000'],
  "Barret Wallace AVALANCHE Vest": ['#8B4513', '#000000', '#C0C0C0'],
  "Zack Fair SOLDIER 1st Class Uniform": ['#000000', '#0000FF', '#C0C0C0'],
  "Vincent Valentine Crimson Cloak": ['#FF0000', '#000000', '#FFFFFF'],
  "Yuffie Kisaragi Ninja Gear": ['#008000', '#FFFFFF', '#000000'],
  "Cid Highwind Pilot Goggles & Jacket": ['#0000FF', '#FFFFFF', '#000000'],
  "Red XIII Cosmo Beast Aesthetic": ['#FF4500', '#000000', '#FFFFFF'],
  "Cait Sith Fortune Teller Look": ['#000000', '#FFFFFF', '#FF0000'],
  "Reno Turks Suit & Goggles": ['#FF0000', '#000000', '#FFFFFF'],
  "Rude Turks Suit & Sunglasses": ['#000000', '#FFFFFF', '#0000FF'],
  "Elena Turks Uniform": ['#000000', '#FFFFFF', '#FFD700']
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
    "Solid Color (No Pattern)",
    "Adaptive Camouflage",
    "Digital Camouflage",
    "Tie-Dye"
  ],
  "Nusantara (Indonesia)": [
    "Batik Megamendung Motif",
    "Batik Kawung Pattern",
    "Batik Parang Rusak",
    "Tenun Ikat Weave",
    "Songket Palembang Gold Thread",
    "Gorga Batak Carving Motif",
    "Minangkabau Carving Pattern",
    "Toraja Wood Carving Motif",
    "Dayak Borneo Tribal Pattern",
    "Papuan Asmat Tribal Motif"
  ],
  "Asian Traditional": [
    "Japanese Seigaiha Wave",
    "Japanese Asa-no-ha Hemp Leaf",
    "Chinese Dragon Motif",
    "Classic Paisley Pattern",
    "Mandala Sacred Geometry"
  ],
  "European Heritage": [
    "Tartan Plaid Checkered",
    "Classic Houndstooth",
    "Herringbone Tweed Pattern",
    "Damask Floral Pattern",
    "Argyle Diamond Pattern",
    "Fleur-de-lis Motif"
  ],
  "Native Americas": [
    "Navajo Geometric Pattern",
    "Aztec Stepped Motif",
    "Pendleton Tribal Native",
    "Chimayo Woven Textile"
  ],
  "African & Middle East": [
    "Kente Cloth Geometric",
    "Mudcloth (Bogolanfini) Abstract",
    "Moroccan Arabesque Tile",
    "Kilim Woven Geometric"
  ]
};

const BRAND_COLOR_DNA = {
  'Versace': ['#000000', '#D4AF37', '#FFFFFF'], 'Yeezy': ['#C2B280', '#556B2F', '#8B4513'], 'Off-White': ['#FFFFFF', '#000000', '#FFD700'], 
  'Supreme': ['#DA291C', '#FFFFFF', '#000000'], 'Mastermind Japan': ['#000000', '#FFFFFF', '#404040'], 'Balenciaga': ['#000000', '#39FF14', '#C0C0C0'], 
  'Gucci': ['#175E36', '#B22222', '#D4AF37'], 'Louis Vuitton': ['#5C4033', '#C2B280', '#D4AF37'], 'Dior': ['#B0C4DE', '#808080', '#FFFFFF'], 
  'Prada': ['#000000', '#FFFFFF', '#FF0000'], 'Adidas': ['#000000', '#FFFFFF', '#0047AB'], 'Nike': ['#FF6600', '#000000', '#FFFFFF'], 
  'Puma': ['#000000', '#FFFFFF', '#DA291C'], 'New Balance': ['#808080', '#C0C0C0', '#000000'], 'Reebok': ['#FFFFFF', '#000000', '#E21A2C'], 'Asics': ['#000000', '#FFFFFF', '#00529B'], 'Under Armour': ['#000000', '#808080', '#FF0000'], 'Salomon': ['#8B4513', '#A9A9A9', '#2F4F4F'], 
  'Stussy': ['#000000', '#FFFFFF', '#FF69B4'], 'BAPE': ['#556B2F', '#8B4513', '#FFFF00'], 'Fear of God': ['#F5F5DC', '#808080', '#000000'], 'Converse': ['#FFFFFF', '#000000', '#FF0000'], 'Vans': ['#000000', '#FFFFFF', '#FF0000'], 'Dr. Martens': ['#000000', '#FFC000', '#8B0000'], 'Air Jordan': ['#CE1141', '#000000', '#FFFFFF'], 'Crocs': ['#000000', '#808080', '#FFFFFF'],
  'Palace': ['#FFFFFF', '#000000', '#0000FF'], 'Thrasher': ['#000000', '#FF0000', '#FFA500'],
  'Machine 56': ['#000000', '#FF4500', '#00FFFF'], 'Acronym': ['#000000', '#2F4F4F', '#808080'], 'HAMCUS': ['#8B4513', '#556B2F', '#A9A9A9'], 
  'NILmance': ['#000000', '#708090', '#FFFFFF'], 'Y-3': ['#000000', '#FFFFFF', '#FF0000'],
  'The North Face': ['#000000', '#FFFFFF', '#FF0000'], 'Patagonia': ['#0033A0', '#FF6600', '#000000'], 'Stone Island': ['#000000', '#556B2F', '#FFFF00'], "Arc'teryx": ['#808080', '#D4AF37', '#000000'], 'Timberland': ['#C19A6B', '#000000', '#8B4513'], 'Eiger': ['#000000', '#8B4513', '#FF4500'], 'Kalibre': ['#000000', '#404040', '#FF0000'], 'Arei': ['#000000', '#8B0000', '#FFFFFF'],
  'Hermès': ['#F37021', '#000000', '#FFFFFF'], 'Chanel': ['#000000', '#FFFFFF', '#FFD700'], 'Goyard': ['#1B4D3E', '#FFC000', '#000000'], 'Coach': ['#8B4513', '#D2B48C', '#000000'], 'Tumi': ['#000000', '#FF0000', '#C0C0C0'],
  'MCM': ['#C19A6B', '#000000', '#FFFFFF'], 'Fendi': ['#D2B48C', '#000000', '#FFD700'], 'Givenchy': ['#000000', '#FFFFFF', '#4A4A4A'], 'YSL': ['#000000', '#FFFFFF', '#D4AF37'],
  // LOCAL PRIDE
  'Compass': ['#F5F5DC', '#000000', '#C19A6B'], 'Brodo': ['#8B4513', '#000000', '#FFFFFF'], 'Ventela': ['#000000', '#FFFFFF', '#FFD700'], 'Piero': ['#000000', '#FFFFFF', '#FF0000'], 'Geoff Max': ['#000000', '#FFFFFF', '#556B2F'], 'Patrobas': ['#000000', '#FFFFFF', '#808080'], 'Nah Project': ['#FF4500', '#FFFFFF', '#000000'], 'Wakai': ['#DA291C', '#000000', '#FFFFFF'], 'Ortuseight': ['#00FFFF', '#000000', '#FFFFFF'], '910 Nineten': ['#39FF14', '#000000', '#FFFFFF'], 'League': ['#0000FF', '#FFFFFF', '#FF0000'], 'Mills': ['#FFFFFF', '#000000', '#FFD700']
};

const ARTIST_COLOR_DNA = {
  "Takashi Murakami": ['#FF69B4', '#00FFFF', '#FFFF00'], "KAWS": ['#808080', '#000000', '#FF007F'], "Travis Scott": ['#624C3C', '#F8CCDF', '#E51C2B'], 
  "Virgil Abloh": ['#FFFFFF', '#000000', '#FF4500'], "Michael Jordan": ['#CE1141', '#000000', '#FFFFFF'], "Kanye West": ['#8B8682', '#4A4A4A', '#000000'], 
  "Pharrell Williams": ['#FFCC00', '#0000FF', '#FF0000'], "Hiroshi Fujiwara": ['#00008B', '#000000', '#FFFFFF'], "John Varvatos": ['#1A1A1A', '#4A4A4A', '#8B4513']
};

const AESTHETIC_COLOR_DNA = {
  "Opiumcore": ['#000000', '#2E0014', '#C0C0C0'],
  "Gothic": ['#000000', '#8A0303', '#FFFFFF'],
  "Vampirecore": ['#8B0000', '#000000', '#4A0000'],
  "Witchcore": ['#301934', '#000000', '#228B22'],
  "Decadentcore": ['#F7E7CE', '#FFFFFF', '#BDB76B'],
  "Heroin Chic": ['#EAEAEA', '#1A1A1A', '#808080'],
  "Angelcore": ['#FFFFFF', '#FFD700', '#AFEEEE'],
  "Fairycore": ['#98FB98', '#C8A2C8', '#FFB6C1'],
  "Etherealcore": ['#F5F5F5', '#E6E6FA', '#C0C0C0'],
  "Dreamcore": ['#FFB6C1', '#87CEEB', '#9370DB'],
  "Cottagecore": ['#FFFDD0', '#8A9A5B', '#F5DEB3'],
  "Farmcore": ['#1560BD', '#E4D96F', '#CB4154'],
  "Goblincore": ['#4A5D23', '#654321', '#D2B48C'],
  "Forestpunk": ['#4A3728', '#228B22', '#FFFFF0'],
  "Desertcore": ['#C2B280', '#E2725B', '#F4A460'],
  "Dark Academia": ['#4B3621', '#36454F', '#013220'],
  "Light Academia": ['#F5F5DC', '#E0D6C8', '#A0522D'],
  "Royalcore": ['#9E1B32', '#D4AF37', '#4169E1'],
  "Regencycore": ['#98FF98', '#FFDAB9', '#FFFDD0'],
  "Old Money": ['#000080', '#FFFDD0', '#228B22'],
  "Coquette / Lolita": ['#F4C2C2', '#FFFFFF', '#FF6961'],
  "Cyberpunk": ['#00FFFF', '#FF00FF', '#C0C0C0'],
  "Synthwave / Retrowave": ['#FF00FF', '#00FFFF', '#301934'],
  "AIcore": ['#FFFFFF', '#00BFFF', '#C0C0C0'],
  "Glitchcore": ['#B0FF00', '#FF00FF', '#FFFF00'],
  "Frutiger Aero": ['#00FFFF', '#00FF00', '#FFFFFF'],
  "Y2K": ['#C0C0C0', '#FF69B4', '#89CFF0'],
  "Pastel Goth": ['#C8A2C8', '#000000', '#F4C2C2'],
  "Art Hoe": ['#FFDB58', '#EAE6CA', '#1560BD'],
  "Kidcore": ['#FF0000', '#0000FF', '#FFFF00'],
  "Clowncore": ['#FF0000', '#FFFF00', '#000000'],
  "Weirdcore": ['#E6E600', '#808080', '#8B0000']
};

const ALL_MATS = [
  'Cotton / Canvas', 'Fleece / Terry', 'Heavy Drill', 'Denim', 'Corduroy', 'Leather / Faux Leather', 'Silk / Satin', 'Knit / Crochet', 'Nylon / Parachute', 'Tech-Knit / Spandex', 'Lace / Sheer Mesh', 'Ballistic Nylon', 'Carbon Fiber / Kevlar', 'Suede', 'Rubber / TPU', 'Translucent TPU / Mesh'
];

const UNRESTRICTED_MATS = ['Cotton / Canvas', 'Fleece / Terry', 'Heavy Drill', 'Denim', 'Corduroy', 'Leather / Faux Leather', 'Silk / Satin', 'Knit / Crochet', 'Nylon / Parachute', 'Tech-Knit / Spandex', 'Translucent TPU / Mesh'];
const SHEER_MATS = ['Lace / Sheer Mesh', 'Silk / Satin', 'Translucent TPU / Mesh']; 
const HARD_MATS = ['Leather / Faux Leather', 'Ballistic Nylon', 'Carbon Fiber / Kevlar', 'Suede', 'Rubber / TPU', 'Cotton / Canvas', 'Denim', 'Translucent TPU / Mesh'];
const SPORT_MATS = ['Tech-Knit / Spandex', 'Nylon / Parachute', 'Rubber / TPU', 'Knit / Crochet', 'Translucent TPU / Mesh'];

const MATERIALS = ALL_MATS;

const PRODUCTS = {
  "Apparel": {
    "Casual Wear": [
      { name: "Oversized T-Shirt", traits: "Dropped shoulders, wide boxy fit, thick collar rib, relaxed drape", allowedMats: ['Cotton / Canvas', 'Tech-Knit / Spandex', 'Knit / Crochet'] },
      { name: "Classic T-Shirt", traits: "Standard tubular fit, crewneck, comfortable everyday wear", allowedMats: ['Cotton / Canvas', 'Tech-Knit / Spandex'] },
      { name: "Polo Shirt", traits: "Ribbed collar, two or three-button placket, sporty casual fit", allowedMats: ['Cotton / Canvas', 'Tech-Knit / Spandex', 'Knit / Crochet'] },
      { name: "Button-Up Shirt (Kemeja)", traits: "Structured collar, full front button placket, cuffs, versatile silhouette", allowedMats: ['Cotton / Canvas', 'Silk / Satin', 'Denim', 'Heavy Drill'] },
      { name: "Utility Jumpsuit / Boilersuit", traits: "Full-body unified silhouette, front zip closure, structured waist, utilitarian aesthetic", allowedMats: UNRESTRICTED_MATS }
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
    "Asia Tenggara (Mainland)": [
      { name: "Áo Dài (Vietnam)", traits: "Tight-fitting long tunic, high collar, high side slits", allowedMats: UNRESTRICTED_MATS },
      { name: "Chut Thai (Thailand)", traits: "One-shoulder draped Sabai (shawl), wrapped tube skirt", allowedMats: ['Silk / Satin', 'Lace / Sheer Mesh', 'Cotton / Canvas'] }
    ],
    "Asia Timur": [
      { name: "Hanbok", traits: "Korean traditional attire, jeogori top with V-neck overlapping collar, wide flowing chima skirt or baji", allowedMats: UNRESTRICTED_MATS },
      { name: "Gakuran", traits: "Japanese traditional school uniform jacket, stiff stand-up collar, prominent front brass buttons", allowedMats: ['Heavy Drill', 'Cotton / Canvas', 'Denim'] },
      { name: "Cheongsam / Qipao", traits: "Mandarin collar, asymmetrical fastening, side slits", allowedMats: UNRESTRICTED_MATS },
      { name: "Tangzhuang (Tang Suit)", traits: "Men's Mandarin collar shirt/jacket, frog buttons (pankou)", allowedMats: UNRESTRICTED_MATS }, 
      { name: "Sukajan (Souvenir)", traits: "Satin bomber silhouette, contrast raglan sleeves", allowedMats: UNRESTRICTED_MATS },
      { name: "Kimono / Yukata", traits: "Wide draped sleeves, crossed overlapping collar, wide obi belt", allowedMats: UNRESTRICTED_MATS }
    ],
    "Timur Tengah & Modest": [
      { name: "Gamis / Jubbah", traits: "Long structured robe, flowing silhouette", allowedMats: UNRESTRICTED_MATS },
      { name: "Abaya / Kaftan", traits: "Floor-length flowing maxi dress, batwing wide sleeves", allowedMats: UNRESTRICTED_MATS }
    ],
    "Modern & Tactical": [
      { name: "Oversized Puffer Jacket", traits: "Quilted voluminous structure, thick insulation", allowedMats: UNRESTRICTED_MATS },
      { name: "Puffer Vest (Gilet)", traits: "Sleeveless insulated vest, high neck, techwear zippers", allowedMats: ['Nylon / Parachute', 'Fleece / Terry', 'Leather / Faux Leather'] },
      { name: "Biker / Moto Jacket", traits: "Asymmetrical zip, wide lapels, metallic hardware", allowedMats: ['Leather / Faux Leather', 'Denim'] },
      { name: "Tactical Utility Vest", traits: "Multiple cargo pockets, heavy straps, buckles", allowedMats: UNRESTRICTED_MATS },
      { name: "Military Combat Jacket", traits: "Rugged army look, tactical webbing, durable", allowedMats: UNRESTRICTED_MATS },
      { name: "Racer Jacket", traits: "Sleek low-profile collar, front zip, minimalist streamlined silhouette", allowedMats: ['Leather / Faux Leather', 'Nylon / Parachute'] },
      { name: "Field Jacket", traits: "Four front flap pockets, drawstring waist, military-inspired utility", allowedMats: ['Heavy Drill', 'Cotton / Canvas', 'Nylon / Parachute'] },
      { name: "Cowl-Neck Hooded Cloak", traits: "Assassin style drape, oversized hood covering face, asymmetrical hem", allowedMats: UNRESTRICTED_MATS }
    ],
    "Classic Outerwear": [
      { name: "Bomber Jacket (MA-1)", traits: "Nylon shell, ribbed collar and cuffs, relaxed fit", allowedMats: UNRESTRICTED_MATS },
      { name: "Heavyweight Hoodie", traits: "Thick oversized hood, kangaroo pocket", allowedMats: ['Fleece / Terry', 'Heavy Drill', 'Tech-Knit / Spandex'] },
      { name: "Windbreaker", traits: "Lightweight weather-resistant shell, hooded, elastic cuffs", allowedMats: ['Nylon / Parachute'] },
      { name: "Trucker Jacket", traits: "Point collar, button front, chest flap pockets, structured fit", allowedMats: ['Denim', 'Corduroy', 'Suede'] },
      { name: "Coach Jacket", traits: "Snap-button front, shirt collar, drawstring hem, light lining", allowedMats: ['Nylon / Parachute', 'Cotton / Canvas'] },
      { name: "Varsity Jacket", traits: "Contrast leather sleeves, ribbed striped collar/cuffs, chenille patches", allowedMats: ['Fleece / Terry', 'Leather / Faux Leather'] },
      { name: "Turtleneck Jacket", traits: "High zip-up turtleneck collar, insulated body, sleek profile", allowedMats: ['Fleece / Terry', 'Tech-Knit / Spandex', 'Nylon / Parachute'] },
      { name: "Crop Zip Up", traits: "Cropped waist length, front zipper, sporty fitted silhouette", allowedMats: ['Fleece / Terry', 'Tech-Knit / Spandex', 'Nylon / Parachute'] }
    ],
    "Sport & Athletics": [
      { name: "Tracktop / Tracksuit", traits: "Zip-up athletic jacket, stand collar, contrast side stripes", allowedMats: SPORT_MATS },
      { name: "Athletic Compression Top", traits: "Tight performance fabric, sporty crop silhouette, high support", allowedMats: SPORT_MATS },
      { name: "Performance Rash Guard", traits: "Skin-tight long sleeve, aerodynamic seams, tech fabric", allowedMats: SPORT_MATS },
      { name: "Basketball Jersey", traits: "Sleeveless breathable mesh, deep armholes, athletic cut", allowedMats: SPORT_MATS },
      { name: "Baseball Jersey", traits: "Button-up front, short sleeves, curved hem, sporty piping", allowedMats: ['Cotton / Canvas', 'Tech-Knit / Spandex'] },
      { name: "American Football Jersey", traits: "Oversized boxy fit, V-neck, breathable mesh panels, wide sleeves", allowedMats: SPORT_MATS },
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
    ],
    "Traditional Fusion": [
      { name: "Tabi Boots (Split-Toe)", traits: "Japanese split-toe design, cylindrical heel, avant-garde styling", allowedMats: ['Leather / Faux Leather', 'Cotton / Canvas'] },
      { name: "Selop / Mules", traits: "Javanese slipper inspiration, pointed toe, intricate upper detailing", allowedMats: ['Leather / Faux Leather', 'Silk / Satin', 'Suede'] }
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
      { name: "Dry Bag / Roll-Top", traits: "Waterproof cylindrical sack, roll-top buckle closure", allowedMats: ALL_MATS }
    ],
    "Traditional Fusion": [
      { name: "Noken (Woven Bag)", traits: "Papuan inspired woven mesh structure, expandable natural netting", allowedMats: ALL_MATS },
      { name: "Obi Belt Bag", traits: "Wide waist sash integrating a sleek storage pouch, kimono styling", allowedMats: ALL_MATS }
    ]
  }
};

const ICONIC_DB = {
  "Footwear": {
    "Nike": [
      { name: "Air Force 1", traits: "Classic low-top court sneaker, perforated toe box, thick flat sole", allowedMats: HARD_MATS },
      { name: "Air Max 1", traits: "Classic running profile, visible heel bubble, paneled upper", allowedMats: HARD_MATS },
      { name: "Air Max 90", traits: "Retro running profile, visible heel bubble, layered mudguards", allowedMats: HARD_MATS },
      { name: "Air Max 95", traits: "Layered anatomical upper, gradient panels, visible forefoot and heel air units", allowedMats: SPORT_MATS },
      { name: "Air Max 97", traits: "Water ripple inspired lines, full-length visible air unit, reflective piping", allowedMats: SPORT_MATS },
      { name: "Air Max Plus", traits: "Tuned air, wavy TPU overlays, aggressive runner shape", allowedMats: SPORT_MATS },
      { name: "Dunk (High / Low)", traits: "Classic hoops silhouette, paneled leather upper, flat sole", allowedMats: HARD_MATS },
      { name: "Cortez", traits: "Retro running profile, shark-tooth sole, large side swoosh", allowedMats: HARD_MATS },
      { name: "Blazer (Mid / Low)", traits: "Vintage basketball shape, large swoosh, vulcanized rubber sole", allowedMats: HARD_MATS },
      { name: "Air Huarache", traits: "Neoprene bootie, exoskeleton heel cage, chunky sole", allowedMats: SPORT_MATS },
      { name: "Pegasus", traits: "Performance running silhouette, aerodynamic heel, engineered mesh", allowedMats: SPORT_MATS },
      { name: "Vapormax", traits: "Futuristic standalone air pod sole, flexible flyknit upper", allowedMats: SPORT_MATS },
      { name: "Flyknit Racer", traits: "Ultra-lightweight sleek running profile, woven knit upper", allowedMats: SPORT_MATS },
      { name: "Waffle Racer", traits: "Retro track shoe, iconic square waffle tread, low-profile", allowedMats: HARD_MATS },
      { name: "Killshot 2", traits: "Minimalist tennis shoe, suede accents, gum sole", allowedMats: HARD_MATS },
      { name: "Terminator", traits: "High-top 80s basketball, bold heel branding, sturdy leather", allowedMats: HARD_MATS }
    ],
    "Adidas": [
      { name: "Stan Smith", traits: "Minimalist tennis shoe, perforated side details, clean heel tab", allowedMats: HARD_MATS },
      { name: "Superstar", traits: "Iconic shell toe, leather upper, thick rubber cupsole, 3-stripes", allowedMats: HARD_MATS },
      { name: "Samba", traits: "Low-profile retro indoor soccer shoe, T-toe design, gum sole", allowedMats: HARD_MATS },
      { name: "Gazelle", traits: "Classic suede profile, textured midsole, contrasting 3-stripes", allowedMats: HARD_MATS },
      { name: "Campus", traits: "Chunky 80s skate/basketball profile, suede upper, wide laces", allowedMats: HARD_MATS },
      { name: "Forum (High / Low / 84)", traits: "80s basketball, ankle hook-and-loop strap, complex overlays", allowedMats: HARD_MATS },
      { name: "NMD (R1)", traits: "Sock-like upper, boost midsole with colored EVA plugs", allowedMats: SPORT_MATS },
      { name: "Ultraboost", traits: "Sleek running profile, sock-like upper, textured foam midsole, heel cage", allowedMats: SPORT_MATS },
      { name: "ZX 8000", traits: "Retro tech runner, Torsion system, external heel counter", allowedMats: SPORT_MATS },
      { name: "EQT (Equipment)", traits: "90s performance runner, integrated 3-stripe lace loops, aggressive stance", allowedMats: SPORT_MATS },
      { name: "SL 72", traits: "Super light 70s runner, nylon base, suede overlays, traction sole", allowedMats: HARD_MATS },
      { name: "Country", traits: "Classic cross-country runner, overlapping heel counter, sleek toe", allowedMats: HARD_MATS },
      { name: "Micropacer", traits: "Retro-futuristic, lace cover with integrated digital screen, metallic finish", allowedMats: HARD_MATS },
      { name: "Spezial", traits: "Terrace casuals classic, premium suede, dark gum sole", allowedMats: HARD_MATS }
    ],
    "Puma": [
      { name: "Suede", traits: "Classic low-top, premium suede upper, thick laces, lateral formstrip", allowedMats: HARD_MATS },
      { name: "Clyde", traits: "Refined basketball low-top, smooth lines, gold foil branding", allowedMats: HARD_MATS },
      { name: "Roma", traits: "Vintage training shoe, T-toe, orthopedic arch support sole", allowedMats: HARD_MATS },
      { name: "Speedcat", traits: "Motorsport inspired, ultra-low profile, rounded driver's heel", allowedMats: ['Suede', 'Leather / Faux Leather', 'Rubber / TPU'] },
      { name: "RS-X", traits: "Chunky retro-future runner, bold geometric color blocking, thick sole", allowedMats: HARD_MATS },
      { name: "Disc Blaze", traits: "Laceless design with central disc dial mechanism, chunky 90s shape", allowedMats: SPORT_MATS },
      { name: "Future Rider", traits: "Retro 80s runner, shock-absorbing Federbein outsole, slim profile", allowedMats: HARD_MATS },
      { name: "Palermo", traits: "Terrace classic, T-toe, suede upper, classic gum sole", allowedMats: HARD_MATS },
      { name: "Slipstream", traits: "80s basketball high/low, heavily padded collar, robust leather panels", allowedMats: HARD_MATS },
      { name: "Mostro", traits: "Avant-garde asymmetric velcro closure, dimpled spiky sole", allowedMats: SPORT_MATS },
      { name: "Dallas", traits: "Classic 80s terrace shoe, simple suede upper, textured cupsole", allowedMats: HARD_MATS }
    ],
    "New Balance": [
      { name: "574", traits: "Classic ENCAP midsole, suede/mesh upper, quintessential retro runner", allowedMats: HARD_MATS },
      { name: "990 (v1-v6)", traits: "Premium suede/mesh overlays, chunky ENCAP sole, iconic dad shoe aesthetic", allowedMats: HARD_MATS },
      { name: "991", traits: "Sleek premium runner, visible ABZORB pods in forefoot and heel", allowedMats: HARD_MATS },
      { name: "992", traits: "Chunky premium dad shoe, complex suede paneling, dual-zone ABZORB", allowedMats: HARD_MATS },
      { name: "993", traits: "Refined chunky runner, dynamic midsole lines, large N logo", allowedMats: HARD_MATS },
      { name: "550", traits: "Vintage basketball low-top, perforated leather, bulky retro shape", allowedMats: HARD_MATS },
      { name: "327", traits: "Exaggerated flared midsole, oversized N logo, studded wraparound outsole", allowedMats: HARD_MATS },
      { name: "2002R", traits: "Y2K tech runner aesthetic, intricate mesh/synthetic overlays, N-ergy sole", allowedMats: SPORT_MATS },
      { name: "1906R", traits: "Aggressive Y2K performance runner, webbed N-lock system, metallic accents", allowedMats: SPORT_MATS },
      { name: "9060", traits: "Exaggerated wavy chunky sole, retro-futuristic Y2K upper, sway lines", allowedMats: SPORT_MATS },
      { name: "1500", traits: "Sleek premium runner, sharp toe box, embroidered small N logo", allowedMats: HARD_MATS },
      { name: "1300", traits: "Classic ENCAP runner, balanced premium suede and mesh construction", allowedMats: HARD_MATS },
      { name: "998", traits: "ABZORB midsole runner, slightly chunky heel, premium pigskin suede", allowedMats: HARD_MATS }
    ],
    "Reebok": [
      { name: "Club C 85", traits: "Clean minimalist tennis aesthetic, leather upper, window box logo", allowedMats: HARD_MATS },
      { name: "Classic Leather", traits: "Quintessential 80s runner, soft leather, die-cut EVA midsole", allowedMats: HARD_MATS },
      { name: "Instapump Fury", traits: "Laceless design, pump technology bladder, split sole, futuristic", allowedMats: SPORT_MATS },
      { name: "Workout Plus", traits: "80s fitness shoe, signature H-strap overlays, low profile", allowedMats: HARD_MATS },
      { name: "Freestyle Hi", traits: "High-top aerobics shoe, double velcro ankle straps, soft leather", allowedMats: HARD_MATS },
      { name: "Question", traits: "Hexalite cushioning windows, contrasting toe cap, chunky basketball silhouette", allowedMats: HARD_MATS },
      { name: "Shaqnosis", traits: "Hypnotic concentric circle overlays, massive 90s basketball shape", allowedMats: HARD_MATS },
      { name: "Kamikaze", traits: "Aggressive zig-zag mobius design, bold contrast blocking, high-top", allowedMats: HARD_MATS },
      { name: "DMX Trail Shadow", traits: "Rugged trail runner, jagged DMX shear cage, aggressive teeth sole", allowedMats: SPORT_MATS },
      { name: "Beatnik", traits: "Slip-on sandal, jagged shark-tooth sole, adjustable midfoot strap", allowedMats: ['Suede', 'Corduroy', 'Rubber / TPU'] },
      { name: "Aztec", traits: "70s retro runner, dual-density midsole, D-ring speed lacing", allowedMats: HARD_MATS }
    ],
    "Salomon": [
      { name: "XT-6", traits: "Technical trail runner, quick-lace system, aggressive lugged outsole", allowedMats: SPORT_MATS },
      { name: "XT-4", traits: "Agile chassis system trail runner, bold gradient TPU film overlays", allowedMats: SPORT_MATS },
      { name: "Speedcross", traits: "Aggressive deep chevron lugs, quicklace, rugged trail profile", allowedMats: SPORT_MATS },
      { name: "ACS Pro Advanced", traits: "Kurim structure upper, robust metallic eyelets, retro-tech trail aesthetic", allowedMats: SPORT_MATS },
      { name: "XA Pro 3D", traits: "Sturdy hiking profile, 3D advanced chassis, asymmetrical lacing", allowedMats: SPORT_MATS },
      { name: "Snowcross", traits: "High-top winter trail runner, zip-up waterproof shroud cover, spikes", allowedMats: SPORT_MATS },
      { name: "XT-Wings 2", traits: "Classic technical runner, breathable mesh, pronation control chassis", allowedMats: SPORT_MATS },
      { name: "RX Slide / Moc", traits: "Recovery slip-on, oversized EVA midsole, seamless stretch upper", allowedMats: SPORT_MATS }
    ],
    "Asics": [
      { name: "Gel-Lyte III", traits: "Split tongue design, retro running profile, layered suede/mesh", allowedMats: HARD_MATS },
      { name: "Gel-Lyte V", traits: "Neoprene sock liner, sleek retro runner, wavy side stripes", allowedMats: HARD_MATS },
      { name: "Gel-Kayano 14", traits: "Y2K tech runner, metallic overlays, visible GEL cushioning pods", allowedMats: SPORT_MATS },
      { name: "Gel-Kayano 5 OG", traits: "Bulky 90s runner, heavy overlays, large visible GEL heel", allowedMats: HARD_MATS },
      { name: "Gel-1130", traits: "Retro 2000s runner, breathable mesh base, synthetic leather tiger stripes", allowedMats: SPORT_MATS },
      { name: "GT-2160", traits: "Sleek Y2K aesthetic, segmented midsole design, technical mesh", allowedMats: SPORT_MATS },
      { name: "Gel-Nimbus", traits: "Max-cushioning performance runner, thick foam, engineered mesh", allowedMats: SPORT_MATS },
      { name: "Gel-Quantum 360", traits: "Full-length 360-degree visible GEL midsole, seamless knit upper", allowedMats: SPORT_MATS },
      { name: "Onitsuka Tiger Mexico 66", traits: "Ultra-low profile, vintage track shoe, heel cross overlay, thin sole", allowedMats: HARD_MATS },
      { name: "Onitsuka Tiger Corsair", traits: "Classic 70s jogger, thick wedge heel, iconic tiger stripes", allowedMats: HARD_MATS }
    ],
    "Yeezy": [
      { name: "Boost 350 V2", traits: "Minimalist slip-on runner, ribbed wide midsole, sleek primeknit shape", allowedMats: SPORT_MATS },
      { name: "Boost 700 (Wave Runner)", traits: "Chunky dad shoe profile, wavy midsole, layered suede and mesh", allowedMats: HARD_MATS },
      { name: "Boost 700 V2", traits: "Chunky profile, sweeping reflective side stripes, technical mesh", allowedMats: SPORT_MATS },
      { name: "500", traits: "Bulky adiprene sole, cow suede, mesh and premium leather, organic shapes", allowedMats: HARD_MATS },
      { name: "750", traits: "High-top suede boot, midfoot strap, hidden side zipper, ribbed sole", allowedMats: ['Suede', 'Leather / Faux Leather', 'Rubber / TPU'] },
      { name: "Foam Runner", traits: "Alien-like porous structure, single-piece molded foam design", allowedMats: ['Rubber / TPU'] },
      { name: "Slide", traits: "Thick minimalist slide, exaggerated shark-tooth outsole, smooth injected EVA", allowedMats: ['Rubber / TPU'] },
      { name: "Quantum (QNTM)", traits: "High-top basketball, translucent overlay, wavy neoprene heel", allowedMats: SPORT_MATS },
      { name: "380", traits: "Sleek sock-like upper, camouflage knit pattern, smooth translucent bulky sole", allowedMats: SPORT_MATS },
      { name: "450", traits: "Aggressive exoskeleton foam cage gripping the knit upper, alien aesthetic", allowedMats: SPORT_MATS }
    ],
    "Air Jordan": [
      { name: "Air Jordan 1", traits: "Iconic 85 basketball silhouette, paneled leather, wings logo, flat sole", allowedMats: HARD_MATS },
      { name: "Air Jordan 2", traits: "Luxury Italian boot inspired, faux lizard skin panels, no side swoosh", allowedMats: HARD_MATS },
      { name: "Air Jordan 3", traits: "Visible air unit, elephant print mudguards, mid-cut profile", allowedMats: HARD_MATS },
      { name: "Air Jordan 4", traits: "Mesh netting panels, plastic support wings, visible heel air", allowedMats: HARD_MATS },
      { name: "Air Jordan 5", traits: "Fighter jet inspired shark teeth on midsole, reflective tongue, clear mesh", allowedMats: HARD_MATS },
      { name: "Air Jordan 6", traits: "Porsche inspired sleek lines, sports car spoiler heel tab, translucent icy sole", allowedMats: HARD_MATS },
      { name: "Air Jordan 7", traits: "Huarache neoprene inner bootie, tribal geometric patterns on tongue", allowedMats: HARD_MATS },
      { name: "Air Jordan 8", traits: "Criss-cross midfoot straps, chenille tongue patch, heavy 90s aesthetic", allowedMats: HARD_MATS },
      { name: "Air Jordan 11", traits: "Signature patent leather mudguard, translucent outsole, carbon fiber plate", allowedMats: HARD_MATS },
      { name: "Air Jordan 12", traits: "Rising sun flag stitched leather lines, asymmetric lizard skin mudguard", allowedMats: HARD_MATS },
      { name: "Air Jordan 13", traits: "Panther paw inspired outsole, quilted side panels, holographic eye logo", allowedMats: HARD_MATS }
    ],
    "Converse": [
      { name: "Chuck Taylor All Star", traits: "Classic canvas shape, rubber toe cap, flat vulcanized sole", allowedMats: ['Cotton / Canvas', 'Denim', 'Leather / Faux Leather', 'Suede'] },
      { name: "Chuck 70", traits: "Premium canvas, slightly thicker vintage sole, enhanced stitching", allowedMats: ['Cotton / Canvas', 'Denim', 'Leather / Faux Leather', 'Suede'] },
      { name: "Jack Purcell", traits: "Signature 'smile' across the toe cap, refined court shoe profile", allowedMats: ['Cotton / Canvas', 'Leather / Faux Leather'] },
      { name: "One Star", traits: "Low-top skate/court shoe, side star cut-out, suede upper", allowedMats: HARD_MATS },
      { name: "Pro Leather", traits: "Vintage basketball silhouette, chevron and star logo, leather upper", allowedMats: HARD_MATS },
      { name: "Weapon", traits: "Bulky 80s basketball high-top, Y-bar ankle support, thick leather", allowedMats: HARD_MATS },
      { name: "Run Star Hike", traits: "Chunky platform sole, jagged two-tone outsole, classic upper", allowedMats: HARD_MATS },
      { name: "Run Star Motion", traits: "Exaggerated wavy platform sole, futuristic chunky silhouette", allowedMats: HARD_MATS },
      { name: "Star Player", traits: "Skate-inspired low top, padded collar, chevron star logo", allowedMats: HARD_MATS },
      { name: "Skidgrip", traits: "Retro slip-on or lace-up skate shoe, thick vulcanized sole, clean vamp", allowedMats: ['Cotton / Canvas', 'Suede'] },
      { name: "Fastbreak", traits: "80s basketball mid-top, minimalist paneling, retro court vibe", allowedMats: HARD_MATS },
      { name: "ERX 260", traits: "Massive late 80s basketball high-top, heavily paneled, bold branding", allowedMats: HARD_MATS },
      { name: "Bosey", traits: "Rugged utility boot hybrid, ribbed rubber toe bumper, thick tread", allowedMats: ['Cotton / Canvas', 'Leather / Faux Leather', 'Rubber / TPU'] }
    ],
    "Vans": [
      { name: "Authentic", traits: "Simple low-top, canvas upper, classic waffle sole", allowedMats: ['Cotton / Canvas', 'Suede'] },
      { name: "Era", traits: "Padded collar low-top, color-blocked panels, skate classic", allowedMats: ['Cotton / Canvas', 'Suede', 'Leather / Faux Leather'] },
      { name: "Old Skool", traits: "Iconic side stripe (jazz stripe), suede toe and heel, padded collar", allowedMats: ['Cotton / Canvas', 'Suede', 'Leather / Faux Leather'] },
      { name: "Sk8-Hi", traits: "Legendary high-top, padded ankle support, side stripe, quilted collar", allowedMats: ['Cotton / Canvas', 'Suede', 'Leather / Faux Leather'] },
      { name: "Classic Slip-On", traits: "Laceless design, elastic side accents, iconic checkerboard pattern option", allowedMats: ['Cotton / Canvas', 'Leather / Faux Leather'] },
      { name: "Half Cab", traits: "Mid-top skate shoe, padded tongue and collar, robust suede panels", allowedMats: ['Suede', 'Leather / Faux Leather'] },
      { name: "Knu Skool", traits: "Chunky 90s skate aesthetic, oversized puffy tongue, 3D side stripe", allowedMats: ['Suede', 'Leather / Faux Leather'] },
      { name: "Chukka Boot / Low", traits: "Two-hole desert boot profile, clean vamp, mid or low cut", allowedMats: ['Suede', 'Cotton / Canvas'] },
      { name: "Lampin", traits: "Distinctive curved side panel, unique eyelet layout, retro skate style", allowedMats: ['Suede', 'Cotton / Canvas'] },
      { name: "Rowley Classic", traits: "Slim profile tech skate shoe, synthetic side stripe, athletic vibe", allowedMats: ['Suede', 'Leather / Faux Leather', 'Nylon / Parachute'] },
      { name: "Sk8-Low", traits: "Low-top takedown of the Sk8-Hi, retained paneling and toe box", allowedMats: ['Cotton / Canvas', 'Suede', 'Leather / Faux Leather'] },
      { name: "Native American", traits: "Early high-top skate shoe, rubber toe cap detail, simple side panel", allowedMats: ['Suede', 'Cotton / Canvas'] },
      { name: "UltraRange", traits: "Modern athletic silhouette, breathable mesh, UltraCush midsole", allowedMats: SPORT_MATS },
      { name: "Wayvee", traits: "Advanced skate shoe, translucent mesh panels, reinforced toe cap", allowedMats: ['Suede', 'Nylon / Parachute', 'Rubber / TPU'] }
    ],
    "Dr. Martens": [
      { name: "1460 (8-Eye Boot)", traits: "Classic 8-eyelet combat boot, yellow welt stitching, AirWair sole", allowedMats: ['Leather / Faux Leather', 'Suede'] },
      { name: "1461 (3-Eye Shoe)", traits: "Iconic 3-eyelet oxford shoe, robust leather, signature stitching", allowedMats: ['Leather / Faux Leather', 'Suede'] },
      { name: "2976 (Chelsea Boot)", traits: "Sleek pull-on boot, elastic side gussets, smooth leather profile", allowedMats: ['Leather / Faux Leather', 'Suede'] },
      { name: "1490 (10-Eye Boot)", traits: "Taller mid-calf combat boot, 10 eyelets, punk/goth heritage", allowedMats: ['Leather / Faux Leather'] },
      { name: "1914 (14-Eye Boot)", traits: "Knee-high lace-up boot, bold statement silhouette, rigid leather", allowedMats: ['Leather / Faux Leather'] },
      { name: "Jadon (Platform Boot)", traits: "Chunky platform Quad sole, 8-eye lace up, aggressive stance", allowedMats: ['Leather / Faux Leather'] },
      { name: "Sinclair (Zip Platform)", traits: "Platform sole, removable front zipper jungle piece, tumbled leather", allowedMats: ['Leather / Faux Leather'] },
      { name: "Adrian (Tassel Loafer)", traits: "Classic subculture loafer, double tassel, kiltie fringe", allowedMats: ['Leather / Faux Leather', 'Suede'] },
      { name: "8065 (Mary Jane)", traits: "Double buckle strap closure, brogue detailing option, T-bar shape", allowedMats: ['Leather / Faux Leather'] },
      { name: "3989 (Brogue Shoe)", traits: "Wingtip detailing, intricate perforations, classic gentleman style", allowedMats: ['Leather / Faux Leather'] },
      { name: "Church (Monkey Boot)", traits: "Vintage archival style, low-slung laces, distinctive side stitching", allowedMats: ['Leather / Faux Leather', 'Suede'] },
      { name: "Audrick", traits: "Exaggerated lightweight platform, jagged Quad Neoteric sole", allowedMats: ['Leather / Faux Leather'] },
      { name: "Jorge (Mule)", traits: "Closed-toe slip-on mule, adjustable heel strap, relaxed fit", allowedMats: ['Leather / Faux Leather', 'Suede'] },
      { name: "Blaire (Sandal)", traits: "Gladiator style strappy sandal, slight wedge 'Zebrilus' sole", allowedMats: ['Leather / Faux Leather'] },
      { name: "Gryphon (Sandal)", traits: "Heavy-duty leather strap sandal, brass buckles, classic AirWair sole", allowedMats: ['Leather / Faux Leather'] }
    ],
    "Crocs": [
      { name: "Classic Clog", traits: "Iconic porous foam clog, heel strap, bulky round toe, jibbitz holes", allowedMats: ['Rubber / TPU'] },
      { name: "Pollex Clog", traits: "Organic fingerprint ridge pattern, exoskeleton molded foam, utilitarian strap", allowedMats: ['Rubber / TPU'] },
      { name: "Echo Clog", traits: "Sculpted aerodynamic foam, aggressive wavy lines, sports-inspired chassis", allowedMats: ['Rubber / TPU'] },
      { name: "Mega Crush Clog", traits: "Massive platform sole, rugged heavy tread, exaggerated proportions", allowedMats: ['Rubber / TPU'] }
    ],
    "Compass": [
      { name: "Gazelle", traits: "Classic vintage canvas sneaker, signature side wave logo, vulcanized sole", allowedMats: ['Cotton / Canvas', 'Denim', 'Suede'] },
      { name: "Retrograde", traits: "Retro aesthetic, layered side logo, slightly chunky vintage midsole", allowedMats: ['Cotton / Canvas', 'Leather / Faux Leather'] },
      { name: "Flight", traits: "Modern utilitarian sneaker, technical ripstop elements, zipper accents", allowedMats: ['Nylon / Parachute', 'Ballistic Nylon', 'Leather / Faux Leather'] },
      { name: "Velocity", traits: "Running inspired silhouette, aerodynamic mesh, sporty overlays", allowedMats: SPORT_MATS },
      { name: "Proto 1", traits: "Deconstructed raw canvas look, exposed stitching, minimalist vulcanized", allowedMats: ['Cotton / Canvas', 'Denim'] },
      { name: "Linen", traits: "Breathable linen upper, relaxed casual aesthetic, slim sole", allowedMats: ['Cotton / Canvas'] }
    ],
    "Brodo": [
      { name: "Signore", traits: "Signature formal-casual leather shoe, classic stitching, moc-toe detail", allowedMats: ['Leather / Faux Leather', 'Suede'] },
      { name: "Vantage", traits: "Clean everyday sneaker, minimalist paneling, flat cupsole", allowedMats: HARD_MATS },
      { name: "Vulcan", traits: "Classic canvas vulcanized shoe, durable bumper, clean aesthetic", allowedMats: ['Cotton / Canvas', 'Suede'] },
      { name: "Base", traits: "Essential clean leather sneaker, versatile profile, padded collar", allowedMats: ['Leather / Faux Leather'] },
      { name: "Alpha", traits: "Sturdy leather boot profile, rugged construction, gentleman aesthetic", allowedMats: ['Leather / Faux Leather'] },
      { name: "Epsilon", traits: "Sporty casual trainer, breathable knit elements, ergonomic sole", allowedMats: SPORT_MATS },
      { name: "Origin", traits: "Heritage leather design, premium construction, smart casual look", allowedMats: ['Leather / Faux Leather'] }
    ],
    "Ventela": [
      { name: "Public", traits: "Iconic striped canvas shoe, rubber toe cap, striped midsole", allowedMats: ['Cotton / Canvas', 'Denim'] },
      { name: "77 / Retro77", traits: "Vintage 70s vibe, reinforced stitching, durable canvas upper", allowedMats: ['Cotton / Canvas', 'Suede'] },
      { name: "Republic", traits: "Modern casual vulcanized, clean side logo, reinforced heel", allowedMats: ['Cotton / Canvas', 'Leather / Faux Leather'] },
      { name: "Basic", traits: "Stripped down minimalist canvas shoe, clean profile", allowedMats: ['Cotton / Canvas'] },
      { name: "BTS (Back To 70s)", traits: "Classic retro shape, distinct bumper texture, vintage eyelets", allowedMats: ['Cotton / Canvas', 'Suede'] },
      { name: "Armor", traits: "Rugged urban exploration sneaker, technical overlays, thick sole", allowedMats: HARD_MATS },
      { name: "Urban", traits: "Sleek low-profile canvas, everyday beater, versatile", allowedMats: ['Cotton / Canvas', 'Denim'] }
    ],
    "Piero": [
      { name: "Jogger", traits: "Classic retro runner shape, suede and mesh combo, comfortable midsole", allowedMats: HARD_MATS },
      { name: "London", traits: "Sleek urban sneaker, minimalist side panel, versatile shape", allowedMats: HARD_MATS },
      { name: "Arc", traits: "Chunky modern streetwear runner, bold overlays, thick sculpted sole", allowedMats: SPORT_MATS },
      { name: "Suedo", traits: "Premium full suede upper, casual lifestyle profile", allowedMats: ['Suede', 'Leather / Faux Leather'] },
      { name: "Essential", traits: "Clean basic trainer, breathable materials, lightweight sole", allowedMats: SPORT_MATS },
      { name: "Classic", traits: "Heritage tennis shoe silhouette, simple perforation, flat sole", allowedMats: HARD_MATS },
      { name: "Legion", traits: "Aggressive tech runner, layered synthetic panels, sporty", allowedMats: SPORT_MATS }
    ],
    "Geoff Max": [
      { name: "Authentic", traits: "Skate-inspired low top, sturdy canvas, vulcanized waffle-like sole", allowedMats: ['Cotton / Canvas', 'Suede'] },
      { name: "Timeless", traits: "Clean low-profile skate shoe, durable stitching, flat sole", allowedMats: ['Cotton / Canvas', 'Leather / Faux Leather'] },
      { name: "Maverick", traits: "Aggressive streetwear sneaker, layered side panels, padded collar", allowedMats: HARD_MATS },
      { name: "Ethan", traits: "Classic vulcanized hi-top, durable construction, skate ready", allowedMats: ['Cotton / Canvas', 'Suede'] },
      { name: "Vision", traits: "Modern skate profile, reinforced ollie area, cushioned sole", allowedMats: HARD_MATS }
    ],
    "Patrobas": [
      { name: "Ivan", traits: "Signature smile bumper toe cap, sturdy canvas, classic aesthetic", allowedMats: ['Cotton / Canvas', 'Denim'] },
      { name: "Equip", traits: "Elevated vulcanized sneaker, premium canvas, refined details", allowedMats: ['Cotton / Canvas', 'Suede'] },
      { name: "Cloud", traits: "Extra cushioned insole, comfortable daily beater, simple profile", allowedMats: ['Cotton / Canvas', 'Leather / Faux Leather'] },
      { name: "Hawk", traits: "Sturdy hi-top silhouette, reinforced heel, rugged canvas", allowedMats: ['Cotton / Canvas', 'Denim'] }
    ],
    "Nah Project": [
      { name: "FlexKnit", traits: "Ultra-breathable knit upper, flexible lightweight sole, sock-like fit", allowedMats: ['Tech-Knit / Spandex', 'Knit / Crochet'] },
      { name: "Audacity", traits: "Chunky streetwear silhouette, bold colorblocking potential, thick sole", allowedMats: HARD_MATS },
      { name: "Coronado", traits: "Classic court sneaker shape, premium synthetic leather, minimalist", allowedMats: HARD_MATS },
      { name: "Pelican", traits: "Slip-on casual shoe, ergonomic shape, lightweight construction", allowedMats: ['Cotton / Canvas', 'Tech-Knit / Spandex'] },
      { name: "SN-01", traits: "Futuristic bulky runner, techy overlays, dynamic midsole", allowedMats: SPORT_MATS }
    ],
    "Wakai": [
      { name: "Core", traits: "Japanese inspired relaxed slip-on, canvas upper, fold-down heel", allowedMats: ['Cotton / Canvas', 'Fleece / Terry'] },
      { name: "Gyou", traits: "Sock-sneaker hybrid, flexible knit upper, EVA outsole, minimalist", allowedMats: ['Tech-Knit / Spandex'] },
      { name: "Atsui", traits: "Chukka style mid-top, casual relaxed fit, lightweight", allowedMats: ['Cotton / Canvas', 'Suede'] },
      { name: "Uwabaki", traits: "Indoor slipper inspired, elastic strap over vamp, extremely minimal", allowedMats: ['Cotton / Canvas', 'Silk / Satin'] },
      { name: "Shou", traits: "Clean lace-up sneaker, low profile, lightweight EVA sole", allowedMats: ['Cotton / Canvas', 'Leather / Faux Leather'] }
    ],
    "Ortuseight": [
      { name: "Jogosala", traits: "Futsal-inspired street shoe, suede toe bumper, flat gum sole", allowedMats: HARD_MATS },
      { name: "Catalyst", traits: "Sleek football/running hybrid, synthetic skin upper, aerodynamic", allowedMats: SPORT_MATS },
      { name: "Forte", traits: "Aggressive athletic profile, supportive heel counter, sleek", allowedMats: SPORT_MATS },
      { name: "Hyperglide", traits: "Performance running shoe, thick curved foam midsole, breathable mesh", allowedMats: SPORT_MATS },
      { name: "Solar", traits: "Lightweight trainer, seamless upper construction, speedy silhouette", allowedMats: SPORT_MATS },
      { name: "Shuriken", traits: "Dynamic turf/court shoe, textured striking zones, sharp lines", allowedMats: SPORT_MATS },
      { name: "Phyton", traits: "Robust indoor court shoe, durable synthetic panels, traction sole", allowedMats: HARD_MATS }
    ],
    "910 Nineten": [
      { name: "Haze", traits: "Advanced running silhouette, engineered mesh, responsive thick midsole", allowedMats: SPORT_MATS },
      { name: "Kaze", traits: "Lightweight trainer, breathable upper, aerodynamic fast shape", allowedMats: SPORT_MATS },
      { name: "Geist", traits: "Modern athleisure sneaker, seamless overlays, cushioned heel", allowedMats: SPORT_MATS },
      { name: "Ekiden", traits: "Marathon racing profile, extremely thin mesh, carbon plate aesthetic", allowedMats: SPORT_MATS },
      { name: "Yuza", traits: "Rugged trail running shoe, aggressive lugs, reinforced toe box", allowedMats: SPORT_MATS },
      { name: "Ryu", traits: "Casual sporty slip-on/lace hybrid, flexible knit, comfort focused", allowedMats: ['Tech-Knit / Spandex'] }
    ],
    "League": [
      { name: "Volans", traits: "Technical running shoe, engineered mesh, stable heel chassis", allowedMats: SPORT_MATS },
      { name: "Shift", traits: "Versatile athleisure sneaker, seamless overlays, clean look", allowedMats: SPORT_MATS },
      { name: "Karkter", traits: "Classic casual trainer, suede/mesh combo, retro running vibe", allowedMats: HARD_MATS },
      { name: "Valiant", traits: "Sturdy basketball/court shoe profile, high ankle support, thick padding", allowedMats: HARD_MATS },
      { name: "Sadewa", traits: "Performance running, responsive foam tech, breathable structure", allowedMats: SPORT_MATS },
      { name: "Ghost", traits: "Minimalist lightweight runner, phantom mesh upper, stealthy look", allowedMats: SPORT_MATS },
      { name: "Grip", traits: "Court and indoor sport shoe, gum traction sole, durable upper", allowedMats: HARD_MATS }
    ],
    "Mills": [
      { name: "Treximo", traits: "Dynamic running trainer, fast forward-leaning silhouette, breathable", allowedMats: SPORT_MATS },
      { name: "Xanthus", traits: "Chunky modern lifestyle sneaker, complex paneling, wavy midsole", allowedMats: HARD_MATS },
      { name: "Triton", traits: "Athletic turf shoe, textured upper for control, low-to-ground feel", allowedMats: SPORT_MATS },
      { name: "Spartan", traits: "Robust training shoe, lateral stability panels, flat lifting sole", allowedMats: HARD_MATS },
      { name: "Energetix", traits: "Highly cushioned running shoe, thick rocker sole, lightweight mesh", allowedMats: SPORT_MATS },
      { name: "Revolt", traits: "Chunky athletic lifestyle shoe, layered upper, robust stance", allowedMats: HARD_MATS }
    ],
    "Balenciaga": [
      { name: "Triple S", traits: "Massive triple-stacked chunky sole, distressed oversized upper", allowedMats: HARD_MATS },
      { name: "Speed Trainer", traits: "High-top sock sneaker, minimalist elastic upper, sculpted sole", allowedMats: SPORT_MATS },
      { name: "Track", traits: "Complex multi-layered overlapping cage, rugged outdoor-inspired sole", allowedMats: SPORT_MATS },
      { name: "Defender", traits: "Extreme heavy-duty tire tread sole wrapping the shoe, worn aesthetic", allowedMats: SPORT_MATS }
    ],
    "Louis Vuitton": [
      { name: "LV Trainer", traits: "Luxury 80s basketball sneaker, complex monogram paneling, thick cupsole", allowedMats: HARD_MATS },
      { name: "Archlight", traits: "Exaggerated wave-shaped oversized arch sole, futuristic high-tongue design", allowedMats: HARD_MATS }
    ],
    "Prada": [
      { name: "Monolith Boot", traits: "Massive chunky block sole, attached nylon pouches, combat boot style", allowedMats: HARD_MATS },
      { name: "America's Cup", traits: "Sleek low-profile sailing sneaker, patent leather and mesh panels", allowedMats: HARD_MATS }
    ],
    "Timberland": [
      { name: "6-Inch Premium Boot", traits: "Rugged work boot shape, padded leather collar, heavy lug sole", allowedMats: ['Suede', 'Leather / Faux Leather', 'Rubber / TPU'] }
    ]
  },
  "Accessories": {
    "Versace": [
      { name: "La Medusa", traits: "Structured handbag, central prominent Medusa head plaque, thick chain link option", allowedMats: ALL_MATS },
      { name: "Virtus", traits: "Elegant V-letter baroque hardware, quilted V pattern, refined evening bag", allowedMats: ALL_MATS },
      { name: "Greca Goddess", traits: "Smooth leather, bold geometric Greca chain motif hardware, sharp angles", allowedMats: ALL_MATS },
      { name: "Palazzo Empire", traits: "Large structured tote, tonal Medusa head clasp, dual top handles", allowedMats: ALL_MATS },
      { name: "Tribute", traits: "Iconic bowling bag shape, gold medallion details, vintage luxury", allowedMats: ALL_MATS },
      { name: "Repeat", traits: "Hobo style re-edition, biker-inspired zippers, half-moon slouchy shape", allowedMats: ALL_MATS },
      { name: "Medusa Biggie", traits: "Messenger/crossbody style, oversized Medusa medallion, streetwear luxury", allowedMats: ALL_MATS },
      { name: "Athena", traits: "Canvas tote, baroque border print, top handles, casual luxury", allowedMats: ALL_MATS },
      { name: "La Greca Signature", traits: "Tote/crossbody with all-over geometric La Greca monogram canvas", allowedMats: ALL_MATS }
    ],
    "Louis Vuitton": [
      { name: "Speedy", traits: "Classic doctor's bag shape, rolled leather handles, Monogram canvas", allowedMats: ALL_MATS },
      { name: "Neverfull", traits: "Wide open-top luxury tote, thin side laces, spacious interior", allowedMats: ALL_MATS },
      { name: "Alma", traits: "Structured domed shape, rigid leather base, double zip closure", allowedMats: ALL_MATS },
      { name: "Keepall Trunk", traits: "Classic structured duffle/koper, reinforced corners, rounded handles", allowedMats: ALL_MATS },
      { name: "Noé", traits: "Classic bucket bag silhouette, drawstring leather closure", allowedMats: ALL_MATS },
      { name: "Capucines", traits: "Structured top-handle, prominent LV initials clasp, flap that can be worn two ways", allowedMats: ALL_MATS },
      { name: "Twist", traits: "Structured shoulder bag, pivoting LV twist-lock, wave-shaped base", allowedMats: ALL_MATS },
      { name: "Coussin", traits: "Puffy quilted lambskin, embossed Monogram, chunky chain strap", allowedMats: ALL_MATS },
      { name: "Pochette Accessoires", traits: "Small iconic pouch, thin leather strap, compact zip closure", allowedMats: ALL_MATS },
      { name: "Dauphine", traits: "Vintage-inspired rectangular flap bag, reversible monogram, magnetic lock", allowedMats: ALL_MATS },
      { name: "Petite Malle", traits: "Rigid miniature trunk, metallic corners, S-lock closure, boxy", allowedMats: ALL_MATS },
      { name: "OnTheGo", traits: "Oversized boxy tote, giant Monogram print, dual braided handles", allowedMats: ALL_MATS },
      { name: "Sac Plat", traits: "Extremely flat, tall rectangular tote bag, structured minimalist shape", allowedMats: ALL_MATS },
      { name: "Multi Pochette Accessoires", traits: "Hybrid cross-body, multiple detachable pouches, coin purse, thick woven strap", allowedMats: ALL_MATS },
      { name: "Boîte Chapeau", traits: "Circular hat-box inspired silhouette, rigid round shape, top handle", allowedMats: ALL_MATS }
    ],
    "Balenciaga": [
      { name: "City Bag (Motorcycle)", traits: "Slouchy shape, long leather tassels, studded hardware details", allowedMats: ALL_MATS },
      { name: "Hourglass Bag", traits: "Curved rigid bottom, sharp structural lines, top handle, B logo clasp", allowedMats: ALL_MATS },
      { name: "Le Cagole", traits: "Crescent moon shape, heavy studded hardware, braided strap, heart mirror charm", allowedMats: ALL_MATS },
      { name: "Neo Classic", traits: "Structured, architectural trapezoid update to the Classic City bag", allowedMats: ALL_MATS },
      { name: "Crush", traits: "Soft crushed/quilted texture, curved base, heavy chain strap", allowedMats: ALL_MATS },
      { name: "Everyday Tote", traits: "Minimalist structured shopper tote, simple block letter logo", allowedMats: ALL_MATS },
      { name: "Ville", traits: "Dome-shaped bowler bag, prominent rounded top handles, bold logo", allowedMats: ALL_MATS },
      { name: "Rodeo", traits: "Slouchy oversized tote, relaxed worn-in aesthetic, multiple charms", allowedMats: ALL_MATS },
      { name: "Monaco", traits: "Soft, oversized flap bag, large BB logo, slouchy casual look", allowedMats: ALL_MATS },
      { name: "Trash Pouch", traits: "Drawstring garbage bag silhouette, smooth glossy finish, avant-garde", allowedMats: ALL_MATS }
    ],
    "Gucci": [
      { name: "Jackie 1961", traits: "Curved hobo shape, signature piston hardware closure", allowedMats: ALL_MATS },
      { name: "GG Marmont", traits: "Soft matelassé quilted chevron leather, antique gold GG logo, chain strap", allowedMats: ALL_MATS },
      { name: "Dionysus", traits: "Structured accordion shape, textured tiger head spur closure, sliding chain", allowedMats: ALL_MATS },
      { name: "Horsebit 1955", traits: "Saddle bag shape, prominent double ring and bar equestrian hardware", allowedMats: ALL_MATS },
      { name: "Bamboo 1947", traits: "Curved rigid top handle crafted from authentic bent bamboo", allowedMats: ALL_MATS },
      { name: "Ophidia", traits: "Vintage-inspired shapes, web stripe detail, double G logo hardware", allowedMats: ALL_MATS },
      { name: "Sylvie", traits: "Structured boxy shape, central web stripe, gold chain detail over the flap", allowedMats: ALL_MATS },
      { name: "Soho Disco", traits: "Compact camera bag shape, embossed interlocking G, leather tassel", allowedMats: ALL_MATS },
      { name: "Diana", traits: "Structured tote, bamboo handles, neon leather bands around handles", allowedMats: ALL_MATS },
      { name: "Attache", traits: "Half-moon shape, G-shaped hardware that hooks the corners together", allowedMats: ALL_MATS },
      { name: "Blondie", traits: "Retro rounded shape, large interlocking circular G logo hardware", allowedMats: ALL_MATS }
    ],
    "Prada": [
      { name: "Galleria", traits: "Structured rectangular shape, Saffiano leather texture, dual top handles", allowedMats: ALL_MATS },
      { name: "Cleo", traits: "Curved asymmetrical hobo shape, sleek brushed finish, minimalist", allowedMats: ALL_MATS },
      { name: "Re-Edition 2000/2005", traits: "Utilitarian parachute nylon material, baguette shape, woven strap with mini pouch", allowedMats: ALL_MATS },
      { name: "Cahier", traits: "Antique book inspired, metallic corner hardware, strap closure", allowedMats: ALL_MATS },
      { name: "Sidonie", traits: "Curved ergonomic shape, flap closure, front strap detail", allowedMats: ALL_MATS },
      { name: "Arqué", traits: "Crescent moon hobo bag, stiff curved handle, minimalist logo", allowedMats: ALL_MATS },
      { name: "Moon", traits: "Padded re-edition, large central buckle, puffy curved silhouette", allowedMats: ALL_MATS },
      { name: "Panier", traits: "Bucket bag shape, single top handle, Saffiano leather", allowedMats: ALL_MATS },
      { name: "Double Bag", traits: "Open top tote, internal divider, snap closures on sides", allowedMats: ALL_MATS },
      { name: "Diagramme", traits: "Quilted leather, chain strap, metallic logo plate", allowedMats: ALL_MATS },
      { name: "Symbole", traits: "Jacquard woven fabric, geometric triangle patterns, structured tote", allowedMats: ALL_MATS },
      { name: "Nylon Backpack", traits: "Utilitarian parachute material, multiple buckled pouches, sleek minimalist", allowedMats: ALL_MATS }
    ],
    "Dior": [
      { name: "Lady Dior", traits: "Boxy structured shape, Cannage quilting, DIOR metallic charms, rigid top handles", allowedMats: ALL_MATS },
      { name: "Saddle Bag", traits: "Asymmetrical equestrian saddle shape, short shoulder strap, bold D stirrup hardware", allowedMats: ALL_MATS },
      { name: "Book Tote", traits: "Rigid rectangular tote, fully embroidered structure, prominent center band", allowedMats: ALL_MATS },
      { name: "30 Montaigne", traits: "Boxy flap bag, prominent CD clasp, embossed back detail", allowedMats: ALL_MATS },
      { name: "Caro", traits: "Macrocannage quilted leather, chain link strap with CD initials", allowedMats: ALL_MATS },
      { name: "Bobby", traits: "Hobo-style half-moon shape, CD logo clasp, military-inspired buckle strap", allowedMats: ALL_MATS },
      { name: "Toujours", traits: "Slouchy casual tote, macrocannage texture, D.I.O.R charms, adjustable side ties", allowedMats: ALL_MATS },
      { name: "Diorama", traits: "Structured flap bag, architectural ribbed design, crest-shaped clasp", allowedMats: ALL_MATS },
      { name: "Lady D-Joy", traits: "Elongated rectangular Lady Dior (East-West), cannage stitching", allowedMats: ALL_MATS },
      { name: "Lady D-Lite", traits: "Fully embroidered canvas version of the Lady Dior, wide reversible strap", allowedMats: ALL_MATS },
      { name: "Vibe", traits: "Sporty hobo/bowling bag hybrid, rubber bottom with star motif, bold logo", allowedMats: ALL_MATS }
    ],
    "Hermès": [
      { name: "Birkin Bag", traits: "Structured luxury tote, signature flap, top handle, metallic turn-lock, clochette", allowedMats: ALL_MATS },
      { name: "Kelly Bag", traits: "Trapezoid luxury handbag, single top handle, elegant strap closure, rigid base", allowedMats: ALL_MATS },
      { name: "Constance", traits: "Compact boxy shoulder bag, large H logo clasp closure", allowedMats: ALL_MATS },
      { name: "Evelyne", traits: "Equestrian crossbody, perforated H logo on front, canvas strap", allowedMats: ALL_MATS },
      { name: "Picotin Lock", traits: "Bucket bag shape, padlock detail, minimal hardware, unlined interior", allowedMats: ALL_MATS },
      { name: "Lindy", traits: "Slouchy unique shape, handles on the sides, perpendicular shoulder strap", allowedMats: ALL_MATS },
      { name: "Bolide", traits: "Domed top, zippered closure, sleek minimalist travel-inspired shape", allowedMats: ALL_MATS },
      { name: "Herbag", traits: "Kelly-inspired canvas body, interchangeable leather top flap and straps", allowedMats: ALL_MATS },
      { name: "Jypsiere", traits: "Messenger style, Kelly-like closure, wide adjustable shoulder strap", allowedMats: ALL_MATS },
      { name: "Garden Party", traits: "Simple tote bag, snap closure, unlined, clou de selle snaps on sides", allowedMats: ALL_MATS },
      { name: "Kelly Danse", traits: "Belt/crossbody convertible, casual and supple, flat flap", allowedMats: ALL_MATS },
      { name: "Kelly Cut", traits: "Elongated clutch version of the Kelly bag, top handle, elegant", allowedMats: ALL_MATS }
    ],
    "Chanel": [
      { name: "Classic Flap (11.12)", traits: "Quilted texture, rectangular shape, interwoven chain strap, interlocking CC lock", allowedMats: ALL_MATS },
      { name: "2.55 Reissue", traits: "Aged calfskin, mademoiselle turn-lock (rectangular), all-metal chain strap", allowedMats: ALL_MATS },
      { name: "Boy Bag", traits: "Boxy structure, linear ribbed border, chunky chain strap, brick lock closure", allowedMats: ALL_MATS },
      { name: "Gabrielle", traits: "Hobo shape, rigid base, double chain strap (gold and silver)", allowedMats: ALL_MATS },
      { name: "Chanel 19", traits: "Exaggerated large quilting, mixed hardware chains, slouchy structure", allowedMats: ALL_MATS },
      { name: "Chanel 22", traits: "Pouch-like hobo shape, large medallion, drawstring closure, relaxed leather", allowedMats: ALL_MATS },
      { name: "Wallet on Chain (WOC)", traits: "Compact rectangular wallet size, long thin interwoven chain strap", allowedMats: ALL_MATS },
      { name: "Grand Shopping Tote (GST)", traits: "Large boxy tote, quilted caviar leather, interwoven chain handles, CC logo", allowedMats: ALL_MATS },
      { name: "Deauville Tote", traits: "Large canvas beach tote, prominent typography, chain handles", allowedMats: ALL_MATS },
      { name: "Vanity Case", traits: "Structured rigid box shape, top handle, zip-around closure, retro travel aesthetic", allowedMats: ALL_MATS },
      { name: "Coco Handle", traits: "Trapezoid flap bag, rolled leather top handle, interlocking CC", allowedMats: ALL_MATS },
      { name: "Camera Case", traits: "Small rectangular zip bag, front pocket, long chain strap", allowedMats: ALL_MATS }
    ],
    "Goyard": [
      { name: "Saint Louis Tote", traits: "Reversible lightweight tote, thin leather handles, open top, Goyardine canvas", allowedMats: ALL_MATS },
      { name: "Anjou Tote", traits: "Reversible tote, leather-lined interior, Goyardine canvas exterior", allowedMats: ALL_MATS },
      { name: "Artois Tote", traits: "Structured tote, zip closure, reinforced leather corners", allowedMats: ALL_MATS },
      { name: "Saigon Tote", traits: "Structured top-handle bag, carved wooden handle, leather trim", allowedMats: ALL_MATS },
      { name: "Belvedere Bag", traits: "Messenger-style crossbody bag, leather strap and trim, flap closure", allowedMats: ALL_MATS },
      { name: "Petit Flot Saddle Bag", traits: "Bucket bag shape, drawstring closure, leather strap", allowedMats: ALL_MATS },
      { name: "Rouette Bucket Bag", traits: "Flexible bucket bag, sliding leather strap for multiple wear styles", allowedMats: ALL_MATS },
      { name: "Plumet Bucket Bag", traits: "Minimalist pouch bag, simple leather strap, open top", allowedMats: ALL_MATS },
      { name: "Alpin Backpack", traits: "Classic backpack silhouette, leather trims, Goyardine canvas body", allowedMats: ALL_MATS }
    ],
    "Coach": [
      { name: "Tabby Shoulder Bag", traits: "Structured rectangular shape, prominent C hardware clasp, short strap", allowedMats: ALL_MATS },
      { name: "Willow Saddle Bag", traits: "Equestrian-inspired saddle shape, turnlock closure, adjustable strap", allowedMats: ALL_MATS },
      { name: "Swinger Bag", traits: "Minimalist 90s-inspired baguette shape, zip-top closure", allowedMats: ALL_MATS },
      { name: "Rogue Tote", traits: "Structured tote bag, top handles, pebble leather texture, spacious", allowedMats: ALL_MATS },
      { name: "Field Tote", traits: "Utilitarian tote bag, canvas material, bold Coach typography", allowedMats: ALL_MATS },
      { name: "Cassie Crossbody", traits: "Classic flap bag, turnlock closure, top handle, elegant silhouette", allowedMats: ALL_MATS },
      { name: "Pillow Tabby", traits: "Puffy, ultra-soft version of the Tabby bag, plush aesthetic", allowedMats: ALL_MATS },
      { name: "Hutton Saddle Bag", traits: "Refined saddle bag shape, metallic turnlock, chain strap", allowedMats: ALL_MATS }
    ],
    "MCM": [
      { name: "Stark Backpack", traits: "Structured backpack silhouette, prominent studded details, front zip pocket, Visetos print", allowedMats: ALL_MATS },
      { name: "Liz Shopper Tote", traits: "Reversible open tote bag, thin handles, spacious unlined interior", allowedMats: ALL_MATS },
      { name: "Aren Crossbody", traits: "Compact camera bag shape, front zip pocket, woven strap", allowedMats: ALL_MATS },
      { name: "Tracy Shoulder Bag", traits: "Classic flap bag with structural lock clasp, refined profile", allowedMats: ALL_MATS }
    ],
    "Fendi": [
      { name: "Baguette", traits: "Iconic short shoulder bag, rectangular shape, FF logo clasp, meant to be tucked under arm", allowedMats: ALL_MATS },
      { name: "Peekaboo", traits: "Structured top-handle bag, twist lock, distinctive draping front showing the interior lining", allowedMats: ALL_MATS },
      { name: "Sunshine Tote", traits: "Rigid rectangular shopper tote, tortoiseshell handles, prominent FENDI Roma stamping", allowedMats: ALL_MATS },
      { name: "First Bag", traits: "Slouchy clutch shape with an oversized asymmetrical F-shaped clasp frame", allowedMats: ALL_MATS }
    ],
    "Givenchy": [
      { name: "Antigona", traits: "Structured trapezoid shape, rolled leather top handles, prominent triangular logo patch, thick strap", allowedMats: ALL_MATS },
      { name: "Pandora", traits: "Unique asymmetrical boxy shape, double zips, slouchy when worn", allowedMats: ALL_MATS },
      { name: "Shark Lock Bag", traits: "Distinctive fold-over silhouette, heavy shark tooth turn-lock hardware", allowedMats: ALL_MATS },
      { name: "4G Bag", traits: "Boxy flap bag, magnetic 4G logo clasp, minimalist architectural lines", allowedMats: ALL_MATS }
    ],
    "YSL": [
      { name: "Loulou", traits: "Soft envelope shape, Y-quilted leather, interlocking YSL logo, chain strap", allowedMats: ALL_MATS },
      { name: "Sac de Jour", traits: "Structured architectural tote, accordion sides, tubular handles, padlock detail", allowedMats: ALL_MATS },
      { name: "Niki", traits: "Slouchy vintage aesthetic, crinkled leather, tonal leather-covered YSL logo", allowedMats: ALL_MATS },
      { name: "Kate", traits: "Sleek rectangular evening bag, magnetic flap, prominent metal YSL tassel", allowedMats: ALL_MATS },
      { name: "Icare Maxi Tote", traits: "Oversized slouchy shopper tote, quilted texture, giant central YSL brass logo", allowedMats: ALL_MATS }
    ],
    "Tumi": [
      { name: "Alpha Bravo Backpack", traits: "Extreme utilitarian durability, multiple zip compartments, ballistic nylon structure", allowedMats: ALL_MATS },
      { name: "Voyageur Carson Backpack", traits: "Sleek and versatile backpack, gold-tone hardware, nylon material", allowedMats: ALL_MATS },
      { name: "Harrison Bradner Backpack", traits: "Minimalist urban backpack, smooth leather finish, clean lines", allowedMats: ALL_MATS },
      { name: "Arrive Barker Backpack", traits: "Premium executive backpack, leather trims, metallic accents", allowedMats: ALL_MATS },
      { name: "Tahoe Finch Backpack", traits: "Modern casual backpack, rain cover, sporty aesthetic", allowedMats: ALL_MATS },
      { name: "Alpha 3 Briefcase", traits: "Classic business briefcase, multiple pockets, extremely durable", allowedMats: ALL_MATS },
      { name: "Tegra-Lite Continental Carry-On", traits: "Hard-shell luggage, woven Tegris material, multi-directional wheels", allowedMats: ALL_MATS }
    ],
    "The North Face": [
      { name: "Base Camp Duffel", traits: "Cylindrical heavy-duty expedition bag, alpine shoulder straps", allowedMats: ALL_MATS },
      { name: "Borealis Backpack", traits: "Bungee cord front system, multiple compartments, padded straps", allowedMats: ALL_MATS },
      { name: "Recon Backpack", traits: "Front mesh stash pocket, robust daypack structure", allowedMats: ALL_MATS },
      { name: "Jester Backpack", traits: "Sleek everyday daypack, simplified bungee system", allowedMats: ALL_MATS },
      { name: "Surge Backpack", traits: "High-capacity tech backpack, dedicated laptop compartment, robust", allowedMats: ALL_MATS },
      { name: "Vault Backpack", traits: "Minimalist daypack, clean front panel, basic organization", allowedMats: ALL_MATS },
      { name: "Kaban Backpack", traits: "Urban commuter backpack, water-resistant coating, sleek silhouette", allowedMats: ALL_MATS }
    ],
    "Patagonia": [
      { name: "Black Hole Duffel", traits: "Glossy weather-resistant finish, rugged wide opening, robust handles", allowedMats: ALL_MATS },
      { name: "Refugio Daypack", traits: "Classic outdoor daypack, multiple compartments, bungee cord", allowedMats: ALL_MATS },
      { name: "Atom Sling", traits: "Teardrop shaped crossbody sling, ergonomic strap, compact", allowedMats: ALL_MATS },
      { name: "Arbor Backpack", traits: "Vintage outdoor aesthetic, flap closure, D-ring tie-downs", allowedMats: ALL_MATS },
      { name: "Tres Pack", traits: "Convertible 3-in-1 bag (backpack, shoulder bag, briefcase), sleek", allowedMats: ALL_MATS }
    ],
    "Stone Island": [
      { name: "Nylon Metal Backpack", traits: "Metallic iridescent fabric finish, utilitarian zippers, compass patch", allowedMats: ALL_MATS },
      { name: "Reflective Backpack", traits: "High-visibility technical fabric, utilitarian straps, compass patch", allowedMats: ALL_MATS },
      { name: "Tela Paracadute Bag", traits: "Ultra-lightweight parachute material, tactical styling, garment dyed", allowedMats: ALL_MATS },
      { name: "Waist Bag", traits: "Utilitarian bum bag, robust webbing strap, distinct compass logo", allowedMats: ALL_MATS },
      { name: "Marina Canvas Tote", traits: "Heavyweight canvas tote, nautical stripes, large Stone Island branding", allowedMats: ALL_MATS }
    ],
    "Arc'teryx": [
      { name: "Arro 22 Backpack", traits: "Water-tight front zipper, rigid thermoformed back panel, urban outdoor hybrid", allowedMats: ALL_MATS },
      { name: "Mantis Backpack", traits: "Versatile daypack, clean lines, side pockets, ergonomic design", allowedMats: ALL_MATS },
      { name: "Granville Backpack", traits: "Sleek courier style backpack, flap closure, highly weather resistant", allowedMats: ALL_MATS },
      { name: "Blade Backpack", traits: "Slim profile commuter bag, side-loading capability, tech focused", allowedMats: ALL_MATS },
      { name: "Alpha FL Backpack", traits: "Ultra-minimalist alpine climbing pack, roll-top, bungee cord front", allowedMats: ALL_MATS },
      { name: "Heliad Backpack", traits: "Extremely lightweight travel pack, minimalist construction, packable", allowedMats: ALL_MATS },
      { name: "Brize Backpack", traits: "Hiking daypack, thermoformed back panel, top lid closure", allowedMats: ALL_MATS }
    ],
    "Timberland": [
      { name: "Classic Canvas Backpack", traits: "Rugged outdoor aesthetic, canvas body, leather accents", allowedMats: ALL_MATS },
      { name: "Roll-Top Backpack", traits: "Rugged canvas, leather bottom, roll-top closure with buckle", allowedMats: ALL_MATS },
      { name: "Earthkeepers Backpack", traits: "Eco-friendly materials, vintage styling, multiple utility pockets", allowedMats: ALL_MATS },
      { name: "Leather Messenger Bag", traits: "Classic leather satchel, rugged distressed leather, brass hardware", allowedMats: ALL_MATS },
      { name: "Boot Laces Waistbag", traits: "Bum bag styling, signature Timberland boot lace details", allowedMats: ALL_MATS }
    ],
    "Eiger": [
      { name: "Rhinos Carrier", traits: "Tall expedition mountaineering backpack, thick waist belt, webbing loops", allowedMats: ALL_MATS },
      { name: "Excelsior Carrier", traits: "Heavy-duty trekking pack, advanced back system, robust frame", allowedMats: ALL_MATS },
      { name: "Diario Daypack", traits: "Classic everyday backpack, simple two-compartment design", allowedMats: ALL_MATS },
      { name: "Wanderlust Daypack", traits: "Classic outdoor daypack, multiple straps, robust zippers", allowedMats: ALL_MATS },
      { name: "Z-Lucid Daypack", traits: "Sleek minimalist daypack, urban styling, laptop sleeve", allowedMats: ALL_MATS },
      { name: "X-Trecker Backpack", traits: "Rugged tactical look, multiple attachment points, durable fabric", allowedMats: ALL_MATS },
      { name: "Kinkajou Pouch", traits: "Small tactical travel pouch, crossbody strap, multiple zips", allowedMats: ALL_MATS }
    ],
    "Kalibre": [
      { name: "Predator Backpack", traits: "Hard-shell tactical turtle shell design, aerodynamic urban commuter shape", allowedMats: ALL_MATS },
      { name: "Overshield Backpack", traits: "Futuristic hard-shell front panel, tech-focused interior", allowedMats: ALL_MATS },
      { name: "Explode Backpack", traits: "Aggressive multi-compartment design, heavy-duty zippers", allowedMats: ALL_MATS },
      { name: "Vanguard Backpack", traits: "Sleek commuter bag, water-resistant zippers, clean profile", allowedMats: ALL_MATS },
      { name: "Horten Backpack", traits: "Versatile daypack, robust handle, multiple utility pockets", allowedMats: ALL_MATS },
      { name: "Krios Backpack", traits: "Tactical-inspired shape, molle webbing, durable construction", allowedMats: ALL_MATS }
    ],
    "Arei": [
      { name: "Carrier Ramelu", traits: "Rugged hiking carrier, external frame elements, heavy-duty buckles", allowedMats: ALL_MATS },
      { name: "Carrier Toba", traits: "High capacity trekking pack, adjustable back system, thick padding", allowedMats: ALL_MATS },
      { name: "Carrier Atmos", traits: "Advanced airflow back system, streamlined outdoor shape", allowedMats: ALL_MATS },
      { name: "Daypack Mamberamo", traits: "Versatile outdoor daypack, side mesh pockets, bungee cord", allowedMats: ALL_MATS },
      { name: "Daypack Vantu", traits: "Urban outdoor hybrid, sleek design, laptop compartment", allowedMats: ALL_MATS }
    ]
  }
};

const getGarmentMenuCategories = (pType) => {
  if (pType === 'Apparel') return Object.keys(PRODUCTS["Apparel"]);
  return ["Iconic Silhouette", "New Model (Generic)", "Outdoor & Tactical", "Traditional Fusion"];
};

const getGarmentsList = (pType, mCat, bName) => {
  if (pType === 'Apparel') {
    return PRODUCTS["Apparel"][mCat] || PRODUCTS["Apparel"]["Nusantara (Indonesia)"];
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

// KOMPONEN DESAIN TAMBAHAN
const DESIGN_COMPONENTS = {
  "Apparel": [
    "None (Standard Cut)",
    "Sleeveless / Vest-Cut",
    "Oversized Hooded",
    "Asymmetrical Hem",
    "Multiple Cargo Pockets",
    "Exposed Zippers / Techwear Hardware",
    "Distressed / Ripped Details",
    "Extra Long / Duster Cut"
  ],
  "Footwear": [
    "None (Standard Structure)",
    "Clear Outsole",
    "Gum Sole",
    "Gum Midsole",
    "Vibram Sole",
    "3D Printed Sole",
    "Zipper System / Zip-Up Shroud",
    "Ankle Strap / Velcro Support",
    "Exaggerated Lacing System",
    "Visible Air/Gel Pods",
    "Platform / Stacked Sole"
  ],
  "Accessories": [
    "None (Standard Detail)",
    "Heavy Chain Links",
    "Multiple Utility Pouches Attached",
    "Oversized Buckles / Clasps",
    "Bungee Cord / Webbing System"
  ]
};

// --- NEW ESTHETIC THEMES DATABASE ---
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

const DESIGN_STYLES = {
  "Minimalist / Clean": "Sleek, minimalist modern interpretation, solid colors, NO busy patterns.",
  "Authentic & Ornate": "Rich motifs, heavy detailed embroidery, bold graphics.",
  "Techwear / Tactical": "Futuristic utility, tactical straps, cargo pockets."
};

const BACKGROUND_STYLES = {
  "Auto (Match Aesthetic)": "AUTO",
  "Clean Studio": "Clean seamless white studio background.", 
  "Urban / Street": "Urban city street background, dynamic neon lighting.",
  "Cyberpunk City": "Dystopian futuristic cyberpunk city alley, rain.", 
  "Outdoor / Wilderness": "Majestic mountain peak, misty forest, rugged nature landscape.",
  "Inside Concrete Building": "Inside a brutalist concrete building, raw concrete walls, minimalist aesthetic, natural lighting.",
  "Zebra Cross at Noon": "Pedestrian zebra crossing on a busy city street, bright noon sunlight, dynamic fashion street photography.",
  "White Sand Beach": "Beautiful white sand beach, clear blue sky, tropical aesthetic, bright sunlight, coastal vibe."
};

const GENDERS = ['Female', 'Female (with Hijab)', 'Female (Plus Size)', 'Female (Plus Size & Hijab)', 'Male', 'Male (Plus Size)', 'Androgynous'];
const ASPECT_RATIOS = {
  "16:9 (Desktop/Triptych)": { ratio: "--ar 16:9", layoutType: "triptych", productOnly: false },
  "16:9 (Desktop/Diptych - Product Only)": { ratio: "--ar 16:9", layoutType: "diptych-horizontal", productOnly: true }, 
  "9:16 (TikTok/Reels)": { ratio: "--ar 9:16", layoutType: "diptych-vertical", productOnly: false }
};

export default function App() {
  const [productType, setProductType] = useState('Apparel'); 

  const [category, setCategory] = useState('Local Pride');
  const [brand, setBrand] = useState('Compass');
  
  const [coBrandCat, setCoBrandCat] = useState('All');
  const [coBrand, setCoBrand] = useState('None'); 
  
  const [collabType, setCollabType] = useState('Artist');
  const [collabArtist, setCollabArtist] = useState('None'); 
  const [collabIP, setCollabIP] = useState('None');
  const [collabCharacter, setCollabCharacter] = useState('');
  const [customIPText, setCustomIPText] = useState(''); 

  const [menuCategory, setMenuCategory] = useState('Casual Wear');
  const [availableGarments, setAvailableGarments] = useState(getGarmentsList('Apparel', 'Casual Wear', 'Compass'));
  const [baseGarment, setBaseGarment] = useState(availableGarments[0]); 
  const [customShapeText, setCustomShapeText] = useState(''); 
  
  const [materials, setMaterials] = useState(['Cotton / Canvas']); 
  const [fitStyle, setFitStyle] = useState('Regular Fit');
  
  // DUAL/TRIPLE COMPONENTS
  const [designComponent1, setDesignComponent1] = useState('None (Standard Cut)');
  const [designComponent2, setDesignComponent2] = useState('None (Standard Cut)');
  const [designComponent3, setDesignComponent3] = useState('None (Standard Structure)'); 
  
  const [selectedAesthetic, setSelectedAesthetic] = useState('None (Standard Fashion)');
  const [designStyle, setDesignStyle] = useState('Authentic & Ornate');
  const [backgroundStyle, setBackgroundStyle] = useState('Auto (Match Aesthetic)');
  const [gender, setGender] = useState('Female');
  const [useUploadedDesign, setUseUploadedDesign] = useState(false);
  
  const [selectedPattern, setSelectedPattern] = useState("Solid Color (No Pattern)");
  
  const [colorMode, setColorMode] = useState('Brand'); 
  const [useColors, setUseColors] = useState(true); 
  const [color1, setColor1] = useState(BRAND_COLOR_DNA['Compass'][0]);
  const [color2, setColor2] = useState(BRAND_COLOR_DNA['Compass'][1]); 
  const [color3, setColor3] = useState(BRAND_COLOR_DNA['Compass'][2]); 
  
  const [aspectRatio, setAspectRatio] = useState("16:9 (Desktop/Triptych)");
  const [layoutPos, setLayoutPos] = useState('Center'); 
  const [whiteLabel, setWhiteLabel] = useState(false);
  
  const [prompt, setPrompt] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (colorMode === 'Aesthetic' && selectedAesthetic !== "None (Standard Fashion)") {
      const aesColor = AESTHETIC_COLOR_DNA[selectedAesthetic];
      if (aesColor) {
        setColor1(aesColor[0]); setColor2(aesColor[1]); setColor3(aesColor[2]);
      }
    }
  }, [selectedAesthetic, colorMode]);

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
    if (BRAND_COLOR_DNA[bName]) loadBrandDNA(bName, coBrand);
    
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

  const applyColorLogic = (mode) => {
    setColorMode(mode);
    const bColor = BRAND_COLOR_DNA[brand];
    const cbColor = coBrand !== "None" ? BRAND_COLOR_DNA[coBrand] : null;
    let aColor = null;
    
    if (collabType === 'Artist' && collabArtist !== "None") {
        aColor = ARTIST_COLOR_DNA[collabArtist];
    } else if (collabType === 'IP' && collabCharacter !== "") {
        aColor = IP_CHARACTER_COLOR_DNA[collabCharacter];
    }

    const aesColor = AESTHETIC_COLOR_DNA[selectedAesthetic];

    if (mode === 'Brand' && bColor) {
      setColor1(bColor[0]); setColor2(bColor[1] || bColor[0]); setColor3(bColor[2] || '#FFFFFF');
    } else if (mode === 'Collab') {
      if (aColor) { setColor1(aColor[0]); setColor2(aColor[1]); setColor3(aColor[2]); }
      else if (cbColor) { setColor1(cbColor[0]); setColor2(cbColor[1]); setColor3(cbColor[2]); }
      else if (bColor) { setColor1(bColor[0]); setColor2(bColor[1]); setColor3(bColor[2]); } 
    } else if (mode === 'Aesthetic' && aesColor) {
      setColor1(aesColor[0]); setColor2(aesColor[1]); setColor3(aesColor[2]);
    } else if (mode === 'Mix') {
      setColor1(bColor ? bColor[0] : '#000000');
      if (aColor && cbColor) { setColor2(cbColor[0]); setColor3(aColor[0]); } 
      else if (aColor) { setColor2(aColor[0]); setColor3(aColor[1]); } 
      else if (cbColor) { setColor2(cbColor[0]); setColor3(bColor[1] || cbColor[1]); } 
      else if (aesColor) { setColor2(aesColor[0]); setColor3(aesColor[1]); }
      else { setColor2(bColor ? (bColor[1] || bColor[0]) : '#333333'); setColor3(bColor ? (bColor[2] || '#FFFFFF') : '#FFFFFF'); }
    }
  };

  const generateRandomPalette = () => {
    setColorMode('Random');
    const colors = generateSensiblePalette();
    setColor1(colors[0]);
    setColor2(colors[1]);
    setColor3(colors[2]);
  };

  const loadBrandDNA = (currentBrand, currentCoBrand) => {
    const bColor = BRAND_COLOR_DNA[currentBrand];
    const cbColor = currentCoBrand !== "None" ? BRAND_COLOR_DNA[currentCoBrand] : null;
    
    if (bColor) {
      setUseColors(true);
      setColorMode(currentCoBrand !== "None" ? 'Mix' : 'Brand');
      setColor1(bColor[0]); 
      setColor2(bColor[1] || bColor[0]); 
      setColor3(cbColor ? cbColor[0] : bColor[2] || '#FFFFFF');
    }
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
        if (randIP !== "None") {
            setCollabCharacter(COLLAB_IPS[randIP][Math.floor(Math.random() * COLLAB_IPS[randIP].length)]);
        }
        setCollabArtist("None");
        setCustomIPText('');
    } else {
        const artists = Object.keys(COLLAB_ARTISTS).filter(k => k !== 'None');
        randArtist = Math.random() > 0.6 ? artists[Math.floor(Math.random() * artists.length)] : "None"; 
        setCollabArtist(randArtist);
        setCollabIP("None");
        setCollabCharacter("");
        setCustomIPText('');
    }
    
    const menus = getGarmentMenuCategories(randType);
    const randMenu = menus[Math.floor(Math.random() * menus.length)];
    let items = getGarmentsList(randType, randMenu, randBrand);
    let finalGarment = items[Math.floor(Math.random() * items.length)];
    let randGender = GENDERS[Math.floor(Math.random() * GENDERS.length)];

    if (randType === 'Apparel') {
       const suitableGarments = items.filter(g => g?.gender?.includes(randGender) || !g.gender);
       if (suitableGarments.length === 0) {
           const fallback = items[Math.floor(Math.random() * items.length)];
           if(fallback.gender) randGender = fallback.gender[Math.floor(Math.random() * fallback.gender.length)];
           finalGarment = fallback;
       } else {
           finalGarment = suitableGarments[Math.floor(Math.random() * suitableGarments.length)];
       }
    }

    const shuffledMats = [...(finalGarment.allowedMats || UNRESTRICTED_MATS)].sort(() => 0.5 - Math.random());
    const matCount = Math.floor(Math.random() * 3) + 1; 
    const randMaterials = shuffledMats.slice(0, Math.min(matCount, shuffledMats.length));

    const fits = DYNAMIC_FITS[randType];
    let validFits = fits;
    if (randType === 'Apparel' && finalGarment) {
      const isModest = randGender === 'Female (with Hijab)' || finalGarment.name.includes('Gamis') || finalGarment.name.includes('Abaya') || finalGarment.name.includes('Koko');
      if (isModest) validFits = fits.filter(f => f !== 'Crop Top Style');
    }
    const randFit = validFits[Math.floor(Math.random() * validFits.length)];
    
    const components = DESIGN_COMPONENTS[randType];
    const randComp1 = Math.random() > 0.4 ? components[Math.floor(Math.random() * components.length)] : components[0];
    const randComp2 = Math.random() > 0.6 && randComp1 !== components[0] ? components[Math.floor(Math.random() * components.length)] : components[0];
    const randComp3 = Math.random() > 0.7 && randType === 'Footwear' ? components[Math.floor(Math.random() * components.length)] : components[0];

    const availablePatternPool = ["Solid Color (No Pattern)"];
    Object.values(GLOBAL_PATTERNS).flat().filter(p => p !== "Solid Color (No Pattern)").forEach(p => availablePatternPool.push(p));
    if (BRAND_PATTERNS[randBrand]) availablePatternPool.push(...BRAND_PATTERNS[randBrand]);
    if (randCoBrand !== "None" && BRAND_PATTERNS[randCoBrand]) availablePatternPool.push(...BRAND_PATTERNS[randCoBrand]);
    if (!isIP && randArtist !== "None" && ARTIST_PATTERNS[randArtist]) availablePatternPool.push(...ARTIST_PATTERNS[randArtist]);

    if (Math.random() > 0.5) {
        setSelectedPattern(availablePatternPool[Math.floor(Math.random() * availablePatternPool.length)]);
    } else {
        setSelectedPattern("Solid Color (No Pattern)");
    }

    const aesthetics = Object.keys(AESTHETIC_THEMES);
    const randAes = Math.random() > 0.3 ? aesthetics[Math.floor(Math.random() * aesthetics.length)] : "None (Standard Fashion)";
    
    setProductType(randType);
    setCategory(randCat); 
    setBrand(randBrand); 
    setCoBrandCat('All');
    setCoBrand(randCoBrand); 
    setGender(randGender);
    setMenuCategory(randMenu);
    setAvailableGarments(getGarmentsList(randType, randMenu, randBrand));
    setBaseGarment(finalGarment);
    setMaterials(randMaterials); 
    setFitStyle(randFit);
    setDesignComponent1(randComp1); 
    setDesignComponent2(randComp2);
    setDesignComponent3(randComp3);
    setSelectedAesthetic(randAes);
    setDesignStyle(Object.keys(DESIGN_STYLES)[Math.floor(Math.random() * 3)]);
    setBackgroundStyle('Auto (Match Aesthetic)');
    setUseUploadedDesign(false);
    setCustomShapeText('');
    
    let newColorMode = 'Mix';
    if (randAes !== "None (Standard Fashion)" && Math.random() > 0.5) {
        newColorMode = 'Aesthetic';
    } else if ((randCoBrand !== "None" || randArtist !== "None" || randIP !== "None") && Math.random() > 0.5) {
        newColorMode = 'Collab';
    } else {
        newColorMode = 'Brand';
    }
    
    setUseColors(true);
    setColorMode(newColorMode);

    const bColor = BRAND_COLOR_DNA[randBrand];
    const cbColor = randCoBrand !== "None" ? BRAND_COLOR_DNA[randCoBrand] : null;
    const aesColor = AESTHETIC_COLOR_DNA[randAes];
    let aColor = null;
    
    if (!isIP && randArtist !== "None") aColor = ARTIST_COLOR_DNA[randArtist];
    else if (isIP && randIP !== "None") {
        const charName = COLLAB_IPS[randIP][Math.floor(Math.random() * COLLAB_IPS[randIP].length)];
        aColor = IP_CHARACTER_COLOR_DNA[charName];
    }

    if (newColorMode === 'Aesthetic' && aesColor) {
        setColor1(aesColor[0]); setColor2(aesColor[1]); setColor3(aesColor[2]);
    } else if (newColorMode === 'Collab') {
        if (aColor) { setColor1(aColor[0]); setColor2(aColor[1]); setColor3(aColor[2]); }
        else if (cbColor) { setColor1(cbColor[0]); setColor2(cbColor[1]); setColor3(cbColor[2]); }
        else if (bColor) { setColor1(bColor[0]); setColor2(bColor[1] || bColor[0]); setColor3(bColor[2] || '#FFFFFF'); } 
    } else if (newColorMode === 'Brand' && bColor) {
        setColor1(bColor[0]); setColor2(bColor[1] || bColor[0]); setColor3(bColor[2] || '#FFFFFF');
    } else {
        setColor1(bColor ? bColor[0] : '#000000');
        if (aColor) { setColor2(aColor[0]); setColor3(aColor[1]); } 
        else if (cbColor) { setColor2(cbColor[0]); setColor3(cbColor[1]); } 
        else if (aesColor) { setColor2(aesColor[0]); setColor3(aesColor[1]); }
        else { setColor2('#333333'); setColor3('#FFFFFF'); }
    }
  };

  const getCoBrandList = () => {
    if (coBrandCat === 'All') return ALL_BRANDS.filter(b => b !== brand);
    return FASHION_CATEGORIES[coBrandCat].brands.filter(b => b !== brand);
  };

  const generatePrompt = () => {
    const brandStyle = FASHION_CATEGORIES[category].description;
    const coBrandText = coBrand !== "None" ? ` x ${coBrand}` : '';
    
    let collabText = "";
    let collabDetails = "";
    if (collabType === 'Artist' && collabArtist !== "None" && collabArtist !== "None (No Artist)") {
        collabText = ` x ${collabArtist.split(' ')[0]}`;
        collabDetails = `Aesthetic Injection: ${COLLAB_ARTISTS[collabArtist]}.`;
    } else if (collabType === 'IP' && collabIP !== "None") {
        if (collabIP === "Custom IP (Type Manual)" && customIPText.trim() !== "") {
            collabText = ` x ${customIPText}`;
            collabDetails = `Pop-Culture Injection: Heavily themed around ${customIPText}, integrating iconic character colorways, motifs, and graphic elements into the design structure.`;
        } else if (collabIP !== "Custom IP (Type Manual)") {
            collabText = ` x ${collabIP}`;
            collabDetails = `Pop-Culture Injection: Heavily themed around ${collabCharacter} from ${collabIP}, integrating iconic character colorways, motifs, and graphic elements into the design structure.`;
        }
    }
    
    let materialText = "";
    if (materials.length === 1) materialText = `${materials[0]}`;
    else if (materials.length === 2) materialText = `a mixed-material paneling of ${materials[0]} and ${materials[1]}`;
    else materialText = `a complex patchwork construction of ${materials[0]}, ${materials[1]}, and ${materials[2]}`;

    let colorPrompt = "";
    if (useColors) {
        colorPrompt = `Color Palette (${colorMode} Strategy): Main color is ${color1}, secondary color is ${color2}, accent color is ${color3}.`;
    }

    let compList = [];
    if (designComponent1 && !designComponent1.includes("None")) compList.push(designComponent1.toLowerCase());
    if (designComponent2 && !designComponent2.includes("None") && designComponent2 !== designComponent1) compList.push(designComponent2.toLowerCase());
    if (productType === 'Footwear' && designComponent3 && !designComponent3.includes("None") && designComponent3 !== designComponent1 && designComponent3 !== designComponent2) compList.push(designComponent3.toLowerCase());
    
    let componentText = "";
    if (compList.length > 0) {
        componentText = ` Structurally modified with ${compList.join(' and ')} features.`;
    }

    let patternText = "";
    if (selectedPattern !== "Solid Color (No Pattern)") {
        if (selectedPattern.includes("Camouflage") || selectedPattern.includes("Tie-Dye")) {
            patternText = ` Featuring an all-over ${selectedPattern.toLowerCase()} pattern dynamically adapting to and utilizing the specified color palette.`;
        } else {
            patternText = ` Featuring prominent all-over ${selectedPattern} material/pattern.`;
        }
    }

    const currentLayoutData = ASPECT_RATIOS[aspectRatio];
    const isProductOnly = currentLayoutData.productOnly;

    let garmentSilhouette = baseGarment?.name || "";
    let garmentTraits = baseGarment?.traits || "";
    let accessoryTypeStr = "bag accessory"; 

    if (productType === 'Accessories') {
        if (baseGarment?.name === "Custom Shape (Type Manual)" && customShapeText.trim() !== "") {
             garmentSilhouette = customShapeText.trim();
             garmentTraits = `avant-garde, literal and functional ${customShapeText.toLowerCase()} structural form`;
             accessoryTypeStr = customShapeText.toLowerCase();
        } else if (baseGarment && !baseGarment.name.toLowerCase().includes('bag') && !baseGarment.name.toLowerCase().includes('backpack') && !baseGarment.name.toLowerCase().includes('tote')) {
             accessoryTypeStr = "accessory";
        }
    }

    // --- ADVANCED WHITE LABEL & NEGATIVE PROMPT LOGIC ---
    let whiteLabelPrompt = "";
    if (whiteLabel) {
        let antiBrandText = `(Remove ALL ${brand} insignias)`;
        if (coBrand !== "None") antiBrandText = `(Remove ALL ${brand} and ${coBrand} insignias)`;

        if ((collabType === 'Artist' && collabArtist !== "None" && collabArtist !== "None (No Artist)") || 
            (collabType === 'IP' && collabIP !== "None")) {
            whiteLabelPrompt = `CRITICAL INSTRUCTION: NO COMMERCIAL BRAND LOGOS OR TEXT ${antiBrandText}. Keep the main structure unbranded (white-label). However, STRICTLY RETAIN AND HIGHLIGHT all artistic motifs, design languages, character patterns, and aesthetic vibes from the collaboration. Strip commercial trademarks but keep the collaborative art style prominent.`;
        } else {
            let shoeOverride = productType === 'Footwear' ? "Ensure smooth, blank side panels without any brand insignias. " : "";
            whiteLabelPrompt = `CRITICAL INSTRUCTION: NO BRAND LOGOS, NO TEXT, NO GRAPHIC TYPOGRAPHY. Keep the design completely unbranded (white-label). ${shoeOverride}Replicate the silhouette and vibe ONLY, strip all visible trademarks or logos ${antiBrandText}.`;
        }
    } else {
        whiteLabelPrompt = `Feature signature branding prominently.`;
    }

    let negativePrompt = "--no floating text, watermarks, captions, magazine text, layout labels, borders, UI elements, signature";
    if (whiteLabel) {
        negativePrompt += `, clothing typography, brand logos, graphic text, printed name, ${brand} logo`;
        if (coBrand !== "None") negativePrompt += `, ${coBrand} logo`;
        if (productType === 'Footwear') {
            negativePrompt += `, swoosh, three stripes, side logo, N logo, star logo, tongue tag, branding patch`;
        }
    }
    if (isProductOnly) negativePrompt += ", humans, models, people, faces, bodies"; 

    const uploadPrompt = useUploadedDesign ? 
      `CRITICAL INSTRUCTION: Applicate and accommodate the custom design/graphic from the image reference I upload to fit perfectly onto the ${productType.toLowerCase()} structure.`
      : "";

    const isHijabi = gender.includes('Hijab');
    const isPlusSize = gender.includes('Plus Size');
    
    let baseGender = 'model';
    if (gender.includes('Female')) baseGender = 'female';
    else if (gender.includes('Male')) baseGender = 'male';
    else if (gender.includes('Androgynous')) baseGender = 'androgynous';

    const modelGender = isPlusSize ? `plus-size curvy ${baseGender}` : baseGender;
    const hijabPrompt = isHijabi ? ' wearing a matching high-fashion sleek hijab (modest styling),' : '';
    let modestConstraint = "";
    if (productType === 'Apparel' && isHijabi) {
        modestConstraint = ' Ensure the design adheres to modest fashion (long sleeves, no revealing skin, fully covered).';
    }

    let aestheticContext = "";
    let aestheticModelVibe = "";
    let finalBackground = BACKGROUND_STYLES[backgroundStyle];

    if (selectedAesthetic !== "None (Standard Fashion)") {
        const aes = AESTHETIC_THEMES[selectedAesthetic];
        if (aes) { 
            aestheticContext = `Aesthetic Core: ${selectedAesthetic}. Overall Vibe & Wardrobe context: ${aes.clothing}. Lighting & Atmosphere: ${aes.lighting}.`;
            aestheticModelVibe = `Model Expression & Makeup: ${aes.makeup}.`;
            
            if (backgroundStyle === "Auto (Match Aesthetic)") {
                finalBackground = `Setting & Decor: ${aes.background}.`;
            }
        }
    } else {
        if (backgroundStyle === "Auto (Match Aesthetic)") {
            finalBackground = BACKGROUND_STYLES["Clean Studio"];
        }
    }

    let panelFront, panelBack, panelModel;

    if (productType === 'Apparel') {
        panelFront = `Front view flat lay / tech pack of the garment, highly detailed, clean white background, showing the front tailoring, ${fitStyle.toLowerCase()}, focusing on the ${garmentSilhouette} silhouette. Constructed using ${materialText}.${patternText}${componentText}${modestConstraint}`;
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
        layoutPrompt = `layout split horizontally into 2 vertical panels (Top and Bottom).
Top Panel: ${panelModel}
Bottom Panel: ${panelFront}`;
    } else if (currentLayoutData.layoutType === 'diptych-horizontal') {
        layoutPrompt = `layout split vertically into 2 perfectly equal horizontal panels (Left and Right).
Left Panel: ${panelFront}
Right Panel: ${panelBack}`;
    } else {
        let leftPanel, centerPanel, rightPanel;
        if (layoutPos === 'Center') { leftPanel = panelFront; centerPanel = panelModel; rightPanel = panelBack; } 
        else if (layoutPos === 'Left') { leftPanel = panelModel; centerPanel = panelFront; rightPanel = panelBack; } 
        else { leftPanel = panelFront; centerPanel = panelBack; rightPanel = panelModel; }
        
        layoutPrompt = `triptych layout split perfectly into 3 vertical panels.
Left Panel: ${leftPanel}
Center Panel: ${centerPanel}
Right Panel: ${rightPanel}`;
    }

    let conceptBrandStr = whiteLabel ? "an unbranded high-fashion" : `${brand}${coBrandText}`;

    const basePrompt = `A stunning product and fashion editorial photography, ${layoutPrompt}

Concept: A crossover ${productType.toLowerCase()} design combining ${conceptBrandStr}${collabText} (${category} style: ${brandStyle}) with the structural silhouette of ${garmentSilhouette} (${garmentTraits}). 
${aestheticContext}
${collabDetails}
${uploadPrompt}
Primary Materials: ${materialText}.
Design Fit/Structure: ${fitStyle}.
Design Approach: ${DESIGN_STYLES[designStyle]}
${colorPrompt}
${whiteLabelPrompt}

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
    
    let activeBg = backgroundStyle;
    if (backgroundStyle === 'Auto (Match Aesthetic)' && selectedAesthetic !== "None (Standard Fashion)") {
        const aes = AESTHETIC_THEMES[selectedAesthetic];
        if (aes) {
            const grp = aes.group;
            if (grp.includes('Gelap & Gotik')) bgStyleStr = 'linear-gradient(to bottom, #1a0b16, #000000)';
            if (grp.includes('Fantasi & Surgawi')) bgStyleStr = 'linear-gradient(to bottom, #fde4ec, #e0f7fa)';
            if (grp.includes('Alam & Pedesaan')) bgStyleStr = 'linear-gradient(to bottom, #dcedc8, #aed581)';
            if (grp.includes('Akademis & Klasik')) bgStyleStr = 'linear-gradient(to bottom, #d7ccc8, #8d6e63)';
            if (grp.includes('Futuristik & Cyber')) bgStyleStr = 'linear-gradient(to bottom, #2b0b3a, #0f172a)';
            if (grp.includes('Pop Culture')) bgStyleStr = 'linear-gradient(to bottom, #ff4081, #7c4dff)';
        }
    } else {
        if (backgroundStyle === 'Cyberpunk City') bgStyleStr = 'linear-gradient(to bottom, #2b0b3a, #0f172a)';
        if (backgroundStyle === 'Desert / Dystopian') bgStyleStr = 'linear-gradient(to bottom, #d2b48c, #8b4513)';
        if (backgroundStyle === 'Urban / Street') bgStyleStr = 'linear-gradient(to bottom, #1a1a2e, #0f172a)';
        if (backgroundStyle === 'Outdoor / Wilderness') bgStyleStr = 'linear-gradient(to bottom, #2d4a22, #1a2e15)';
        if (backgroundStyle === 'Inside Concrete Building') bgStyleStr = 'linear-gradient(to bottom, #7a7a7a, #333333)';
        if (backgroundStyle === 'Zebra Cross at Noon') bgStyleStr = 'linear-gradient(to bottom, #87CEEB, #4f4f4f)';
        if (backgroundStyle === 'White Sand Beach') bgStyleStr = 'linear-gradient(to bottom, #00BFFF, #F5DEB3)';
    }

    const ProductIcon = productType === 'Footwear' ? Footprints : productType === 'Accessories' ? Briefcase : Shirt;

    const ModelNode = (
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 shadow-[0_0_30px_rgba(0,0,0,0.5)]" style={{ background: bgStyleStr }}>
        <span className={`absolute text-[9px] font-bold bottom-2 tracking-widest ${backgroundStyle === 'Clean Studio' ? 'text-neutral-500' : 'text-red-400 mix-blend-difference'}`}>MODEL / LIFESTYLE</span>
        <div className={`w-8 h-20 md:h-24 rounded-full flex items-center justify-center ${backgroundStyle === 'Clean Studio' ? 'bg-neutral-300' : 'bg-white/20 border border-white/50 shadow-lg'}`}>📸</div>
        {useUploadedDesign && <span className="absolute top-2 right-2 text-[8px] bg-indigo-500 text-white px-1.5 py-0.5 rounded font-bold shadow-md">+ IMAGE REF</span>}
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
                <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">Fashion Gen <span className="text-red-500">v52</span></h1>
                <p className="text-neutral-400 text-[11px] md:text-xs font-medium">Aesthetic Core Engine & Auto Context Mapping</p>
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
                
                {productType === 'Apparel' && (
                  <div className="mb-2">
                    <select value={gender} onChange={(e) => setGender(e.target.value)}
                      className="w-full bg-neutral-900 border border-neutral-800 text-red-400 text-xs font-bold rounded-xl focus:ring-red-500 p-3">
                      {GENDERS.map(g => <option key={g} value={g}>Model: {g}</option>)}
                    </select>
                  </div>
                )}

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
                
                {/* NEW: Custom Shape Manual Input for Accessories */}
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
            <div className="space-y-3 bg-red-950/10 p-4 rounded-2xl border border-red-500/20">
               <div className="flex justify-between items-center">
                 <label className="text-xs font-bold text-red-300 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-red-500/30 flex items-center justify-center text-[10px] text-white">3</span>
                    Mixed Materials (Max 3)
                  </label>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded ${materials.length === 3 ? 'bg-red-500 text-white' : 'bg-neutral-800 text-neutral-400'}`}>
                    {materials.length} / 3
                  </span>
               </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                  {MATERIALS.map(mat => {
                    const isAllowed = baseGarment?.allowedMats?.includes(mat) ?? false;
                    const isSelected = materials.includes(mat);
                    const isMaxedOut = !isSelected && materials.length >= 3;
                    const isDisabled = !isAllowed || isMaxedOut;

                    return (
                      <button key={mat} onClick={() => toggleMaterial(mat)} disabled={isDisabled}
                        className={`text-left text-[10px] p-2 rounded-lg border transition-all ${
                          isSelected ? 'border-red-500 bg-red-500/20 text-white shadow-[0_0_10px_rgba(239,68,68,0.3)]' : 
                          isDisabled ? 'border-neutral-800/50 bg-neutral-900/30 text-neutral-600 cursor-not-allowed opacity-30' :
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
                
                {/* MULTI DESIGN COMPONENT DROPDOWN */}
                <div className={`grid gap-2 ${productType === 'Footwear' ? 'grid-cols-3' : 'grid-cols-2'}`}>
                    <select value={designComponent1} onChange={(e) => setDesignComponent1(e.target.value)}
                        className="w-full bg-neutral-900 border border-red-500/30 text-white text-[10px] font-bold rounded-xl focus:ring-red-500 p-2 truncate">
                        {DESIGN_COMPONENTS[productType].map(comp => <option key={comp} value={comp}>Add: {comp}</option>)}
                    </select>
                    <select value={designComponent2} onChange={(e) => setDesignComponent2(e.target.value)}
                        className="w-full bg-neutral-900 border border-red-500/30 text-white text-[10px] font-bold rounded-xl focus:ring-red-500 p-2 truncate">
                        {DESIGN_COMPONENTS[productType].map(comp => <option key={comp} value={comp}>Add: {comp}</option>)}
                    </select>
                    {productType === 'Footwear' && (
                        <select value={designComponent3} onChange={(e) => setDesignComponent3(e.target.value)}
                            className="w-full bg-neutral-900 border border-red-500/30 text-white text-[10px] font-bold rounded-xl focus:ring-red-500 p-2 truncate">
                            {DESIGN_COMPONENTS[productType].map(comp => <option key={comp} value={comp}>Add: {comp}</option>)}
                        </select>
                    )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-red-500/20 flex items-center justify-center text-[9px] text-red-500">5</span>
                  Aesthetic Theme & Approach
                </label>
                <div className="flex flex-col gap-1.5">
                  {/* NEW AESTHETIC CORE SYSTEM */}
                  <select value={selectedAesthetic} onChange={(e) => setSelectedAesthetic(e.target.value)}
                    className="w-full bg-indigo-950 border border-indigo-500/50 text-indigo-200 text-xs font-bold rounded-xl focus:ring-indigo-500 p-2.5">
                    <option value="None (Standard Fashion)">Select Aesthetic: None (Standard)</option>
                    {Object.values(AESTHETIC_THEMES).reduce((acc, aes, idx) => {
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
                    className="w-full bg-neutral-900 border border-neutral-800 text-white text-xs font-bold rounded-xl focus:ring-red-500 p-2.5">
                    {Object.keys(DESIGN_STYLES).map(style => <option key={style} value={style}>{style}</option>)}
                  </select>
                  
                  {/* UPLOAD SYNC FEATURE */}
                  <label className={`flex items-center justify-center cursor-pointer gap-2 p-2.5 rounded-xl border transition-all ${useUploadedDesign ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300' : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:bg-neutral-800'}`} title="Tambahkan instruksi ke AI untuk mengikuti gambar yang Anda masukkan di Midjourney">
                    <input type="checkbox" checked={useUploadedDesign} onChange={(e) => setUseUploadedDesign(e.target.checked)} className="sr-only" />
                    <UploadCloud className={`w-4 h-4 flex-shrink-0 ${useUploadedDesign ? 'text-indigo-400' : 'text-neutral-500'}`} />
                    <span className="text-[10px] font-bold truncate">Add "Accommodate Uploaded Design" Prompt</span>
                    {useUploadedDesign && <CheckCircle2 className="w-3 h-3 text-indigo-400 ml-auto flex-shrink-0" />}
                  </label>

                </div>
              </div>
            </div>

            <div className="h-px w-full bg-neutral-800/50"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-red-500/20 flex items-center justify-center text-[9px] text-red-500">6</span>
                    Intelligent Color & Pattern
                  </label>
                  <label className="flex items-center cursor-pointer gap-1">
                    <input type="checkbox" checked={useColors} onChange={(e) => setUseColors(e.target.checked)} className="rounded border-neutral-700 text-red-500 bg-neutral-900" />
                    <span className="text-[9px] text-neutral-500">Use Palettes</span>
                  </label>
                </div>
                
                <div className={`bg-neutral-900 p-2 rounded-xl border border-neutral-800 flex flex-col gap-2 transition-all ${!useColors ? 'opacity-50 pointer-events-none' : ''}`}>
                  <div className="flex flex-wrap gap-1 bg-neutral-950 p-1 rounded-lg">
                     <button onClick={() => applyColorLogic('Brand')} className={`flex-1 min-w-[50px] text-[9px] font-bold py-1.5 rounded transition-all ${colorMode==='Brand' ? 'bg-red-500 text-white' : 'text-neutral-500 hover:text-white'}`}>Brand</button>
                     <button onClick={() => applyColorLogic('Collab')} disabled={coBrand==="None" && collabArtist==="None" && collabCharacter === ""} className={`flex-1 min-w-[50px] text-[9px] font-bold py-1.5 rounded transition-all ${(coBrand==="None" && collabArtist==="None" && collabCharacter === "") ? 'opacity-30 cursor-not-allowed' : colorMode==='Collab' ? 'bg-blue-500 text-white' : 'text-neutral-500 hover:text-white'}`}>Collab</button>
                     <button onClick={() => applyColorLogic('Aesthetic')} disabled={selectedAesthetic==="None (Standard Fashion)"} className={`flex-1 min-w-[50px] text-[9px] font-bold py-1.5 rounded transition-all ${selectedAesthetic==="None (Standard Fashion)" ? 'opacity-30 cursor-not-allowed' : colorMode==='Aesthetic' ? 'bg-purple-500 text-white' : 'text-neutral-500 hover:text-white'}`}>Aesthetic</button>
                     <button onClick={() => applyColorLogic('Mix')} disabled={coBrand==="None" && collabArtist==="None" && collabCharacter === ""} className={`flex-1 min-w-[50px] text-[9px] font-bold py-1.5 rounded transition-all ${(coBrand==="None" && collabArtist==="None" && collabCharacter === "") ? 'opacity-30 cursor-not-allowed' : colorMode==='Mix' ? 'bg-indigo-500 text-white' : 'text-neutral-500 hover:text-white'}`}>Auto Mix</button>
                     <button onClick={generateRandomPalette} className={`flex-1 min-w-[50px] text-[9px] font-bold py-1.5 rounded transition-all ${colorMode==='Random' ? 'bg-emerald-500 text-white' : 'text-neutral-500 hover:text-white'}`}>Randomize</button>
                  </div>
                  <div className="flex justify-around py-1">
                    <input type="color" value={color1} onChange={(e) => { setColor1(e.target.value); setColorMode('Custom'); }} className="w-8 h-8 rounded-full cursor-pointer bg-transparent border-0 p-0 shadow-sm" title="Manual Pick (Custom)" />
                    <input type="color" value={color2} onChange={(e) => { setColor2(e.target.value); setColorMode('Custom'); }} className="w-8 h-8 rounded-full cursor-pointer bg-transparent border-0 p-0 shadow-sm" title="Manual Pick (Custom)" />
                    <input type="color" value={color3} onChange={(e) => { setColor3(e.target.value); setColorMode('Custom'); }} className="w-8 h-8 rounded-full cursor-pointer bg-transparent border-0 p-0 shadow-sm" title="Manual Pick (Custom)" />
                  </div>
                  
                  {/* PATTERN INJECTOR */}
                  <div className="mt-1 flex items-center gap-2 border-t border-neutral-800 pt-2">
                     <Palette className="w-3 h-3 text-red-500 flex-shrink-0" />
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

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-red-500/20 flex items-center justify-center text-[9px] text-red-500">7</span>
                  Format Layout
                </label>
                <select value={backgroundStyle} onChange={(e) => setBackgroundStyle(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 text-white text-xs font-bold rounded-xl focus:ring-red-500 p-2.5 mb-2">
                  {Object.keys(BACKGROUND_STYLES).map(bg => <option key={bg} value={bg}>{bg}</option>)}
                </select>
                <select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)}
                  className="w-full bg-orange-500/10 border border-orange-500/30 text-orange-300 text-xs font-bold rounded-xl focus:ring-orange-500 p-2.5 mb-1">
                  {Object.keys(ASPECT_RATIOS).map(ar => <option key={ar} value={ar}>{ar}</option>)}
                </select>
                {ASPECT_RATIOS[aspectRatio].layoutType === 'triptych' && (
                  <select value={layoutPos} onChange={(e) => setLayoutPos(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 text-white text-xs rounded-xl focus:ring-red-500 p-2.5">
                    <option value="Left">Model Left</option>
                    <option value="Center">Model Center</option>
                    <option value="Right">Model Right</option>
                  </select>
                )}
                {ASPECT_RATIOS[aspectRatio].layoutType === 'diptych-vertical' && (
                  <div className="w-full bg-neutral-900 border border-neutral-800 text-neutral-500 text-[10px] font-bold rounded-xl p-2.5 flex items-center gap-2">
                    <Smartphone className="w-3 h-3 text-red-400" /> TIKTOK / REELS VERTICAL
                  </div>
                )}
                {ASPECT_RATIOS[aspectRatio].productOnly && (
                  <div className="w-full bg-neutral-900 border border-neutral-800 text-neutral-500 text-[10px] font-bold rounded-xl p-2.5 flex items-center gap-2 text-yellow-500/70">
                    *Model hidden for product-focused tech pack
                  </div>
                )}
              </div>
            </div>

            <button onClick={generatePrompt}
              className="w-full py-4 mt-2 bg-gradient-to-r from-red-600 to-orange-500 text-white hover:opacity-90 rounded-2xl font-black flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-[0_0_20px_rgba(239,68,68,0.3)] text-sm tracking-widest">
              <Wand2 className="w-4 h-4" /> GENERATE MASTERPIECE
            </button>
          </div>

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