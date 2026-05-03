/**
 * Supplier Selection Algorithm
 * 
 * Computes a weighted score for each supplier mapped to a product.
 * Lower score = better supplier.
 * 
 * score = (0.5 × normalizedCost) + (0.3 × normalizedLeadTime) - (0.2 × normalizedRating)
 * 
 * Min-max normalization is applied across candidates per factor.
 * 
 * @param {Array} supplierProducts - Array of SupplierProduct docs with populated `supplier`
 * @returns {Object|null} The best SupplierProduct doc, or null if empty
 */
const selectBestSupplier = (supplierProducts) => {
  if (!supplierProducts || supplierProducts.length === 0) return null;
  if (supplierProducts.length === 1) return supplierProducts[0];

  // Filter to only active suppliers
  const active = supplierProducts.filter(sp => sp.supplier && sp.supplier.isActive);
  if (active.length === 0) return null;
  if (active.length === 1) return active[0];

  // Extract raw values
  const costs = active.map(sp => sp.unitCost);
  const leadTimes = active.map(sp => sp.leadTimeDays);
  const ratings = active.map(sp => sp.supplier.rating || 3);

  // Min-max normalizer (returns 0 if all values are equal)
  const normalize = (value, min, max) => {
    if (max === min) return 0;
    return (value - min) / (max - min);
  };

  const minCost = Math.min(...costs);
  const maxCost = Math.max(...costs);
  const minLead = Math.min(...leadTimes);
  const maxLead = Math.max(...leadTimes);
  const minRating = Math.min(...ratings);
  const maxRating = Math.max(...ratings);

  // Weights
  const COST_WEIGHT = 0.5;
  const LEAD_WEIGHT = 0.3;
  const RATING_WEIGHT = 0.2;

  let bestScore = Infinity;
  let bestSupplier = null;

  for (const sp of active) {
    const normCost = normalize(sp.unitCost, minCost, maxCost);
    const normLead = normalize(sp.leadTimeDays, minLead, maxLead);
    const normRating = normalize(sp.supplier.rating || 3, minRating, maxRating);

    const score = (COST_WEIGHT * normCost) + (LEAD_WEIGHT * normLead) - (RATING_WEIGHT * normRating);

    if (score < bestScore) {
      bestScore = score;
      bestSupplier = sp;
    }
  }

  return bestSupplier;
};

module.exports = { selectBestSupplier };
