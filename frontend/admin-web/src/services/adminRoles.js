export const ROLES = {
  admin: 'Admin',
  books: 'NhanVienQuanLySach',
  borrowing: 'NhanVienDuyetMuon',
}

export const ALL_ROLES = Object.values(ROLES)
export const BOOK_ROLES = [ROLES.admin, ROLES.books]
export const BORROW_ROLES = [ROLES.admin, ROLES.borrowing]

export function readAdminSession() {
  const token = localStorage.getItem('token')
  if (!token) return null

  try {
    const encoded = token.split('.')[1]
    const normalized = encoded.replace(/-/g, '+').replace(/_/g, '/')
    const payload = JSON.parse(atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')))
    if (payload.aud !== 'admin' || !ALL_ROLES.includes(payload.role) || !payload.exp || Date.now() >= payload.exp * 1000) {
      return null
    }
    return payload
  } catch {
    return null
  }
}

export function defaultAdminPath(role) {
  return role === ROLES.books ? '/sach' : '/dashboard'
}
