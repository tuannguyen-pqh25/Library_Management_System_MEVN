require("dotenv").config();
const { MongoClient, ObjectId } = require("mongodb");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/QuanLyMuonSach";

async function seedDanhGia() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log("Connected to MongoDB successfully!");
    const db = client.db();

    const DocGiaCol = db.collection("DOCGIA");
    const SachCol = db.collection("SACH");
    const MuonSachCol = db.collection("THEODOIMUONSACH");
    const DanhGiaCol = db.collection("DANHGIA");
    const NhanVienCol = db.collection("NHANVIEN");

    // Lấy nhân viên để gán nếu cần tạo phiếu mượn bổ sung
    const adminStaff = await NhanVienCol.findOne({ MSNV: "ADMIN001" }) || await NhanVienCol.findOne({});
    const staffId = adminStaff ? adminStaff._id : new ObjectId();

    // 1. Lấy danh sách độc giả hợp lệ (TrangThaiTaiKhoan = "BinhThuong")
    const activeReaders = await DocGiaCol.find({
      TrangThaiTaiKhoan: { $ne: "BiKhoa" }
    }).toArray();

    if (activeReaders.length === 0) {
      console.error("Không tìm thấy độc giả hợp lệ nào!");
      return;
    }
    console.log(`Tìm thấy ${activeReaders.length} độc giả hợp lệ (không bị khóa).`);

    // Map độc giả theo MaDocGia để dễ chọn
    const readerMap = {};
    activeReaders.forEach(r => {
      if (r.MaDocGia) readerMap[r.MaDocGia] = r;
      readerMap[r._id.toString()] = r;
    });

    // 2. Dọn dẹp các đánh giá rác từ các đợt test tự động (noiDung rỗng hoặc vô nghĩa)
    const deleteTestReviews = await DanhGiaCol.deleteMany({
      $or: [
        { noiDung: "" },
        { noiDung: null },
        { noiDung: "ĐASADAS" } // Xóa đánh giá test tạm trước đó
      ]
    });
    console.log(`Đã dọn dẹp ${deleteTestReviews.deletedCount} đánh giá rác/test cũ.`);

    // 3. Danh sách các bài đánh giá mẫu phong phú, chân thực cho các đầu sách tiêu biểu
    const bookReviewsData = [
      {
        bookTitleMatch: "Clean Code",
        reviews: [
          {
            readerCode: "DG1001", // Nguyễn Văn An
            soSao: 5,
            tinhTrang: "tot",
            noiDung: "Cuốn sách kinh điển và là kim chỉ nam cho bất kỳ ai theo ngành phát triển phần mềm. Tác giả Robert C. Martin giải thích cực kỳ cặn kẽ về cách đặt tên biến, tách hàm và kiến trúc code sạch. Sách ở thư viện bản in rất đẹp, chữ rõ nét.",
            dateOffsetDays: -25
          },
          {
            readerCode: "DG1004", // Phạm Minh Đức
            soSao: 5,
            tinhTrang: "tot",
            noiDung: "Đọc xong cuốn này tư duy viết code của mình thay đổi hẳn. Các ví dụ minh họa bằng Java rất thực tế và dễ áp dụng vào đồ án môn học. Thủ thư duyệt mượn rất nhanh, sách được giữ gìn cẩn thận.",
            dateOffsetDays: -18
          },
          {
            readerCode: "DG1008", // Bùi Tiến Dũng
            soSao: 4,
            tinhTrang: "tot",
            noiDung: "Nội dung vô cùng giá trị. Một số chương nâng cao về Concurrency và Smell & Heuristics đòi hỏi phải nghiền ngẫm nhiều lần. Rất khuyến khích sinh viên ngành CNTT từ năm 2 trở lên nên mượn đọc.",
            dateOffsetDays: -12
          },
          {
            readerCode: "DG1006", // Vũ Quốc Bảo
            soSao: 5,
            tinhTrang: "tot",
            noiDung: "Sách được bảo quản tốt, bìa và gáy sách đều còn nguyên vẹn, không bị nhăn rách. Cảm ơn thư viện đã cập nhật những đầu sách chuyên ngành chất lượng như thế này!",
            dateOffsetDays: -5
          }
        ]
      },
      {
        bookTitleMatch: "Đắc Nhân Tâm",
        reviews: [
          {
            readerCode: "DG1002", // Trần Thị Bích
            soSao: 5,
            tinhTrang: "tot",
            noiDung: "Tác phẩm gối đầu giường về nghệ thuật giao tiếp và đối nhân xử thế. Mỗi nguyên tắc của Dale Carnegie đều đi kèm câu chuyện lịch sử sống động, giúp mình cải thiện kỹ năng làm việc nhóm rất nhiều.",
            dateOffsetDays: -40
          },
          {
            readerCode: "DG1005", // Đỗ Thảo My
            soSao: 5,
            tinhTrang: "tot",
            noiDung: "Văn phong dịch của bản First News rất trau chuốt và truyền cảm hứng. Đọc cuốn sách này giúp mình học được cách lắng nghe chân thành và thấu hiểu góc nhìn của người khác.",
            dateOffsetDays: -30
          },
          {
            readerCode: "DG1007", // Hoàng Ngọc Ánh
            soSao: 4,
            tinhTrang: "nhanbich",
            noiDung: "Nội dung tuyệt vời 10/10. Sách được rất nhiều bạn mượn nên bìa ngoài có hơi nhăn nhẹ ở mép nhưng bên trong giấy vẫn sáng và không bị mất trang nào. Thư viện phục vụ rất chu đáo.",
            dateOffsetDays: -20
          },
          {
            readerCode: "DG1008", // Bùi Tiến Dũng
            soSao: 5,
            tinhTrang: "tot",
            noiDung: "Một cuốn sách không bao giờ cũ theo thời gian. Mượn sách trực tuyến qua hệ thống ASALib rất tiện, vừa đăng ký xong là có email thông báo đến nhận sách ngay.",
            dateOffsetDays: -10
          },
          {
            readerCode: "DG1013", // Trương Mỹ Duyên
            soSao: 5,
            tinhTrang: "tot",
            noiDung: "Cuốn sách nuôi dưỡng tâm hồn và mở rộng tư duy sống tích cực. Rất cảm ơn thư viện trường đã có sẵn nhiều bản in để sinh viên mượn đọc cùng lúc.",
            dateOffsetDays: -3
          }
        ]
      },
      {
        bookTitleMatch: "Tôi Thấy Hoa Vàng Trên Cỏ Xanh",
        reviews: [
          {
            readerCode: "DG1009", // Đinh Phương Thảo
            soSao: 5,
            tinhTrang: "tot",
            noiDung: "Giọng văn của chú Nguyễn Nhật Ánh luôn đem lại cảm giác bình yên, nhẹ nhàng đến lạ. Những mẩu chuyện tuổi thơ của Thiều, Tường và Mận làm mình bồi hồi nhớ về những ngày tháng ở quê.",
            dateOffsetDays: -35
          },
          {
            readerCode: "DG1003", // Lê Hoàng Long
            soSao: 5,
            tinhTrang: "tot",
            noiDung: "Tình anh em giữa Thiều và Tường được khắc họa quá xúc động. Bản in của NXB Trẻ rất đẹp, có cả những bức vẽ minh họa mộc mạc và giàu cảm xúc.",
            dateOffsetDays: -22
          },
          {
            readerCode: "DG1011", // Ngô Thanh Vân
            soSao: 5,
            tinhTrang: "tot",
            noiDung: "Một câu chuyện trong trẻo nhưng cũng đượm buồn về sự ghen tỵ và hối hận của tuổi thơ. Đọc giải trí sau những tuần thi cử căng thẳng là lựa chọn số một.",
            dateOffsetDays: -14
          },
          {
            readerCode: "DG1016", // Phan Thị Hồng
            soSao: 4,
            tinhTrang: "tot",
            noiDung: "Sách mới, giấy thơm và chữ to dễ đọc. Thủ thư tại quầy bàn giao sách rất ân cần, hướng dẫn chi tiết cách bảo quản và thời hạn trả sách.",
            dateOffsetDays: -6
          }
        ]
      },
      {
        bookTitleMatch: "Dế Mèn Phiêu Lưu Ký",
        reviews: [
          {
            readerCode: "DG1012", // Hồ Văn Cường
            soSao: 5,
            tinhTrang: "tot",
            noiDung: "Kiệt tác văn học thiếu nhi của nhà văn Tô Hoài. Ngòi bút nhân hóa thế giới côn trùng vô cùng tài tình, chứa đựng bài học sâu sắc về tinh thần trượng nghĩa và lòng bao dung.",
            dateOffsetDays: -45
          },
          {
            readerCode: "DG1001", // Nguyễn Văn An
            soSao: 5,
            tinhTrang: "tot",
            noiDung: "Đọc lại tác phẩm này khi đã là sinh viên đại học vẫn thấy thấm thía từng lời răn dạy. Sách của thư viện được đóng bìa cứng rất trang trọng.",
            dateOffsetDays: -28
          },
          {
            readerCode: "DG1008", // Bùi Tiến Dũng
            soSao: 4,
            tinhTrang: "nhanbich",
            noiDung: "Tác phẩm bất hủ của văn học nước nhà. Sách cầm vừa tay, trang sách hơi ngả vàng nhẹ theo thời gian nhưng giữ được nét mộc mạc cổ điển.",
            dateOffsetDays: -15
          }
        ]
      },
      {
        bookTitleMatch: "Số Đỏ",
        reviews: [
          {
            readerCode: "DG1006", // Vũ Quốc Bảo
            soSao: 5,
            tinhTrang: "tot",
            noiDung: "Đỉnh cao của văn học hiện thực phê phán Việt Nam. Ngòi bút châm biếm của Vũ Trọng Phụng sắc như dao cạo, vạch trần bộ mặt kệch cỡm của xã hội thượng lưu nửa mùa thời bấy giờ.",
            dateOffsetDays: -32
          },
          {
            readerCode: "DG1002", // Trần Thị Bích
            soSao: 5,
            tinhTrang: "tot",
            noiDung: "Nhân vật Xuân Tóc Đỏ được xây dựng quá độc đáo và tài tình. Tác phẩm đọc vừa buồn cười vừa xót xa, ngôn từ phong phú và giàu tính nhạc.",
            dateOffsetDays: -19
          },
          {
            readerCode: "DG1004", // Phạm Minh Đức
            soSao: 5,
            tinhTrang: "tot",
            noiDung: "Một cuốn sách bắt buộc phải đọc đối với những ai yêu thích văn học kinh điển Việt Nam. Rất mừng là thư viện có lưu trữ đầy đủ bản in chuẩn không bị cắt xén.",
            dateOffsetDays: -7
          }
        ]
      },
      {
        bookTitleMatch: "Chí Phèo",
        reviews: [
          {
            readerCode: "DG1003", // Lê Hoàng Long
            soSao: 5,
            tinhTrang: "tot",
            noiDung: "Tiếng thét khao khát được làm người lương thiện của Chí Phèo vẫn luôn vang vọng và gây ám ảnh sâu sắc. Nghệ thuật miêu tả tâm lý nhân vật của Nam Cao thực sự đạt đến bậc thầy.",
            dateOffsetDays: -26
          },
          {
            readerCode: "DG1005", // Đỗ Thảo My
            soSao: 5,
            tinhTrang: "tot",
            noiDung: "Bát cháo hành của Thị Nở là chi tiết nhân đạo đắt giá nhất trong văn học hiện thực. Tác phẩm để lại nhiều khoảng lặng và sự trắc ẩn trong lòng người đọc.",
            dateOffsetDays: -11
          }
        ]
      },
      {
        bookTitleMatch: "Tắt Đèn",
        reviews: [
          {
            readerCode: "DG1007", // Hoàng Ngọc Ánh
            soSao: 5,
            tinhTrang: "tot",
            noiDung: "Hình tượng chị Dậu vùng lên chống lại tên cai lệ và người nhà lý trưởng thể hiện sức sống quật cường, bất khuất của người phụ nữ nông dân Việt Nam trước cách mạng.",
            dateOffsetDays: -33
          },
          {
            readerCode: "DG1016", // Phan Thị Hồng
            soSao: 5,
            tinhTrang: "tot",
            noiDung: "Câu chuyện xúc động lấy đi nhiều nước mắt. Đọc tác phẩm để thêm thấu hiểu nỗi cơ cực của ông cha ta thời sưu cao thuế nặng và biết trân trọng cuộc sống tự do hôm nay.",
            dateOffsetDays: -16
          }
        ]
      },
      {
        bookTitleMatch: "Vợ Nhặt",
        reviews: [
          {
            readerCode: "DG1004", // Phạm Minh Đức
            soSao: 5,
            tinhTrang: "tot",
            noiDung: "Giữa bờ vực của nạn đói năm 1945, tình người và khát vọng sống vẫn vươn lên mãnh liệt. Kim Lân đã viết nên một tác phẩm ngắn nhưng chan chứa tình thương yêu và niềm lạc quan.",
            dateOffsetDays: -21
          },
          {
            readerCode: "DG1013", // Trương Mỹ Duyên
            soSao: 5,
            tinhTrang: "tot",
            noiDung: "Nụ cười rạng rỡ của bà cụ Tứ trong bữa cháo cám đọng lại niềm tin mãnh liệt vào ngày mai tươi sáng. Một bài học sâu sắc về tình nghĩa vợ chồng và tình mẫu tử thiêng liêng.",
            dateOffsetDays: -8
          }
        ]
      },
      {
        bookTitleMatch: "Doraemon",
        reviews: [
          {
            readerCode: "DG1009", // Đinh Phương Thảo
            soSao: 5,
            tinhTrang: "tot",
            noiDung: "Bộ truyện tranh bất hủ của tuổi thơ. Những bảo bối diệu kỳ và tình bạn hồn nhiên của nhóm bạn Nobita luôn mang lại tiếng cười sảng khoái và thư giãn sau giờ học.",
            dateOffsetDays: -17
          },
          {
            readerCode: "DG1011", // Ngô Thanh Vân
            soSao: 5,
            tinhTrang: "tot",
            noiDung: "Bản dịch của NXB Kim Đồng rất mượt và thân thuộc. Truyện tranh ở thư viện được giữ gìn rất cẩn thận, bìa cứng sạch sẽ, không bị vẽ bậy hay quăn mép.",
            dateOffsetDays: -4
          }
        ]
      },
      {
        bookTitleMatch: "Conan",
        reviews: [
          {
            readerCode: "DG1004", // Phạm Minh Đức
            soSao: 5,
            tinhTrang: "tot",
            noiDung: "Tập đầu tiên mở màn cho hành trình phá án huyền thoại của thám tử teo nhỏ Edogawa Conan. Những vụ án được xây dựng chặt chẽ, lôi cuốn và đầy bất ngờ.",
            dateOffsetDays: -24
          },
          {
            readerCode: "DG1001", // Nguyễn Văn An
            soSao: 4,
            tinhTrang: "tot",
            noiDung: "Nét vẽ những tập đầu tuy cổ điển nhưng cốt truyện rất kịch tính. Rất thích việc thư viện cập nhật đầy đủ các tập truyện tranh song song với sách giáo trình.",
            dateOffsetDays: -9
          }
        ]
      },
      {
        bookTitleMatch: "Dragon Ball",
        reviews: [
          {
            readerCode: "DG1006", // Vũ Quốc Bảo
            soSao: 5,
            tinhTrang: "tot",
            noiDung: "Trận chiến đỉnh cao tại hành tinh Namek giữa Goku và Frieza. Từng khung tranh hành động của tác giả Akira Toriyama đều tràn đầy năng lượng và nhiệt huyết.",
            dateOffsetDays: -15
          }
        ]
      },
      {
        bookTitleMatch: "Dune",
        reviews: [
          {
            readerCode: "DG1001", // Nguyễn Văn An
            soSao: 5,
            tinhTrang: "tot",
            noiDung: "Tượng đài của dòng tiểu thuyết khoa học viễn tưởng thế giới. Hệ sinh thái hành tinh cát Arrakis và cuộc đấu tranh quyền lực giữa các đại gia tộc được Frank Herbert xây dựng đồ sộ và thâm sâu kỳ vĩ.",
            dateOffsetDays: -13
          },
          {
            readerCode: "DG1003", // Lê Hoàng Long
            soSao: 5,
            tinhTrang: "tot",
            noiDung: "Bản dịch tiếng Việt chuyển tải được trọn vẹn thuật ngữ tôn giáo, chính trị và triết học của nguyên tác. Một cuốn tiểu thuyết đòi hỏi sự kiên nhẫn nhưng phần thưởng nhận lại là vô giá.",
            dateOffsetDays: -2
          }
        ]
      },
      {
        bookTitleMatch: "The Martian",
        reviews: [
          {
            readerCode: "DG1006", // Vũ Quốc Bảo
            soSao: 5,
            tinhTrang: "tot",
            noiDung: "Kịch bản nghẹt thở và hài hước một cách thông minh. Mark Watney với tinh thần khoa học thực nghiệm và sự lạc quan đã chứng minh ý chí con người có thể chiến thắng cả môi trường khắc nghiệt của sao Hỏa.",
            dateOffsetDays: -11
          }
        ]
      },
      {
        bookTitleMatch: "1984",
        reviews: [
          {
            readerCode: "DG1003", // Lê Hoàng Long
            soSao: 5,
            tinhTrang: "tot",
            noiDung: "Tác phẩm phản địa đàng (Dystopia) kinh điển của George Orwell. Lời cảnh báo sâu sắc và mang tính tiên tri về tự do cá nhân, tư duy phản biện và sự kiểm soát tâm lý.",
            dateOffsetDays: -7
          }
        ]
      },
      {
        bookTitleMatch: "Fullmetal Alchemist",
        reviews: [
          {
            readerCode: "DG1008", // Bùi Tiến Dũng
            soSao: 5,
            tinhTrang: "tot",
            noiDung: "Quy luật trao đổi đồng giá và tình anh em giữa Edward và Alphonse Elric. Cốt truyện chặt chẽ không một chi tiết thừa, một trong những bộ manga nhân văn nhất từng đọc.",
            dateOffsetDays: -5
          }
        ]
      },
      {
        bookTitleMatch: "Mat Biec",
        reviews: [
          {
            readerCode: "DG1005", // Đỗ Thảo My
            soSao: 5,
            tinhTrang: "tot",
            noiDung: "Tình yêu đơn phương sâu nặng và day dứt của Ngạn dành cho Hà Lan dưới bóng cây gòn làng Đo Đo. Đọc xong thấy bồi hồi và tiếc nuối cho một thời thanh xuân tươi đẹp.",
            dateOffsetDays: -18
          },
          {
            readerCode: "DG1002", // Trần Thị Bích
            soSao: 5,
            tinhTrang: "tot",
            noiDung: "Nguyễn Nhật Ánh viết về tình yêu đầu đời quá tinh tế. Bản in bìa mới của NXB Trẻ rất trang nhã, giấy xốp nhẹ dễ cầm đọc.",
            dateOffsetDays: -8
          }
        ]
      },
      {
        bookTitleMatch: "Cho Toi Xin Mot Ve Di Tuoi Tho",
        reviews: [
          {
            readerCode: "DG1009", // Đinh Phương Thảo
            soSao: 5,
            tinhTrang: "tot",
            noiDung: "Cuốn vé trở về tuổi thơ tuyệt vời nhất. Những trò nghịch ngợm ngây ngô của cu Mùi, Hải cò, con Tủn khiến người lớn phải mỉm cười và suy ngẫm về thế giới của con trẻ.",
            dateOffsetDays: -21
          },
          {
            readerCode: "DG1012", // Hồ Văn Cường
            soSao: 5,
            tinhTrang: "tot",
            noiDung: "Đọc để được cười thả ga và nhớ về thời còn vô lo vô nghĩ. Cảm ơn thư viện đã chuẩn bị kho sách văn học thiếu nhi rất đồ sộ.",
            dateOffsetDays: -6
          }
        ]
      },
      {
        bookTitleMatch: "Kinh Van Hoa",
        reviews: [
          {
            readerCode: "DG1011", // Ngô Thanh Vân
            soSao: 5,
            tinhTrang: "tot",
            noiDung: "Bộ ba Quý rơm, Tiểu Long và nhỏ Hạnh như những người bạn đồng hành suốt những năm tháng cắp sách đến trường. Cốt truyện vui nhộn, thông minh và giàu tính giáo dục.",
            dateOffsetDays: -14
          }
        ]
      }
    ];

    let totalReviewsSeeded = 0;
    let totalBorrowRecordsEnsured = 0;

    for (const item of bookReviewsData) {
      // Tìm sách khớp theo tên
      const regex = new RegExp(item.bookTitleMatch, "i");
      const book = await SachCol.findOne({ TenSach: { $regex: regex } });

      if (!book) {
        console.log(`Bỏ qua: Không tìm thấy sách khớp với từ khóa "${item.bookTitleMatch}"`);
        continue;
      }

      console.log(`\nĐang xử lý đánh giá cho sách: "${book.TenSach}" (ID: ${book._id})...`);

      for (const rev of item.reviews) {
        const reader = readerMap[rev.readerCode];
        if (!reader) {
          console.log(`  - Không tìm thấy độc giả có mã ${rev.readerCode}, bỏ qua.`);
          continue;
        }

        // 1. Kiểm tra độc giả đã có phiếu mượn hợp lệ cho sách này chưa
        let borrowRecord = await MuonSachCol.findOne({
          docGiaId: reader._id,
          sachId: book._id,
          trangThai: { $nin: ["chờ duyệt", "từ chối"] }
        });

        const now = new Date();
        const reviewDate = new Date(now.getTime() + (rev.dateOffsetDays || -10) * 86400000);
        const borrowDate = new Date(reviewDate.getTime() - 14 * 86400000); // Mượn trước khi đánh giá 14 ngày
        const returnDate = new Date(reviewDate.getTime() - 2 * 86400000); // Đã trả trước khi đánh giá 2 ngày

        const borrowDateStr = borrowDate.toISOString().split("T")[0];
        const dueDateStr = new Date(borrowDate.getTime() + 14 * 86400000).toISOString().split("T")[0];
        const returnDateStr = returnDate.toISOString().split("T")[0];

        if (!borrowRecord) {
          // Tự động tạo phiếu mượn hoàn tất (đã trả) để đảm bảo toàn vẹn nghiệp vụ
          const newBorrow = {
            docGiaId: reader._id,
            sachId: book._id,
            soLuong: 1,
            ngayMuon: borrowDateStr,
            ngayTra: dueDateStr,
            trangThai: "đã trả",
            ngayTraThucTe: returnDateStr,
            nhanVienId: staffId,
            isDemo: true,
            createdAt: `${borrowDateStr}T08:00:00.000Z`,
            updatedAt: `${returnDateStr}T16:00:00.000Z`
          };
          await MuonSachCol.insertOne(newBorrow);
          totalBorrowRecordsEnsured++;
          console.log(`  + Đã tự động tạo phiếu mượn "đã trả" cho độc giả ${reader.HoLot} ${reader.Ten} (${reader.MaDocGia})`);
        }

        // 2. Upsert đánh giá vào collection DANHGIA
        const reviewDoc = {
          docGiaId: reader._id,
          sachId: book._id,
          soSao: rev.soSao,
          noiDung: rev.noiDung,
          tinhTrang: rev.tinhTrang || "tot",
          createdAt: reviewDate.toISOString(),
          updatedAt: reviewDate.toISOString()
        };

        await DanhGiaCol.updateOne(
          { docGiaId: reader._id, sachId: book._id },
          { $set: reviewDoc },
          { upsert: true }
        );

        totalReviewsSeeded++;
        console.log(`  ✓ Đã cập nhật đánh giá [${rev.soSao}⭐] từ độc giả: ${reader.HoLot} ${reader.Ten}`);
      }
    }

    console.log("\n=================== TỔNG KẾT SEED ĐÁNH GIÁ ===================");
    console.log(`- Tổng số lượt đánh giá đã tạo/cập nhật: ${totalReviewsSeeded}`);
    console.log(`- Tổng số phiếu mượn bổ sung đảm bảo toàn vẹn: ${totalBorrowRecordsEnsured}`);

    // Thống kê điểm trung bình của các sách có đánh giá
    const allReviews = await DanhGiaCol.find({}).toArray();
    console.log(`- Tổng số bản ghi DANHGIA trong CSDL: ${allReviews.length}`);

    const stats = await DanhGiaCol.aggregate([
      {
        $group: {
          _id: "$sachId",
          avgRating: { $avg: "$soSao" },
          totalReviews: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: "SACH",
          localField: "_id",
          foreignField: "_id",
          as: "book"
        }
      },
      { $unwind: "$book" },
      { $sort: { totalReviews: -1, avgRating: -1 } }
    ]).toArray();

    console.log("\nĐiểm xếp hạng trung bình theo từng đầu sách:");
    stats.forEach(s => {
      const avg = Math.round(s.avgRating * 10) / 10;
      console.log(`  • "${s.book.TenSach}": ${avg}⭐ (${s.totalReviews} đánh giá)`);
    });
    console.log("==============================================================");

  } catch (error) {
    console.error("Lỗi khi seed đánh giá:", error);
  } finally {
    await client.close();
  }
}

seedDanhGia();