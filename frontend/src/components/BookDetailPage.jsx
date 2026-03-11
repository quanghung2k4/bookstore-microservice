import React from 'react';

export default function BookDetailPage({ book, reviews, loading, onBack, renderRating, formatPrice }) {
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
          <p className="section-eyebrow">Chi tiết sách</p>
          <h2 className="modal-title">{book.title}</h2>
          <p className="muted-text">{book.author}</p>
          <p className="detail-description">
            Xem đầy đủ thông tin cơ bản của sách cùng các bình luận mới nhất từ người đọc ngay trên một trang riêng.
          </p>

          <div className="detail-summary-grid">
            <div className="modal-summary-card">
              <span className="meta-label">Giá bán</span>
              <strong>{formatPrice(book.price)}</strong>
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
        </div>
      </div>

      <div className="modal-review-section">
        <div className="section-header compact-section-header">
          <div>
            <p className="section-eyebrow">Bình luận</p>
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