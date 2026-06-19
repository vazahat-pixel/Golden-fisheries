/**
 * Recomputes harvest-level money fields from line items + deduction inputs.
 * Call on every saveNetRate so client-supplied totals cannot be trusted alone.
 */
export function recalculateHarvestNetRate(harvestDoc, body = {}) {
  let gross = 0;
  const products = harvestDoc.products || [];
  for (const p of products) {
    const q = parseFloat(p.estimatedQty) || 0;
    const r = parseFloat(p.rate) || 0;
    gross += q * r;
  }
  gross = Math.round(gross * 100) / 100;

  const deductionTransport = parseFloat(body.deductionTransport ?? harvestDoc.deductionTransport) || 0;
  const deductionCommission = parseFloat(body.deductionCommission ?? harvestDoc.deductionCommission) || 0;
  const deductionSoft = parseFloat(body.deductionSoft ?? harvestDoc.deductionSoft) || 0;
  const deductionOther = parseFloat(body.deductionOther ?? harvestDoc.deductionOther) || 0;
  const tds = parseFloat(body.tds ?? harvestDoc.tds) || 0;
  const commission = parseFloat(body.commission ?? harvestDoc.commission) || 0;
  const soft = parseFloat(body.soft ?? harvestDoc.soft) || 0;

  const totalDeductions = Math.round(
    (tds + deductionTransport + deductionCommission + deductionSoft + deductionOther) * 100
  ) / 100;

  const totalPayableAmount = Math.max(
    0,
    Math.round((gross - totalDeductions + commission + soft) * 100) / 100
  );

  return {
    netRateCalculated: gross,
    totalDeductions,
    totalPayableAmount,
    commissionAddition: commission,
    loadingAddition: soft,
    deductionTransport,
    deductionCommission,
    deductionSoft,
    deductionOther,
    tds,
    commission,
    soft,
    finalNetRate: totalPayableAmount
  };
}
