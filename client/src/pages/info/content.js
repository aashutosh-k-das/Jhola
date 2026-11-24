// Content for the footer / help pages, in English and Nepali.
// Policies describe how the store actually works (see server/utils/pricing.js, delivery.js, orderController.js).
// NOTE: These are starting templates — have the legal pages (Terms, Privacy, Returns) reviewed before launch.

const L = (en, ne) => ({ en, ne });

export const SUPPORT = {
  phone: '1660-01-56789',
  email: 'support@jhola.com.np',
  grievanceEmail: 'grievance@jhola.com.np',
  sellerEmail: 'sellers@jhola.com.np',
  careersEmail: 'careers@jhola.com.np',
  pressEmail: 'press@jhola.com.np',
  adsEmail: 'ads@jhola.com.np',
};

// Each page: title, intro, sections [{ h, p?, list? }]. `faq: true` renders sections as an accordion.
export const PAGES = {
  about: {
    group: 'About',
    title: L('About Us', 'हाम्रोबारे'),
    intro: L(
      'Jhola is a Nepali online store built for shoppers across all 77 districts. Our name means "bag" — everything you need, in one jhola.',
      'झोला नेपालका सबै ७७ जिल्लाका ग्राहकका लागि बनेको नेपाली अनलाइन पसल हो। हाम्रो नामको अर्थ हो "झोला" — तपाईंलाई चाहिने सबै कुरा, एउटै झोलामा।'
    ),
    sections: [
      { h: L('What we do', 'हामी के गर्छौं'), p: L('We sell mobiles, electronics, fashion, home & kitchen, beauty and sports products from trusted brands, delivered to your door with Cash on Delivery or digital payment through eSewa, Khalti, ConnectIPS and cards.', 'हामी विश्वसनीय ब्रान्डका मोबाइल, इलेक्ट्रोनिक्स, फेसन, घर र भान्सा, सौन्दर्य र खेलकुद सामान बेच्छौं र क्यास अन डेलिभरी वा ईसेवा, खल्ती, कनेक्टआईपीएस र कार्डबाट भुक्तानी गर्ने सुविधासहित घरदैलोमा पुर्‍याउँछौं।') },
      { h: L('Our promise', 'हाम्रो प्रतिबद्धता'), list: [L('100% authentic products sourced from brands and authorised distributors', 'ब्रान्ड र आधिकारिक वितरकबाट ल्याइएका १००% सक्कली सामान'), L('Clear prices in Nepalese Rupees, with VAT bills', 'भ्याट बिलसहित नेपाली रुपैयाँमा स्पष्ट मूल्य'), L('Next-day delivery inside Kathmandu Valley', 'काठमाडौं उपत्यकाभित्र भोलिपल्टै डेलिभरी'), L('Customer care in Nepali and English', 'नेपाली र अंग्रेजीमा ग्राहक सेवा')] },
    ],
  },
  contact: {
    group: 'About',
    title: L('Contact Us', 'सम्पर्क गर्नुहोस्'),
    intro: L('We are happy to help with orders, payments, deliveries and returns.', 'अर्डर, भुक्तानी, डेलिभरी र फिर्ताबारे सहयोग गर्न हामी खुसी छौं।'),
    contact: true,
    sections: [
      { h: L('Before you contact us', 'सम्पर्क गर्नुअघि'), list: [L('Track your order any time from My Orders.', 'मेरा अर्डरहरूबाट जुनसुकै बेला अर्डर ट्र्याक गर्नुहोस्।'), L('Keep your Order ID (starts with JHL) ready — it helps us find your order quickly.', 'आफ्नो अर्डर आईडी (JHL बाट सुरु हुने) तयार राख्नुहोस् — यसले हामीलाई छिटो सहयोग गर्न मद्दत गर्छ।'), L('Many answers are already in our FAQ.', 'धेरै प्रश्नका उत्तर हाम्रो बारम्बार सोधिने प्रश्नमा छन्।')] },
    ],
  },
  careers: {
    group: 'About',
    title: L('Careers', 'रोजगारी'),
    intro: L('Help us build the way Nepal shops online.', 'नेपालले अनलाइन किनमेल गर्ने तरिका बनाउन हामीसँग जोडिनुहोस्।'),
    sections: [
      { h: L('Teams we hire for', 'हामी भर्ना गर्ने टोलीहरू'), list: [L('Engineering & product', 'इन्जिनियरिङ र प्रोडक्ट'), L('Customer care (Nepali & English)', 'ग्राहक सेवा (नेपाली र अंग्रेजी)'), L('Warehouse & delivery operations', 'गोदाम र डेलिभरी सञ्चालन'), L('Category & brand partnerships', 'वर्ग र ब्रान्ड साझेदारी')] },
      { h: L('How to apply', 'कसरी आवेदन दिने'), p: L(`There are no open positions listed right now. Send your CV to ${SUPPORT.careersEmail} and we will contact you when a matching role opens.`, `अहिले कुनै खुला पद सूचीकृत छैन। आफ्नो सीभी ${SUPPORT.careersEmail} मा पठाउनुहोस्, मिल्दो पद खुलेपछि हामी सम्पर्क गर्नेछौं।`) },
    ],
  },
  stories: {
    group: 'About',
    title: L('Jhola Stories', 'झोलाका कथाहरू'),
    intro: L('News, shopping guides and stories from our sellers and customers.', 'समाचार, किनमेल गाइड र हाम्रा बिक्रेता तथा ग्राहकका कथाहरू।'),
    sections: [{ h: L('Coming soon', 'छिट्टै आउँदैछ'), p: L('Our blog is on its way. Follow the shop for festival deals around Dashain and Tihar.', 'हाम्रो ब्लग छिट्टै आउँदैछ। दशैं र तिहारका डिलका लागि पसल हेरिरहनुहोस्।') }],
  },
  press: {
    group: 'About',
    title: L('Press', 'प्रेस'),
    intro: L('For media enquiries, interviews and brand assets.', 'मिडिया सोधपुछ, अन्तर्वार्ता र ब्रान्ड सामग्रीका लागि।'),
    sections: [{ h: L('Media contact', 'मिडिया सम्पर्क'), p: L(`Write to ${SUPPORT.pressEmail}. We usually reply within two working days.`, `${SUPPORT.pressEmail} मा लेख्नुहोस्। हामी प्रायः दुई कार्य दिनभित्र जवाफ दिन्छौं।`) }],
  },

  payments: {
    group: 'Help',
    title: L('Payments', 'भुक्तानीहरू'),
    intro: L('Pay the way that suits you. All prices are in Nepalese Rupees and include VAT.', 'तपाईंलाई सजिलो तरिकाले भुक्तानी गर्नुहोस्। सबै मूल्य नेपाली रुपैयाँमा छन् र भ्याट समावेश छ।'),
    sections: [
      { h: L('Accepted payment methods', 'स्वीकार्य भुक्तानी माध्यमहरू'), list: [L('eSewa and Khalti wallets', 'ईसेवा र खल्ती वालेट'), L('ConnectIPS / mobile banking from any major Nepali bank', 'कुनै पनि प्रमुख नेपाली बैंकबाट कनेक्टआईपीएस / मोबाइल बैंकिङ'), L('Visa, Mastercard and UnionPay credit & debit cards', 'भिसा, मास्टरकार्ड र युनियनपे क्रेडिट तथा डेबिट कार्ड'), L('Cash on Delivery (not available in some remote districts)', 'क्यास अन डेलिभरी (केही दुर्गम जिल्लामा उपलब्ध छैन)')] },
      { h: L('Cash on Delivery limits', 'क्यास अन डेलिभरीका सीमा'), p: L('To keep stock available for everyone, a customer can have up to 3 Cash on Delivery orders on the way at a time. Online payment has no such limit.', 'सबैका लागि स्टक उपलब्ध गराउन, एक ग्राहकले एकपटकमा बढीमा ३ वटा क्यास अन डेलिभरी अर्डर बाटोमा राख्न सक्नुहुन्छ। अनलाइन भुक्तानीमा यस्तो सीमा छैन।') },
      { h: L('Is my payment safe?', 'के मेरो भुक्तानी सुरक्षित छ?'), p: L('Card details are never stored on our servers. Wallet and bank payments are completed on the provider’s own secure page.', 'कार्ड विवरण हाम्रो सर्भरमा कहिल्यै राखिँदैन। वालेट र बैंक भुक्तानी सम्बन्धित सेवाप्रदायकको आफ्नै सुरक्षित पृष्ठमा पूरा हुन्छ।') },
    ],
  },
  shipping: {
    group: 'Help',
    title: L('Shipping', 'ढुवानी'),
    intro: L('We deliver to all 77 districts of Nepal. Check the exact date for your district on any product page.', 'हामी नेपालका सबै ७७ जिल्लामा डेलिभरी गर्छौं। आफ्नो जिल्लाको ठ्याक्कै मिति कुनै पनि सामानको पृष्ठमा हेर्नुहोस्।'),
    sections: [
      { h: L('Delivery charges', 'डेलिभरी शुल्क'), list: [L('FREE delivery on orders of Rs. 1,000 or more', 'रु. १,००० वा सोभन्दा बढीको अर्डरमा निःशुल्क डेलिभरी'), L('Rs. 100 for orders below Rs. 1,000', 'रु. १,००० भन्दा कमको अर्डरमा रु. १००')] },
      { h: L('Delivery time', 'डेलिभरी समय'), list: [L('Kathmandu, Lalitpur, Bhaktapur: next day', 'काठमाडौं, ललितपुर, भक्तपुर: भोलिपल्टै'), L('Major cities (Pokhara, Biratnagar, Bharatpur, Butwal, Birgunj, Nepalgunj, Dhangadhi…): about 3 days', 'प्रमुख सहर (पोखरा, विराटनगर, भरतपुर, बुटवल, वीरगञ्ज, नेपालगञ्ज, धनगढी…): करिब ३ दिन'), L('Other districts: about 5 days', 'अन्य जिल्ला: करिब ५ दिन'), L('Remote mountain districts (Humla, Dolpa, Mugu, Manang, Mustang and others): about 8 days, Cash on Delivery not available', 'दुर्गम हिमाली जिल्ला (हुम्ला, डोल्पा, मुगु, मनाङ, मुस्ताङ र अन्य): करिब ८ दिन, क्यास अन डेलिभरी उपलब्ध छैन')] },
      { h: L('Delivery hours', 'डेलिभरी हुने घण्टा'), p: L('Home addresses receive deliveries all day; work addresses between 10 AM and 5 PM. Our courier will call the phone number on your address before arriving.', 'घरको ठेगानामा दिनभर र कार्यालयको ठेगानामा बिहान १० देखि बेलुका ५ बजेसम्म डेलिभरी हुन्छ। कुरियरले आइपुग्नुअघि ठेगानामा दिइएको फोन नम्बरमा फोन गर्नेछ।') },
    ],
  },
  'cancellation-returns': {
    group: 'Help',
    title: L('Cancellation & Returns', 'रद्द र फिर्ता'),
    intro: L('Changed your mind? Here is how cancellations and returns work.', 'मन परिवर्तन भयो? रद्द र फिर्ता कसरी हुन्छ, यहाँ हेर्नुहोस्।'),
    sections: [
      { h: L('Cancelling an order', 'अर्डर रद्द गर्ने'), p: L('You can cancel from My Orders until the order is out for delivery. If you already paid online, the full amount is refunded to the same eSewa, Khalti, bank account or card.', 'अर्डर डेलिभरीका लागि नगएसम्म मेरा अर्डरहरूबाट रद्द गर्न सकिन्छ। अनलाइन भुक्तानी गरिसक्नुभएको भए पूरा रकम सोही ईसेवा, खल्ती, बैंक खाता वा कार्डमा फिर्ता हुन्छ।') },
      { h: L('Returns & replacements', 'फिर्ता र साटफेर'), p: L('Most items can be replaced within 7 days of delivery if they arrive damaged, defective or different from what you ordered. Call customer care with your Order ID and photos of the item.', 'धेरैजसो सामान बिग्रिएको, खराब वा अर्डर गरेभन्दा फरक आएमा डेलिभरी भएको ७ दिनभित्र साट्न सकिन्छ। अर्डर आईडी र सामानको फोटोसहित ग्राहक सेवामा फोन गर्नुहोस्।') },
      { h: L('Refund time', 'रकम फिर्ता हुने समय'), list: [L('eSewa / Khalti: 1–3 working days', 'ईसेवा / खल्ती: १–३ कार्य दिन'), L('ConnectIPS / bank: 3–5 working days', 'कनेक्टआईपीएस / बैंक: ३–५ कार्य दिन'), L('Cards: 5–7 working days', 'कार्ड: ५–७ कार्य दिन')] },
    ],
  },
  faq: {
    group: 'Help',
    title: L('Frequently Asked Questions', 'बारम्बार सोधिने प्रश्नहरू'),
    faq: true,
    sections: [
      { h: L('How do I track my order?', 'मेरो अर्डर कसरी ट्र्याक गर्ने?'), p: L('Log in and open My Orders. Each order shows its status and expected delivery date.', 'लगइन गरी मेरा अर्डरहरू खोल्नुहोस्। हरेक अर्डरमा यसको अवस्था र अपेक्षित डेलिभरी मिति देखिन्छ।') },
      { h: L('Is Cash on Delivery available?', 'के क्यास अन डेलिभरी उपलब्ध छ?'), p: L('Yes, in most districts. Choose your district on a product page to check. You can have up to 3 Cash on Delivery orders on the way at a time.', 'हो, धेरैजसो जिल्लामा। जाँच्न सामानको पृष्ठमा आफ्नो जिल्ला छान्नुहोस्। एकपटकमा बढीमा ३ वटा क्यास अन डेलिभरी अर्डर बाटोमा राख्न सकिन्छ।') },
      { h: L('How much is delivery?', 'डेलिभरी शुल्क कति हो?'), p: L('Free on orders of Rs. 1,000 or more, otherwise Rs. 100.', 'रु. १,००० वा बढीको अर्डरमा निःशुल्क, अन्यथा रु. १००।') },
      { h: L('Can I cancel my order?', 'के म अर्डर रद्द गर्न सक्छु?'), p: L('Yes, from My Orders until it is out for delivery. Online payments are refunded in full.', 'हो, डेलिभरीका लागि नगएसम्म मेरा अर्डरहरूबाट। अनलाइन भुक्तानी पूरा फिर्ता हुन्छ।') },
      { h: L('I forgot my password.', 'मैले पासवर्ड बिर्सें।'), p: L(`Please call ${SUPPORT.phone} or email ${SUPPORT.email} from your registered email and we will help you reset it.`, `कृपया ${SUPPORT.phone} मा फोन गर्नुहोस् वा दर्ता भएको इमेलबाट ${SUPPORT.email} मा लेख्नुहोस्, हामी पासवर्ड रिसेट गर्न सहयोग गर्नेछौं।`) },
      { h: L('Are the products original?', 'के सामानहरू सक्कली हुन्?'), p: L('Yes. We source only from brands and authorised distributors, and every order comes with a VAT bill.', 'हो। हामी ब्रान्ड र आधिकारिक वितरकबाट मात्र सामान ल्याउँछौं, र हरेक अर्डरसँग भ्याट बिल आउँछ।') },
      { h: L('Can I change the language?', 'के भाषा परिवर्तन गर्न सकिन्छ?'), p: L('Yes — use the English / नेपाली button at the top of the page or in the footer.', 'सकिन्छ — पृष्ठको माथि वा तल रहेको English / नेपाली बटन प्रयोग गर्नुहोस्।') },
    ],
  },

  'return-policy': {
    group: 'Consumer Policy',
    title: L('Return Policy', 'फिर्ता नीति'),
    intro: L('We want you to be happy with every purchase.', 'हामी चाहन्छौं तपाईं हरेक खरिदमा सन्तुष्ट हुनुहोस्।'),
    sections: [
      { h: L('Eligible items', 'फिर्ता योग्य सामान'), list: [L('Damaged, defective or wrong items reported within 7 days of delivery', 'डेलिभरी भएको ७ दिनभित्र जानकारी दिइएका बिग्रिएका, खराब वा गलत सामान'), L('Items must be unused, with original packaging, tags and bill', 'सामान प्रयोग नगरिएको, मूल प्याकेजिङ, ट्याग र बिलसहित हुनुपर्छ')] },
      { h: L('Not returnable', 'फिर्ता नहुने'), list: [L('Opened beauty, personal-care and fragrance products (for hygiene)', 'खोलिएका सौन्दर्य, व्यक्तिगत हेरचाह र अत्तर (स्वच्छताका कारण)'), L('Items damaged after delivery through misuse', 'डेलिभरीपछि गलत प्रयोगले बिग्रिएका सामान')] },
      { h: L('How refunds are paid', 'रकम कसरी फिर्ता हुन्छ'), p: L('To your original payment method. For Cash on Delivery orders we refund to your eSewa, Khalti or bank account.', 'तपाईंले भुक्तानी गरेकै माध्यममा। क्यास अन डेलिभरी अर्डरको रकम तपाईंको ईसेवा, खल्ती वा बैंक खातामा फिर्ता गरिन्छ।') },
    ],
  },
  terms: {
    group: 'Consumer Policy',
    title: L('Terms of Use', 'प्रयोगका सर्तहरू'),
    intro: L('By using Jhola you agree to these terms.', 'झोला प्रयोग गरेर तपाईं यी सर्तहरूमा सहमत हुनुहुन्छ।'),
    sections: [
      { h: L('Your account', 'तपाईंको खाता'), p: L('Keep your password private. You are responsible for orders placed from your account. We may suspend accounts used for fraud or abuse.', 'आफ्नो पासवर्ड गोप्य राख्नुहोस्। तपाईंको खाताबाट गरिएका अर्डरको जिम्मेवारी तपाईंको हुन्छ। ठगी वा दुरुपयोगमा प्रयोग भएका खाता हामी रोक्न सक्छौं।') },
      { h: L('Prices & orders', 'मूल्य र अर्डर'), p: L('Prices are in Nepalese Rupees and include VAT. An order is confirmed when it appears as “Placed” in My Orders. If an item becomes unavailable we will cancel it and refund any payment.', 'मूल्य नेपाली रुपैयाँमा छन् र भ्याट समावेश छ। मेरा अर्डरहरूमा “अर्डर भयो” देखिएपछि अर्डर पक्का हुन्छ। कुनै सामान उपलब्ध नभए हामी रद्द गरी भुक्तानी फिर्ता गर्नेछौं।') },
      { h: L('Governing law', 'लागू हुने कानुन'), p: L('These terms are governed by the laws of Nepal, including the Consumer Protection Act, 2075 and the Electronic Transactions Act, 2063.', 'यी सर्तहरू उपभोक्ता संरक्षण ऐन, २०७५ र विद्युतीय कारोबार ऐन, २०६३ लगायत नेपालको कानुनअनुसार लागू हुन्छन्।') },
    ],
  },
  security: {
    group: 'Consumer Policy',
    title: L('Security', 'सुरक्षा'),
    intro: L('How we keep your account and payments safe.', 'हामी तपाईंको खाता र भुक्तानी कसरी सुरक्षित राख्छौं।'),
    sections: [
      { h: L('What we do', 'हामी के गर्छौं'), list: [L('Passwords are stored encrypted — no one at Jhola can read them', 'पासवर्ड इन्क्रिप्ट गरेर राखिन्छ — झोलाका कसैले पनि पढ्न सक्दैनन्'), L('Repeated wrong passwords temporarily lock login', 'धेरै पटक गलत पासवर्ड हालेमा लगइन केही समय रोकिन्छ'), L('Changing your password signs you out of every other device', 'पासवर्ड परिवर्तन गर्दा अरू सबै उपकरणबाट लगआउट हुन्छ'), L('Card details are never stored on our servers', 'कार्ड विवरण हाम्रो सर्भरमा कहिल्यै राखिँदैन')] },
      { h: L('Stay safe', 'सुरक्षित रहनुहोस्'), list: [L('Jhola will never ask for your password, OTP or card PIN on a call', 'झोलाले फोनमा कहिल्यै तपाईंको पासवर्ड, OTP वा कार्डको पिन माग्दैन'), L('Only pay on jhola.com.np or inside the eSewa / Khalti app', 'jhola.com.np वा ईसेवा / खल्ती एपभित्र मात्र भुक्तानी गर्नुहोस्'), L(`Report suspicious messages to ${SUPPORT.email}`, `शंकास्पद सन्देश ${SUPPORT.email} मा जानकारी गराउनुहोस्`)] },
    ],
  },
  privacy: {
    group: 'Consumer Policy',
    title: L('Privacy Policy', 'गोपनीयता नीति'),
    intro: L('We collect only what we need to deliver your orders.', 'हामी तपाईंको अर्डर पुर्‍याउन चाहिने जानकारी मात्र लिन्छौं।'),
    sections: [
      { h: L('What we collect', 'हामी के जानकारी लिन्छौं'), list: [L('Name, email and mobile number', 'नाम, इमेल र मोबाइल नम्बर'), L('Delivery addresses', 'डेलिभरी ठेगानाहरू'), L('Orders, wishlist and reviews', 'अर्डर, इच्छासूची र समीक्षा'), L('Your language and district choice, saved in your browser', 'तपाईंको भाषा र जिल्लाको रोजाइ, ब्राउजरमा सुरक्षित')] },
      { h: L('How we use it', 'हामी यसलाई कसरी प्रयोग गर्छौं'), p: L('To process and deliver orders, provide customer care and prevent fraud. We share your name, phone and address only with the courier delivering your order. We do not sell your data.', 'अर्डर प्रक्रिया र डेलिभरी, ग्राहक सेवा र ठगी रोक्न। तपाईंको नाम, फोन र ठेगाना अर्डर पुर्‍याउने कुरियरसँग मात्र साझा गरिन्छ। हामी तपाईंको जानकारी बेच्दैनौं।') },
      { h: L('Your choices', 'तपाईंका अधिकार'), p: L(`You can edit your profile and addresses any time. To delete your account, email ${SUPPORT.email}.`, `तपाईं जुनसुकै बेला प्रोफाइल र ठेगाना सम्पादन गर्न सक्नुहुन्छ। खाता मेटाउन ${SUPPORT.email} मा इमेल गर्नुहोस्।`) },
    ],
  },
  grievance: {
    group: 'Consumer Policy',
    title: L('Grievance Redressal', 'गुनासो सुनुवाइ'),
    intro: L('Not satisfied with how your issue was handled? Escalate it to our Grievance Officer.', 'तपाईंको समस्या समाधानबाट सन्तुष्ट हुनुहुन्न? हाम्रो गुनासो सुनुवाइ अधिकारीसमक्ष लैजानुहोस्।'),
    sections: [
      { h: L('Grievance Officer', 'गुनासो सुनुवाइ अधिकारी'), p: L(`Jhola Pvt. Ltd., Durbar Marg, Kathmandu-1 · ${SUPPORT.grievanceEmail} · Sunday–Friday, 10 AM–5 PM`, `झोला प्रा. लि., दरबारमार्ग, काठमाडौं-१ · ${SUPPORT.grievanceEmail} · आइतबार–शुक्रबार, बिहान १० – बेलुका ५ बजे`) },
      { h: L('Timeline', 'समयसीमा'), list: [L('We acknowledge every complaint within 48 hours', 'हरेक गुनासोको ४८ घण्टाभित्र प्राप्ति जानकारी दिइन्छ'), L('We aim to resolve it within 15 days', '१५ दिनभित्र समाधान गर्ने लक्ष्य राखिन्छ'), L('Include your Order ID and a short description', 'आफ्नो अर्डर आईडी र छोटो विवरण समावेश गर्नुहोस्')] },
    ],
  },

  sell: {
    group: 'More',
    title: L('Become a Seller', 'बिक्रेता बन्नुहोस्'),
    intro: L('Reach customers in all 77 districts of Nepal.', 'नेपालका सबै ७७ जिल्लाका ग्राहकसम्म पुग्नुहोस्।'),
    sections: [
      { h: L('What you need', 'तपाईंलाई के चाहिन्छ'), list: [L('Company or firm registration and PAN / VAT certificate', 'कम्पनी वा फर्म दर्ता र प्यान / भ्याट प्रमाणपत्र'), L('A bank account in the business name', 'व्यवसायको नाममा बैंक खाता'), L('Product photos and prices', 'सामानको फोटो र मूल्य')] },
      { h: L('How to start', 'कसरी सुरु गर्ने'), p: L(`Email ${SUPPORT.sellerEmail} with your business details and product categories. Our seller team will contact you within 3 working days.`, `आफ्नो व्यवसाय विवरण र सामानको वर्गसहित ${SUPPORT.sellerEmail} मा इमेल गर्नुहोस्। हाम्रो बिक्रेता टोलीले ३ कार्य दिनभित्र सम्पर्क गर्नेछ।`) },
    ],
  },
  advertise: {
    group: 'More',
    title: L('Advertise', 'विज्ञापन'),
    intro: L('Put your brand in front of shoppers when they are ready to buy.', 'किन्न तयार ग्राहकसामु आफ्नो ब्रान्ड पुर्‍याउनुहोस्।'),
    sections: [{ h: L('Options', 'विकल्पहरू'), list: [L('Home page banners', 'गृहपृष्ठ ब्यानर'), L('Featured products and Deals of the Day', 'विशेष सामान र आजका डिल'), L('Brand placement in Top Brands', 'शीर्ष ब्रान्डमा ब्रान्ड राख्ने')] }, { h: L('Get in touch', 'सम्पर्क'), p: L(`Email ${SUPPORT.adsEmail}.`, `${SUPPORT.adsEmail} मा इमेल गर्नुहोस्।`) }],
  },
  'gift-cards': {
    group: 'More',
    title: L('Gift Cards', 'गिफ्ट कार्ड'),
    intro: L('The perfect gift for Dashain, Tihar, birthdays and weddings.', 'दशैं, तिहार, जन्मदिन र विवाहका लागि उत्तम उपहार।'),
    sections: [{ h: L('Coming soon', 'छिट्टै आउँदैछ'), p: L('Jhola gift cards are not available yet. Corporate buyers can email us for bulk vouchers.', 'झोला गिफ्ट कार्ड अहिले उपलब्ध छैन। कर्पोरेट ग्राहकले थोकमा भौचरका लागि हामीलाई इमेल गर्न सक्नुहुन्छ।') }],
  },
  help: {
    group: 'More',
    title: L('Help Center', 'सहायता केन्द्र'),
    intro: L('Find answers or reach our customer care team.', 'उत्तर खोज्नुहोस् वा हाम्रो ग्राहक सेवा टोलीसँग सम्पर्क गर्नुहोस्।'),
    contact: true,
    links: ['faq', 'shipping', 'payments', 'cancellation-returns', 'return-policy', 'security'],
    sections: [],
  },
};

export const PAGE_GROUPS = ['About', 'Help', 'Consumer Policy', 'More'];
