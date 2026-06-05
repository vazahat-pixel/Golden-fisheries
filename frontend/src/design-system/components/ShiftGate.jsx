import React from 'react';
import { Lock } from 'lucide-react';
import { Card } from './Card';
import { Button } from './Button';
import { FormField } from './FormField';
import { Input, Textarea } from './Input';

/**
 * Compact shift-opening gate used by Fish Mall & Restaurant dashboards.
 */
export const ShiftGate = ({
  title = 'Shift opening required',
  subtitle = 'Enter opening cash float before starting operations.',
  openingCash,
  onOpeningCashChange,
  notes,
  onNotesChange,
  onSubmit,
  submitting = false,
  notesLabel = 'Handover notes',
  notesPlaceholder = 'Optional shift handover remarks…',
}) => (
  <div className="flex items-center justify-center min-h-[60vh] p-4">
    <Card padding="lg" className="w-full max-w-md">
      <div className="flex flex-col items-center text-center mb-4">
        <div className="w-10 h-10 rounded-erp bg-amber-50 text-amber-700 flex items-center justify-center mb-3 border border-amber-200">
          <Lock size={20} />
        </div>
        <h1 className="erp-h1">{title}</h1>
        <p className="erp-caption mt-1">{subtitle}</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-3">
        <FormField label="Opening cash float (₹)" required>
          <Input
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            required
            value={openingCash}
            onChange={(e) => onOpeningCashChange(e.target.value)}
          />
        </FormField>

        <FormField label={notesLabel}>
          <Textarea
            placeholder={notesPlaceholder}
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            rows={3}
          />
        </FormField>

        <Button type="submit" variant="accent" className="w-full" loading={submitting}>
          Open shift
        </Button>
      </form>
    </Card>
  </div>
);
