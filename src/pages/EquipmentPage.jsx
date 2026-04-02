/**
 * Equipment Page (معدات)
 * Track rental costs, purchases, maintenance.
 */
import CategoryExpensePage from './CategoryExpensePage';
import { FiTruck } from 'react-icons/fi';

export default function EquipmentPage() {
  return (
    <CategoryExpensePage
      categoryKeys={['equipment']}
      titleKey="equipment.title"
      subtitleKey="equipment.subtitle"
      icon={<FiTruck />}
      accentColor="warning"
    />
  );
}
