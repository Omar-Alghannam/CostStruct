/**
 * Labor Costs Page (مصاريف مصنعية)
 * Track workers, wages, subcontractor payments.
 */
import CategoryExpensePage from './CategoryExpensePage';
import { FiUsers } from 'react-icons/fi';

export default function LaborPage() {
  return (
    <CategoryExpensePage
      categoryKeys={['labor', 'subcontractor']}
      titleKey="labor.title"
      subtitleKey="labor.subtitle"
      icon={<FiUsers />}
      accentColor="primary"
    />
  );
}
