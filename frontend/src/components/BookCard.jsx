import React from 'react';

export default function BookCard({ book, shelf, busyAction, onAddToCart, onSelectBook, renderRating, formatPrice }) {
  const actionKey = `book-${book.id}`;
  const disabled = Number(book.stock) <= 0;
  const coverText = (book.title || 'B').slice(0, 1).toUpperCase();

  return (
    <article className="book-card">
      <button className="book-card-cover book-card-trigger" onClick={() => onSelectBook(book)} type="button">
        <span>{coverText}</span>
      </button>

      <div className="book-card-content">
        <div className="book-card-head">
          <span className="chip chip-soft">{shelf}</span>
          <span className={book.stock > 5 ? 'chip chip-success' : 'chip chip-warning'}>
            {book.stock > 0 ? `Còn ${book.stock} cuốn` : 'Hết hàng'}
          </span>
        </div>

        <button className="book-card-title-button" onClick={() => onSelectBook(book)} type="button">
          <h4 className="book-card-title" title={book.title}>
            {book.title}
          </h4>
        </button>
        <p className="book-card-author muted-text" title={book.author}>
          {book.author}
        </p>

        <p className="book-card-copy">
          {book.stock > 0
            ? 'Mở chi tiết để xem thông tin sách và bình luận của người đọc.'
            : 'Sách đang tạm hết hàng nhưng bạn vẫn có thể xem bình luận và đánh giá.'}
        </p>

        <div className="book-card-meta-grid">
          <div className="book-card-meta-box">
            <span className="meta-label">Mã sách</span>
            <strong>#{book.id}</strong>
          </div>
          <div className="book-card-meta-box">
            <span className="meta-label">Đánh giá</span>
            <strong>{renderRating(book.id)}</strong>
          </div>
        </div>

        <div className="book-card-foot">
          <div className="price-stack">
            <span className="meta-label">Giá bán</span>
            <strong>{formatPrice(book.price)}</strong>
          </div>
          <div className="book-card-actions">
            <button className="text-button inline-link-button" onClick={() => onSelectBook(book)} type="button">
              Xem chi tiết
            </button>
            <button
              className="action-button book-card-action"
              disabled={disabled || busyAction === actionKey}
              onClick={() => onAddToCart(book)}
              type="button"
            >
              {busyAction === actionKey ? 'Đang thêm...' : disabled ? 'Tạm hết hàng' : 'Thêm vào giỏ'}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}