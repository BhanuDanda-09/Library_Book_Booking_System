import { useState, useEffect } from "react";
import { useLibrary } from "../context/LibraryContext";
import BookCard from "../components/BookCard";
import { Input, Radio, Switch, Row, Col, Pagination, Spin, Empty, Typography, Space, Button } from "antd";
import { SearchOutlined, FilterOutlined, ClearOutlined } from "@ant-design/icons";
import "./Catalog.css";

const { Title, Text } = Typography;

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

  return (
    <div className="catalog-container">
      {/* Page Header */}
      <div className="catalog-page-header">
        <div>
          <Title level={2} className="catalog-title">Explore Our Catalog</Title>
          <Text type="secondary">
            {totalBooks} book{totalBooks !== 1 ? "s" : ""} found in our collection
          </Text>
        </div>
        {(searchQuery || selectedCategory !== "All" || availableOnly) && (
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
          
          {/* Availability Switch */}
          <Col xs={24} md={14} className="col-avail-switch">
            <Space size="middle">
              <Text strong className="filter-label">
                <FilterOutlined /> Filters:
              </Text>
              <div className="switch-wrapper">
                <Switch 
                  checked={availableOnly} 
                  onChange={handleAvailableToggle} 
                  id="available-only-switch"
                />
                <label htmlFor="available-only-switch" className="switch-label">
                  Available Copies Only
                </label>
              </div>
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
      ) : books.length === 0 ? (
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
            {books.map((book) => (
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
              total={totalBooks}
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