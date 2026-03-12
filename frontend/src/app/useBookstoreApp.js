import { startTransition, useEffect, useMemo, useState } from 'react';
import { ALL_SHELVES_LABEL, API_ENDPOINTS, CUSTOMER_SESSION_KEY } from './constants.js';
import { buildShelf, formatPrice, requestJson } from './utils.js';

export function useBookstoreApp() {
  const [books, setBooks] = useState([]);
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [cart, setCart] = useState(null);
  const [orders, setOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [recommendationMeta, setRecommendationMeta] = useState({
    strategy: '',
    isFallback: false,
    reason: '',
  });
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedBookReviews, setSelectedBookReviews] = useState([]);
  const [activeView, setActiveView] = useState('home');
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [searchInput, setSearchInput] = useState('');
  const [appliedQuery, setAppliedQuery] = useState('');
  const [activeShelf, setActiveShelf] = useState(ALL_SHELVES_LABEL);
  const [busyAction, setBusyAction] = useState('');
  const [loadingBooks, setLoadingBooks] = useState(true);
  const [loadingCart, setLoadingCart] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);
  const [loadingSelectedBook, setLoadingSelectedBook] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [bannerMessage, setBannerMessage] = useState('');
  const [checkoutForm, setCheckoutForm] = useState({
    paymentMethod: 'COD',
    shippingMethod: 'Express',
    shippingAddress: '123 Test Street',
  });
  const [reviewForm, setReviewForm] = useState({
    bookId: '',
    rating: '5',
    comment: '',
  });
  const customerId = currentCustomer ? String(currentCustomer.id) : '';

  useEffect(() => {
    try {
      const savedSession = window.localStorage.getItem(CUSTOMER_SESSION_KEY);
      if (!savedSession) {
        return;
      }

      const parsedSession = JSON.parse(savedSession);
      if (parsedSession?.id) {
        setCurrentCustomer(parsedSession);
      }
    } catch {
      window.localStorage.removeItem(CUSTOMER_SESSION_KEY);
    }
  }, []);

  useEffect(() => {
    let ignore = false;

    async function loadBooks() {
      try {
        setLoadingBooks(true);
        const data = await requestJson(API_ENDPOINTS.books);
        if (!ignore) {
          startTransition(() => {
            setBooks(Array.isArray(data) ? data : []);
          });
        }
      } catch (error) {
        if (!ignore) {
          setErrorMessage(`Khong the tai danh sach sach: ${error.message}`);
        }
      } finally {
        if (!ignore) {
          setLoadingBooks(false);
        }
      }
    }

    loadBooks();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;

    async function loadAllOrders() {
      try {
        const data = await requestJson(API_ENDPOINTS.orders);
        if (!ignore) {
          setAllOrders(Array.isArray(data) ? data : []);
        }
      } catch {
        if (!ignore) {
          setAllOrders([]);
        }
      }
    }

    loadAllOrders();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;

    async function loadReviews() {
      try {
        setLoadingReviews(true);
        const data = await requestJson(API_ENDPOINTS.reviews);
        if (!ignore) {
          setReviews(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        if (!ignore) {
          setErrorMessage(`Khong the tai danh gia: ${error.message}`);
        }
      } finally {
        if (!ignore) {
          setLoadingReviews(false);
        }
      }
    }

    loadReviews();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;

    async function loadCustomerData() {
      const currentCustomerId = currentCustomer?.id;

      try {
        setLoadingCart(true);
        const data = await requestJson(`${API_ENDPOINTS.cartDetail}/${currentCustomerId}/`);
        if (!ignore) {
          setCart(data);
        }
      } catch (error) {
        if (!ignore) {
          if (error.message === 'Cart not found') {
            setCart(null);
          } else {
            setErrorMessage(`Khong the tai gio hang: ${error.message}`);
          }
        }
      } finally {
        if (!ignore) {
          setLoadingCart(false);
        }
      }

      try {
        setLoadingOrders(true);
        const data = await requestJson(`${API_ENDPOINTS.orderHistory}/${currentCustomerId}/`);
        if (!ignore) {
          setOrders(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        if (!ignore) {
          setOrders([]);
          setErrorMessage(`Khong the tai lich su don hang: ${error.message}`);
        }
      } finally {
        if (!ignore) {
          setLoadingOrders(false);
        }
      }

      try {
        setLoadingRecommendations(true);
        const data = await requestJson(`${API_ENDPOINTS.recommendations}/${currentCustomerId}/`);
        if (!ignore) {
          setRecommendations(Array.isArray(data?.recommendations) ? data.recommendations : []);
          setRecommendationMeta({
            strategy: data?.strategy || '',
            isFallback: Boolean(data?.is_fallback),
            reason: data?.reason || '',
          });
        }
      } catch (error) {
        if (!ignore) {
          setRecommendations([]);
          setRecommendationMeta({ strategy: '', isFallback: false, reason: '' });
          setErrorMessage(`Khong the tai goi y: ${error.message}`);
        }
      } finally {
        if (!ignore) {
          setLoadingRecommendations(false);
        }
      }
    }

    if (currentCustomer?.id) {
      loadCustomerData();
    } else {
      setCart(null);
      setOrders([]);
      setRecommendations([]);
      setRecommendationMeta({ strategy: '', isFallback: false, reason: '' });
      setLoadingCart(false);
      setLoadingOrders(false);
      setLoadingRecommendations(false);
    }

    return () => {
      ignore = true;
    };
  }, [currentCustomer]);

  const shelves = useMemo(() => {
    const nextShelves = new Set([ALL_SHELVES_LABEL]);
    books.forEach((book) => nextShelves.add(buildShelf(book)));
    return Array.from(nextShelves);
  }, [books]);

  const booksById = useMemo(() => {
    return books.reduce((accumulator, book) => {
      accumulator[book.id] = book;
      return accumulator;
    }, {});
  }, [books]);

  const filteredBooks = useMemo(() => {
    const normalizedQuery = appliedQuery.trim().toLowerCase();
    return books.filter((book) => {
      const matchesShelf = activeShelf === ALL_SHELVES_LABEL || buildShelf(book) === activeShelf;
      const haystack = `${book.title} ${book.author}`.toLowerCase();
      const matchesQuery = !normalizedQuery || haystack.includes(normalizedQuery);
      return matchesShelf && matchesQuery;
    });
  }, [activeShelf, appliedQuery, books]);

  const reviewSummaryByBook = useMemo(() => {
    return reviews.reduce((summary, review) => {
      const current = summary[review.book_id] || { total: 0, count: 0 };
      current.total += Number(review.rating || 0);
      current.count += 1;
      summary[review.book_id] = current;
      return summary;
    }, {});
  }, [reviews]);

  const cartItems = cart?.items || [];
  const enrichedCartItems = useMemo(() => {
    return cartItems.map((item) => ({
      ...item,
      book: booksById[item.book_id],
    }));
  }, [booksById, cartItems]);

  const totals = useMemo(() => {
    return enrichedCartItems.reduce(
      (summary, item) => {
        const price = Number(item.book?.price || 0);
        summary.items += item.quantity;
        summary.subtotal += price * item.quantity;
        return summary;
      },
      { items: 0, subtotal: 0 }
    );
  }, [enrichedCartItems]);

  const recentReviews = useMemo(() => reviews.slice(0, 6), [reviews]);

  const purchasedBookIds = useMemo(() => {
    const identifiers = new Set();
    orders.forEach((order) => {
      (order.items || []).forEach((item) => identifiers.add(item.book_id));
    });
    return identifiers;
  }, [orders]);

  const reviewableBooks = useMemo(() => {
    return books.filter((book) => purchasedBookIds.has(book.id));
  }, [books, purchasedBookIds]);

  const soldCountsByBook = useMemo(() => {
    return allOrders.reduce((summary, order) => {
      (order.items || []).forEach((item) => {
        summary[item.book_id] = (summary[item.book_id] || 0) + Number(item.quantity || 0);
      });
      return summary;
    }, {});
  }, [allOrders]);

  function persistCustomerSession(customer) {
    setCurrentCustomer(customer);
    window.localStorage.setItem(CUSTOMER_SESSION_KEY, JSON.stringify(customer));
  }

  function clearCustomerSession() {
    setCurrentCustomer(null);
    window.localStorage.removeItem(CUSTOMER_SESSION_KEY);
  }

  async function refreshCart(targetCustomerId = currentCustomer?.id) {
    if (!targetCustomerId) {
      setCart(null);
      return;
    }

    setLoadingCart(true);
    try {
      const data = await requestJson(`${API_ENDPOINTS.cartDetail}/${targetCustomerId}/`);
      setCart(data);
    } catch (error) {
      if (error.message === 'Cart not found') {
        setCart(null);
      } else {
        setErrorMessage(`Khong the lam moi gio hang: ${error.message}`);
      }
    } finally {
      setLoadingCart(false);
    }
  }

  async function refreshOrders(targetCustomerId = currentCustomer?.id) {
    if (!targetCustomerId) {
      setOrders([]);
      return;
    }

    setLoadingOrders(true);
    try {
      const data = await requestJson(`${API_ENDPOINTS.orderHistory}/${targetCustomerId}/`);
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      setOrders([]);
      setErrorMessage(`Khong the lam moi don hang: ${error.message}`);
    } finally {
      setLoadingOrders(false);
    }
  }

  async function refreshAllOrders() {
    try {
      const data = await requestJson(API_ENDPOINTS.orders);
      setAllOrders(Array.isArray(data) ? data : []);
    } catch {
      setAllOrders([]);
    }
  }

  async function refreshRecommendations(targetCustomerId = currentCustomer?.id) {
    if (!targetCustomerId) {
      setRecommendations([]);
      setRecommendationMeta({ strategy: '', isFallback: false, reason: '' });
      return;
    }

    setLoadingRecommendations(true);
    try {
      const data = await requestJson(`${API_ENDPOINTS.recommendations}/${targetCustomerId}/`);
      setRecommendations(Array.isArray(data?.recommendations) ? data.recommendations : []);
      setRecommendationMeta({
        strategy: data?.strategy || '',
        isFallback: Boolean(data?.is_fallback),
        reason: data?.reason || '',
      });
    } catch (error) {
      setRecommendations([]);
      setRecommendationMeta({ strategy: '', isFallback: false, reason: '' });
      setErrorMessage(`Khong the lam moi goi y: ${error.message}`);
    } finally {
      setLoadingRecommendations(false);
    }
  }

  async function refreshReviews() {
    setLoadingReviews(true);
    try {
      const data = await requestJson(API_ENDPOINTS.reviews);
      setReviews(Array.isArray(data) ? data : []);
    } catch (error) {
      setErrorMessage(`Khong the lam moi danh gia: ${error.message}`);
    } finally {
      setLoadingReviews(false);
    }
  }

  async function handleSelectBook(book) {
    setErrorMessage('');
    setSelectedBook(book);
    setActiveView('detail');
    setLoadingSelectedBook(true);

    try {
      const data = await requestJson(`${API_ENDPOINTS.bookReviews}/${book.id}/`);
      setSelectedBookReviews(Array.isArray(data) ? data : []);
    } catch (error) {
      setSelectedBookReviews([]);
      setErrorMessage(`Khong the tai chi tiet danh gia sach: ${error.message}`);
    } finally {
      setLoadingSelectedBook(false);
    }
  }

  function handleCloseBookDetail() {
    setSelectedBook(null);
    setSelectedBookReviews([]);
    setLoadingSelectedBook(false);
    setActiveView('home');
  }

  function handleSearchSubmit(event) {
    event.preventDefault();
    setAppliedQuery(searchInput);
  }

  async function ensureCart() {
    if (!currentCustomer?.id) {
      throw new Error('Vui long dang nhap truoc khi su dung gio hang.');
    }

    if (cart?.cart?.id) {
      return cart.cart.id;
    }

    const createdCart = await requestJson(API_ENDPOINTS.carts, {
      method: 'POST',
      body: JSON.stringify({ customer_id: Number(currentCustomer.id) }),
    });

    await refreshCart();
    return createdCart.id;
  }

  async function handleAuthSubmit(event) {
    event.preventDefault();
    setErrorMessage('');
    setBannerMessage('');
    setBusyAction('auth');

    try {
      const isLogin = authMode === 'login';
      const payload = isLogin
        ? {
            email: authForm.email.trim(),
            password: authForm.password,
          }
        : {
            name: authForm.name.trim(),
            email: authForm.email.trim(),
            password: authForm.password,
          };

      const endpoint = isLogin ? API_ENDPOINTS.customerLogin : API_ENDPOINTS.customerRegister;
      const data = await requestJson(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const customer = {
        id: data.id,
        name: data.name,
        email: data.email,
      };

      persistCustomerSession(customer);
      setActiveView('home');
      setAuthForm({ name: '', email: '', password: '' });
      setBannerMessage(
        isLogin
          ? `Xin chao ${customer.name}, ban da dang nhap thanh cong.`
          : `Tai khoan ${customer.name} da duoc tao va dang nhap ngay.`
      );
    } catch (error) {
      setErrorMessage(`Khong the ${authMode === 'login' ? 'dang nhap' : 'dang ky'}: ${error.message}`);
    } finally {
      setBusyAction('');
    }
  }

  function handleLogout() {
    clearCustomerSession();
    setCart(null);
    setOrders([]);
    setRecommendations([]);
    handleCloseBookDetail();
    setReviewForm({ bookId: '', rating: '5', comment: '' });
    setActiveView('home');
    setErrorMessage('');
    setBannerMessage('Da dang xuat khoi phien mua hang.');
  }

  async function handleAddToCart(book, quantity = 1, options = {}) {
    const requestedQuantity = Math.max(1, Number(quantity) || 1);
    setErrorMessage('');
    setBusyAction(`book-${book.id}`);

    try {
      if (Number(book.stock) <= 0) {
        throw new Error('Sach nay dang tam het hang.');
      }

      const cartId = await ensureCart();
      const existingItem = cartItems.find((item) => item.book_id === book.id);

      if (existingItem) {
        await requestJson(`${API_ENDPOINTS.cartItems}${existingItem.id}/`, {
          method: 'PATCH',
          body: JSON.stringify({ quantity: existingItem.quantity + requestedQuantity }),
        });
      } else {
        await requestJson(API_ENDPOINTS.cartItems, {
          method: 'POST',
          body: JSON.stringify({
            cart_id: cartId,
            book_id: book.id,
            quantity: requestedQuantity,
          }),
        });
      }

      await refreshCart();
      if (options.openCartAfterAdd) {
        setActiveView('cart');
        setBannerMessage(`Da dua ${requestedQuantity} cuon "${book.title}" vao gio hang. Kiem tra thong tin va xac nhan don de mua ngay.`);
      } else {
        setBannerMessage(`Da them ${requestedQuantity} cuon "${book.title}" vao gio hang cua khach hang #${customerId}.`);
      }
    } catch (error) {
      setErrorMessage(`Khong the them sach vao gio: ${error.message}`);
    } finally {
      setBusyAction('');
    }
  }

  async function handleBuyNow(book, quantity = 1) {
    await handleAddToCart(book, quantity, { openCartAfterAdd: true });
  }

  async function handleQuantityChange(item, nextQuantity) {
    setErrorMessage('');
    setBusyAction(`item-${item.id}`);

    try {
      if (nextQuantity <= 0) {
        await requestJson(`${API_ENDPOINTS.cartItems}${item.id}/`, {
          method: 'DELETE',
        });
        await refreshCart();
        setBannerMessage('Da xoa sach khoi gio hang.');
        return;
      }

      await requestJson(`${API_ENDPOINTS.cartItems}${item.id}/`, {
        method: 'PATCH',
        body: JSON.stringify({ quantity: nextQuantity }),
      });
      await refreshCart();
      setBannerMessage('Da cap nhat gio hang.');
    } catch (error) {
      setErrorMessage(`Khong the cap nhat so luong: ${error.message}`);
    } finally {
      setBusyAction('');
    }
  }

  async function handleRemoveItem(itemId) {
    setErrorMessage('');
    setBusyAction(`item-${itemId}`);

    try {
      await requestJson(`${API_ENDPOINTS.cartItems}${itemId}/`, {
        method: 'DELETE',
      });
      await refreshCart();
      setBannerMessage('Da xoa sach khoi gio hang.');
    } catch (error) {
      setErrorMessage(`Khong the xoa sach khoi gio: ${error.message}`);
    } finally {
      setBusyAction('');
    }
  }

  async function handleCheckout() {
    if (!currentCustomer?.id) {
      setErrorMessage('Vui long dang nhap truoc khi tao don hang.');
      return;
    }

    if (enrichedCartItems.length === 0) {
      setErrorMessage('Gio hang dang trong. Hay them sach truoc khi tao don.');
      return;
    }

    setErrorMessage('');
    setBusyAction('checkout');

    try {
      const payload = {
        customer_id: Number(currentCustomer.id),
        payment_method: checkoutForm.paymentMethod,
        shipping_method: checkoutForm.shippingMethod,
        shipping_address: checkoutForm.shippingAddress,
      };

      const data = await requestJson(API_ENDPOINTS.orders, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      await Promise.all([refreshCart(), refreshOrders(), refreshRecommendations(), refreshAllOrders()]);

      setBannerMessage(`Don hang #${data.order.id} da duoc tao. Thanh toan va van chuyen da duoc khoi tao.`);
    } catch (error) {
      setErrorMessage(`Khong the tao don hang: ${error.message}`);
    } finally {
      setBusyAction('');
    }
  }

  async function handleSubmitReview(event) {
    event.preventDefault();

    if (!currentCustomer?.id) {
      setErrorMessage('Vui long dang nhap truoc khi gui danh gia.');
      return;
    }

    if (reviewableBooks.length === 0) {
      setErrorMessage('Ban can mua sach truoc khi gui danh gia.');
      return;
    }

    setErrorMessage('');
    setBusyAction('review');

    try {
      await requestJson(API_ENDPOINTS.reviews, {
        method: 'POST',
        body: JSON.stringify({
          customer_id: Number(currentCustomer.id),
          book_id: Number(reviewForm.bookId || reviewableBooks[0]?.id),
          rating: Number(reviewForm.rating),
          comment: reviewForm.comment,
        }),
      });

      await Promise.all([refreshReviews(), refreshRecommendations()]);
      setReviewForm((current) => ({
        ...current,
        comment: '',
        bookId: '',
      }));
      setBannerMessage('Da gui danh gia thanh cong.');
    } catch (error) {
      setErrorMessage(`Khong the gui danh gia: ${error.message}`);
    } finally {
      setBusyAction('');
    }
  }

  function renderRating(bookId) {
    const summary = reviewSummaryByBook[bookId];
    if (!summary?.count) {
      return 'Moi';
    }

    return `${(summary.total / summary.count).toFixed(1)} / 5`;
  }

  function handleCheckoutFieldChange(field, value) {
    setCheckoutForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleReviewFieldChange(field, value) {
    setReviewForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleAuthFieldChange(field, value) {
    setAuthForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  return {
    activeShelf,
    activeView,
    authForm,
    authMode,
    bannerMessage,
    booksById,
    buildShelf,
    busyAction,
    checkoutForm,
    currentCustomer,
    enrichedCartItems,
    errorMessage,
    filteredBooks,
    formatPrice,
    handleAddToCart,
    handleBuyNow,
    handleAuthFieldChange,
    handleAuthSubmit,
    handleCheckout,
    handleCheckoutFieldChange,
    handleCloseBookDetail,
    handleLogout,
    handleQuantityChange,
    handleRemoveItem,
    handleReviewFieldChange,
    handleSearchSubmit,
    handleSelectBook,
    handleSubmitReview,
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
    setActiveView,
    setAuthMode,
    setSearchInput,
    shelves,
    soldCountsByBook,
    totals,
  };
}