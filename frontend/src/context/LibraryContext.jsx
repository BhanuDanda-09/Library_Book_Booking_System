import { createContext, useContext, useState, useCallback } from "react";
import API from "../services/api";
import { message } from "antd";

const LibraryContext = createContext();

export function LibraryProvider({ children }) {
  const [books, setBooks] = useState([]);
  const [totalBooks, setTotalBooks] = useState(0);
  const [bookings, setBookings] = useState([]);
  const [isLoadingBooks, setIsLoadingBooks] = useState(false);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);

  // Fetch books with filters
  const fetchBooks = useCallback(async (filters = {}) => {
    setIsLoadingBooks(true);
    try {
      const { search, category, available, page = 1, limit = 12 } = filters;
      const params = {};
      if (search) params.search = search;
      if (category && category !== "All") params.category = category;
      if (available) params.available = "true";
      params.page = page;
      params.limit = limit;

      const res = await API.get("/books", { params });
      if (res.data.success) {
        setBooks(res.data.books);
        setTotalBooks(res.data.total);
      }
    } catch (err) {
      console.error("Fetch books error:", err);
      message.error(err.response?.data?.message || "Failed to fetch book catalog");
    } finally {
      setIsLoadingBooks(false);
    }
  }, []);

  // Fetch student's own bookings
  const fetchMyReservations = useCallback(async () => {
    setIsLoadingBookings(true);
    try {
      const res = await API.get("/reservations/my");
      if (res.data.success) {
        setBookings(res.data.reservations);
      }
    } catch (err) {
      console.error("Fetch my reservations error:", err);
      message.error(err.response?.data?.message || "Failed to load bookings");
    } finally {
      setIsLoadingBookings(false);
    }
  }, []);

  // Fetch librarian's view of bookings (all or filtered by status)
  const fetchAllReservations = useCallback(async (status) => {
    setIsLoadingBookings(true);
    try {
      const params = {};
      if (status && status !== "All") params.status = status.toLowerCase();
      
      const res = await API.get("/reservations", { params });
      if (res.data.success) {
        setBookings(res.data.reservations);
      }
    } catch (err) {
      console.error("Fetch all reservations error:", err);
      message.error(err.response?.data?.message || "Failed to load all reservations");
    } finally {
      setIsLoadingBookings(false);
    }
  }, []);

  // Student makes a new reservation request
  const createReservation = async (bookId) => {
    if (bookId && bookId.startsWith("demo-")) {
      message.success("Reservation request submitted successfully! (Demo Mode)");
      return { success: true };
    }
    try {
      const res = await API.post("/reservations", { bookId });
      if (res.data.success) {
        message.success("Reservation request submitted successfully!");
        // Refresh local bookings list
        fetchMyReservations();
        return { success: true };
      }
    } catch (err) {
      console.error("Create reservation error:", err);
      if (bookId && bookId.startsWith("demo-")) {
        message.success("Reservation request submitted successfully! (Demo Fallback)");
        return { success: true };
      }
      const errMsg = err.response?.data?.message || "Failed to create reservation";
      message.error(errMsg);
      return { success: false, message: errMsg };
    }
  };

  // Librarian updates a reservation's status (approve, issue, return, cancel)
  const updateReservationStatus = async (id, status) => {
    if (id && id.startsWith("booking-demo-")) {
      message.success(`Reservation status updated to ${status} (Demo Mode)`);
      return { success: true };
    }
    try {
      const res = await API.put(`/reservations/${id}/status`, { status });
      if (res.data.success) {
        message.success(`Reservation status updated to ${status}`);
        // Refresh local bookings list (librarian or student view)
        return { success: true, data: res.data.reservation };
      }
    } catch (err) {
      console.error("Update reservation status error:", err);
      if (id && id.startsWith("booking-demo-")) {
        message.success(`Reservation status updated to ${status} (Demo Fallback)`);
        return { success: true };
      }
      const errMsg = err.response?.data?.message || "Failed to update reservation status";
      message.error(errMsg);
      return { success: false, message: errMsg };
    }
  };

  // Librarian adds a book (supports cover image upload via multipart/form-data)
  const addBook = async (formData) => {
    try {
      const res = await API.post("/books", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      if (res.data.success) {
        message.success("New book added to catalogue!");
        return { success: true, book: res.data.book };
      }
    } catch (err) {
      console.error("Add book error:", err);
      const errMsg = err.response?.data?.message || "Failed to add new book";
      message.error(errMsg);
      return { success: false, message: errMsg };
    }
  };

  // Librarian updates a book (supports cover image upload via multipart/form-data)
  const updateBook = async (id, formData) => {
    try {
      const res = await API.put(`/books/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      if (res.data.success) {
        message.success("Book details updated successfully!");
        return { success: true, book: res.data.book };
      }
    } catch (err) {
      console.error("Update book error:", err);
      const errMsg = err.response?.data?.message || "Failed to update book";
      message.error(errMsg);
      return { success: false, message: errMsg };
    }
  };

  // Librarian deletes a book
  const deleteBook = async (id) => {
    if (id && id.startsWith("demo-")) {
      message.success("Book removed from catalogue. (Demo Mode)");
      return { success: true };
    }
    try {
      const res = await API.delete(`/books/${id}`);
      if (res.data.success) {
        message.success("Book removed from catalogue.");
        return { success: true };
      }
    } catch (err) {
      console.error("Delete book error:", err);
      if (id && id.startsWith("demo-")) {
        message.success("Book removed from catalogue. (Demo Fallback)");
        return { success: true };
      }
      const errMsg = err.response?.data?.message || "Failed to delete book";
      message.error(errMsg);
      return { success: false, message: errMsg };
    }
  };

  return (
    <LibraryContext.Provider
      value={{
        books,
        totalBooks,
        bookings,
        isLoadingBooks,
        isLoadingBookings,
        fetchBooks,
        fetchMyReservations,
        fetchAllReservations,
        createReservation,
        updateReservationStatus,
        addBook,
        updateBook,
        deleteBook
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
}

export const useLibrary = () => useContext(LibraryContext);