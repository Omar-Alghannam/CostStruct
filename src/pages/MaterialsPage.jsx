/**
 * Material Costs Page (مواد البناء)
 * Track purchase orders, suppliers, invoices.
 */
import CategoryExpensePage from './CategoryExpensePage';
import { FiPackage } from 'react-icons/fi';

export default function MaterialsPage() {
  return (
    <CategoryExpensePage
      categoryKeys={['materials']}
      titleKey="materials.title"
      subtitleKey="materials.subtitle"
      icon={<FiPackage />}
      accentColor="info"
    />
  );
}
