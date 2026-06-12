// Yapio Kullanım Sözleşmesi / Terms of Service — TR + EN.
// ⚠️ Bu metin kapsamlı bir taslaktır, hukuki danışmanlık değildir. Lansman öncesi avukat onayı alınmalıdır.

export const TERMS_VERSION = '2.0';
export const TERMS_EFFECTIVE = '2026-06-12';

export const TERMS = [
  {
    tr: { title: '1. Taraflar ve Tanımlar', body:
      'Bu Kullanım Sözleşmesi ("Sözleşme"), Yapio uygulamasını ("Platform", "Yapio") işleten Yapio ("biz") ile Platform\'u kullanan gerçek veya tüzel kişi ("Kullanıcı", "siz") arasında akdedilmiştir. ' +
      '"Mini Uygulama": Bir işletmenin Platform içinde oluşturduğu uygulama. "Mini Admin / Satıcı": Mini Uygulamayı kuran ve yöneten işletme veya yetkilisi. "Müşteri / Danışan": Bir Mini Uygulamayı kullanan son kullanıcı. ' +
      'Platform\'a kayıt olarak veya kullanarak bu Sözleşme\'yi okuduğunuzu, anladığınızı ve kabul ettiğinizi beyan edersiniz.' },
    en: { title: '1. Parties and Definitions', body:
      'These Terms of Service ("Terms") are entered into between Yapio ("we", "Platform"), the operator of the Yapio application, and the natural or legal person using the Platform ("User", "you"). ' +
      '"Mini App": an app a business creates within the Platform. "Mini Admin / Seller": the business or its representative who builds and manages a Mini App. "Customer": an end user who uses a Mini App. ' +
      'By registering for or using the Platform, you represent that you have read, understood, and agree to these Terms.' },
  },
  {
    tr: { title: '2. Hizmetin Niteliği — Aracı Platform', body:
      'Platform yalnızca bir ARACI teknik hizmettir; Mini Adminler ile Müşterileri buluşturan altyapıyı sağlarız. ' +
      'Mini Adminlerin sunduğu hizmetlerin (randevu, üyelik, seans, ürün, danışmanlık vb.) sağlayıcısı, satıcısı veya garantörü DEĞİLİZ. ' +
      'Bu hizmetlerin kalitesi, yasallığı, güvenliği, zamanında ifası ve içeriğinden tamamen ilgili Mini Admin sorumludur. Platform, Mini Admin ile Müşteri arasındaki hiçbir sözleşmenin tarafı değildir.' },
    en: { title: '2. Nature of Service — Intermediary Platform', body:
      'The Platform is solely an INTERMEDIARY technical service connecting Mini Admins and Customers. ' +
      'We are NOT the provider, seller, or guarantor of any services offered by Mini Admins (appointments, memberships, sessions, products, consulting, etc.). ' +
      'The quality, legality, safety, timely performance, and content of such services are the sole responsibility of the relevant Mini Admin. The Platform is not a party to any contract between a Mini Admin and a Customer.' },
  },
  {
    tr: { title: '3. Hesap ve Kayıt', body:
      'Hesap oluştururken doğru, güncel ve eksiksiz bilgi vermeyi kabul edersiniz. Hesap güvenliğinizden (kullanıcı adı ve şifre dahil) siz sorumlusunuz. ' +
      '18 yaşından küçükler Platform\'u veli/vasi onayı olmadan kullanamaz. Bir hesabı başkasına devredemez, sahte kimlikle kayıt olamazsınız. Hesabınızdaki tüm etkinlikten siz sorumlusunuz.' },
    en: { title: '3. Account and Registration', body:
      'You agree to provide accurate, current, and complete information when creating an account. You are responsible for the security of your account (including username and password). ' +
      'Persons under 18 may not use the Platform without parental/guardian consent. You may not transfer your account or register under a false identity. You are responsible for all activity under your account.' },
  },
  {
    tr: { title: '4. Kullanıcı Yükümlülükleri', body:
      'Platform\'u yalnızca yasalara uygun amaçlarla kullanırsınız. Başkalarının haklarını ihlal eden, yanıltıcı, zararlı, müstehcen, nefret içeren veya yasa dışı içerik üretemez veya paylaşamazsınız. ' +
      'Platform\'un güvenliğini tehlikeye atan, tersine mühendislik yapan veya otomatik veri toplayan (scraping) eylemlerde bulunamazsınız.' },
    en: { title: '4. User Obligations', body:
      'You will use the Platform only for lawful purposes. You may not create or share content that infringes others\' rights or is misleading, harmful, obscene, hateful, or illegal. ' +
      'You may not compromise Platform security, reverse-engineer it, or perform automated data collection (scraping).' },
  },
  {
    tr: { title: '5. Mini Admin (İşletme) Yükümlülükleri', body:
      'Mini Admin olarak; sunduğunuz hizmetin tüm yasal izinlerine, ruhsatlarına ve vergisel yükümlülüklerine sahip olduğunuzu taahhüt edersiniz. ' +
      'Müşterilere karşı tüm tüketici hukuku, mesafeli satış, KVKK ve sektörel mevzuat yükümlülükleri size aittir. Verdiğiniz bilgilerin (fiyat, hizmet, çalışma saati, program, ölçüm vb.) doğruluğundan ve hizmetin ifasından bizzat sorumlusunuz. ' +
      'Platform, satıcı başvurunuzu inceleme, onaylama, reddetme veya yayınlanmış Mini Uygulamanızı önceden bildirimde bulunmaksızın askıya alma hakkını saklı tutar.' },
    en: { title: '5. Mini Admin (Business) Obligations', body:
      'As a Mini Admin, you warrant that you hold all legal permits, licenses, and tax obligations for the services you offer. ' +
      'All consumer-law, distance-selling, data-protection, and sector-specific obligations toward Customers are yours. You are solely responsible for the accuracy of the information you provide (prices, services, hours, programs, measurements, etc.) and for the performance of the service. ' +
      'The Platform reserves the right to review, approve, or reject your seller application, or to suspend your published Mini App without prior notice.' },
  },
  {
    tr: { title: '6. Mini Admin\'in Açtığı Müşteri Hesapları', body:
      'Mini Admin, danışan/çalışanları için kullanıcı adı ve şifre içeren hesaplar oluşturabilir ("kayıt sistemi"). Bu hesapları yalnızca ilgili kişinin açık rızasıyla ve onun bilgisiyle oluşturursunuz. ' +
      'Oluşturulan giriş bilgilerinin güvenli iletilmesinden, paylaşılmamasından ve kişi talep ettiğinde erişimin kaldırılmasından Mini Admin sorumludur. Üçüncü kişiler adına izinsiz hesap açmak yasaktır.' },
    en: { title: '6. Customer Accounts Created by the Mini Admin', body:
      'A Mini Admin may create username/password accounts for its clients/staff ("registration system"). You create such accounts only with the explicit consent and knowledge of the relevant person. ' +
      'The Mini Admin is responsible for securely delivering credentials, not sharing them, and removing access upon the person\'s request. Creating accounts on behalf of third parties without permission is prohibited.' },
  },
  {
    tr: { title: '7. Ödemeler — Uygulama İçinde Para Tahsilatı Yoktur', body:
      'Platform üzerinden Müşteri ile Mini Admin arasında UYGULAMA İÇİNDE herhangi bir para tahsilatı YAPILMAZ. Sipariş, randevu veya hizmet bedeli; teslimde, gel-al sırasında veya işletme dışı yöntemlerle FİZİKSEL olarak ödenir. ' +
      'Platform bu ödemelere aracılık etmez, parayı tahsil etmez, tutmaz veya iade yükümlülüğü taşımaz. Mini Admin ile Müşteri arasındaki ücret, iade, iptal, fatura, vergi ve uyuşmazlıklardan Platform sorumlu DEĞİLDİR; bunların tamamı Mini Admin\'in sorumluluğundadır.' },
    en: { title: '7. Payments — No In-App Money Collection', body:
      'NO money is collected IN THE APP between a Customer and a Mini Admin through the Platform. The price of an order, appointment, or service is paid PHYSICALLY at delivery, pickup, or through off-app methods. ' +
      'The Platform does not intermediate these payments and does not collect, hold, or refund funds. The Platform is NOT responsible for fees, refunds, cancellations, invoicing, taxes, or disputes between Mini Admin and Customer; all of these are the Mini Admin\'s responsibility.' },
  },
  {
    tr: { title: '8. Platform Abonelik Paketleri', body:
      'Mini Adminler, Mini Uygulamalarını yayınlamak ve kapasite/özellik limitlerini yükseltmek için Platform aboneliği satın alabilir. Bu abonelikler, uygulamayı edindiğiniz mağaza (Apple App Store / Google Play) üzerinden, ilgili mağazanın uygulama-içi satın alma kuralları ve komisyonları çerçevesinde tahsil edilir. ' +
      'Abonelik ücretleri, yenileme, iptal ve iade işlemleri ilgili mağazanın politikalarına tabidir. Bu abonelik, Müşteri\'nin Mini Admin\'e yaptığı fiziksel ödemelerden tamamen bağımsızdır. Temel kullanım ücretsiz olabilir; ücretli paketler ek özellik ve limit sağlar.' },
    en: { title: '8. Platform Subscription Plans', body:
      'Mini Admins may purchase a Platform subscription to publish their Mini Apps and raise capacity/feature limits. These subscriptions are charged through the store from which you obtained the app (Apple App Store / Google Play), under that store\'s in-app purchase rules and commissions. ' +
      'Subscription pricing, renewal, cancellation, and refunds are subject to the relevant store\'s policies. This subscription is entirely independent of the physical payments Customers make to Mini Admins. Basic use may be free; paid plans provide additional features and limits.' },
  },
  {
    tr: { title: '9. İçerik ve Fikri Mülkiyet', body:
      'Mini Admin\'in yüklediği içerik (metin, görsel, logo) ilgili Mini Admin\'e aittir; Mini Admin bu içeriği Platform\'da göstermemiz için bize sınırlı, dünya çapında, telifsiz, alt-lisanslanabilir bir lisans verir. ' +
      'Mini Admin, yüklediği içeriğin telif ve kullanım haklarına sahip olduğunu taahhüt eder. Platform\'un yazılımı, "Yapio" markası ve tasarımı bize aittir; izinsiz kullanılamaz, kopyalanamaz.' },
    en: { title: '9. Content and Intellectual Property', body:
      'Content uploaded by a Mini Admin (text, images, logos) belongs to that Mini Admin, who grants us a limited, worldwide, royalty-free, sublicensable license to display it on the Platform. ' +
      'The Mini Admin warrants ownership of the copyright and usage rights to uploaded content. The Platform\'s software, the "Yapio" brand, and design belong to us and may not be used or copied without permission.' },
  },
  {
    tr: { title: '10. Sağlık ve Hassas Veriler', body:
      'Bazı Mini Uygulamalar sağlıkla ilgili veri (vücut ölçümü, diyet/antrenman programı, klinik notları) işleyebilir. Yapio bir TIBBİ CİHAZ veya teşhis/tedavi aracı DEĞİLDİR; yalnızca işletmenin kullandığı bir araçtır. ' +
      'Girilen ölçüm, program ve sağlık bilgilerinin doğruluğu, yorumu ve buna dayalı tavsiyeler tamamen ilgili Mini Admin\'in (ve varsa yetkili sağlık personelinin) sorumluluğundadır. Müşteri, acil veya ciddi durumlarda yetkili sağlık kuruluşuna başvurmalıdır. Hassas veriler yalnızca açık rıza ile ve hizmetin gerektirdiği ölçüde işlenmelidir.' },
    en: { title: '10. Health and Sensitive Data', body:
      'Some Mini Apps may process health-related data (body measurements, diet/training programs, clinical notes). Yapio is NOT a MEDICAL DEVICE or a diagnostic/treatment tool; it is merely a tool used by the business. ' +
      'The accuracy and interpretation of, and any advice based on, entered measurements, programs, and health information are the sole responsibility of the relevant Mini Admin (and its authorized health personnel, if any). Customers must consult a qualified health provider in urgent or serious situations. Sensitive data must be processed only with explicit consent and only as necessary for the service.' },
  },
  {
    tr: { title: '11. İletişim, Mesajlaşma ve İçerik Denetimi', body:
      'Platform, Mini Admin ile Müşteri arasında uygulama içi mesajlaşma sağlar. Güvenlik, hukuka uygunluk ve kötüye kullanımı önleme amacıyla, uygulama içi iletişim ve içerikler Platform tarafından denetlenebilir, incelenebilir ve gerektiğinde saklanabilir. ' +
      'Yasa dışı faaliyet, taciz, dolandırıcılık, tehdit veya istismar tespit edilirse hesaplar askıya alınabilir, içerik kaldırılabilir ve durum yetkili mercilere bildirilebilir. Uygulamayı kullanarak bu denetimi kabul edersiniz.' },
    en: { title: '11. Communications, Messaging and Content Moderation', body:
      'The Platform provides in-app messaging between Mini Admins and Customers. For safety, legal compliance, and abuse prevention, in-app communications and content may be monitored, reviewed, and retained by the Platform where necessary. ' +
      'If illegal activity, harassment, fraud, threats, or exploitation is detected, accounts may be suspended, content removed, and the matter reported to the competent authorities. By using the app you consent to such moderation.' },
  },
  {
    tr: { title: '12. Bildirimler ve Cihaz Verileri', body:
      'Platform, randevu hatırlatması, mesaj, onay vb. için push/yerel bildirim gönderebilir. Bildirimleri cihaz ayarlarından kapatabilirsiniz. ' +
      '"Adım Sayar" özelliği, yalnızca izin verdiğinizde cihazınızın hareket/adım sensöründen veri okur; bu veri adım/ilerleme göstermek için kullanılır. İzni cihaz ayarlarından geri alabilirsiniz.' },
    en: { title: '12. Notifications and Device Data', body:
      'The Platform may send push/local notifications for appointment reminders, messages, approvals, etc. You can disable notifications in device settings. ' +
      'The "Step Counter" feature reads data from your device\'s motion/step sensor only with your permission; this data is used to show steps/progress. You may revoke the permission in device settings.' },
  },
  {
    tr: { title: '13. Yasak Kullanımlar', body:
      'Şunlar yasaktır: yasa dışı mal/hizmet sunumu; dolandırıcılık; başkasının fikri mülkiyetini ihlal; spam; zararlı yazılım; nefret söylemi; reşit olmayanların istismarı; sahte hesap; izinsiz kişi/hesap ekleme; Platform\'u kötüye kullanma veya manipüle etme. İhlal halinde hesabınız derhal kapatılabilir ve yasal işlem başlatılabilir.' },
    en: { title: '13. Prohibited Uses', body:
      'Prohibited: offering illegal goods/services; fraud; infringing others\' IP; spam; malware; hate speech; exploitation of minors; fake accounts; adding persons/accounts without consent; abusing or manipulating the Platform. In case of violation, your account may be terminated immediately and legal action taken.' },
  },
  {
    tr: { title: '14. Kişisel Veriler (KVKK / GDPR)', body:
      'Kişisel veriler, Gizlilik Politikası ve 6698 sayılı KVKK (ve uygulanabilir yerlerde GDPR) uyarınca işlenir. Mini Admin, Müşterilerinden topladığı kişisel verilerin VERİ SORUMLUSU olarak kendi yasal yükümlülüklerini (aydınlatma, rıza, saklama, silme talepleri) yerine getirmekle yükümlüdür. ' +
      'Platform, kendi işlediği veriler bakımından gerekli teknik ve idari tedbirleri alır ve veri işleyen sıfatıyla hareket edebilir. Kullanıcı, kendisine ait verilerin silinmesini talep edebilir.' },
    en: { title: '14. Personal Data (KVKK / GDPR)', body:
      'Personal data is processed under the Privacy Policy and Turkish Law No. 6698 (KVKK) (and GDPR where applicable). The Mini Admin, as DATA CONTROLLER of data collected from its Customers, is responsible for its own legal obligations (notice, consent, retention, deletion requests). ' +
      'The Platform takes necessary technical and administrative measures for the data it processes and may act as a data processor. Users may request deletion of their own data.' },
  },
  {
    tr: { title: '15. Sorumluluğun Sınırlandırılması', body:
      'Yürürlükteki yasaların izin verdiği azami ölçüde; Platform, dolaylı, arızi, özel veya sonuç niteliğindeki zararlardan (kâr kaybı, veri kaybı, iş kaybı dahil) sorumlu değildir. Mini Admin ile Müşteri arasındaki hizmet, sağlık tavsiyesi veya ödemeden doğan zararlardan Platform sorumlu tutulamaz. Her hâlükârda Platform\'un toplam sorumluluğu, ilgili Kullanıcı\'nın son 3 ayda Platform\'a ödediği ücretle sınırlıdır.' },
    en: { title: '15. Limitation of Liability', body:
      'To the maximum extent permitted by law, the Platform is not liable for indirect, incidental, special, or consequential damages (including lost profits, data, or business). The Platform cannot be held liable for damages arising from the service, health advice, or payment between a Mini Admin and a Customer. In any event, the Platform\'s total liability is limited to the fees paid by the relevant User to the Platform in the preceding 3 months.' },
  },
  {
    tr: { title: '16. Tazminat', body:
      'Platform\'u kullanımınızdan, bu Sözleşme\'yi ihlalinizden, sunduğunuz hizmetten veya haklarınızı aşan eylemlerinizden doğan her türlü talep, zarar ve masrafa (makul avukatlık ücretleri dahil) karşı Platform\'u tazmin etmeyi ve beri kılmayı kabul edersiniz.' },
    en: { title: '16. Indemnification', body:
      'You agree to indemnify and hold the Platform harmless against any claims, damages, and costs (including reasonable attorneys\' fees) arising from your use of the Platform, your breach of these Terms, the service you provide, or acts exceeding your rights.' },
  },
  {
    tr: { title: '17. Garanti Reddi', body:
      'Platform "OLDUĞU GİBİ" ve "MEVCUT HÂLİYLE" sunulur. Kesintisiz, hatasız veya belirli bir amaca uygun olacağına dair açık veya zımni hiçbir garanti vermeyiz. Hizmeti dilediğimiz zaman değiştirebilir veya durdurabiliriz.' },
    en: { title: '17. Disclaimer of Warranties', body:
      'The Platform is provided "AS IS" and "AS AVAILABLE". We make no express or implied warranty that it will be uninterrupted, error-free, or fit for a particular purpose. We may modify or discontinue the service at any time.' },
  },
  {
    tr: { title: '18. Fesih ve Askıya Alma', body:
      'Bu Sözleşme\'yi ihlal etmeniz hâlinde hesabınızı önceden bildirimde bulunmaksızın askıya alabilir veya kapatabiliriz. Hesabınızı dilediğiniz zaman kapatabilirsiniz. Fesih, doğmuş yükümlülükleri ortadan kaldırmaz.' },
    en: { title: '18. Termination and Suspension', body:
      'We may suspend or terminate your account without prior notice if you breach these Terms. You may close your account at any time. Termination does not eliminate accrued obligations.' },
  },
  {
    tr: { title: '19. Uygulanacak Hukuk ve Yetki', body:
      'Bu Sözleşme Türkiye Cumhuriyeti hukukuna tabidir. Doğabilecek uyuşmazlıklarda Ankara Mahkemeleri ve İcra Daireleri yetkilidir. Tüketici işlemlerinde tüketicinin yasal hakları ve yetkili tüketici hakem heyetleri/mahkemeleri saklıdır.' },
    en: { title: '19. Governing Law and Jurisdiction', body:
      'These Terms are governed by the laws of the Republic of Türkiye. The Courts and Execution Offices of Ankara have jurisdiction over disputes. In consumer transactions, consumers\' statutory rights and competent consumer arbitration boards/courts are reserved.' },
  },
  {
    tr: { title: '20. Değişiklikler', body:
      'Bu Sözleşme\'yi zaman zaman güncelleyebiliriz. Önemli değişikliklerde sizi bilgilendiririz. Güncellemeden sonra Platform\'u kullanmaya devam etmeniz, yeni şartları kabul ettiğiniz anlamına gelir.' },
    en: { title: '20. Changes', body:
      'We may update these Terms from time to time. We will notify you of material changes. Continuing to use the Platform after an update constitutes acceptance of the new terms.' },
  },
  {
    tr: { title: '21. App Store / Play Store Şartları', body:
      'Platform\'u Apple App Store veya Google Play üzerinden edindiyseniz, ilgili mağazanın kullanım şartları da geçerlidir. Apple ve Google bu Sözleşme\'nin tarafı değildir ve Platform\'dan sorumlu değildir; abonelikler ilgili mağaza üzerinden yönetilir.' },
    en: { title: '21. App Store / Play Store Terms', body:
      'If you obtained the Platform via the Apple App Store or Google Play, that store\'s terms also apply. Apple and Google are not parties to these Terms and are not responsible for the Platform; subscriptions are managed through the relevant store.' },
  },
  {
    tr: { title: '22. İletişim', body:
      'Sorularınız için destek üzerinden bize ulaşabilirsiniz. Bu Sözleşme\'nin Türkçe ve İngilizce sürümleri arasında çelişki olması hâlinde Türkçe sürüm esas alınır.' },
    en: { title: '22. Contact', body:
      'For questions, you can reach us via support. In case of conflict between the Turkish and English versions, the Turkish version prevails.' },
  },
];
