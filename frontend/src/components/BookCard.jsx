import React from 'react';
import styles from '../styles/book-card.module.css';

export default function BookCard({ book, shelf, busyAction, onAddToCart, onSelectBook, renderRating, formatPrice }) {
  const actionKey = `book-${book.id}`;
  const disabled = Number(book.stock) <= 0;
  const coverText = (book.title || 'B').slice(0, 1).toUpperCase();
  const availabilityClassName =
    book.stock > 5 ? `${styles.badge} ${styles.badgeAvailable}` : `${styles.badge} ${styles.badgeLimited}`;

  return (
    <article className={styles.card}>
      <button className={styles.coverButton} onClick={() => onSelectBook(book)} type="button">
        <span>{coverText}</span>
      </button>

      <div className={styles.content}>
        <div className={styles.header}>
          <span className={`${styles.badge} ${styles.badgeShelf}`}>{shelf}</span>
          <span className={availabilityClassName}>{book.stock > 0 ? `Còn ${book.stock} cuốn` : 'Hết hàng'}</span>
        </div>

        <button className={styles.titleButton} onClick={() => onSelectBook(book)} type="button">
          <h4 className={styles.title} title={book.title}>
            {book.title}
          </h4>
        </button>

        <p className={styles.author} title={book.author}>
          {book.author}
        </p>

        <p className={styles.copy}>
          {book.stock > 0
            ? 'description'
            : 'Sách đang tạm hết hàng nhưng bạn vẫn có thể xem bình luận và đánh giá.'}
        </p>

        <div className={styles.metaGrid}>
          <div className={styles.metaBox}>
            <span className={styles.metaLabel}>Mã sách</span>
            <strong>#{book.id}</strong>
          </div>

          <div className={styles.metaBox}>
            <span className={styles.metaLabel}>Đánh giá</span>
            <strong>{renderRating(book.id)}</strong>
          </div>
        </div>

        <div className={styles.footer}>
          <div className={styles.priceBlock}>
            <span className={styles.metaLabel}>Giá bán</span>
            <strong className={styles.priceValue}>{formatPrice(book.price)}</strong>
          </div>

          <div className={styles.actions}>
            <button className={styles.detailButton} onClick={() => onSelectBook(book)} type="button">
              Xem chi tiết
            </button>

            <button
              className={styles.cartButton}
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