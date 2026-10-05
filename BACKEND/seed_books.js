const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

const uri = "mongodb://127.0.0.1:27017/QuanLyMuonSach";
const sourceDir = "D:\\Project\\CT467\\LibraryManagement\\backend\\uploads";
const targetDir = path.join(__dirname, "public", "uploads");

// Create target dir if not exists
if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
}

// Helper to format string
function formatName(filename) {
    let name = filename.replace('.jpg', '').replace('.png', '').replace('.jpeg', '');
    // Remove leading numbers and underscores
    name = name.replace(/^\d+_?/, '');
    // Replace underscores with spaces
    name = name.replace(/_/g, ' ');
    // Handle specific cases (like Capybara CTU, Capybara Hutech)
    if (name.includes('-')) {
        name = name.split('-')[1].trim();
    }
    // Capitalize first letters
    name = name.replace(/\b\w/g, l => l.toUpperCase());
    return name;
}

// Map filenames to some categories heuristically
function getCategory(name) {
    name = name.toLowerCase();
    if (name.includes('dragon ball') || name.includes('naruto') || name.includes('one piece') || name.includes('conan') || name.includes('doraemon') || name.includes('titan') || name.includes('demon slayer') || name.includes('slam dunk') || name.includes('death note') || name.includes('fullmetal')) return "Truyện tranh (Manga/Comic)";
    if (name.includes('tuoi tho') || name.includes('kinh van hoa') || name.includes('cho toi xin mot ve') || name.includes('chu be')) return "Sách thiếu nhi";
    if (name.includes('vi sinh vat') || name.includes('kinh te') || name.includes('marketing') || name.includes('di truyen') || name.includes('luat') || name.includes('ky thuat') || name.includes('hoa dai cuong') || name.includes('csvh') || name.includes('ta cntt') || name.includes('benh thuy san')) return "Giáo trình";
    if (name.includes('1984') || name.includes('dune') || name.includes('martian') || name.includes('foundation') || name.includes('brave new world') || name.includes('enders game') || name.includes('time machine') || name.includes('fahrenheit') || name.includes('neuromancer') || name.includes('robot')) return "Khoa học - Kỹ thuật";
    if (name.includes('capybara')) return "Giải trí";
    return "Văn học Việt Nam"; // default for most of the provided list which looks like VN literature
}

async function run() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const db = client.db();
        const booksCollection = db.collection('SACH');
        const nxbCollection = db.collection('NHAXUATBAN');

        const nxbs = await nxbCollection.find({}).toArray();
        let defaultNxbId = "NXB001";
        if (nxbs.length > 0) {
            defaultNxbId = nxbs[0].MaNXB;
        }

        const files = fs.readdirSync(sourceDir);
        
        // Find current max MaSach
        let maxNumber = 0;
        const existingBooks = await booksCollection.find({}).toArray();
        for (const book of existingBooks) {
            if (book.MaSach && book.MaSach.startsWith('S')) {
                const num = parseInt(book.MaSach.replace('S', ''), 10);
                if (!isNaN(num) && num > maxNumber) {
                    maxNumber = num;
                }
            }
        }
        
        let count = maxNumber + 1;

        let inserted = 0;
        for (const file of files) {
            if (file === '.DS_Store' || file === 'default-book.jpg') continue;

            const sourcePath = path.join(sourceDir, file);
            const targetPath = path.join(targetDir, file);
            
            // Copy file
            fs.copyFileSync(sourcePath, targetPath);

            const bookName = formatName(file);
            const theLoai = getCategory(bookName);
            
            // Check if book already exists
            const existingBook = await booksCollection.findOne({ TenSach: bookName });
            if (existingBook) {
                console.log(`Skip existing: ${bookName}`);
                continue;
            }

            const bookDoc = {
                MaSach: `S${String(count).padStart(3, '0')}`,
                TenSach: bookName,
                DonGia: Math.floor(Math.random() * 15 + 5) * 10000,
                SoQuyen: Math.floor(Math.random() * 20 + 5),
                NamXuatBan: Math.floor(Math.random() * 20 + 2000),
                MaNXB: defaultNxbId,
                TacGia: "Nhiều Tác Giả",
                HinhAnh: `http://localhost:3000/uploads/${file}`,
                SoTrang: Math.floor(Math.random() * 400 + 100),
                MoTa: `Tác phẩm ${bookName} rất đáng đọc và mang lại nhiều giá trị.`,
                NgonNgu: "Tiếng Việt",
                TheLoai: theLoai
            };

            await booksCollection.insertOne(bookDoc);
            console.log(`Inserted book: ${bookName} - TheLoai: ${theLoai}`);
            count++;
            inserted++;
        }
        console.log(`Seeding completed successfully! Inserted ${inserted} books.`);
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

run();
