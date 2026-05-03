export const PO_TRANSITIONS = {
  draft:              ['sent', 'cancelled'],
  sent:               ['acknowledged', 'cancelled'],
  acknowledged:       ['partially_received', 'received', 'cancelled'],
  partially_received: ['received'],
  received:           ['closed'],
  closed:             [],
  cancelled:          [],
};

export const DELIVERY_TRANSITIONS = {
  pending:   ['partial', 'completed', 'cancelled'],
  partial:   ['completed'],
  completed: [],
  cancelled: [],
};

export const INVOICE_TRANSITIONS = {
  draft:          ['sent', 'voided'],
  sent:           ['overdue', 'partially_paid', 'paid', 'voided'],
  overdue:        ['partially_paid', 'paid', 'voided'],
  partially_paid: ['paid', 'overdue', 'voided'],
  paid:           [],
  voided:         [],
};

export const validateTransition = (machine, current, next, label) => {
  const allowed = machine[current] ?? [];
  if (!allowed.includes(next)) {
    const error = new Error(`Invalid ${label} transition: ${current} → ${next}. Allowed: ${allowed.join(', ') || 'none'}`);
    error.statusCode = 400; // Adding statusCode for AppError compatibility since we can't easily import AppError here without knowing path
    error.isOperational = true;
    throw error;
  }
};
