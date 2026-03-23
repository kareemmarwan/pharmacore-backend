const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const path = require("path");
const { errorHandler } = require("./middleware/errorMiddleware");

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(cookieParser());

app.use(express.static(path.join(__dirname, "public")));
app.use(
    cors({
        // origin: "http://localhost:5173",
        origin: true,
        methods:['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        credentials: true,
        
    })
);
if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
}

app.use("/api/user", require("./routes/userRoutes"));
app.use("/api/products", require("./routes/Product.Routes"));
app.use("/api/categories", require("./routes/Category.Routes"));
app.use("/api/orders", require("./routes/Order.Router"));
app.use("/api/dashboard", require("./routes/Dashboard.Routes"));
app.use("/api/shipping-areas", require("./routes/ShippingArea.Controller"));



app.use(errorHandler);

module.exports = app;
