const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();

const inventoryController = require('../controllers/inventoryController');
const { protect, authorize } = require('../middlewares/auth'); // Use only the function you need

// ----------------------
// Helper middleware for validation results
// ----------------------
const validate = (req, res, next) => {
  const errors = validationResult(req);
  console.log('errors: ',errors);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// ----------------------
// Inventory Summary & List
// ----------------------
router.get('/summary', protect, inventoryController.getInventorySummary);
router.get('/low-stock', protect, inventoryController.getLowStockProducts);
router.get('/', protect, inventoryController.getInventories);

// ----------------------
// Supplier-scoped Inventory (used by supplier dashboard)
// ----------------------
router.get('/supplier/summary', protect, authorize('supplier','admin','staff'), inventoryController.getSupplierInventorySummary);
router.get('/supplier/low-stock', protect, authorize('supplier','admin','staff'), inventoryController.getSupplierLowStockProducts);
router.get('/supplier', protect, authorize('supplier','admin','staff'), inventoryController.getSupplierInventories);

// ----------------------
// Stock Movements
// Must come before /item/:id to avoid conflicts
// ----------------------
router.get('/item/:id/movements', protect, inventoryController.getStockMovements);
router.get('/supplier/movements', protect, inventoryController.getSupplierStockMovements);

// ----------------------
// Single Inventory
// ----------------------
router.get('/item/:id', protect, inventoryController.getInventory);

// ----------------------
// Stock Operations
// ----------------------
router.post(
  '/supplier/:productId/add-stock',
  protect,
  authorize('supplier','admin','staff'),
  [
    body('quantity').isInt({ min: 1 }),
    body('reason').notEmpty()
  ],
  validate,
  inventoryController.addStock
);

router.post(
  '/supplier/:productId/remove-stock',
  protect,
  authorize('supplier','admin','staff'),
  [
    body('quantity').isInt({ min: 1 }),
    body('reason').notEmpty()
  ],
  validate,
  inventoryController.removeStock
);

router.post(
  '/supplier/:productId/adjust-stock',
  protect,
  authorize('supplier','admin','staff'),
  [
    body('newQuantity').isInt({ min: 0 }),
    body('reason').notEmpty()
  ],
  validate,
  inventoryController.adjustStock
);

// ----------------------
// Inventory Settings Update
// ----------------------
router.put(
  '/:id/settings',
  protect,
  authorize('supplier','admin','staff'),
  [
    body('minStockLevel').optional().isInt({ min: 0 }),
    body('maxStockLevel').optional().isInt({ min: 0 }),
    body('reorderPoint').optional().isInt({ min: 0 }),
    body('reorderQuantity').optional().isInt({ min: 0 })
  ],
  validate,
  inventoryController.updateInventorySettings
);

// ----------------------
// Reserve / Release Stock
// ----------------------
router.post(
  '/:productId/reserve-stock',
  protect,
  authorize('supplier','admin','staff'),
  [body('quantity').isInt({ min: 1 })],
  validate,
  inventoryController.reserveStock
);

router.post(
  '/:productId/release-stock',
  protect,
  authorize('supplier','admin','staff'),
  [body('quantity').isInt({ min: 1 })],
  validate,
  inventoryController.releaseReservedStock
);

router.delete(
  '/delete/:id',
  protect,
  authorize('supplier','admin','staff'),
  inventoryController.deleteStock
)

module.exports = router;
