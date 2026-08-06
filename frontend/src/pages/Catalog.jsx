import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useLibrary } from "../context/LibraryContext";
import { useAuth } from "../context/AuthContext";
import BookCard from "../components/BookCard";
import EmptyState from "../components/ui/EmptyState";
import { Select, Pagination, Switch } from "antd";
import { SearchOutlined, FilterOutlined, AppstoreOutlined, BarsOutlined } from "@ant-design/icons";
import "./Catalog.css";

const SORTS = [
  { value: "-createdAt", label: "Newest First" },
  { value: "az",         label: "A → Z" },
  { value: "za",         label: "Z → A" },
  { value: "mostBorrowed", label: "Most Popular" },
];

export default function Catalog() {
  const { books, totalBooks, isLoadingBooks, fetchBooks, categories, fetchCategories } = useLibrary();
  const [searchParams, setSearchParams] = useSearchParams();
  const [search,    setSearch]    = useState(searchParams.get("search") || "");
  const [category,  setCategory]  = useState(searchParams.get("category") || "All");
  const [sort,      setSort]      = useState("-createdAt");
  const [available, setAvailable] = useState(searchParams.get("available") === "true");
  const [page,      setPage]      = useState(1);
  const [gridView,  setGridView]  = useState(true);
  const [searchInput, setSearchInput] = useState(search);

  const PAGE_LIMIT = 12;

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const loadBooks = useCallback(() => {
    fetchBooks({ search, category, sort, available, page, limit: PAGE_LIMIT });
  }, [search, category, sort, available, page, fetchBooks]);

  useEffect(() => { loadBooks(); }, [loadBooks]);

  const handleSearch = e => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleCategory = (val) => { setCategory(val); setPage(1); };
  const handleSort     = (val) => { setSort(val);     setPage(1); };
  const handleAvail    = (val) => { setAvailable(val); setPage(1); };
  const handleClear    = () => {
    setSearch(""); setSearchInput(""); setCategory("All");
    setSort("-createdAt"); setAvailable(false); setPage(1);
  };

  const catOptions = [
    { value: "All", label: "All Categories" },
    ...(categories || []).map(c => ({ value: c.name, label: `${c.icon || ""} ${c.name}` })),
  ];

  const hasFilters = search || category !== "All" || available;

  return (
    <div className="catalog-page page-wrapper animate-fadeInUp">
      {/* Page header */}
      <div className="catalog-header">
        <div>
          <h1 className="catalog-title">Book Catalog</h1>
          <p className="catalog-subtitle">
            {totalBooks > 0 ? `${totalBooks} book${totalBooks !== 1 ? "s" : ""} found` : "Explore our collection"}
          </p>
        </div>
        <div className="catalog-view-toggle">
          <button className={`view-btn ${gridView ? "active" : ""}`} onClick={() => setGridView(true)}>
            <AppstoreOutlined />
          </button>
          <button className={`view-btn ${!gridView ? "active" : ""}`} onClick={() => setGridView(false)}>
            <BarsOutlined />
          </button>
        </div>
      </div>

      {/* Filters bar */}
      <div className="catalog-filters">
        {/* Search */}
        <form className="catalog-search" onSubmit={handleSearch}>
          <SearchOutlined className="search-icon" />
          <input
            type="text"
            placeholder="Search by title, author, ISBN…"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
          />
          <button type="submit" className="search-submit-btn">Search</button>
        </form>

        {/* Category */}
        <Select
          value={category}
          onChange={handleCategory}
          options={catOptions}
          style={{ minWidth: 200 }}
          size="large"
          showSearch
          placeholder="All Categories"
        />

        {/* Sort */}
        <Select
          value={sort}
          onChange={handleSort}
          options={SORTS}
          style={{ minWidth: 170 }}
          size="large"
        />

        {/* Available only */}
        <div className="catalog-avail-toggle">
          <Switch checked={available} onChange={handleAvail} size="small" />
          <span>Available only</span>
        </div>

        {/* Clear */}
        {hasFilters && (
          <button className="catalog-clear-btn" onClick={handleClear}>
            ✕ Clear filters
          </button>
        )}
      </div>

      {/* Results */}
      {isLoadingBooks ? (
        <div className={`catalog-grid ${!gridView ? "catalog-list" : ""}`}>
          {[...Array(12)].map((_, i) => (
            <div key={i} className="book-skeleton">
              <div className="skeleton" style={{ aspectRatio: "400/560", borderRadius: 12 }} />
              <div className="skeleton" style={{ height: 14, marginTop: 12, borderRadius: 6 }} />
              <div className="skeleton" style={{ height: 12, marginTop: 8, width: "60%", borderRadius: 6 }} />
            </div>
          ))}
        </div>
      ) : books.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="No books found"
          description="Try adjusting your filters or search term."
          action={handleClear}
          actionLabel="Clear all filters"
        />
      ) : (
        <div className={`catalog-grid ${!gridView ? "catalog-list" : ""}`}>
          {books.map(book => <BookCard key={book._id} book={book} />)}
        </div>
      )}

      {/* Pagination */}
      {totalBooks > PAGE_LIMIT && (
        <div className="catalog-pagination">
          <Pagination
            current={page}
            total={totalBooks}
            pageSize={PAGE_LIMIT}
            onChange={p => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            showSizeChanger={false}
            showTotal={(total, range) => `${range[0]}–${range[1]} of ${total} books`}
          />
        </div>
      )}
    </div>
  );
}