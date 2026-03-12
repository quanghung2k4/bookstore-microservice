import React from 'react';
import SectionHeader from './SectionHeader.jsx';

export default function OrderSection({ customerName, orders, loadingOrders, formatPrice }) {
  return (
    <section className="section-panel order-section">
      <SectionHeader
        eyebrow="Đơn hàng"
        title={`Lịch sử đơn của ${customerName || 'khách hàng hiện tại'}`}
        badge={`${orders.length} đơn`}
      />

      {loadingOrders ? <p className="state-line">Đang tải lịch sử đơn hàng...</p> : null}

      <div className="stack-list">
        {orders.map((order) => (
          <article className="mini-card" key={order.id}>
            <div className="mini-card-head">
              <strong>Đơn #{order.id}</strong>
              <span className="chip chip-soft">{order.status}</span>
            </div>
            <p className="muted-text">
              {order.payment_method} • {order.shipping_method}
            </p>
            <p className="muted-text">{order.items?.length || 0} đầu sách</p>
            <strong>{formatPrice(order.total_amount)}</strong>
          </article>
        ))}

        {!loadingOrders && orders.length === 0 ? (
          <div className="empty-state compact-empty">
            <p>Chưa có đơn hàng nào được xác nhận.</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}