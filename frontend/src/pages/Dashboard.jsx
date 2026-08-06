import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLibrary } from "../context/LibraryContext";
import { useAuth } from "../context/AuthContext";
import { Tag, Table, Modal, Select, Input } from "antd";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from "recharts";
import EmptyState from "../components/ui/EmptyState";
import "./Dashboard.css";

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const COLORS = ["#6366f1","#8b5cf6","#ec4899","#f59e0b","#10b981","#3b82f6","#ef4444","#14b8a6","#f97316","#84cc16"];
const STATUS_COLORS = { pending:"gold", approved:"blue", issued:"purple", returned:"green", cancelled:"red", overdue:"volcano" };

function StatCard({ icon, label, value, sub, color = "#6366f1" }) {
  return (
    <div className="dash-stat-card" style={{ "--card-color": color }}>
      <div className="dash-stat-icon">{icon}</div>
      <div className="dash-stat-body">
        <div className="dash-stat-value">{value ?? "—"}</div>
        <div className="dash-stat-label">{label}</div>
        {sub && <div className="dash-stat-sub">{sub}</div>}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { fetchDashboardStats, fetchChartData, fetchAllReservations, fetchRecentActivity,
          updateReservationStatus, bookings, isLoadingBookings } = useLibrary();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats,     setStats]     = useState(null);
  const [charts,    setCharts]    = useState(null);
  const [activity,  setActivity]  = useState([]);
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchQ,   setSearchQ]   = useState("");
  const [updating,  setUpdating]  = useState(null);

  useEffect(() => {
    fetchDashboardStats().then(setStats);
    fetchChartData().then(setCharts);
    fetchRecentActivity().then(setActivity);
    fetchAllReservations();
  }, []);

  const handleStatusChange = async (reservationId, newStatus) => {
    setUpdating(reservationId);
    await updateReservationStatus(reservationId, newStatus);
    fetchAllReservations(statusFilter === "All" ? undefined : statusFilter);
    fetchDashboardStats().then(setStats);
    setUpdating(null);
  };

  // Build monthly chart data
  const monthlyData = (() => {
    if (!charts) return [];
    const map = {};
    charts.monthlyIssued?.forEach(d => {
      const key = `${MONTH_NAMES[d._id.month - 1]} ${d._id.year}`;
      if (!map[key]) map[key] = { month: key, issued: 0, returned: 0 };
      map[key].issued = d.count;
    });
    charts.monthlyReturned?.forEach(d => {
      const key = `${MONTH_NAMES[d._id.month - 1]} ${d._id.year}`;
      if (!map[key]) map[key] = { month: key, issued: 0, returned: 0 };
      map[key].returned = d.count;
    });
    return Object.values(map).slice(-8);
  })();

  const categoryData = charts?.categoryDistribution?.slice(0, 8).map(c => ({
    name: c._id, value: c.count,
  })) || [];

  const columns = [
    { title: "Member", dataIndex: "user", key: "user",
      render: u => (
        <div className="dt-user-cell">
          <div className="dt-user-avatar">{u?.name?.[0] || "?"}</div>
          <div>
            <div className="dt-user-name">{u?.name || "—"}</div>
            <div className="dt-user-id">{u?.studentId || u?.email}</div>
          </div>
        </div>
      )
    },
    { title: "Book", dataIndex: "book", key: "book",
      render: b => (
        <div>
          <div className="dt-book-title">{b?.title || "—"}</div>
          <div className="dt-book-author">{b?.author}</div>
        </div>
      )
    },
    { title: "Status", dataIndex: "status", key: "status",
      render: s => <Tag color={STATUS_COLORS[s]} style={{ borderRadius: 99, fontWeight: 600 }}>{s?.toUpperCase()}</Tag>
    },
    { title: "Due Date", dataIndex: "dueDate", key: "dueDate",
      render: d => d ? (
        <span style={{ color: new Date(d) < new Date() ? "var(--color-error)" : "var(--color-text-2)", fontWeight: 500 }}>
          {new Date(d).toLocaleDateString()}
        </span>
      ) : "—"
    },
    { title: "Fine", dataIndex: "fine", key: "fine",
      render: f => f?.amount > 0 ? <span style={{ color: "var(--color-error)", fontWeight: 600 }}>₹{f.amount}</span> : "—"
    },
    { title: "Action", key: "action",
      render: (_, row) => (
        <Select
          value={row.status}
          size="small"
          style={{ width: 130 }}
          loading={updating === row._id}
          onChange={val => handleStatusChange(row._id, val)}
          options={["pending","approved","issued","returned","cancelled","overdue"].map(s => ({ value: s, label: s }))}
        />
      )
    },
  ];

  const filteredBookings = bookings.filter(b => {
    const matchStatus = statusFilter === "All" || b.status === statusFilter.toLowerCase();
    const matchSearch = !searchQ ||
      b.user?.name?.toLowerCase().includes(searchQ.toLowerCase()) ||
      b.book?.title?.toLowerCase().includes(searchQ.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="dashboard-page page-wrapper animate-fadeInUp">
      {/* Welcome */}
      <div className="dash-welcome">
        <div>
          <h1 className="dash-title">Dashboard 📊</h1>
          <p className="dash-subtitle">Welcome back, <strong>{user?.name}</strong> — here's what's happening today.</p>
        </div>
        <div className="dash-welcome-actions">
          <button className="dash-action-btn primary" onClick={() => navigate("/dashboard/reservations")}>
            📋 Manage Reservations
          </button>
          <button className="dash-action-btn" onClick={() => navigate("/dashboard/add-book")}>
            + Add Book
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="dash-stats-grid">
        <StatCard icon="📚" label="Total Books"     value={stats?.totalBooks}      color="#6366f1" />
        <StatCard icon="👥" label="Students"        value={stats?.totalUsers}      color="#8b5cf6" />
        <StatCard icon="📋" label="Pending"         value={stats?.pendingCount}    color="#f59e0b" />
        <StatCard icon="📖" label="Issued"          value={stats?.issuedCount}     color="#3b82f6" />
        <StatCard icon="✅" label="Returned"        value={stats?.returnedCount}   color="#10b981" />
        <StatCard icon="⚠️" label="Overdue"         value={stats?.overdueCount}    color="#ef4444" sub={stats?.overdueCount > 0 ? "Needs attention!" : undefined} />
        <StatCard icon="📦" label="Available Copies" value={stats?.availableCopies} color="#14b8a6" />
        <StatCard icon="💰" label="Total Fines"     value={stats?.totalFinesCollected ? `₹${stats.totalFinesCollected}` : "₹0"} color="#f97316" />
      </div>

      {/* Charts row */}
      {charts && (
        <div className="dash-charts-grid">
          {/* Monthly borrow chart */}
          <div className="dash-chart-card">
            <h3 className="dash-chart-title">Monthly Activity</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--color-text-3)" }} />
                <YAxis tick={{ fontSize: 11, fill: "var(--color-text-3)" }} />
                <Tooltip contentStyle={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 10, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="issued"   name="Issued"   fill="#6366f1" radius={[4,4,0,0]} />
                <Bar dataKey="returned" name="Returned" fill="#10b981" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Category pie chart */}
          <div className="dash-chart-card">
            <h3 className="dash-chart-title">Books by Category</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={55} outerRadius={90}
                  paddingAngle={3} dataKey="value">
                  {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 10, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Popular books */}
          {charts.popularBooks?.length > 0 && (
            <div className="dash-chart-card dash-chart-wide">
              <h3 className="dash-chart-title">Most Borrowed Books</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={charts.popularBooks.slice(0, 6)} layout="vertical"
                  margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "var(--color-text-3)" }} />
                  <YAxis type="category" dataKey="title" width={140}
                    tick={{ fontSize: 11, fill: "var(--color-text-2)" }}
                    tickFormatter={v => v.length > 22 ? v.slice(0, 22) + "…" : v} />
                  <Tooltip contentStyle={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", borderRadius: 10, fontSize: 12 }} />
                  <Bar dataKey="borrowCount" name="Borrows" fill="#8b5cf6" radius={[0,4,4,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* Reservations table */}
      <div className="dash-section">
        <div className="dash-section-header">
          <h2 className="dash-section-title">Reservations</h2>
          <div className="dash-table-controls">
            <Input.Search
              placeholder="Search member or book…"
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              style={{ width: 220 }}
              allowClear
            />
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: 140 }}
              options={["All","pending","approved","issued","returned","cancelled","overdue"].map(s => ({
                value: s, label: s === "All" ? "All Statuses" : s,
              }))}
            />
          </div>
        </div>
        <Table
          dataSource={filteredBookings}
          columns={columns}
          rowKey="_id"
          loading={isLoadingBookings}
          pagination={{ pageSize: 10, showSizeChanger: false }}
          locale={{ emptyText: <EmptyState icon="📋" title="No reservations found" /> }}
          scroll={{ x: 800 }}
          size="middle"
        />
      </div>

      {/* Recent activity */}
      {activity.length > 0 && (
        <div className="dash-section">
          <h2 className="dash-section-title">Recent Activity</h2>
          <div className="activity-feed">
            {activity.map(a => (
              <div key={a._id} className="activity-item">
                <div className="activity-dot" />
                <div className="activity-body">
                  <p className="activity-text">{a.details}</p>
                  <span className="activity-time">{new Date(a.createdAt).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
