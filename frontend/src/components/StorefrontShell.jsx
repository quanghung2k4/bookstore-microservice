import React from 'react';
import BookDetailPage from './BookDetailPage.jsx';
import CartSection from './CartSection.jsx';
import CatalogSection from './CatalogSection.jsx';
import NavigationTabs from './NavigationTabs.jsx';
import OrderSection from './OrderSection.jsx';
import RecommendationSection from './RecommendationSection.jsx';
import ReviewSection from './ReviewSection.jsx';

function StorefrontView(props) {
  const {
    activeShelf,
    activeView,
    booksById,
    buildShelf,
    busyAction,
    checkoutForm,
    currentCustomer,
    enrichedCartItems,
    filteredBooks,
    formatPrice,
    handleAddToCart,
    handleCheckout,
    handleCheckoutFieldChange,
    handleCloseBookDetail,
    handleQuantityChange,
    handleRemoveItem,
    handleReviewFieldChange,
    handleSearchSubmit,
    handleSelectBook,
    handleSubmitReview,
    handleBuyNow,
    loadingBooks,
    loadingCart,
    loadingOrders,
    loadingRecommendations,
    loadingReviews,
    loadingSelectedBook,
    orders,
    recentReviews,
    recommendations,
    recommendationMeta,
    renderRating,
    reviews,
    reviewForm,
    reviewableBooks,
    searchInput,
    selectedBook,
    selectedBookReviews,
    setActiveShelf,
    setSearchInput,
    shelves,
    soldCountsByBook,
    totals,
  } = props;

  switch (activeView) {
    case 'cart':
      return (
        <div className="single-column-layout">
          <CartSection
            customerName={currentCustomer?.name}
            loadingCart={loadingCart}
            enrichedCartItems={enrichedCartItems}
            busyAction={busyAction}
            onQuantityChange={handleQuantityChange}
            onRemoveItem={handleRemoveItem}
            totals={totals}
            checkoutForm={checkoutForm}
            onCheckoutFieldChange={handleCheckoutFieldChange}
            onCheckout={handleCheckout}
            formatPrice={formatPrice}
          />
        </div>
      );
    case 'orders':
      return (
        <div className="single-column-layout">
          <OrderSection
            customerName={currentCustomer?.name}
            orders={orders}
            loadingOrders={loadingOrders}
            formatPrice={formatPrice}
          />
        </div>
      );
    case 'reviews':
      return (
        <div className="single-column-layout">
          <ReviewSection
            reviews={reviews}
            recentReviews={recentReviews}
            loadingReviews={loadingReviews}
            reviewForm={reviewForm}
            onReviewFieldChange={handleReviewFieldChange}
            onSubmit={handleSubmitReview}
            busyAction={busyAction}
            reviewableBooks={reviewableBooks}
            booksById={booksById}
          />
        </div>
      );
    case 'detail':
      return selectedBook ? (
        <div className="single-column-layout detail-view-layout">
          <BookDetailPage
            book={selectedBook}
            reviews={selectedBookReviews}
            loading={loadingSelectedBook}
            onBack={handleCloseBookDetail}
            renderRating={renderRating}
            formatPrice={formatPrice}
            busyAction={busyAction}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            checkoutForm={checkoutForm}
            onCheckoutFieldChange={handleCheckoutFieldChange}
            currentCartQuantity={enrichedCartItems.find((item) => item.book_id === selectedBook.id)?.quantity || 0}
            soldCount={soldCountsByBook[selectedBook.id] || 0}
          />
        </div>
      ) : null;
    case 'home':
    default:
      return (
        <div className="view-stack">
          <RecommendationSection
            customerName={currentCustomer?.name}
            recommendations={recommendations}
            recommendationMeta={recommendationMeta}
            loadingRecommendations={loadingRecommendations}
            busyAction={busyAction}
            onAddToCart={handleAddToCart}
            onSelectBook={handleSelectBook}
            renderRating={renderRating}
            formatPrice={formatPrice}
          />

          <CatalogSection
            searchInput={searchInput}
            onSearchInputChange={setSearchInput}
            onSearchSubmit={handleSearchSubmit}
            shelves={shelves}
            activeShelf={activeShelf}
            onShelfChange={setActiveShelf}
            loadingBooks={loadingBooks}
            filteredBooks={filteredBooks}
            busyAction={busyAction}
            onAddToCart={handleAddToCart}
            onSelectBook={handleSelectBook}
            buildShelf={buildShelf}
            renderRating={renderRating}
            formatPrice={formatPrice}
          />
        </div>
      );
  }
}

export default function StorefrontShell(props) {
  const { activeView, currentCustomer, handleLogout, orders, reviewableBooks, setActiveView, totals } = props;

  return (
    <>
      <section className="section-panel storefront-welcome welcome-strip">
        <div>
          <p className="section-eyebrow">BookVerse Storefront</p>
          <h2>{`Xin chao ${currentCustomer.name}`}</h2>
          <p className="section-description">
            Chọn tab để vào đúng khu chức năng. Bấm trực tiếp vào một đầu sách để xem chi tiết và bình luận của người đọc.
          </p>
        </div>
        <button className="text-button logout-button" onClick={handleLogout} type="button">
          Đăng xuất
        </button>
      </section>

      <NavigationTabs
        activeView={activeView}
        onChange={setActiveView}
        cartCount={totals.items}
        ordersCount={orders.length}
        reviewsCount={reviewableBooks.length}
      />

      <main className="view-shell">
        <StorefrontView {...props} />
      </main>
    </>
  );
}