const { test } = require('node:test');
const assert = require('node:assert/strict');
const { MongoClient } = require('mongodb');
const app = require('../app');
const config = require('../app/config');
const MongoDB = require('../app/utils/mongodb.util');
const NhanVienService = require('../app/services/nhanvien.service');

test('real MongoDB: staff roles and reader borrow lifecycle', async () => {
  if (!process.env.CT449_TEST_MONGODB_URI) {
    throw new Error('Set CT449_TEST_MONGODB_URI for the isolated test instance');
  }
  const dbName = `ct449_integration_${Date.now()}`;
  const client = new MongoClient(`${process.env.CT449_TEST_MONGODB_URI}/${dbName}`);
  await client.connect();
  MongoDB.client = client;
  config.jwt.secret = 'ct449-integration-secret';
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;

  const request = async (method, path, token, body) => {
    const response = await fetch(base + path, {
      method,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    return { status: response.status, body: await response.json() };
  };

  try {
    const staff = new NhanVienService(client);
    await staff.create({ MSNV: 'ADMIN_TEST', password: 'Admin@Test123', HoTenNV: 'Admin Test', ChucVu: 'Admin' });
    const adminLogin = await request('POST', '/api/admin/auth/login', null, { MSNV: 'ADMIN_TEST', password: 'Admin@Test123' });
    assert.equal(adminLogin.status, 200, JSON.stringify(adminLogin.body));
    const adminToken = adminLogin.body.token;

    const manager = await request('POST', '/api/admin/nhanvien', adminToken, { MSNV: 'BOOK_TEST', password: 'Books@Test123', HoTenNV: 'Book Manager', ChucVu: 'NhanVienQuanLySach' });
    const borrower = await request('POST', '/api/admin/nhanvien', adminToken, { MSNV: 'LOAN_TEST', password: 'Loans@Test123', HoTenNV: 'Loan Manager', ChucVu: 'NhanVienDuyetMuon' });
    assert.equal(manager.status, 200, JSON.stringify(manager.body));
    assert.equal(borrower.status, 200, JSON.stringify(borrower.body));
    const managerId = manager.body.data._id;
    const borrowerId = borrower.body.data._id;
    const bookLogin = await request('POST', '/api/admin/auth/login', null, { MSNV: 'BOOK_TEST', password: 'Books@Test123' });
    const loanLogin = await request('POST', '/api/admin/auth/login', null, { MSNV: 'LOAN_TEST', password: 'Loans@Test123' });
    assert.equal(bookLogin.status, 200);
    assert.equal(loanLogin.status, 200);
    assert.equal((await request('GET', '/api/admin/nhanvien', bookLogin.body.token)).status, 403);
    assert.equal((await request('GET', '/api/admin/nhanvien', loanLogin.body.token)).status, 403);
    assert.equal((await request('GET', '/api/admin/sach', loanLogin.body.token)).status, 403);
    assert.equal((await request('GET', '/api/admin/muonsach', bookLogin.body.token)).status, 403);
    assert.equal((await request('GET', '/api/admin/sach', bookLogin.body.token)).status, 200);
    assert.equal((await request('GET', '/api/admin/muonsach', loanLogin.body.token)).status, 200);

    const staffList = await request('GET', '/api/admin/nhanvien', adminToken);
    assert.equal(staffList.status, 200);
    assert.equal(staffList.body.length, 3);
    assert.ok(staffList.body.every(item => !('Password' in item)));
    const edit = await request('PUT', `/api/admin/nhanvien/${managerId}`, adminToken, { HoTenNV: 'Updated Book Manager', ChucVu: 'NhanVienQuanLySach' });
    assert.equal(edit.status, 200, JSON.stringify(edit.body));
    assert.equal(edit.body.data.HoTenNV, 'Updated Book Manager');

    const bookInsert = await client.db().collection('SACH').insertOne({ MaSach: 'TEST001', TenSach: 'Integration Book', DonGia: 10000, SoQuyen: 1, NamXuatBan: 2026, MaNXB: 'TESTNXB' });
    const bookId = String(bookInsert.insertedId);
    const register = async (email, code) => {
      const result = await request('POST', '/api/user/auth/register', null, { Email: email, MatKhau: 'Reader@Test123', MaDocGia: code, HoLot: 'Doc', Ten: 'Gia' });
      assert.equal(result.status, 201, JSON.stringify(result.body));
      const login = await request('POST', '/api/user/auth/login', null, { Email: email, MatKhau: 'Reader@Test123' });
      assert.equal(login.status, 200, JSON.stringify(login.body));
      return login.body.token;
    };
    const user1 = await register('reader1@ct449.test', 'DGTEST001');
    const user2 = await register('reader2@ct449.test', 'DGTEST002');
    const storedReader = await client.db().collection('DOCGIA').findOne({ Email: 'reader1@ct449.test' });
    assert.notEqual(storedReader.password, 'Reader@Test123');
    assert.equal(storedReader.password, storedReader.MatKhau);
    const borrow = async token => request('POST', '/api/user/muon', token, { sachId: bookId, soLuong: 1, ngayMuon: '2026-09-30', ngayTra: '2026-10-20' });
    const first = await borrow(user1);
    const second = await borrow(user2);
    assert.equal(first.status, 201, JSON.stringify(first.body));
    assert.equal(second.status, 201, JSON.stringify(second.body));
    const loans = client.db().collection('THEODOIMUONSACH');
    const books = client.db().collection('SACH');
    assert.equal((await books.findOne({ _id: bookInsert.insertedId })).SoQuyen, 1);
    assert.equal((await request('PUT', `/api/admin/muonsach/${first.body.data._id}/approve`, loanLogin.body.token)).status, 200);
    assert.equal((await books.findOne({ _id: bookInsert.insertedId })).SoQuyen, 0);
    assert.equal((await request('PUT', `/api/admin/muonsach/${second.body.data._id}/approve`, loanLogin.body.token)).status, 400);
    assert.equal((await request('PUT', `/api/admin/muonsach/${second.body.data._id}/reject`, loanLogin.body.token)).status, 200);
    assert.equal((await books.findOne({ _id: bookInsert.insertedId })).SoQuyen, 0);
    const history = await request('GET', '/api/user/muon/lich-su', user1);
    assert.equal(history.status, 200);
    assert.equal(history.body[0].trangThai, 'đã duyệt');
    assert.equal((await request('PUT', `/api/admin/muonsach/${first.body.data._id}/confirm-return`, loanLogin.body.token)).status, 200);
    assert.equal((await books.findOne({ _id: bookInsert.insertedId })).SoQuyen, 1);
    assert.equal((await request('PUT', `/api/admin/muonsach/${first.body.data._id}/confirm-return`, loanLogin.body.token)).status, 400);
    assert.equal((await books.findOne({ _id: bookInsert.insertedId })).SoQuyen, 1);

    const pending = await borrow(user1);
    assert.equal(pending.status, 201);
    assert.equal((await request('PUT', `/api/admin/muonsach/${pending.body.data._id}/confirm-return`, loanLogin.body.token)).status, 400);
    assert.equal((await books.findOne({ _id: bookInsert.insertedId })).SoQuyen, 1);
    assert.equal((await request('DELETE', `/api/admin/muonsach/${pending.body.data._id}`, adminToken)).status, 200);
    assert.equal((await books.findOne({ _id: bookInsert.insertedId })).SoQuyen, 1);
    assert.equal(await loans.countDocuments({}), 2);

    const raceBook = await books.insertOne({ MaSach: 'TEST002', TenSach: 'Concurrent Book', DonGia: 10000, SoQuyen: 2, NamXuatBan: 2026, MaNXB: 'TESTNXB' });
    const raceLoan = await request('POST', '/api/user/muon', user1, { sachId: String(raceBook.insertedId), soLuong: 1 });
    assert.equal(raceLoan.status, 201);
    const approvals = await Promise.all([
      request('PUT', `/api/admin/muonsach/${raceLoan.body.data._id}/approve`, loanLogin.body.token),
      request('PUT', `/api/admin/muonsach/${raceLoan.body.data._id}/approve`, adminToken),
    ]);
    assert.deepEqual(approvals.map(result => result.status).sort(), [200, 400]);
    assert.equal((await books.findOne({ _id: raceBook.insertedId })).SoQuyen, 1);

    const lastCopy = await books.insertOne({ MaSach: 'TEST003', TenSach: 'Last Copy', DonGia: 10000, SoQuyen: 1, NamXuatBan: 2026, MaNXB: 'TESTNXB' });
    const firstWaiting = await request('POST', '/api/user/muon', user1, { sachId: String(lastCopy.insertedId), soLuong: 1 });
    const secondWaiting = await request('POST', '/api/user/muon', user2, { sachId: String(lastCopy.insertedId), soLuong: 1 });
    assert.equal(firstWaiting.status, 201);
    assert.equal(secondWaiting.status, 201);
    const competing = await Promise.all([
      request('PUT', `/api/admin/muonsach/${firstWaiting.body.data._id}/approve`, loanLogin.body.token),
      request('PUT', `/api/admin/muonsach/${secondWaiting.body.data._id}/approve`, adminToken),
    ]);
    assert.deepEqual(competing.map(result => result.status).sort(), [200, 400]);
    assert.equal((await books.findOne({ _id: lastCopy.insertedId })).SoQuyen, 0);
    assert.equal((await request('DELETE', `/api/admin/nhanvien/${borrowerId}`, adminToken)).status, 200);
    assert.equal((await request('GET', `/api/admin/nhanvien/${borrowerId}`, adminToken)).status, 404);
  } finally {
    await new Promise(resolve => server.close(resolve));
    await client.close();
    MongoDB.client = null;
  }
});
