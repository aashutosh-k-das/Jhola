// Nepal's 7 provinces and 77 districts (English + Nepali names).
const d = (en, ne) => ({ en, ne });

const PROVINCES = [
  { en: 'Koshi', ne: 'कोशी', districts: [d('Bhojpur', 'भोजपुर'), d('Dhankuta', 'धनकुटा'), d('Ilam', 'इलाम'), d('Jhapa', 'झापा'), d('Khotang', 'खोटाङ'), d('Morang', 'मोरङ'), d('Okhaldhunga', 'ओखलढुङ्गा'), d('Panchthar', 'पाँचथर'), d('Sankhuwasabha', 'सङ्खुवासभा'), d('Solukhumbu', 'सोलुखुम्बु'), d('Sunsari', 'सुनसरी'), d('Taplejung', 'ताप्लेजुङ'), d('Terhathum', 'तेह्रथुम'), d('Udayapur', 'उदयपुर')] },
  { en: 'Madhesh', ne: 'मधेश', districts: [d('Bara', 'बारा'), d('Dhanusha', 'धनुषा'), d('Mahottari', 'महोत्तरी'), d('Parsa', 'पर्सा'), d('Rautahat', 'रौतहट'), d('Saptari', 'सप्तरी'), d('Sarlahi', 'सर्लाही'), d('Siraha', 'सिराहा')] },
  { en: 'Bagmati', ne: 'बागमती', districts: [d('Bhaktapur', 'भक्तपुर'), d('Chitwan', 'चितवन'), d('Dhading', 'धादिङ'), d('Dolakha', 'दोलखा'), d('Kathmandu', 'काठमाडौं'), d('Kavrepalanchok', 'काभ्रेपलाञ्चोक'), d('Lalitpur', 'ललितपुर'), d('Makwanpur', 'मकवानपुर'), d('Nuwakot', 'नुवाकोट'), d('Ramechhap', 'रामेछाप'), d('Rasuwa', 'रसुवा'), d('Sindhuli', 'सिन्धुली'), d('Sindhupalchok', 'सिन्धुपाल्चोक')] },
  { en: 'Gandaki', ne: 'गण्डकी', districts: [d('Baglung', 'बागलुङ'), d('Gorkha', 'गोरखा'), d('Kaski', 'कास्की'), d('Lamjung', 'लमजुङ'), d('Manang', 'मनाङ'), d('Mustang', 'मुस्ताङ'), d('Myagdi', 'म्याग्दी'), d('Nawalpur', 'नवलपुर'), d('Parbat', 'पर्वत'), d('Syangja', 'स्याङ्जा'), d('Tanahun', 'तनहुँ')] },
  { en: 'Lumbini', ne: 'लुम्बिनी', districts: [d('Arghakhanchi', 'अर्घाखाँची'), d('Banke', 'बाँके'), d('Bardiya', 'बर्दिया'), d('Dang', 'दाङ'), d('Eastern Rukum', 'रुकुम पूर्व'), d('Gulmi', 'गुल्मी'), d('Kapilvastu', 'कपिलवस्तु'), d('Palpa', 'पाल्पा'), d('Parasi', 'परासी'), d('Pyuthan', 'प्युठान'), d('Rolpa', 'रोल्पा'), d('Rupandehi', 'रुपन्देही')] },
  { en: 'Karnali', ne: 'कर्णाली', districts: [d('Dailekh', 'दैलेख'), d('Dolpa', 'डोल्पा'), d('Humla', 'हुम्ला'), d('Jajarkot', 'जाजरकोट'), d('Jumla', 'जुम्ला'), d('Kalikot', 'कालिकोट'), d('Mugu', 'मुगु'), d('Salyan', 'सल्यान'), d('Surkhet', 'सुर्खेत'), d('Western Rukum', 'रुकुम पश्चिम')] },
  { en: 'Sudurpashchim', ne: 'सुदूरपश्चिम', districts: [d('Achham', 'अछाम'), d('Baitadi', 'बैतडी'), d('Bajhang', 'बझाङ'), d('Bajura', 'बाजुरा'), d('Dadeldhura', 'डडेल्धुरा'), d('Darchula', 'दार्चुला'), d('Doti', 'डोटी'), d('Kailali', 'कैलाली'), d('Kanchanpur', 'कञ्चनपुर')] },
];

// Delivery tiers (simulated logistics)
const VALLEY = ['Kathmandu', 'Lalitpur', 'Bhaktapur'];
const HUBS = ['Kaski', 'Morang', 'Sunsari', 'Jhapa', 'Chitwan', 'Rupandehi', 'Parsa', 'Banke', 'Kailali', 'Dhanusha', 'Makwanpur', 'Bara', 'Dang', 'Surkhet', 'Kanchanpur'];
const REMOTE = ['Humla', 'Dolpa', 'Mugu', 'Manang', 'Mustang', 'Jumla', 'Kalikot', 'Bajura', 'Bajhang', 'Darchula', 'Taplejung', 'Solukhumbu', 'Rasuwa'];

const DISTRICT_TO_PROVINCE = Object.fromEntries(PROVINCES.flatMap((p) => p.districts.map((x) => [x.en, p.en])));

module.exports = { PROVINCES, VALLEY, HUBS, REMOTE, DISTRICT_TO_PROVINCE };
