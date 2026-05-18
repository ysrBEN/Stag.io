const router = require("express").Router();
const authMiddleware = require("../middleware/authMiddleware");

const {
  createOffer,
  getOffers,
  getMyOffers,
  updateOffer,
  deleteOffer,
} = require("../controllers/offerController");


// ✅ Create offer (company فقط)
router.post("/", authMiddleware, createOffer);

// ✅ Get all offers (public but optional auth for skill matching)
router.get("/", (req, res, next) => {
  if (req.headers.authorization) {
    return authMiddleware(req, res, next);
  }
  next();
}, getOffers);

// 🔥 NEW: Get my offers (company فقط)
router.get("/me", authMiddleware, getMyOffers);

// 🛠 UPDATE / DELETE
router.put("/:id", authMiddleware, updateOffer);
router.delete("/:id", authMiddleware, deleteOffer);


module.exports = router;