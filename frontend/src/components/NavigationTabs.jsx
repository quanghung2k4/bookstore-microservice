import React from 'react';

const tabs = [
  { key: 'home', label: 'Trang chủ' },
  { key: 'cart', label: 'Cart' },
  { key: 'orders', label: 'Lịch sử' },
  { key: 'reviews', label: 'Đánh giá' },
];

export default function NavigationTabs({ activeView, onChange, cartCount, ordersCount, reviewsCount }) {
  const badgeByKey = {
    cart: cartCount,
    orders: ordersCount,
    reviews: reviewsCount,
  };

  return (
    <nav className="nav-tabs section-panel" aria-label="Điều hướng storefront">
      {tabs.map((tab) => {
        const badge = badgeByKey[tab.key];
        return (
          <button
            key={tab.key}
            className={tab.key === activeView ? 'nav-tab active' : 'nav-tab'}
            onClick={() => onChange(tab.key)}
            type="button"
          >
            <span>{tab.label}</span>
            {typeof badge === 'number' ? <strong>{badge}</strong> : null}
          </button>
        );
      })}
    </nav>
  );
}