export const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'USD',
});

export function formatPrice(value) {
  const numericValue = Number(value || 0);
  return currencyFormatter.format(numericValue);
}

export function buildShelf(book) {
  const price = Number(book.price || 0);
  const stock = Number(book.stock || 0);

  if (stock <= 0) {
    return 'Tạm ẩn';
  }
  if (stock <= 5) {
    return 'Sắp hết';
  }
  if (price >= 35) {
    return 'Bản tuyển chọn';
  }
  return 'Nổi bật hôm nay';
}

export async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = data?.error || data?.detail || 'Yeu cau that bai';
    throw new Error(message);
  }

  return data;
}