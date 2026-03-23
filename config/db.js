const mongoose = require("mongoose");

const url = "mongodb://127.0.0.1:27017/BioCare"; // ✅ ضع اسم قاعدة البيانات هنا

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,  // ✅ يحل مشاكل URL parsing
      useUnifiedTopology: true, // ✅ يحسن الأداء والاتصال
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;


// mongodb+srv://<db_username>:<db_password>@cluster0.wpxuopc.mongodb.net/

// const mongoose = require("mongoose");

// const url = "mongodb://127.0.0.1:27017";

// const connectDB = async () => {
//   try {
//     const conn = await mongoose.connect(url, {});

//   } catch (error) {
//     console.log(error);
//     process.exit(1);
//   }
// };

// module.exports = connectDB;
