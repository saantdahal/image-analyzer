// components/common/Pagination.jsx

const Pagination = ({
  page,
  count,
  pageSize,
  onPageChange,
  siblingCount = 1,
}) => {
  const totalPages = Math.max(1, Math.ceil(count / pageSize));

  if (totalPages <= 1) return null;

  const goTo = (num) => {
    if (num < 1 || num > totalPages || num === page) return;
    onPageChange(num);
  };

  const getPageNumbers = () => {
    const totalNumbers = siblingCount * 2 + 5; 
    if (totalPages <= totalNumbers) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const leftSibling = Math.max(page - siblingCount, 1);
    const rightSibling = Math.min(page + siblingCount, totalPages);

    const showLeftDots = leftSibling > 2;
    const showRightDots = rightSibling < totalPages - 1;

    const pages = [1];

    if (showLeftDots) pages.push("dots-left");
    for (let i = leftSibling; i <= rightSibling; i++) {
      if (i !== 1 && i !== totalPages) pages.push(i);
    }
    if (showRightDots) pages.push("dots-right");

    pages.push(totalPages);

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <nav
      aria-label="Pagination"
      className="d-flex align-items-center justify-content-between mt-3 flex-wrap gap-2"
    >
      <div className="text-muted small">
        Showing page {page} of {totalPages} ({count} total)
      </div>

      <div className="d-flex align-items-center gap-1">
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm"
          onClick={() => goTo(page - 1)}
          disabled={page <= 1}
        >
          <i className="ti ti-chevron-left" />
          Prev
        </button>

        {pageNumbers.map((num, i) =>
          typeof num === "number" ? (
            <button
              key={num}
              type="button"
              className={`btn btn-sm ${num === page ? "btn-primary" : "btn-outline-secondary"}`}
              onClick={() => goTo(num)}
            >
              {num}
            </button>
          ) : (
            <span key={`${num}-${i}`} className="px-1 text-muted">
              …
            </span>
          ),
        )}

        <button
          type="button"
          className="btn btn-outline-secondary btn-sm"
          onClick={() => goTo(page + 1)}
          disabled={page >= totalPages}
        >
          Next
          <i className="ti ti-chevron-right" />
        </button>
      </div>
    </nav>
  );
};

export default Pagination;
