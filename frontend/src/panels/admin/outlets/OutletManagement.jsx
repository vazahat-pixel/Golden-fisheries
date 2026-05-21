import React from 'react';
import { Link } from 'react-router-dom';
import { AdminPageHeader, AdminCard } from '../shared/adminUi';
import { Utensils, ShoppingBag } from 'lucide-react';

const OutletManagement = () => {
  const outlets = [
    { name: 'Restaurant POS', path: '/restaurant/pos', icon: Utensils, desc: 'Dine-in billing, kitchen, settlement' },
    { name: 'Fish Mall Retail', path: '/fishmall/billing', icon: ShoppingBag, desc: 'Weight billing, EOD tally' },
  ];

  return (
    <div className="pb-12">
      <AdminPageHeader title="Outlets" subtitle="Restaurant & Fish Mall operations" badge="Outlets" />
      <div className="grid md:grid-cols-2 gap-4">
        {outlets.map((o) => (
          <Link key={o.path} to={o.path}>
            <AdminCard className="p-6 hover:border-black transition-colors">
              <o.icon size={28} className="mb-3 text-[#6A7051]" />
              <h3 className="font-bold">{o.name}</h3>
              <p className="text-xs text-gray-500 mt-1">{o.desc}</p>
            </AdminCard>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default OutletManagement;
