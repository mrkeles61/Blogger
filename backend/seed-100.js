const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Article topics and templates
const topics = [
    'Teknoloji', 'Yazılım', 'Web Geliştirme', 'Mobil Uygulama', 'Yapay Zeka',
    'Makine Öğrenimi', 'Veri Bilimi', 'Siber Güvenlik', 'Bulut Bilişim', 'DevOps',
    'Frontend', 'Backend', 'Full Stack', 'React', 'Vue.js', 'Node.js', 'Python',
    'JavaScript', 'TypeScript', 'Veritabanı', 'API Tasarımı', 'Mikroservisler',
    'Docker', 'Kubernetes', 'Git', 'Agile', 'Scrum', 'UI/UX', 'Tasarım', 'SEO'
];

const titleTemplates = [
    '{topic} Rehberi: Başlangıçtan İleri Seviyeye',
    '{topic} ile Modern Uygulama Geliştirme',
    '{topic} Nedir? Kapsamlı Bir İnceleme',
    '{topic} Best Practices ve İpuçları',
    '{topic} için 10 Altın Kural',
    '{topic} Hatalarından Kaçınma Yolları',
    'Profesyonel {topic} Teknikleri',
    '{topic} Performans Optimizasyonu',
    '{topic} ile Verimli Çalışma Yöntemleri',
    '{topic} Karşılaştırması: Hangisini Seçmeli?',
    '2024\'te {topic} Trendleri',
    '{topic} Öğrenirken Yapılan Hatalar',
    '{topic} Araçları ve Kaynakları',
    'Adım Adım {topic} Projesi',
    '{topic} Interview Soruları ve Cevapları'
];

const summaryTemplates = [
    '{topic} konusunda bilmeniz gereken her şeyi bu makalede bulacaksınız.',
    'Bu rehber, {topic} yolculuğunuzda size yol gösterecek.',
    '{topic} hakkında kapsamlı ve güncel bilgiler.',
    'Profesyonellerden {topic} ipuçları ve stratejileri.',
    '{topic} konusundaki en iyi pratikleri öğrenin.',
    'Adım adım {topic} öğrenme rehberi.',
    '{topic} ile ilgili sık sorulan sorular ve cevapları.',
    'Kariyerinizi {topic} bilgisiyle güçlendirin.',
];

const contentParagraphs = [
    'Günümüz teknoloji dünyasında sürekli gelişen ve değişen trendleri takip etmek büyük önem taşımaktadır. Bu alanda uzmanlaşmak, sadece teorik bilgiyle değil, pratik deneyimle de mümkün olmaktadır.',
    'Başarılı projelerin arkasında her zaman iyi planlanmış bir strateji ve doğru araç seçimi yatmaktadır. Bu makalede, en etkili yöntemleri ve araçları inceleyeceğiz.',
    'Birçok geliştirici, kariyerlerinin başlangıcında sık yapılan hatalardan kaçınmak için rehberlik arar. İşte size yardımcı olacak kritik noktalar.',
    'Modern yazılım geliştirme süreçleri, ekip çalışmasına ve sürekli entegrasyona dayanmaktadır. Bu yaklaşımlar, projelerin başarısını doğrudan etkiler.',
    'Performans optimizasyonu, kullanıcı deneyiminin en önemli bileşenlerinden biridir. Yavaş çalışan uygulamalar, kullanıcı kaybına neden olabilir.',
    'Test Driven Development (TDD) yaklaşımı, kod kalitesini artırmanın en etkili yollarından biridir. Bu metodoloji, hataları erken aşamada yakalamaya yardımcı olur.',
    'Güvenlik, her yazılım projesinin temel taşlarından biridir. OWASP Top 10 güvenlik açıklarını bilmek ve bunlara karşı önlem almak kritik önem taşır.',
    'Microservices mimarisi, büyük ölçekli uygulamaların yönetimini kolaylaştırır. Ancak doğru şekilde uygulanmazsa karmaşıklığa neden olabilir.',
    'API tasarımı, modern yazılım geliştirmenin temel becerilerinden biridir. RESTful veya GraphQL API\'lar, frontend ve backend arasında köprü görevi görür.',
    'Container teknolojileri, deployment süreçlerini devrim niteliğinde değiştirmiştir. Docker ve Kubernetes, bu alandaki en popüler araçlardır.',
    'Continuous Integration ve Continuous Deployment (CI/CD) pipeline\'ları, yazılım teslimat sürecini otomatikleştirir ve hızlandırır.',
    'Clean Code prensipleri, okunabilir ve sürdürülebilir kod yazmanın temelidir. SOLID prensipleri bu konuda yol gösterici olabilir.',
    'Veritabanı tasarımı, uygulamanın performansını doğrudan etkiler. Normalizasyon ve indeksleme stratejileri iyi anlaşılmalıdır.',
    'Frontend framework\'leri sürekli evrim geçirmektedir. React, Vue ve Angular, bu alandaki en popüler seçenekler arasındadır.',
    'State management, karmaşık frontend uygulamalarının vazgeçilmez bir parçasıdır. Redux, Vuex veya MobX gibi çözümler bu ihtiyacı karşılar.'
];

function getRandomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generateContent(topic) {
    const numParagraphs = 4 + Math.floor(Math.random() * 4); // 4-7 paragraphs
    let content = `# ${topic} Hakkında\n\n`;

    for (let i = 0; i < numParagraphs; i++) {
        content += getRandomElement(contentParagraphs) + '\n\n';
    }

    content += `## Sonuç\n\n`;
    content += `${topic} konusunda sürekli öğrenme ve pratik yapma, başarının anahtarıdır. `;
    content += `Bu alanda kendinizi geliştirmek için kaynaklara göz atın ve projeler üzerinde çalışın.`;

    return content;
}

async function main() {
    console.log('🚀 Veritabanı seed işlemi başlıyor...\n');

    // Clear existing data
    console.log('📦 Mevcut veriler temizleniyor...');
    await prisma.activityLog.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.articleView.deleteMany();
    await prisma.articleCollaborator.deleteMany();
    await prisma.report.deleteMany();
    await prisma.moderationAction.deleteMany();
    await prisma.follow.deleteMany();
    await prisma.bookmark.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.like.deleteMany();
    await prisma.article.deleteMany();
    await prisma.user.deleteMany();

    // Create admin user
    console.log('\n👤 Admin kullanıcısı oluşturuluyor...');
    const adminPasswordHash = await bcrypt.hash('Admin123!', 10);
    const admin = await prisma.user.create({
        data: {
            email: 'admin@example.com',
            passwordHash: adminPasswordHash,
            role: 'Admin',
            username: 'admin',
            displayName: 'Admin',
            bio: 'Blog yöneticisi',
            headline: 'Site Yöneticisi',
            isVerified: true,
        },
    });
    console.log('✅ Admin: admin@example.com / Admin123!');

    // Create regular users
    console.log('\n👥 Normal kullanıcılar oluşturuluyor...');
    const userPasswordHash = await bcrypt.hash('User123!', 10);

    const users = await Promise.all([
        prisma.user.create({
            data: {
                email: 'ahmet@example.com',
                passwordHash: userPasswordHash,
                role: 'Editor',
                username: 'ahmet',
                displayName: 'Ahmet Yılmaz',
                bio: 'Full Stack Developer, teknoloji tutkunu',
                headline: 'Senior Software Engineer',
                isVerified: true,
            },
        }),
        prisma.user.create({
            data: {
                email: 'elif@example.com',
                passwordHash: userPasswordHash,
                role: 'Editor',
                username: 'elif',
                displayName: 'Elif Demir',
                bio: 'Frontend geliştirici, UI/UX meraklısı',
                headline: 'Frontend Developer',
                isVerified: false,
            },
        }),
        prisma.user.create({
            data: {
                email: 'mehmet@example.com',
                passwordHash: userPasswordHash,
                role: 'Viewer',
                username: 'mehmet',
                displayName: 'Mehmet Kaya',
                bio: 'Backend developer, veritabanı uzmanı',
                headline: 'Backend Developer',
                isVerified: true,
            },
        }),
        prisma.user.create({
            data: {
                email: 'zeynep@example.com',
                passwordHash: userPasswordHash,
                role: 'Viewer',
                username: 'zeynep',
                displayName: 'Zeynep Aydın',
                bio: 'DevOps mühendisi, bulut teknolojileri uzmanı',
                headline: 'DevOps Engineer',
                isVerified: false,
            },
        }),
    ]);

    console.log('✅ Kullanıcılar: ahmet, elif, mehmet, zeynep (şifre: User123!)');

    const allUsers = [admin, ...users];

    // Create 100 articles
    console.log('\n📝 100 makale oluşturuluyor...');
    const articles = [];

    for (let i = 0; i < 100; i++) {
        const topic = getRandomElement(topics);
        const titleTemplate = getRandomElement(titleTemplates);
        const summaryTemplate = getRandomElement(summaryTemplates);

        const title = titleTemplate.replace('{topic}', topic);
        const summary = summaryTemplate.replace('{topic}', topic);
        const content = generateContent(topic);

        const author = getRandomElement(allUsers);
        const status = Math.random() > 0.2 ? 'Published' : 'Draft'; // 80% published
        const daysAgo = Math.floor(Math.random() * 90); // Last 90 days
        const publishedAt = status === 'Published'
            ? new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000)
            : null;

        const article = await prisma.article.create({
            data: {
                title,
                summary,
                content,
                status,
                publishedAt,
                authorId: author.id,
                views: Math.floor(Math.random() * 500),
                isFeatured: i < 5, // First 5 are featured
            },
        });

        articles.push(article);

        if ((i + 1) % 20 === 0) {
            console.log(`  📄 ${i + 1}/100 makale oluşturuldu...`);
        }
    }
    console.log('✅ 100 makale oluşturuldu!');

    // Create likes
    console.log('\n❤️ Beğeniler oluşturuluyor...');
    const likesData = [];
    for (const article of articles) {
        const numLikes = Math.floor(Math.random() * 10) + 1; // 1-10 likes
        const likers = [...allUsers].sort(() => Math.random() - 0.5).slice(0, numLikes);
        for (const liker of likers) {
            likesData.push({ userId: liker.id, articleId: article.id });
        }
    }
    await prisma.like.createMany({ data: likesData, skipDuplicates: true });
    console.log(`✅ ${likesData.length} beğeni oluşturuldu!`);

    // Create comments
    console.log('\n💬 Yorumlar oluşturuluyor...');
    const commentTemplates = [
        'Harika bir makale, çok faydalı bilgiler!',
        'Bu konuda daha fazla içerik bekliyoruz.',
        'Teşekkürler, çok açıklayıcı olmuş.',
        'Pratik örnekler çok yararlı.',
        'Bu yaklaşımı projemde deneyeceğim.',
        'Güzel bir kaynak, kaydettim.',
        'Daha detaylı bir versiyon yapabilir misiniz?',
        'Sorularım için DM atabilir miyim?',
        'Mükemmel içerik, paylaşım için teşekkürler!',
        'Bu konuda workshop yapar mısınız?',
    ];

    const commentsData = [];
    for (const article of articles) {
        const numComments = Math.floor(Math.random() * 5); // 0-4 comments
        for (let j = 0; j < numComments; j++) {
            const commenter = getRandomElement(allUsers);
            commentsData.push({
                userId: commenter.id,
                articleId: article.id,
                content: getRandomElement(commentTemplates),
            });
        }
    }
    await prisma.comment.createMany({ data: commentsData });
    console.log(`✅ ${commentsData.length} yorum oluşturuldu!`);

    // Create bookmarks
    console.log('\n🔖 Kaydedilenler oluşturuluyor...');
    const bookmarksData = [];
    for (const article of articles) {
        if (Math.random() > 0.6) { // 40% chance
            const bookmarker = getRandomElement(allUsers);
            bookmarksData.push({ userId: bookmarker.id, articleId: article.id });
        }
    }
    await prisma.bookmark.createMany({ data: bookmarksData, skipDuplicates: true });
    console.log(`✅ ${bookmarksData.length} kayıt oluşturuldu!`);

    // Create follows
    console.log('\n👥 Takipler oluşturuluyor...');
    const followsData = [];
    for (const follower of allUsers) {
        for (const following of allUsers) {
            if (follower.id !== following.id && Math.random() > 0.5) {
                followsData.push({ followerId: follower.id, followingId: following.id });
            }
        }
    }
    await prisma.follow.createMany({ data: followsData, skipDuplicates: true });
    console.log(`✅ ${followsData.length} takip oluşturuldu!`);

    // Update user stats
    console.log('\n📊 Kullanıcı istatistikleri güncelleniyor...');
    for (const user of allUsers) {
        const articlesCount = await prisma.article.count({ where: { authorId: user.id } });
        const followersCount = await prisma.follow.count({ where: { followingId: user.id } });
        const followingCount = await prisma.follow.count({ where: { followerId: user.id } });

        await prisma.user.update({
            where: { id: user.id },
            data: { articlesCount, followersCount, followingCount },
        });
    }
    console.log('✅ İstatistikler güncellendi!');

    console.log('\n🎉 Seed işlemi tamamlandı!\n');
    console.log('📋 Özet:');
    console.log('  - 5 kullanıcı (1 admin, 4 normal)');
    console.log('  - 100 makale');
    console.log(`  - ${likesData.length} beğeni`);
    console.log(`  - ${commentsData.length} yorum`);
    console.log(`  - ${bookmarksData.length} kayıt`);
    console.log(`  - ${followsData.length} takip`);
    console.log('\n🔐 Giriş bilgileri:');
    console.log('  Admin: admin@example.com / Admin123!');
    console.log('  User:  ahmet@example.com / User123!');
}

main()
    .catch((e) => {
        console.error('❌ Hata:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
