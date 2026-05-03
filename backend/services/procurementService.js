const SupplierPerformanceLog = require('../models/SupplierPerformanceLog');
const Supplier = require('../models/Supplier');
const PurchaseOrder = require('../models/PurchaseOrder');
const SupplierDelivery = require('../models/SupplierDelivery');
const SupplierInvoice = require('../models/SupplierInvoice');

// ─── 1. SUPPLIER SCORING SYSTEM ───
exports.recalculateSupplierScore = async (supplierId) => {
  const logs = await SupplierPerformanceLog.find({ supplier: supplierId });
  if (!logs.length) return;

  let totalOnTime = 0, totalFillRate = 0, totalRejection = 0, totalInvoiceAcc = 0, totalDisputes = 0;
  let onTimeCount = 0, invoiceCount = 0;

  logs.forEach(log => {
    if (log.onTimeDelivery !== null) {
      totalOnTime += log.onTimeDelivery ? 1 : 0;
      onTimeCount++;
    }
    totalFillRate += log.fillRate || 0;
    totalRejection += log.rejectionRate || 0;
    if (log.invoiceAccuracy !== null) {
      totalInvoiceAcc += log.invoiceAccuracy ? 1 : 0;
      invoiceCount++;
    }
    totalDisputes += log.disputeOccurred ? 1 : 0;
  });

  const avgOnTime = onTimeCount ? totalOnTime / onTimeCount : 1;
  const avgFillRate = totalFillRate / logs.length;
  const avgRejection = totalRejection / logs.length;
  const avgInvoiceAcc = invoiceCount ? totalInvoiceAcc / invoiceCount : 1;
  const avgDisputes = totalDisputes / logs.length;

  // Score = 0.30 × OnTimeDelivery + 0.25 × FillRate + 0.20 × InvoiceAccuracy + 0.15 × (1 - RejectionRate) + 0.10 × (1 - DisputeRate)
  const score = (
    0.30 * avgOnTime +
    0.25 * Math.min(avgFillRate, 1) +
    0.20 * avgInvoiceAcc +
    0.15 * Math.max(0, 1 - avgRejection) +
    0.10 * Math.max(0, 1 - avgDisputes)
  ) * 100;

  await Supplier.findByIdAndUpdate(supplierId, {
    performanceScore: Math.round(score),
    scoreDetails: {
      onTimeDelivery: avgOnTime,
      fillRate: avgFillRate,
      invoiceAccuracy: avgInvoiceAcc,
      rejectionRate: avgRejection,
      disputeRate: avgDisputes
    }
  });
};

// ─── 2. PERFORMANCE TRACKING ───
exports.logSupplierPerformance = async (deliveryId) => {
  const delivery = await SupplierDelivery.findById(deliveryId).populate('purchaseOrder');
  if (!delivery || !delivery.purchaseOrder) return;
  const po = delivery.purchaseOrder;

  const expectedDate = po.expectedDeliveryDate ? new Date(po.expectedDeliveryDate).setHours(0,0,0,0) : null;
  const deliveryDate = new Date(delivery.deliveryDate || delivery.createdAt).setHours(0,0,0,0);
  
  let onTime = null;
  if (expectedDate) {
    onTime = deliveryDate <= expectedDate;
  }

  let totalExpected = 0, totalReceived = 0, totalRejected = 0;
  delivery.deliveredItems.forEach(item => {
    totalExpected += item.expectedQty || 0;
    totalReceived += item.receivedQty || 0;
    totalRejected += item.rejectedQty || 0;
  });

  // Calculate fallbacks to avoid NaN
  if (totalExpected === 0) {
      po.items.forEach(poItem => {
         const di = delivery.deliveredItems.find(i => i.product.toString() === poItem.product.toString() );
         if(di) totalExpected += poItem.orderedQty;
      })
  }

  const fillRate = totalExpected > 0 ? (totalReceived / totalExpected) : 1;
  const rejectionRate = totalReceived > 0 ? (totalRejected / totalReceived) : 0;
  const disputeOccurred = ['disputed', 'UNDER_REVIEW', 'OPEN'].includes(delivery.status) || delivery.disputeStatus !== 'NONE';

  // Find existing log to prevent duplicates for same delivery
  let log = await SupplierPerformanceLog.findOne({ delivery: delivery._id });
  if (!log) {
    log = new SupplierPerformanceLog({
      supplier: delivery.supplier,
      purchaseOrder: po._id,
      delivery: delivery._id,
    });
  }

  log.onTimeDelivery = onTime;
  log.fillRate = fillRate;
  log.rejectionRate = rejectionRate;
  log.disputeOccurred = disputeOccurred;
  await log.save();

  await this.recalculateSupplierScore(delivery.supplier);
};


// ─── 3. THREE-WAY VALIDATION ───
exports.threeWayMatchInvoice = async (invoiceId) => {
  const invoice = await SupplierInvoice.findById(invoiceId).populate('purchaseOrder');
  if (!invoice || !invoice.purchaseOrder) throw new Error("Invalid Invoice or missing PO via populated reference");

  const po = invoice.purchaseOrder;
  const deliveries = await SupplierDelivery.find({ purchaseOrder: po._id });
  
  // Calculate value of received goods
  let actualDeliveredValue = 0;
  deliveries.forEach(del => {
    del.deliveredItems.forEach(dItem => {
        const poItem = po.items.find(i => i.product.toString() === dItem.product.toString());
        if(poItem) {
           actualDeliveredValue += (dItem.receivedQty - (dItem.rejectedQty || 0)) * poItem.unitCost;
        }
    });
  });

  // Tolerance +/- 2%
  const tolerance = 0.02;
  const minAllowed = actualDeliveredValue * (1 - tolerance);
  const maxAllowed = actualDeliveredValue * (1 + tolerance);

  // Consider taxes and shipping if encoded on the invoice side, but for basic 3-way:
  // comparing item-net value vs invoice total base value.
  // We'll compare against invoice amount minus tax to keep logic accurate.
  const baseInvoiceAmt = invoice.totalAmount - (invoice.taxAmount || 0);

  const matched = (baseInvoiceAmt >= minAllowed && baseInvoiceAmt <= maxAllowed);

  invoice.invoiceStatus = matched ? 'MATCHED' : 'MATCH_FAILED';
  await invoice.save();

  // Update Log
  if(deliveries.length > 0) {
    const log = await SupplierPerformanceLog.findOne({ delivery: deliveries[0]._id });
    if(log){
       log.invoiceAccuracy = matched;
       await log.save();
       await this.recalculateSupplierScore(invoice.supplier);
    }
  }

  return matched;
};

// ─── 4. RECORD DISPUTE ───
exports.recordDispute = async (deliveryId, status, action, notes) => {
    const delivery = await SupplierDelivery.findById(deliveryId);
    if(!delivery) throw new Error("Delivery not found");

    delivery.disputeStatus = status;
    delivery.resolutionAction = action;
    delivery.resolutionNotes = notes;
    if(status === 'OPEN' || status === 'UNDER_REVIEW') {
       delivery.status = 'disputed';
    }
    await delivery.save();

    await this.logSupplierPerformance(delivery._id);
    return delivery;
}
