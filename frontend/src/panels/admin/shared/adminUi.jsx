/**
 * Admin UI primitives — re-exported from ERP design system for backward compatibility.
 * Prefer: import { PageHeader, DataTable, Button } from '../../../design-system';
 */
import React from 'react';
import {
  PageHeader,
  DataTable,
  StatusBadge,
  Button,
  SearchInput,
  Card,
} from '../../../design-system';

export const AdminPageHeader = PageHeader;

export const AdminCard = ({ children, className }) => (
  <Card padding="none" className={className}>
    {children}
  </Card>
);

export { StatusBadge };

export const AdminDataTable = (props) => (
  <DataTable
    {...props}
    emptyMessage={props.emptyMessage ?? props.emptyLabel ?? 'No records found'}
  />
);

export const AdminSearchBar = ({ value, onChange, placeholder = 'Search…', className }) => (
  <SearchInput
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    className={className}
  />
);

const adminBtnVariants = {
  primary: 'primary',
  outline: 'secondary',
  danger: 'danger',
  gold: 'warning',
};

export const AdminBtn = ({ children, variant = 'primary', className, loading, ...props }) => (
  <Button
    variant={adminBtnVariants[variant] ?? 'primary'}
    size="sm"
    loading={loading}
    className={className}
    {...props}
  >
    {children}
  </Button>
);
