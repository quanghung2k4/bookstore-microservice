import React from 'react';
import SectionHeader from './SectionHeader.jsx';

export default function RecommendationSection({
  customerName,
  recommendations,
  recommendationMeta,
  loadingRecommendations,
  busyAction,
  onAddToCart,
  onSelectBook,
  renderRating,
  formatPrice,
}) {
  return (
    <section className="section-panel recommendation-section">
      <SectionHeader
        eyebrow="Gợi ý"
        title={
          recommendationMeta?.isFallback
            ? `Sách nổi bật cho ${customerName || 'bạn'}`
            : `Gợi ý cá nhân hóa cho ${customerName || 'bạn'}`
        }
        description={
          recommendationMeta?.isFallback
            ? 'Chưa có đủ dữ liệu cá nhân hóa nên hệ thống tạm xếp theo điểm đánh giá trung bình giảm dần.'
            : 'Danh sách này ưu tiên các đầu sách gần với lịch sử mua và đánh giá của bạn.'
        }
        badge={`${recommendations.length} gợi ý`}
      />

      {loadingRecommendations ? <p className="state-line">Đang tải danh sách gợi ý...</p> : null}

      {!loadingRecommendations && recommendationMeta?.isFallback ? (
        <p className="state-line">Đang dùng fallback theo đánh giá giảm dần vì tài khoản này chưa có đủ lịch sử mua hoặc đánh giá.</p>
      ) : null}

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
            <p>Chưa có dữ liệu gợi ý khả dụng. Hãy tạo thêm đánh giá hoặc đơn hàng để hệ thống cá nhân hóa tốt hơn.</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}