import React from 'react';

export default function AuthSection({ authMode, onModeChange, authForm, onFieldChange, onSubmit, busyAction }) {
  const isLogin = authMode === 'login';

  return (
    <section className="section-panel auth-shell">
      <div className="auth-copy">
        <p className="section-eyebrow">Tài khoản khách hàng</p>
        <h2>{isLogin ? 'Đăng nhập để bắt đầu mua sắm' : 'Tạo tài khoản mới để sử dụng storefront'}</h2>
        <p className="section-description">
          Sau khi đăng nhập, người dùng sẽ xem riêng trang chủ, giỏ hàng, lịch sử đơn và đánh giá theo từng khu rõ ràng hơn.
        </p>
      </div>

      <div className="auth-toggle-row">
        <button
          className={isLogin ? 'filter-chip active' : 'filter-chip'}
          onClick={() => onModeChange('login')}
          type="button"
        >
          Đăng nhập
        </button>
        <button
          className={!isLogin ? 'filter-chip active' : 'filter-chip'}
          onClick={() => onModeChange('register')}
          type="button"
        >
          Đăng ký
        </button>
      </div>

      <form className="auth-form" onSubmit={onSubmit}>
        {!isLogin ? (
          <label className="field">
            <span>Họ tên</span>
            <input
              value={authForm.name}
              onChange={(event) => onFieldChange('name', event.target.value)}
              placeholder="Ví dụ: Nguyễn Minh An"
              required
            />
          </label>
        ) : null}

        <label className="field">
          <span>Email</span>
          <input
            type="email"
            value={authForm.email}
            onChange={(event) => onFieldChange('email', event.target.value)}
            placeholder="ban@example.com"
            required
          />
        </label>

        <label className="field">
          <span>Mật khẩu</span>
          <input
            type="password"
            value={authForm.password}
            onChange={(event) => onFieldChange('password', event.target.value)}
            placeholder="Tối thiểu 6 ký tự"
            required
          />
        </label>

        <button className="action-button auth-submit" disabled={busyAction === 'auth'} type="submit">
          {busyAction === 'auth' ? 'Đang xử lý...' : isLogin ? 'Đăng nhập' : 'Tạo tài khoản'}
        </button>
      </form>
    </section>
  );
}