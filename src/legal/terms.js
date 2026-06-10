// yapp Kullanım Sözleşmesi / Terms of Service — TR + EN.
// ⚠️ Bu metin kapsamlı bir taslaktır, hukuki danışmanlık değildir. Lansman öncesi avukat onayı alınmalıdır.

export const TERMS_VERSION = '1.0';
export const TERMS_EFFECTIVE = '2026-06-10';

export const TERMS = [
  {
    tr: {
      title: '1. Taraflar ve Tanımlar',
      body:
        'Bu Kullanım Sözleşmesi ("Sözleşme"), yapp uygulamasını ("Platform") işleten yapp ("biz", "Platform") ile Platform\'u kullanan gerçek veya tüzel kişi ("Kullanıcı", "siz") arasında akdedilmiştir. ' +
        '"Satıcı/İşletme": Platform üzerinde kendi uygulamasını (mini-app) oluşturup hizmet sunan Kullanıcı. "Müşteri": Satıcı\'nın uygulamasını indirip kullanan Kullanıcı. ' +
        'Platform\'a kayıt olarak veya kullanarak bu Sözleşme\'yi okuduğunuzu, anladığınızı ve kabul ettiğinizi beyan edersiniz.',
    },
    en: {
      title: '1. Parties and Definitions',
      body:
        'These Terms of Service ("Terms") are entered into between yapp ("we", "Platform"), the operator of the yapp application ("Platform"), and the natural or legal person using the Platform ("User", "you"). ' +
        '"Seller/Business": a User who creates their own mini-app and offers services on the Platform. "Customer": a User who installs and uses a Seller\'s app. ' +
        'By registering for or using the Platform, you represent that you have read, understood, and agree to these Terms.',
    },
  },
  {
    tr: {
      title: '2. Hizmetin Niteliği — Aracı Platform',
      body:
        'Platform yalnızca bir ARACI hizmettir. Satıcılar ile Müşterileri buluşturan teknik bir altyapı sağlarız. ' +
        'Satıcıların sunduğu hizmetlerin (randevu, üyelik, seans, ürün vb.) sağlayıcısı, satıcısı veya garantörü DEĞİLİZ. ' +
        'Bu hizmetlerin kalitesi, yasallığı, güvenliği, zamanında ifası ve içeriğinden tamamen ilgili Satıcı sorumludur. ' +
        'Platform, Satıcı ile Müşteri arasındaki hiçbir sözleşmenin tarafı değildir.',
    },
    en: {
      title: '2. Nature of Service — Intermediary Platform',
      body:
        'The Platform is solely an INTERMEDIARY service. We provide technical infrastructure connecting Sellers and Customers. ' +
        'We are NOT the provider, seller, or guarantor of any services offered by Sellers (appointments, memberships, sessions, products, etc.). ' +
        'The quality, legality, safety, timely performance, and content of such services are the sole responsibility of the relevant Seller. ' +
        'The Platform is not a party to any contract between a Seller and a Customer.',
    },
  },
  {
    tr: {
      title: '3. Hesap ve Kayıt',
      body:
        'Hesap oluştururken doğru, güncel ve eksiksiz bilgi vermeyi kabul edersiniz. Hesap güvenliğinizden (giriş bilgileri dahil) siz sorumlusunuz. ' +
        '18 yaşından küçükler Platform\'u veli/vasi onayı olmadan kullanamaz. Bir hesabı başkasına devredemez, sahte kimlikle kayıt olamazsınız. ' +
        'Hesabınızdaki tüm etkinlikten siz sorumlusunuz.',
    },
    en: {
      title: '3. Account and Registration',
      body:
        'You agree to provide accurate, current, and complete information when creating an account. You are responsible for the security of your account (including credentials). ' +
        'Persons under 18 may not use the Platform without parental/guardian consent. You may not transfer your account or register under a false identity. ' +
        'You are responsible for all activity under your account.',
    },
  },
  {
    tr: {
      title: '4. Kullanıcı Yükümlülükleri',
      body:
        'Platform\'u yalnızca yasalara uygun amaçlarla kullanırsınız. Başkalarının haklarını ihlal eden, yanıltıcı, zararlı, müstehcen veya yasa dışı içerik üretemez veya paylaşamazsınız. ' +
        'Platform\'un güvenliğini tehlikeye atan, tersine mühendislik yapan veya otomatik veri toplayan (scraping) eylemlerde bulunamazsınız.',
    },
    en: {
      title: '4. User Obligations',
      body:
        'You will use the Platform only for lawful purposes. You may not create or share content that infringes others\' rights or is misleading, harmful, obscene, or illegal. ' +
        'You may not compromise Platform security, reverse-engineer it, or perform automated data collection (scraping).',
    },
  },
  {
    tr: {
      title: '5. Satıcı (İşletme) Yükümlülükleri',
      body:
        'Satıcı olarak; sunduğunuz hizmetin tüm yasal izinlerine, ruhsatlarına ve vergisel yükümlülüklerine sahip olduğunuzu taahhüt edersiniz. ' +
        'Müşterilere karşı tüm tüketici hukuku, mesafeli satış, KVKK ve sektörel mevzuat yükümlülükleri size aittir. ' +
        'Verdiğiniz bilgilerin (fiyat, hizmet, çalışma saati vb.) doğruluğundan ve hizmetin ifasından bizzat sorumlusunuz. ' +
        'Platform, başvurunuzu inceleme, onaylama, reddetme veya yayınlanmış app\'inizi gerekçe göstermeksizin askıya alma hakkını saklı tutar.',
    },
    en: {
      title: '5. Seller (Business) Obligations',
      body:
        'As a Seller, you warrant that you hold all legal permits, licenses, and tax obligations for the services you offer. ' +
        'All consumer-law, distance-selling, data-protection, and sector-specific obligations toward Customers are yours. ' +
        'You are solely responsible for the accuracy of the information you provide (prices, services, hours, etc.) and for the performance of the service. ' +
        'The Platform reserves the right to review, approve, reject your application, or suspend your published app without cause.',
    },
  },
  {
    tr: {
      title: '6. Ödemeler ve Mali Sorumluluk',
      body:
        'Müşteri ödemeleri, Satıcı\'nın KENDİ bağladığı ödeme kuruluşu (iyzico, Stripe vb.) üzerinden DOĞRUDAN Satıcı\'nın hesabına geçer. ' +
        'Platform bu ödemelere aracılık etmez, parayı tahsil etmez, tutmaz veya iade yükümlülüğü taşımaz. ' +
        'Satıcı-Müşteri arasındaki ücret, iade, iptal ve uyuşmazlıklardan Platform sorumlu DEĞİLDİR. ' +
        'Satıcı, kullandığı ödeme kuruluşunun sözleşme ve komisyonlarına tabidir.',
    },
    en: {
      title: '6. Payments and Financial Responsibility',
      body:
        'Customer payments are processed through the Seller\'s OWN connected payment provider (iyzico, Stripe, etc.) and go DIRECTLY to the Seller\'s account. ' +
        'The Platform does not intermediate these payments, does not collect, hold, or refund funds. ' +
        'The Platform is NOT responsible for fees, refunds, cancellations, or disputes between Seller and Customer. ' +
        'The Seller is subject to the terms and commissions of their chosen payment provider.',
    },
  },
  {
    tr: {
      title: '7. Platform Ücretleri',
      body:
        'Satıcılar, app\'lerini yayında tutmak için Platform\'a kullanım-bazlı ücret öder. Ücret; açılan modüller ve gerçek kullanım (aktif müşteri, bildirim adedi, medya kullanımı vb.) baz alınarak hesaplanır. ' +
        'Yayınlama anında tahmini ücret gösterilir; gerçek tutar aylık kullanıma göre hesaplanır. Ücretler abonelik değildir; kullandığınız kadar ödersiniz. ' +
        'Ödenmeyen ücretlerde app askıya alınabilir. Bu ücret, Müşteri\'nin Satıcı\'ya yaptığı ödemelerden bağımsızdır.',
    },
    en: {
      title: '7. Platform Fees',
      body:
        'Sellers pay the Platform a usage-based fee to keep their app live. The fee is calculated based on enabled modules and actual usage (active customers, notification count, media usage, etc.). ' +
        'An estimated fee is shown at publishing; the actual amount is calculated from monthly usage. Fees are not a subscription; you pay for what you use. ' +
        'Unpaid fees may result in app suspension. This fee is independent of payments made by Customers to the Seller.',
    },
  },
  {
    tr: {
      title: '8. İçerik ve Fikri Mülkiyet',
      body:
        'Satıcı\'nın yüklediği içerik (metin, görsel, logo) ilgili Satıcı\'ya aittir; Satıcı bu içeriği Platform\'da göstermemiz için bize sınırlı, devredilebilir bir lisans verir. ' +
        'Satıcı, yüklediği içeriğin telif ve kullanım haklarına sahip olduğunu taahhüt eder. Platform\'un yazılımı, markası ve tasarımı bize aittir; izinsiz kullanılamaz.',
    },
    en: {
      title: '8. Content and Intellectual Property',
      body:
        'Content uploaded by a Seller (text, images, logos) belongs to that Seller; the Seller grants us a limited, sublicensable license to display it on the Platform. ' +
        'The Seller warrants they own the copyright and usage rights to uploaded content. The Platform\'s software, brand, and design belong to us and may not be used without permission.',
    },
  },
  {
    tr: {
      title: '9. Yasak Kullanımlar',
      body:
        'Şunlar yasaktır: yasa dışı mal/hizmet satışı; dolandırıcılık; başkasının fikri mülkiyetini ihlal; spam; zararlı yazılım; nefret söylemi; reşit olmayanların istismarı; Platform\'u kötüye kullanma veya manipüle etme. ' +
        'İhlal halinde hesabınız derhal kapatılabilir ve yasal işlem başlatılabilir.',
    },
    en: {
      title: '9. Prohibited Uses',
      body:
        'The following are prohibited: sale of illegal goods/services; fraud; infringement of others\' IP; spam; malware; hate speech; exploitation of minors; abuse or manipulation of the Platform. ' +
        'In case of violation, your account may be terminated immediately and legal action may be taken.',
    },
  },
  {
    tr: {
      title: '10. Kişisel Veriler (KVKK / GDPR)',
      body:
        'Kişisel verileriniz, Gizlilik Politikası ve 6698 sayılı KVKK (ve uygulanabilir yerlerde GDPR) uyarınca işlenir. ' +
        'Satıcı, Müşterilerinden topladığı kişisel verilerin veri sorumlusu olarak kendi yasal yükümlülüklerini yerine getirmekle yükümlüdür. ' +
        'Platform, kendi işlediği veriler bakımından gerekli teknik ve idari tedbirleri alır.',
    },
    en: {
      title: '10. Personal Data (KVKK / GDPR)',
      body:
        'Your personal data is processed in accordance with the Privacy Policy and Turkish Law No. 6698 (KVKK) (and GDPR where applicable). ' +
        'The Seller, as data controller of personal data collected from its Customers, is responsible for fulfilling its own legal obligations. ' +
        'The Platform takes necessary technical and administrative measures for the data it processes.',
    },
  },
  {
    tr: {
      title: '11. Sorumluluğun Sınırlandırılması',
      body:
        'Yürürlükteki yasaların izin verdiği azami ölçüde; Platform, dolaylı, arızi, özel veya sonuç niteliğindeki zararlardan (kâr kaybı, veri kaybı, iş kaybı dahil) sorumlu değildir. ' +
        'Satıcı ile Müşteri arasındaki hizmet veya ödemeden doğan zararlardan Platform sorumlu tutulamaz. ' +
        'Her hâlükârda Platform\'un toplam sorumluluğu, ilgili Kullanıcı\'nın son 3 ayda Platform\'a ödediği ücretle sınırlıdır.',
    },
    en: {
      title: '11. Limitation of Liability',
      body:
        'To the maximum extent permitted by applicable law, the Platform is not liable for indirect, incidental, special, or consequential damages (including lost profits, data, or business). ' +
        'The Platform cannot be held liable for damages arising from the service or payment between a Seller and a Customer. ' +
        'In any event, the Platform\'s total liability is limited to the fees paid by the relevant User to the Platform in the preceding 3 months.',
    },
  },
  {
    tr: {
      title: '12. Tazminat',
      body:
        'Platform\'u kullanımınızdan, bu Sözleşme\'yi ihlalinizden veya haklarınızı aşan eylemlerinizden doğan her türlü talep, zarar ve masrafa (makul avukatlık ücretleri dahil) karşı Platform\'u tazmin etmeyi ve beri kılmayı kabul edersiniz.',
    },
    en: {
      title: '12. Indemnification',
      body:
        'You agree to indemnify and hold the Platform harmless against any claims, damages, and costs (including reasonable attorneys\' fees) arising from your use of the Platform, your breach of these Terms, or your acts exceeding your rights.',
    },
  },
  {
    tr: {
      title: '13. Garanti Reddi',
      body:
        'Platform "OLDUĞU GİBİ" ve "MEVCUT HÂLİYLE" sunulur. Kesintisiz, hatasız veya belirli bir amaca uygun olacağına dair açık veya zımni hiçbir garanti vermeyiz. Hizmeti dilediğimiz zaman değiştirebilir veya durdurabiliriz.',
    },
    en: {
      title: '13. Disclaimer of Warranties',
      body:
        'The Platform is provided "AS IS" and "AS AVAILABLE". We make no express or implied warranty that it will be uninterrupted, error-free, or fit for a particular purpose. We may modify or discontinue the service at any time.',
    },
  },
  {
    tr: {
      title: '14. Fesih ve Askıya Alma',
      body:
        'Bu Sözleşme\'yi ihlal etmeniz hâlinde hesabınızı önceden bildirimde bulunmaksızın askıya alabilir veya kapatabiliriz. Hesabınızı dilediğiniz zaman kapatabilirsiniz. Fesih, doğmuş ödeme yükümlülüklerini ortadan kaldırmaz.',
    },
    en: {
      title: '14. Termination and Suspension',
      body:
        'We may suspend or terminate your account without prior notice if you breach these Terms. You may close your account at any time. Termination does not eliminate accrued payment obligations.',
    },
  },
  {
    tr: {
      title: '15. Uygulanacak Hukuk ve Yetki',
      body:
        'Bu Sözleşme Türkiye Cumhuriyeti hukukuna tabidir. Doğabilecek uyuşmazlıklarda Ankara Mahkemeleri ve İcra Daireleri yetkilidir. Tüketici işlemlerinde tüketicinin yasal hakları saklıdır.',
    },
    en: {
      title: '15. Governing Law and Jurisdiction',
      body:
        'These Terms are governed by the laws of the Republic of Türkiye. The Courts and Execution Offices of Ankara have jurisdiction over disputes. Consumers\' statutory rights are reserved in consumer transactions.',
    },
  },
  {
    tr: {
      title: '16. Değişiklikler',
      body:
        'Bu Sözleşme\'yi zaman zaman güncelleyebiliriz. Önemli değişikliklerde sizi bilgilendiririz. Güncellemeden sonra Platform\'u kullanmaya devam etmeniz, yeni şartları kabul ettiğiniz anlamına gelir.',
    },
    en: {
      title: '16. Changes',
      body:
        'We may update these Terms from time to time. We will notify you of material changes. Continuing to use the Platform after an update constitutes acceptance of the new terms.',
    },
  },
  {
    tr: {
      title: '17. App Store / Play Store Şartları',
      body:
        'Platform\'u Apple App Store veya Google Play üzerinden edindiyseniz, ilgili mağazanın kullanım şartları da geçerlidir. Apple ve Google bu Sözleşme\'nin tarafı değildir ve Platform\'dan sorumlu değildir.',
    },
    en: {
      title: '17. App Store / Play Store Terms',
      body:
        'If you obtained the Platform via the Apple App Store or Google Play, that store\'s terms of use also apply. Apple and Google are not parties to these Terms and are not responsible for the Platform.',
    },
  },
  {
    tr: {
      title: '18. İletişim',
      body:
        'Sorularınız için: destek üzerinden bize ulaşabilirsiniz. Bu Sözleşme\'nin Türkçe ve İngilizce sürümleri arasında çelişki olması hâlinde Türkçe sürüm esas alınır.',
    },
    en: {
      title: '18. Contact',
      body:
        'For questions, you can reach us via support. In case of conflict between the Turkish and English versions of these Terms, the Turkish version prevails.',
    },
  },
];
