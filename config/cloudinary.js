const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: "myshop123",      // ضع هنا cloud_name الخاص بك
  api_key: "167661214692395",   // ضع هنا api_key
  api_secret: "p8emDLzAN-pJW7SmJBYonemUe34" // ضع هنا api_secret
});

module.exports = cloudinary;