const mongoose = require("mongoose");

const orderSchema = mongoose.Schema(
  {
    orderNumber: { 
      type: String, 
      unique: true 
    },
    customerName: { type: String, required: false 
  },
    customerPhone: { type: String, required: false 
  },
    customerAddress: { type: String, required: false 
  },
    customerIdNumber: { type: String, required: false 
  },
  customerEmail: { type: String, required: false 
  },

    products: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        price: { type: Number, required: true }, 
        quantity: { type: Number, required: true },
      },
    ],

    paymentProof: { type: String },
    shippingCost: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },

    status: {
      type: String,
      enum: ["pending","assigned","accepted","onDelivery", "delivered", "cancelled"],
      default: "pending",
    },

    assignedDriver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

orderSchema.pre("save", async function (next) {
  if (!this.orderNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000); // 4 أرقام عشوائية
    this.orderNumber = `ORD-${year}-${random}`;
  }
  next();
});

module.exports = mongoose.model("Order", orderSchema);

