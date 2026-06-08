import React from 'react';
import { FieldHeader } from './FieldHeader';

export function FieldScreen({
  userName,
  subtitle,
  notifyHref,
  children,
  className = '',
  fill = false,
}) {
  return (
    <div
      className={`fa-stagger pb-3 ${fill ? 'fa-page-fill' : 'space-y-3'} ${className}`}
    >
      <FieldHeader userName={userName} subtitle={subtitle} notifyHref={notifyHref} />
      {fill ? <div className="fa-page-body-grow">{children}</div> : children}
    </div>
  );
}
