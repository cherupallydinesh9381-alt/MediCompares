import { useEffect } from "react";
import ProductCard from "./ProductCard.jsx";

const ProductsSection = ({
  filteredProducts,
  isLoading,
  isFull,
  setIsFull,
  categoryName,
  selectedVariants,
  expandedVendors,
  onToggleExpand,
  onToggleFavourite,
  onShare,
  onVendorAction,
  getDisplayPrice,
  getVendorPrice,
  getQuantityForVariant,
  selectedVendors,
  service,
  id,
  navigate,
  page,
  totalPages,
  priceRange = [200, 100000],
  onPageChange,
  onSelectVariant,
  onClearFilters,
  onOpenFilterDrawer,
  isSidebarOpen = true
}) => {
  useEffect(() => {
    if (window.bootstrap) {
      const timer = setTimeout(() => {
        const tooltipTriggerList = [].slice.call(
          document.querySelectorAll('[data-bs-toggle="tooltip"]')
        );
        tooltipTriggerList.forEach(function (tooltipTriggerEl) {
          const existingTooltip = window.bootstrap.Tooltip.getInstance(tooltipTriggerEl);
          if (!existingTooltip) {
            new window.bootstrap.Tooltip(tooltipTriggerEl);
          }
        });
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [filteredProducts]);

  return (
    <div>
      {/* Products Section Header */}
      <div className="products-section-header"> 
        <div className="products-count">
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
            {/* <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#1a1a1a", margin: 0 }}>
              {categoryName} <span style={{ color: "#8059ca" }}>({filteredProducts.length})</span>
            </h2> */}
            <div className="d-flex align-items-center gap-2 mobile-filter-buttons-container">
              {/* Mobile Filter Button */}
              {onOpenFilterDrawer && (
                <button
                  type="button"
                  className="mobile-filter-toggle-btn-inline"
                  onClick={onOpenFilterDrawer}
                >
                  <i className="fas fa-filter"></i>
                  <span>Filter</span>
                  {filteredProducts.length > 0 && (
                    <span className="filter-count-badge-inline">{filteredProducts.length}</span>
                  )}
                </button>
              )}
              {/* Clear All Button */}
              {onClearFilters && (
                <button
                  type="button"
                  className="mobile-clear-all-btn"
                  onClick={onClearFilters}
                >
                  <i className="fas fa-redo"></i>
                  <span>Clear All</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="row g-3">
        {isLoading && (
          <div className="col-12 products-loading">
            <i className="fa fa-spinner fa-spin"></i>
            <p style={{ color: "#666", fontSize: "16px" }}>Loading products...</p>
          </div>
        )}

        {!isLoading && filteredProducts.length === 0 && (
          <div className="col-12 products-empty">
            <img
              src="https://cdni.iconscout.com/illustration/premium/thumb/data-not-found-illustration-svg-download-png-9404367.png"
              alt="No Data Found"
            />
            <h3>No Products Found</h3>
            <p>Try adjusting your filters to see more results</p>
          </div>
        )}

        {!isLoading &&
          filteredProducts.map((product, index) => {
            if (!product || !product.tablet || !product.tablet._id) {
              return null;
            }
            
            return (
              <ProductCard
                key={`${product.tablet._id}-${index}`}
                product={product}
                index={index}
                isFull={isFull}
                service={service}
                id={id}
                navigate={navigate}
                selectedVariants={selectedVariants}
                expandedVendors={expandedVendors}
                onToggleExpand={onToggleExpand}
                onToggleFavourite={onToggleFavourite}
                onShare={onShare}
                onVendorAction={onVendorAction}
                getDisplayPrice={getDisplayPrice}
                getVendorPrice={getVendorPrice}
                getQuantityForVariant={getQuantityForVariant}
                selectedVendors={selectedVendors}
                categoryName={categoryName}
                priceRange={priceRange}
                onSelectVariant={onSelectVariant}
                isSidebarOpen={isSidebarOpen}
              />
            );
          })}
      </div>

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="pagination dashboard-pagination mt-0 mb-2">
          <ul>
            <li>
              <a
                className={`page-link ${page <= 1 ? "disabled" : ""}`}
                onClick={() => page > 1 && onPageChange(page - 1)}
              >
                <i className="fa-solid fa-chevron-left" />
              </a>
            </li>

            {page > 3 && (
              <li>
                <a className="page-link" onClick={() => onPageChange(1)}>1</a>
              </li>
            )}

            {page > 4 && (
              <li>
                <span className="page-link">...</span>
              </li>
            )}

            {(() => {
              let start = Math.max(1, page - 2);
              let end = Math.min(totalPages, page + 2);
              if (start === 1) end = Math.min(5, totalPages);
              if (end === totalPages) start = Math.max(1, totalPages - 4);

              return [...Array(end - start + 1)].map((_, i) => {
                const pageNum = start + i;
                return (
                  <li key={pageNum}>
                    <a
                      className={`page-link ${pageNum === page ? "active" : ""}`}
                      onClick={() => onPageChange(pageNum)}
                    >
                      {pageNum}
                    </a>
                  </li>
                );
              });
            })()}

            {page < totalPages - 3 && (
              <li>
                <span className="page-link">...</span>
              </li>
            )}

            {page < totalPages - 2 && (
              <li>
                <a className="page-link" onClick={() => onPageChange(totalPages)}>
                  {totalPages}
                </a>
              </li>
            )}

            <li>
              <a
                className={`page-link ${page >= totalPages ? "disabled" : ""}`}
                onClick={() => page < totalPages && onPageChange(page + 1)}
              >
                <i className="fa-solid fa-chevron-right" />
              </a>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default ProductsSection;

