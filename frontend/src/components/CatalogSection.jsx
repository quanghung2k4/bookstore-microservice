import React from 'react';
import BookCard from './BookCard.jsx';
import SectionHeader from './SectionHeader.jsx';

export default function CatalogSection({
  searchInput,
  onSearchInputChange,
  onSearchSubmit,
  shelves,
  activeShelf,
  onShelfChange,
  loadingBooks,
  filteredBooks,
  busyAction,
  onAddToCart,
  onSelectBook,
  buildShelf,
  renderRating,
  formatPrice,
}) {
  return (
    <section className="section-panel">
      <SectionHeader
        eyebrow="Danh mục sách"
        title="Khám phá kệ sách"
        description="Lọc theo nhóm hiển thị và tìm kiếm theo tên sách hoặc tác giả."
        badge={`${filteredBooks.length} kết quả`}
      />

      <div className="toolbar-row">
        <div className="tab-row">
          {shelves.map((shelf) => (
            <button
              key={shelf}
              className={shelf === activeShelf ? 'filter-chip active' : 'filter-chip'}
              onClick={() => onShelfChange(shelf)}
              type="button"
            >
              {shelf}
            </button>
          ))}
        </div>

        <form className="search-form" onSubmit={onSearchSubmit}>
          <input
            className="search-input"
            value={searchInput}
            onChange={(event) => onSearchInputChange(event.target.value)}
            placeholder="Nhập tên sách hoặc tác giả"
          />
          <button className="action-button search-button" type="submit">
            Tìm kiếm
          </button>
        </form>
      </div>

      <div className="message-stack">{loadingBooks ? <p className="state-line">Đang tải danh mục sách...</p> : null}</div>

      <div className="catalog-grid">
        {filteredBooks.map((book) => {
          return (
            <BookCard
              key={book.id}
              book={book}
              shelf={buildShelf(book)}
              busyAction={busyAction}
              onAddToCart={onAddToCart}
              onSelectBook={onSelectBook}
              renderRating={renderRating}
              formatPrice={formatPrice}
            />
          );
        })}

        {!loadingBooks && filteredBooks.length === 0 ? (
          <div className="empty-state">
            <p>Không tìm thấy sách phù hợp với bộ lọc hiện tại.</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}