import { useState, useEffect } from "react";
import { useLibrary } from "../context/LibraryContext";
import BookCard from "../components/BookCard";
import { demoBooks } from "../services/demoData";
import { Input, Radio, Switch, Row, Col, Pagination, Spin, Empty, Typography, Space, Button, Select } from "antd";
import { SearchOutlined, FilterOutlined, ClearOutlined, SortAscendingOutlined } from "@ant-design/icons";
import "./Catalog.css";

const { Title, Text } = Typography;
const { Option } = Select;

const categories = ["All", "Fiction", "Non-Fiction", "Science", "Technology", "History", "Biography", "Mathematics", "Arts", "Philosophy", "Other"];

export default function Catalog() {
  const { books, totalBooks, isLoadingBooks, fetchBooks } = useLibrary();

  // Filter States
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(12);
  const [sortBy, setSortBy] = useState("title-asc");

  // Load books when filters/pagination change
  useEffect(() => {
    fetchBooks({
      search: searchQuery,
      category: selectedCategory,
      available: availableOnly,
      page: currentPage,
      limit: pageSize
    });
  }, [fetchBooks, searchQuery, selectedCategory, availableOnly, currentPage, pageSize]);

  // Reset filters
  const handleReset = () => {
    setSearchInput("");
    setSearchQuery("");
    setSelectedCategory("All");
    setAvailableOnly(false);
    setSortBy("title-asc");
    setCurrentPage(1);
  };

  const handleSearchSubmit = (value) => {
    setSearchQuery(value);
    setCurrentPage(1); // Reset to page 1 on new search
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setCurrentPage(1); // Reset to page 1 on category change
  };

  const handleAvailableToggle = (checked) => {
    setAvailableOnly(checked);
    setCurrentPage(1); // Reset to page 1 on availability toggle
  };

  // Determine active book list (DB vs fallback demo)
  let activeList = books && books.length > 0 ? books : demoBooks;
  const isDemo = !(books && books.length > 0);

  // If using demo books, apply search and filters locally
  if (isDemo) {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      activeList = activeList.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          b.isbn.toLowerCase().includes(q)
      );
    }
    if (selectedCategory && selectedCategory !== "All") {
      activeList = activeList.filter((b) => b.category === selectedCategory);
    }
    if (availableOnly) {
      activeList = activeList.filter((b) => b.availableCopies > 0);
    }
  }

  // Apply Sorting
  const sortedList = [...activeList].sort((a, b) => {
    if (sortBy === "title-asc") {
      return a.title.localeCompare(b.title);
    }
    if (sortBy === "title-desc") {
      return b.title.localeCompare(a.title);
    }
    if (sortBy === "year-desc") {
      return (b.publishedYear || 0) - (a.publishedYear || 0);
    }
    if (sortBy === "year-asc") {
      return (a.publishedYear || 0) - (b.publishedYear || 0);
    }
    if (sortBy === "copies-desc") {
      return b.availableCopies - a.availableCopies;
    }
    return 0;
  });

  // Apply client-side pagination for demo books
  const finalBooks = isDemo 
    ? sortedList.slice((currentPage - 1) * pageSize, currentPage * pageSize) 
    : sortedList;

  const displayCount = isDemo ? sortedList.length : totalBooks;

  return (
    <div className="catalog-container">
      {/* Page Header */}
      <div className="catalog-page-header">
        <div>
          <Title level={2} className="catalog-title">Explore Our Catalog</Title>
          <Text type="secondary">
            {displayCount} book{displayCount !== 1 ? "s" : ""} found in our collection {isDemo && "(Sample Mode)"}
          </Text>
        </div>
        {(searchQuery || selectedCategory !== "All" || availableOnly || sortBy !== "title-asc") && (
          <Button icon={<ClearOutlined />} onClick={handleReset} className="btn-clear-filters">
            Clear Filters
          </Button>
        )}
      </div>

      {/* Catalog Filters Bar */}
      <div className="catalog-filters-bar">
        <Row gutter={[16, 16]} align="middle">
          {/* Search Input */}
          <Col xs={24} md={10}>
            <Input.Search
              placeholder="Search by title, author, or ISBN..."
              enterButton={<SearchOutlined />}
              size="large"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onSearch={handleSearchSubmit}
              allowClear
            />
          </Col>
          
          {/* Availability & Sorting Switch */}
          <Col xs={24} md={14} className="col-avail-switch">
            <Space size="middle" wrap style={{ width: "100%", justifyContent: "flex-end" }}>
              <Text strong className="filter-label">
                <FilterOutlined /> Filters & Sorting:
              </Text>
              <div className="switch-wrapper">
                <Switch 
                  checked={availableOnly} 
                  onChange={handleAvailableToggle} 
                  id="available-only-switch"
                />
                <label htmlFor="available-only-switch" className="switch-label" style={{ marginRight: 16 }}>
                  Available Only
                </label>
              </div>
              <Select 
                value={sortBy} 
                onChange={setSortBy} 
                style={{ width: 180 }}
                placeholder="Sort by"
                size="middle"
                suffixIcon={<SortAscendingOutlined />}
              >
                <Option value="title-asc">Title: A to Z</Option>
                <Option value="title-desc">Title: Z to A</Option>
                <Option value="year-desc">Year: Newest First</Option>
                <Option value="year-asc">Year: Oldest First</Option>
                <Option value="copies-desc">Most Copies Available</Option>
              </Select>
            </Space>
          </Col>
        </Row>

        {/* Category Selector Pills */}
        <div className="category-scroll-container">
          <Radio.Group 
            value={selectedCategory} 
            onChange={handleCategoryChange} 
            optionType="button" 
            buttonStyle="solid"
            size="middle"
            className="category-radio-group"
          >
            {categories.map((cat) => (
              <Radio.Button key={cat} value={cat} className="category-radio-btn">
                {cat}
              </Radio.Button>
            ))}
          </Radio.Group>
        </div>
      </div>

      {/* Book Grid Area */}
      {isLoadingBooks ? (
        <div className="catalog-loading-wrapper">
          <Spin size="large" tip="Searching library catalog..." />
        </div>
      ) : finalBooks.length === 0 ? (
        <div className="catalog-empty-wrapper">
          <Empty 
            description={
              <Space direction="vertical" size={4}>
                <Text strong style={{ fontSize: 16 }}>No books matched your criteria</Text>
                <Text type="secondary">Try adjusting your filters or search terms</Text>
              </Space>
            }
          >
            <Button type="primary" onClick={handleReset}>Reset All Filters</Button>
          </Empty>
        </div>
      ) : (
        <>
          <Row gutter={[24, 24]} className="catalog-books-grid">
            {finalBooks.map((book) => (
              <Col xs={24} sm={12} md={8} lg={6} key={book._id}>
                <BookCard book={book} />
              </Col>
            ))}
          </Row>

          {/* Catalog Pagination */}
          <div className="catalog-pagination-wrapper">
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={isDemo ? sortedList.length : totalBooks}
              onChange={(page) => setCurrentPage(page)}
              showSizeChanger={false}
              className="catalog-pagination"
            />
          </div>
        </>
      )}
    </div>
  );
}