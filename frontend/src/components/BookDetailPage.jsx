import React, { useEffect, useMemo, useState } from 'react';

const SHIPPING_COPY = {
  Express: 'Giao nhanh trong 1-2 ngay lam viec.',
  Standard: 'Giao tieu chuan trong 3-5 ngay lam viec.',
  Pickup: 'Nhan tai quay, khong tinh phi van chuyen.',
};

export default function BookDetailPage({
  book,
  reviews,
  loading,
  onBack,
  renderRating,
  formatPrice,
  busyAction,
  onAddToCart,
  onBuyNow,
  checkoutForm,
  onCheckoutFieldChange,
  currentCartQuantity,
  soldCount,
}) {
  const [quantity, setQuantity] = useState(1);
  const stock = Number(book.stock || 0);
  const availableToAdd = Math.max(stock - Number(currentCartQuantity || 0), 0);
  const actionKey = `book-${book.id}`;
  const isBusy = busyAction === actionKey;
  const isSoldOut = stock <= 0;
  const subtotal = useMemo(() => Number(book.price || 0) * quantity, [book.price, quantity]);

  useEffect(() => {
    setQuantity(availableToAdd > 0 ? 1 : 0);
  }, [book.id, availableToAdd]);

  function handleStep(nextQuantity) {
    if (availableToAdd <= 0) {
      return;
    }

    setQuantity(Math.min(availableToAdd, Math.max(1, nextQuantity)));
  }

  return (
    <section className="section-panel detail-page">
      <div className="detail-page-header">
        <button className="text-button inline-link-button" onClick={onBack} type="button">
          Quay lại kệ sách
        </button>
        <span className="section-badge">{reviews.length} bình luận</span>
      </div>

      <div className="detail-hero-grid">
        <div className="detail-cover-card">
          <span>{(book.title || 'B').slice(0, 1).toUpperCase()}</span>
        </div>

        <div className="detail-copy-card">
          <h2 className="modal-title">{book.title}</h2>
          <p className="muted-text">{book.author}</p>
          <p className="detail-description">
            Xem nhanh thong tin sach, chon so luong muon mua va kiem tra van chuyen truoc khi them vao gio hoac chuyen sang buoc xac nhan don.
          </p>

          <div className="detail-summary-grid">
            <div className="modal-summary-card">
              <span className="meta-label">Giá bán</span>
              <strong>{formatPrice(book.price)}</strong>
            </div>
            <div className="modal-summary-card">
              <span className="meta-label">Đã bán</span>
              <strong>{soldCount} cuốn</strong>
            </div>
            <div className="modal-summary-card">
              <span className="meta-label">Tồn kho</span>
              <strong>{book.stock > 0 ? `${book.stock} cuốn` : 'Hết hàng'}</strong>
            </div>
            <div className="modal-summary-card">
              <span className="meta-label">Đánh giá chung</span>
              <strong>{renderRating(book.id)}</strong>
            </div>
          </div>

          <div className="detail-purchase-panel">
            <div className="detail-purchase-top">
              <div>
                <span className="meta-label">Số lượng mua</span>
                <div className="stepper detail-stepper">
                  <button disabled={isBusy || quantity <= 1 || availableToAdd <= 0} onClick={() => handleStep(quantity - 1)} type="button">
                    -
                  </button>
                  <span>{quantity}</span>
                  <button
                    disabled={isBusy || quantity >= availableToAdd || availableToAdd <= 0}
                    onClick={() => handleStep(quantity + 1)}
                    type="button"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="detail-inline-summary">
                <span className="meta-label">Tạm tính</span>
                <strong>{formatPrice(subtotal)}</strong>
              </div>
            </div>

            <div className="detail-shipping-grid">
              <label className="field">
                <span>Phương thức giao hàng</span>
                <select
                  value={checkoutForm.shippingMethod}
                  onChange={(event) => onCheckoutFieldChange('shippingMethod', event.target.value)}
                >
                  <option value="Express">Nhanh</option>
                  <option value="Standard">Tiêu chuẩn</option>
                  <option value="Pickup">Nhận tại quầy</option>
                </select>
              </label>

              <label className="field">
                <span>Phương thức thanh toán</span>
                <select
                  value={checkoutForm.paymentMethod}
                  onChange={(event) => onCheckoutFieldChange('paymentMethod', event.target.value)}
                >
                  <option value="COD">COD</option>
                  <option value="Card">Thẻ</option>
                  <option value="EWallet">Ví điện tử</option>
                </select>
              </label>

              <label className="field detail-address-field">
                <span>Thông tin vận chuyển</span>
                <textarea
                  rows="3"
                  value={checkoutForm.shippingAddress}
                  onChange={(event) => onCheckoutFieldChange('shippingAddress', event.target.value)}
                />
              </label>
            </div>

            <div className="detail-delivery-note">
              <strong>Vận chuyển:</strong> {SHIPPING_COPY[checkoutForm.shippingMethod] || SHIPPING_COPY.Standard}
            </div>

            <div className="detail-action-row">
              <button
                className="secondary-action detail-buy-button"
                disabled={isBusy || isSoldOut || availableToAdd <= 0}
                onClick={() => onBuyNow(book, quantity)}
                type="button"
              >
                {isBusy ? 'Đang xử lý...' : 'Mua ngay'}
              </button>

              <button
                className="action-button detail-cart-button"
                disabled={isBusy || isSoldOut || availableToAdd <= 0}
                onClick={() => onAddToCart(book, quantity)}
                type="button"
              >
                {isBusy ? 'Đang thêm...' : `Thêm ${quantity || 0} vào giỏ`}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="modal-review-section">
        <div className="section-header compact-section-header">
          <div>
            <h3>Người đọc nói gì về cuốn này</h3>
          </div>
        </div>

        {loading ? <p className="state-line">Đang tải bình luận...</p> : null}

        <div className="modal-review-list">
          {!loading && reviews.length === 0 ? (
            <div className="empty-state compact-empty">
              <p>Chưa có bình luận nào cho cuốn sách này.</p>
            </div>
          ) : null}

          {reviews.map((review) => (
            <article className="mini-card modal-review-card" key={review.id}>
              <div className="mini-card-head">
                <strong>Khách hàng #{review.customer_id}</strong>
                <span className="chip chip-success">{review.rating}/5</span>
              </div>
              <p>{review.comment || 'Chưa có nội dung chi tiết.'}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}