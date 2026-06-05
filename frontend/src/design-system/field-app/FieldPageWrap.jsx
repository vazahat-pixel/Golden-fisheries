import React from 'react';
import { useAuthStore } from '../../store/authStore';
import { FieldScreen } from './FieldScreen';

/** Thin wrapper so inner pages get dark theme header without duplicating layout */
export function FieldPageWrap({ subtitle, children, notifyHref, fill = false }) {
  const { user } = useAuthStore();
  const raw = user?.fullName || user?.name || 'User';
  const name = raw.includes(' ') ? raw.split(/\s+/)[0].toLowerCase() : raw.toLowerCase();

  return (
    <FieldScreen userName={name} subtitle={subtitle} notifyHref={notifyHref} fill={fill}>
      {children}
    </FieldScreen>
  );
}
