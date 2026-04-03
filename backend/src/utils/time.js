function humanElapsed(dateValue, settled) {
  if (settled) {
    return "Settled";
  }

  const now = Date.now();
  const timestamp = new Date(dateValue).getTime();
  const minutes = Math.max(0, Math.floor((now - timestamp) / 60000));

  if (minutes < 1) {
    return "Now";
  }

  return `${String(minutes).padStart(2, "0")}m`;
}

module.exports = {
  humanElapsed,
};
