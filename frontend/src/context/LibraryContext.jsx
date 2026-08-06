import { createContext, useContext, useState, useCallback } from "react";
import API from "../services/api";
import toast from "react-hot-toast";

const LibraryContext = createContext();

export function LibraryProvider({ children }) {
  const [books,        setBooks]        = useState([]);
  const [totalBooks,   setTotalBooks]   = useState(0);
  const [bookings,     setBookings]     = useState([]);
  const [categories,   setCategories]   = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount,  setUnreadCount]  = useState(0);
  const [dashStats,    setDashStats]    = useState(null);
  const [chartData,    setChartData]    = useState(null);
  const [wishlist,     setWishlist]     = useState([]);
  const [isLoadingBooks,    setIsLoadingBooks]    = useState(false);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);

  // ── Books ─────────────────────────────────────────────────────────────────
  const fetchBooks = useCallback(async (filters = {}) => {
    setIsLoadingBooks(true);
    try {
      const { search, category, available, author, language, publisher, sort, page = 1, limit = 12 } = filters;
      const params = { page, limit };
      if (search)    params.search    = search;
      if (sort)      params.sort      = sort;
      if (author)    params.author    = author;
      if (language)  params.language  = language;
      if (publisher) params.publisher = publisher;
      if (category && category !== "All") params.category = category;
      if (available) params.available = "true";

      const res = await API.get("/books", { params });
      if (res.data.success) {
        setBooks(res.data.books);
        setTotalBooks(res.data.total);
        return res.data;
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to fetch books");
    } finally {
      setIsLoadingBooks(false);
    }
  }, []);

  // ── Categories ────────────────────────────────────────────────────────────
  const fetchCategories = useCallback(async () => {
    try {
      const res = await API.get("/categories");
      if (res.data.success) setCategories(res.data.categories);
    } catch { /* silent */ }
  }, []);

  // ── Reservations (student) ────────────────────────────────────────────────
  const fetchMyReservations = useCallback(async (status) => {
    setIsLoadingBookings(true);
    try {
      const params = {};
      if (status && status !== "All") params.status = status.toLowerCase();
      const res = await API.get("/reservations/my", { params });
      if (res.data.success) setBookings(res.data.reservations);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load bookings");
    } finally {
      setIsLoadingBookings(false);
    }
  }, []);

  // ── Reservations (admin/librarian) ────────────────────────────────────────
  const fetchAllReservations = useCallback(async (status, search, page, limit) => {
    setIsLoadingBookings(true);
    try {
      const params = {};
      if (status && status !== "All") params.status = status.toLowerCase();
      if (search) params.search = search;
      if (page)   params.page   = page;
      if (limit)  params.limit  = limit;
      const res = await API.get("/reservations", { params });
      if (res.data.success) setBookings(res.data.reservations);
      return res.data;
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load reservations");
    } finally {
      setIsLoadingBookings(false);
    }
  }, []);

  // ── Create Reservation ────────────────────────────────────────────────────
  const createReservation = async (bookId) => {
    try {
      const res = await API.post("/reservations", { bookId });
      if (res.data.success) {
        toast.success("Reservation created! Awaiting librarian approval.");
        fetchMyReservations();
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to create reservation";
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  // ── Update Reservation Status ─────────────────────────────────────────────
  const updateReservationStatus = async (id, status, notes) => {
    try {
      const res = await API.put(`/reservations/${id}/status`, { status, notes });
      if (res.data.success) {
        toast.success(`Status updated to ${status}`);
        return { success: true, data: res.data.reservation };
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to update status";
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  // ── Renew Book ────────────────────────────────────────────────────────────
  const renewBook = async (id) => {
    try {
      const res = await API.put(`/reservations/${id}/renew`);
      if (res.data.success) {
        toast.success(res.data.message);
        fetchMyReservations();
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to renew book";
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  // ── Cancel Reservation ────────────────────────────────────────────────────
  const cancelReservation = async (id) => {
    try {
      const res = await API.delete(`/reservations/${id}`);
      if (res.data.success) {
        toast.success("Reservation cancelled.");
        fetchMyReservations();
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to cancel reservation";
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  // ── Books CRUD ────────────────────────────────────────────────────────────
  const addBook = async (formData) => {
    try {
      const res = await API.post("/books", formData, { headers: { "Content-Type": "multipart/form-data" } });
      if (res.data.success) {
        toast.success("Book added to catalogue!");
        return { success: true, book: res.data.book };
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to add book";
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const updateBook = async (id, formData) => {
    try {
      const res = await API.put(`/books/${id}`, formData, { headers: { "Content-Type": "multipart/form-data" } });
      if (res.data.success) {
        toast.success("Book updated!");
        return { success: true, book: res.data.book };
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to update book";
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  const deleteBook = async (id) => {
    try {
      const res = await API.delete(`/books/${id}`);
      if (res.data.success) {
        toast.success("Book removed from catalogue.");
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to delete book";
      toast.error(msg);
      return { success: false, message: msg };
    }
  };

  // ── Wishlist ──────────────────────────────────────────────────────────────
  const fetchWishlist = useCallback(async () => {
    try {
      const res = await API.get("/users/wishlist");
      if (res.data.success) setWishlist(res.data.wishlist);
    } catch { /* silent */ }
  }, []);

  const toggleWishlist = async (bookId) => {
    try {
      const res = await API.post(`/users/wishlist/${bookId}`);
      if (res.data.success) {
        fetchWishlist();
        toast.success(res.data.inWishlist ? "Added to wishlist!" : "Removed from wishlist");
        return { success: true, inWishlist: res.data.inWishlist };
      }
    } catch (err) {
      toast.error("Failed to update wishlist");
      return { success: false };
    }
  };

  // ── Notifications ─────────────────────────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await API.get("/notifications");
      if (res.data.success) {
        setNotifications(res.data.notifications);
        setUnreadCount(res.data.unreadCount);
      }
    } catch { /* silent */ }
  }, []);

  const markNotificationRead = async (id) => {
    try {
      await API.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch { /* silent */ }
  };

  const markAllNotificationsRead = async () => {
    try {
      await API.put("/notifications/read-all");
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success("All notifications marked as read");
    } catch { /* silent */ }
  };

  // ── Dashboard (admin) ─────────────────────────────────────────────────────
  const fetchDashboardStats = useCallback(async () => {
    try {
      const res = await API.get("/dashboard/stats");
      if (res.data.success) setDashStats(res.data.stats);
      return res.data.stats;
    } catch { /* silent */ }
  }, []);

  const fetchChartData = useCallback(async () => {
    try {
      const res = await API.get("/dashboard/charts");
      if (res.data.success) setChartData(res.data.charts);
      return res.data.charts;
    } catch { /* silent */ }
  }, []);

  const fetchRecentActivity = useCallback(async () => {
    try {
      const res = await API.get("/dashboard/activity");
      return res.data.activities || [];
    } catch { return []; }
  }, []);

  // ── Recently Viewed ───────────────────────────────────────────────────────
  const trackRecentlyViewed = async (bookId) => {
    try { await API.post(`/users/recently-viewed/${bookId}`); } catch { /* silent */ }
  };

  return (
    <LibraryContext.Provider value={{
      books, totalBooks, bookings, categories, notifications, unreadCount,
      dashStats, chartData, wishlist,
      isLoadingBooks, isLoadingBookings,
      fetchBooks, fetchCategories,
      fetchMyReservations, fetchAllReservations,
      createReservation, updateReservationStatus, renewBook, cancelReservation,
      addBook, updateBook, deleteBook,
      fetchWishlist, toggleWishlist,
      fetchNotifications, markNotificationRead, markAllNotificationsRead,
      fetchDashboardStats, fetchChartData, fetchRecentActivity,
      trackRecentlyViewed,
    }}>
      {children}
    </LibraryContext.Provider>
  );
}

export const useLibrary = () => useContext(LibraryContext);