/**
 * DataTable Component
 * Reusable table with search, filters, and pagination.
 * Supports bilingual columns and action buttons.
 */
import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FiSearch, FiEdit2, FiTrash2, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const PAGE_SIZE = 10;

export default function DataTable({
  data = [],
  columns = [],
  onEdit,
  onDelete,
  searchPlaceholder,
  filters = null,
}) {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === 'ar';
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Filter data based on search query
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    const query = searchQuery.toLowerCase();
    return data.filter((item) =>
      columns.some((col) => {
        const value = item[col.key];
        return value && String(value).toLowerCase().includes(query);
      })
    );
  }, [data, searchQuery, columns]);

  // Paginate
  const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const formatValue = (item, col) => {
    const value = item[col.key];
    if (col.render) return col.render(item);
    if (col.type === 'currency') {
      return `${Number(value || 0).toLocaleString()} ${t('common.currency')}`;
    }
    if (col.type === 'bilingual') {
      return isAr ? item[col.key_ar] || value : value;
    }
    return value || '-';
  };

  return (
    <div className="data-table-container">
      {/* Search & Filters Bar */}
      <div className="data-table__toolbar">
        <div className="data-table__search">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder={searchPlaceholder || t('expenses.search')}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        {filters}
      </div>

      {/* Table */}
      <div className="data-table__wrapper">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key}>{col.label}</th>
              ))}
              {(onEdit || onDelete) && <th>{t('common.actions')}</th>}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (onEdit || onDelete ? 1 : 0)}
                  className="data-table__empty"
                >
                  {t('common.noData')}
                </td>
              </tr>
            ) : (
              paginatedData.map((item, idx) => (
                <tr key={item.id || idx}>
                  {columns.map((col) => (
                    <td key={col.key}>{formatValue(item, col)}</td>
                  ))}
                  {(onEdit || onDelete) && (
                    <td className="data-table__actions">
                      {onEdit && (
                        <button
                          className="btn-icon btn-icon--edit"
                          onClick={() => onEdit(item)}
                          title={t('common.edit')}
                        >
                          <FiEdit2 size={16} />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          className="btn-icon btn-icon--delete"
                          onClick={() => onDelete(item)}
                          title={t('common.delete')}
                        >
                          <FiTrash2 size={16} />
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="data-table__pagination">
          <button
            className="btn-icon"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            <FiChevronLeft />
          </button>
          <span>
            {currentPage} / {totalPages}
          </span>
          <button
            className="btn-icon"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            <FiChevronRight />
          </button>
        </div>
      )}
    </div>
  );
}
