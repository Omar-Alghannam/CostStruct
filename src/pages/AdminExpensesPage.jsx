/**
 * Administrative Expenses Page (مصاريف إدارية)
 * Track permits, licenses, office costs, insurance.
 */
import CategoryExpensePage from './CategoryExpensePage';
import { FiFileText } from 'react-icons/fi';

export default function AdminExpensesPage() {
  return (
    <CategoryExpensePage
      categoryKeys={['administrative', 'permits', 'insurance']}
      titleKey="administrative.title"
      subtitleKey="administrative.subtitle"
      icon={<FiFileText />}
      accentColor="success"
    />
  );
}
