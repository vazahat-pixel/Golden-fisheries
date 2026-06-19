export function unwrapBuyers(res) {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.docs)) return res.docs;
  return [];
}

export function emptyBuyerForm() {
  return {
    buyerName: '',
    phone: '',
    buyerType: 'EXTERNAL',
    deliveryAddress: '',
  };
}

export function buyerToForm(buyer = {}) {
  return {
    buyerName: buyer.buyerName || buyer.name || '',
    phone: String(buyer.phone || '').replace(/\D/g, '').slice(0, 10),
    buyerType: buyer.buyerType || 'EXTERNAL',
    deliveryAddress: buyer.deliveryAddress || buyer.address || '',
  };
}

export function toBuyerPayload(form) {
  return {
    buyerName: String(form.buyerName || '').trim().toUpperCase(),
    phone: String(form.phone || '').trim(),
    buyerType: form.buyerType || 'EXTERNAL',
    deliveryAddress: String(form.deliveryAddress || '').trim().toUpperCase(),
  };
}

export function buyerLabel(buyer) {
  const name = (buyer?.buyerName || buyer?.name || 'Buyer').toUpperCase();
  const phone = buyer?.phone || '';
  return phone ? `${name} — ${phone}` : name;
}
