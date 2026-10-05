class CartService {
  getCart() {
    const cart = localStorage.getItem('borrow_cart')
    return cart ? JSON.parse(cart) : []
  }

  saveCart(cart) {
    localStorage.setItem('borrow_cart', JSON.stringify(cart))
    // Dispatch event so other components can update
    window.dispatchEvent(new Event('cart-updated'))
  }

  addToCart(book) {
    const cart = this.getCart()
    if (!cart.find(item => item._id === book._id)) {
      cart.push({
        _id: book._id,
        TenSach: book.TenSach,
        TacGia: book.TacGia,
        HinhAnh: book.HinhAnh,
        SoQuyen: book.SoQuyen,
        DonGia: book.DonGia,
        quantity: book.quantity || 1
      })
      this.saveCart(cart)
      return true
    }
    return false
  }

  removeFromCart(bookId) {
    let cart = this.getCart()
    cart = cart.filter(item => item._id !== bookId)
    this.saveCart(cart)
  }

  updateQuantity(bookId, quantity) {
    let cart = this.getCart()
    const item = cart.find(item => item._id === bookId)
    if (item) {
      item.quantity = Math.max(1, quantity)
      this.saveCart(cart)
    }
  }

  clearCart() {
    localStorage.removeItem('borrow_cart')
    window.dispatchEvent(new Event('cart-updated'))
  }

  isInCart(bookId) {
    const cart = this.getCart()
    return !!cart.find(item => item._id === bookId)
  }
}

export default new CartService()
