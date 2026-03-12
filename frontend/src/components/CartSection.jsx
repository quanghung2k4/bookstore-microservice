import React from 'react';
import SectionHeader from './SectionHeader.jsx';

export default function CartSection({
  customerName,
  loadingCart,
  enrichedCartItems,
  busyAction,
  onQuantityChange,
  onRemoveItem,
  totals,
  checkoutForm,
  onCheckoutFieldChange,
  onCheckout,
  formatPrice,
}) {
  return (
    <section className="section-panel cart-section sticky-panel">
      <SectionHeader
        eyebrow="Giỏ hàng"
        title={`Giỏ của ${customerName || 'khách hàng hiện tại'}`}
        description="Mở riêng một màn hình để chỉnh số lượng, chọn phương thức thanh toán và xác nhận đơn hàng rõ ràng hơn."
        badge={`${totals.items} sản phẩm`}
        badgeTone="accent"
      />

      {loadingCart ? <p className="state-line">Đang tải giỏ hàng...</p> : null}

      {!loadingCart && enrichedCartItems.length === 0 ? (
        <div className="empty-state compact-empty">
          <p>Giỏ hàng đang trống. Hãy thêm sách từ danh mục ở bên trái.</p>
        </div>
      ) : null}

      <div className="cart-list">
        {enrichedCartItems.map((item) => {
          const actionKey = `item-${item.id}`;
          const title = item.book?.title || `Sách #${item.book_id}`;
          const author = item.book?.author || 'Không rõ tác giả';
          const lineTotal = Number(item.book?.price || 0) * item.quantity;

          return (
            <article className="cart-item" key={item.id}>
              <div>
                <h4>{title}</h4>
                <p className="muted-text">{author}</p>
              </div>

              <div className="cart-item-side">
                <strong>{formatPrice(lineTotal)}</strong>
                <div className="stepper">
                  <button
                    disabled={busyAction === actionKey}
                    onClick={() => onQuantityChange(item, item.quantity - 1)}
                    type="button"
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    disabled={busyAction === actionKey}
                    onClick={() => onQuantityChange(item, item.quantity + 1)}
                    type="button"
                  >
                    +
                  </button>
                </div>
                <button
                  className="text-button"
                  disabled={busyAction === actionKey}
                  onClick={() => onRemoveItem(item.id)}
                  type="button"
                >
                  Xóa khỏi giỏ
                </button>
              </div>
            </article>
          );
        })}
      </div>

      <div className="checkout-card">
        <div className="summary-line">
          <span>Tạm tính</span>
          <strong>{formatPrice(totals.subtotal)}</strong>
        </div>
        <div className="summary-line muted-line">
          <span>Luồng đang dùng</span>
          <span>Cart → Order → Pay → Ship</span>
        </div>

        <div className="checkout-grid">
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

          <label className="field field-full">
            <span>Địa chỉ giao hàng</span>
            <textarea
              rows="3"
              value={checkoutForm.shippingAddress}
              onChange={(event) => onCheckoutFieldChange('shippingAddress', event.target.value)}
            />
          </label>
        </div>

        <button
          className="action-button full-width"
          disabled={busyAction === 'checkout'}
          onClick={onCheckout}
          type="button"
        >
          {busyAction === 'checkout' ? 'Đang tạo đơn hàng...' : 'Xác nhận và tạo đơn'}
        </button>
      </div>
    </section>
  );
}