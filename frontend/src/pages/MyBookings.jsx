import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLibrary } from "../context/LibraryContext";
import { useAuth } from "../context/AuthContext";
import { Tag, Tabs } from "antd";
import EmptyState from "../components/ui/EmptyState";
import "./MyBookings.css";

const STATUS_COLOR = {
  pending:   { tag: "gold",    emoji: "⏳" },
  approved:  { tag: "blue",    emoji: "✅" },
  issued:    { tag: "purple",  emoji: "📖" },
  returned:  { tag: "green",   emoji: "✔️" },
  cancelled: { tag: "red",     emoji: "✖️" },
  overdue:   { tag: "volcano", emoji: "🔴" },
};

const BACKEND = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/api$/, "");


export default function MyBookings() {
  const { bookings, isLoadingBookings, fetchMyReservations, cancelReservation, renewBook } = useLibrary();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    fetchMyReservations();
  }, [fetchMyReservations]);

  const filteredBookings = activeTab === "all"
    ? bookings
    : bookings.filter(b => b.status === activeTab);

  const counts = {};
  bookings.forEach(b => { counts[b.status] = (counts[b.status] || 0) + 1; });

  const tabItems = [
    { key: "all",       label: `All (${bookings.length})` },
    { key: "pending",   label: `⏳ Pending (${counts.pending || 0})` },
    { key: "approved",  label: `✅ Approved (${counts.approved || 0})` },
    { key: "issued",    label: `📖 Issued (${counts.issued || 0})` },
    { key: "returned",  label: `✔️ Returned (${counts.returned || 0})` },
    { key: "overdue",   label: `🔴 Overdue (${counts.overdue || 0})` },
    { key: "cancelled", label: `✖️ Cancelled (${counts.cancelled || 0})` },
  ];

  const getDaysLeft = (dueDate) => {
    if (!dueDate) return null;
    const diff = Math.ceil((new Date(dueDate) - new Date()) / 86400000);
    return diff;
  };

  return (
    <div className="my-bookings-page page-wrapper animate-fadeInUp">
      <div className="bookings-header">
        <div>
          <h1 className="bookings-title">My Bookings</h1>
          <p className="bookings-subtitle">{bookings.length} total reservation{bookings.length !== 1 ? "s" : ""}</p>
        </div>
        <button className="bookings-browse-btn" onClick={() => navigate("/catalog")}>
          + Reserve a Book
        </button>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        style={{ marginBottom: 24 }}
      />

      {isLoadingBookings ? (
        <div className="bookings-skeleton-list">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="booking-skeleton">
              <div className="skeleton" style={{ width: 72, height: 100, borderRadius: 10, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton" style={{ height: 18, width: "60%", borderRadius: 6, marginBottom: 10 }} />
                <div className="skeleton" style={{ height: 14, width: "40%", borderRadius: 6, marginBottom: 8 }} />
                <div className="skeleton" style={{ height: 14, width: "30%", borderRadius: 6 }} />
              </div>
            </div>
          ))}
        </div>
      ) : filteredBookings.length === 0 ? (
        <EmptyState
          icon={activeTab === "all" ? "📋" : STATUS_COLOR[activeTab]?.emoji || "📋"}
          title={activeTab === "all" ? "No reservations yet" : `No ${activeTab} reservations`}
          description={activeTab === "all" ? "Start browsing our catalog to reserve your first book." : undefined}
          action={() => navigate("/catalog")}
          actionLabel="Browse Catalog"
        />
      ) : (
        <div className="bookings-list">
          {filteredBookings.map(booking => {
            const cover = booking.book?.coverImage
              ? (booking.book.coverImage.startsWith("/uploads") ? `${BACKEND}${booking.book.coverImage}` : booking.book.coverImage)
              : `https://picsum.photos/seed/${booking.book?._id?.slice(-6) || "b"}/400/560`;
            const daysLeft = getDaysLeft(booking.dueDate);
            const isOverdue = daysLeft !== null && daysLeft < 0;
            const dueSoon   = daysLeft !== null && daysLeft >= 0 && daysLeft <= 3;

            return (
              <div key={booking._id} className={`booking-card ${isOverdue ? "overdue" : ""}`}>
                {/* Cover */}
                <img
                  src={cover}
                  alt={booking.book?.title}
                  className="booking-cover"
                  onClick={() => navigate(`/book/${booking.book?._id}`)}
                  onError={e => { e.target.src = "https://picsum.photos/seed/default/400/560"; }}
                />

                {/* Details */}
                <div className="booking-info">
                  <div className="booking-top-row">
                    <h3 className="booking-book-title"
                      onClick={() => navigate(`/book/${booking.book?._id}`)}>
                      {booking.book?.title || "Unknown Book"}
                    </h3>
                    <Tag color={STATUS_COLOR[booking.status]?.tag || "default"}
                      style={{ borderRadius: 99, fontWeight: 700 }}>
                      {STATUS_COLOR[booking.status]?.emoji} {booking.status?.toUpperCase()}
                    </Tag>
                  </div>

                  <p className="booking-book-author">by {booking.book?.author}</p>

                  <div className="booking-meta-row">
                    <div className="booking-meta-item">
                      <span className="meta-lbl">Reserved</span>
                      <span>{new Date(booking.reservationDate || booking.createdAt).toLocaleDateString()}</span>
                    </div>
                    {booking.issueDate && (
                      <div className="booking-meta-item">
                        <span className="meta-lbl">Issued</span>
                        <span>{new Date(booking.issueDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    {booking.dueDate && (
                      <div className="booking-meta-item">
                        <span className="meta-lbl">Due Date</span>
                        <span style={{ color: isOverdue ? "var(--color-error)" : dueSoon ? "var(--color-warning)" : "inherit", fontWeight: isOverdue || dueSoon ? 700 : 500 }}>
                          {new Date(booking.dueDate).toLocaleDateString()}
                          {isOverdue ? ` (${Math.abs(daysLeft)}d overdue)` : dueSoon ? ` (${daysLeft}d left!)` : ""}
                        </span>
                      </div>
                    )}
                    {booking.returnDate && (
                      <div className="booking-meta-item">
                        <span className="meta-lbl">Returned</span>
                        <span>{new Date(booking.returnDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    {booking.fine?.amount > 0 && (
                      <div className="booking-meta-item">
                        <span className="meta-lbl">Fine</span>
                        <span style={{ color: "var(--color-error)", fontWeight: 700 }}>
                          ₹{booking.fine.amount} {booking.fine.paid ? "(paid)" : "(unpaid)"}
                        </span>
                      </div>
                    )}
                    {booking.renewalCount > 0 && (
                      <div className="booking-meta-item">
                        <span className="meta-lbl">Renewals</span>
                        <span>{booking.renewalCount} / 2</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="booking-actions">
                    {["pending", "approved"].includes(booking.status) && (
                      <button className="booking-action-btn cancel"
                        onClick={() => cancelReservation(booking._id)}>
                        Cancel
                      </button>
                    )}
                    {booking.status === "issued" && booking.renewalCount < 2 && (
                      <button className="booking-action-btn renew"
                        onClick={() => renewBook(booking._id)}>
                        🔄 Renew (14 days)
                      </button>
                    )}
                    <button className="booking-action-btn view"
                      onClick={() => navigate(`/book/${booking.book?._id}`)}>
                      View Book
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}