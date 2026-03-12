import React from 'react';
import SectionHeader from './SectionHeader.jsx';

export default function ReviewSection({
  reviews,
  recentReviews,
  loadingReviews,
  reviewForm,
  onReviewFieldChange,
  onSubmit,
  busyAction,
  reviewableBooks,
  booksById,
}) {
  const canSubmitReview = reviewableBooks.length > 0;

  return (
    <section className="section-panel review-section review-shell">
      <SectionHeader
        eyebrow="Đánh giá từ người đọc"
        title="Nhận xét sau khi mua"
        description="Khung đánh giá được tách riêng khỏi trang chủ. Chỉ các sách đã mua mới xuất hiện trong danh sách gửi review."
        badge={`${reviews.length} đánh giá`}
      />

      <div className="review-layout">
        <form className="review-form" onSubmit={onSubmit}>
          {!canSubmitReview ? (
            <p className="state-line">Bạn chưa có đầu sách nào đủ điều kiện để đánh giá.</p>
          ) : null}

          <label className="field">
            <span>Chọn sách</span>
            <select
              disabled={!canSubmitReview}
              value={reviewForm.bookId}
              onChange={(event) => onReviewFieldChange('bookId', event.target.value)}
            >
              <option value="">Chọn đầu sách</option>
              {reviewableBooks.map((book) => (
                <option key={`review-book-${book.id}`} value={book.id}>
                  {book.title}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Mức đánh giá</span>
            <select
              disabled={!canSubmitReview}
              value={reviewForm.rating}
              onChange={(event) => onReviewFieldChange('rating', event.target.value)}
            >
              <option value="5">5 sao</option>
              <option value="4">4 sao</option>
              <option value="3">3 sao</option>
              <option value="2">2 sao</option>
              <option value="1">1 sao</option>
            </select>
          </label>

          <label className="field field-full">
            <span>Nội dung nhận xét</span>
            <textarea
              disabled={!canSubmitReview}
              rows="5"
              value={reviewForm.comment}
              onChange={(event) => onReviewFieldChange('comment', event.target.value)}
              placeholder="Chia sẻ trải nghiệm đọc, chất lượng nội dung hoặc lý do bạn muốn giới thiệu cuốn sách này."
            />
          </label>

          <button className="action-button full-width" disabled={busyAction === 'review' || !canSubmitReview} type="submit">
            {busyAction === 'review' ? 'Đang lưu đánh giá...' : 'Gửi đánh giá'}
          </button>
        </form>

        <div className="stack-list">
          {loadingReviews ? <p className="state-line">Đang tải đánh giá...</p> : null}

          {recentReviews.map((review) => {
            const book = booksById[review.book_id];
            return (
              <article className="mini-card" key={review.id}>
                <div className="mini-card-head">
                  <strong>{book?.title || `Sách #${review.book_id}`}</strong>
                  <span className="chip chip-success">{review.rating}/5</span>
                </div>
                <p className="muted-text">Khách hàng #{review.customer_id}</p>
                <p>{review.comment || 'Chưa có nội dung chi tiết.'}</p>
              </article>
            );
          })}

          {!loadingReviews && recentReviews.length === 0 ? (
            <div className="empty-state compact-empty">
              <p>Chưa có đánh giá nào. Bạn có thể là người đầu tiên gửi phản hồi.</p>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}