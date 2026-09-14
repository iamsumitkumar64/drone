"use client";

import styles from "./pagination-bar.module.css";

interface PaginationBarProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (newPage: number) => void;
}

export default function PaginationBar({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
}: PaginationBarProps) {
  if (total <= 0 || totalPages <= 1) return null;

  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  // Generate page numbers to display
  const pages: number[] = [];
  const maxButtons = 5;
  let startPage = Math.max(1, page - Math.floor(maxButtons / 2));
  let endPage = Math.min(totalPages, startPage + maxButtons - 1);

  if (endPage - startPage + 1 < maxButtons) {
    startPage = Math.max(1, endPage - maxButtons + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className={styles.paginationContainer}>
      <span className={styles.paginationInfo}>
        Showing {startItem}–{endItem} of {total} items (Page {page} of {totalPages})
      </span>

      <div className={styles.controls}>
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className={styles.pageButton}
        >
          ‹ Prev
        </button>

        {pages.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            className={p === page ? styles.activeButton : styles.pageButton}
          >
            {p}
          </button>
        ))}

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className={styles.pageButton}
        >
          Next ›
        </button>
      </div>
    </div>
  );
}
