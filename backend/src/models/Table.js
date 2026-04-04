const mongoose = require("mongoose");

const tableSchema = new mongoose.Schema(
  {
    tableId: { type: String, required: true, unique: true, index: true },
    label: { type: String, required: true, trim: true },
    status: { type: String, enum: ["Available", "Occupied", "Cleaning", "Reserved"], default: "Available" },
    assignedOrderCode: { type: String, default: null },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

module.exports = mongoose.model("Table", tableSchema);
