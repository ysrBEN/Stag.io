const router = require("express").Router();
const { register, login, googleAuth, googleRegister, forgotPassword, verifyResetCode, resetPassword } = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.post("/google", googleAuth);
router.post("/google-register", googleRegister);

router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-code", verifyResetCode);
router.post("/reset-password", resetPassword);

module.exports = router;