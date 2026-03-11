import React from 'react';
import SectionHeader from './SectionHeader.jsx';

export default function RecommendationSection({
  customerName,
  recommendations,
  loadingRecommendations,
  busyAction,
  onAddToCart,
  onSelectBook,
  renderRating,
  formatPrice,
}) {
  return (
    <section className="section-panel">
      <SectionHeader
        eyebrow="Gợi ý thông minh"
        title={`AI đang gợi ý cho ${customerName || 'bạn'}`}
        description="Danh sách này lấy từ recommender service, ưu tiên sách còn hàng và có đánh giá tốt."
        badge={`${recommendations.length} gợi ý`}
      />

      {loadingRecommendations ? <p className="state-line">Đang tải danh sách gợi ý...</p> : null}

      <div className="recommendation-grid">
        {recommendations.map((book) => (
          <article className="mini-card recommendation-card" key={`recommend-${book.id}`}>
            <span className="chip chip-soft">Nên xem</span>
            <h4>{book.title}</h4>
            <p className="muted-text">{book.author}</p>
            <div className="mini-card-meta">
              <strong>{formatPrice(book.price)}</strong>
              <span>{renderRating(book.id)}</span>
            </div>
            <button className="text-button inline-link-button" onClick={() => onSelectBook(book)} type="button">
              Xem chi tiết
            </button>
            <button
              className="action-button secondary-action"
              disabled={busyAction === `book-${book.id}` || Number(book.stock) <= 0}
              onClick={() => onAddToCart(book)}
              type="button"
            >
              {busyAction === `book-${book.id}` ? 'Đang thêm...' : 'Thêm nhanh vào giỏ'}
            </button>
          </article>
        ))}

        {!loadingRecommendations && recommendations.length === 0 ? (
          <div className="empty-state compact-empty">
            <p>Chưa có đủ dữ liệu để cá nhân hóa. Hãy tạo thêm đánh giá hoặc đơn hàng để hệ thống gợi ý tốt hơn.</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}