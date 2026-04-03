const Table = require("../models/Table");

const defaultTables = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8"].map((id) => ({
  tableId: id,
  label: id,
  status: "Available",
  assignedOrderCode: null,
}));

async function seedTablesIfEmpty() {
  const count = await Table.countDocuments();
  if (count > 0) {
    return;
  }

  await Table.insertMany(defaultTables);
}

module.exports = {
  seedTablesIfEmpty,
};
