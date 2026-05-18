require("dotenv").config();
const express = require("express");
const cors = require("cors");


const connectDB = require("./config/db");

const app = express();

// ✅ Connect DB
connectDB();

// ✅ Middlewares
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));

// ✅ Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/students", require("./routes/studentRoutes"));
app.use("/api/student", require("./routes/studentRoutes"));
app.use("/api/companies", require("./routes/companyRoutes"));
app.use("/api/company", require("./routes/companyRoutes"));
app.use("/api/offers", require("./routes/offerRoutes"));
app.use("/api/applications", require("./routes/applicationRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/ai", require("./routes/ai.routes"));

// ✅ Test route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// ✅ Port
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

