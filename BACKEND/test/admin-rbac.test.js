const { test } = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');
const app = require('../app');
const config = require('../app/config');
const MongoDB = require('../app/utils/mongodb.util');

test('admin API separates the three staff roles', async () => {
  config.jwt.secret = 'rbac-test-secret';
  MongoDB.client = {
    db: () => ({ collection: () => ({ find: () => ({ toArray: async () => [] }) }) }),
  };

  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const token = (role, aud = 'admin') => jwt.sign({ _id: 'test-user', role, aud }, config.jwt.secret, { expiresIn: '1h' });
  const request = async (path, bearer, method = 'GET') => {
    const response = await fetch(base + path, { method, headers: bearer ? { Authorization: `Bearer ${bearer}` } : {} });
    return response.status;
  };

  try {
    assert.equal(await request('/api/admin/nhanvien'), 401);
    assert.equal(await request('/api/admin/nhanvien', token('DocGia', 'user')), 403);
    assert.equal(await request('/api/admin/nhanvien', token('NhanVienQuanLySach')), 403);
    assert.equal(await request('/api/admin/nhanvien', token('NhanVienDuyetMuon')), 403);
    assert.equal(await request('/api/admin/nhanvien', token('Admin')), 200);

    assert.equal(await request('/api/admin/sach', token('NhanVienDuyetMuon')), 403);
    assert.equal(await request('/api/admin/nxb', token('NhanVienDuyetMuon')), 403);
    assert.equal(await request('/api/admin/muonsach', token('NhanVienQuanLySach')), 403);
    assert.equal(await request('/api/admin/muonsach/test/approve', token('NhanVienQuanLySach'), 'PUT'), 403);
    assert.equal(await request('/api/admin/docgia', token('NhanVienQuanLySach')), 403);
    assert.equal(await request('/api/admin/muonsach-legacy', token('NhanVienDuyetMuon')), 403);
  } finally {
    await new Promise(resolve => server.close(resolve));
    MongoDB.client = null;
  }
});
