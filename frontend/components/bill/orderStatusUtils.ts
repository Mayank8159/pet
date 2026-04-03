/**
 * Order Status Color Utilities
 * 
 * Color States:
 * - Yellow: Payment not done (paymentStatus === 'pending')
 * - Preparing: Payment done but not prepared (paymentStatus === 'paid' && preparationStatus === 'pending')
 * - Green: Both painted && paid, OR unpaid amount cleared
 */

export type OrderColorStatus = "yellow" | "preparing" | "green" | "unpaid-history";

export interface OrderStatus {
  paymentStatus: "pending" | "paid";
  preparationStatus: "pending" | "prepared";
  unpaidAmountCleared?: boolean;
  settled?: boolean;
}

export function getOrderColorStatus(order: OrderStatus): OrderColorStatus {
  // If settled, consider it green
  if (order.settled) {
    return "green";
  }

  // If unpaid amount is cleared in history, it's green
  if (order.unpaidAmountCleared) {
    return "green";
  }

  // If prepared but payment not done, special unpaid history state
  if (order.preparationStatus === "prepared" && order.paymentStatus === "pending") {
    return "unpaid-history";
  }

  // If payment not done, it's yellow
  if (order.paymentStatus === "pending") {
    return "yellow";
  }

  // If payment done but not prepared, it's in preparing stage
  if (order.preparationStatus === "pending") {
    return "preparing";
  }

  // If both paid and prepared, it's green
  return "green";
}

export function getOrderColorClasses(colorStatus: OrderColorStatus): string {
  const baseClasses = "rounded-lg border-2 transition-all duration-300 shadow-md hover:shadow-lg";

  switch (colorStatus) {
    case "yellow":
      return `${baseClasses} border-yellow-600 bg-yellow-100 dark:border-yellow-500 dark:bg-yellow-900/30`;
    case "preparing":
      return `${baseClasses} border-blue-600 bg-blue-100 dark:border-blue-500 dark:bg-blue-900/30`;
    case "green":
      return `${baseClasses} border-green-600 bg-green-100 dark:border-green-500 dark:bg-green-900/30`;
    case "unpaid-history":
      return `${baseClasses} border-orange-600 bg-orange-100 dark:border-orange-500 dark:bg-orange-900/30`;
    default:
      return baseClasses;
  }
}

export function getOrderStatusLabel(colorStatus: OrderColorStatus): string {
  switch (colorStatus) {
    case "yellow":
      return "⏳ Pending Payment";
    case "preparing":
      return "👨‍🍳 Preparing";
    case "green":
      return "✅ Ready/Completed";
    case "unpaid-history":
      return "⚠️ Prepared - Unpaid";
    default:
      return "Unknown";
  }
}

/**
 * Determines if an order should appear in each view
 */
export function shouldShowInLiveView(order: OrderStatus): boolean {
  // Show in live view if not settled
  return !(order.settled || false);
}

export function shouldShowInOrderHistory(order: OrderStatus): boolean {
  // Show in history if prepared or settled
  return order.preparationStatus === "prepared" || (order.settled || false);
}

export function shouldShowUnpaidCheckbox(order: OrderStatus): boolean {
  // Show checkbox only if prepared but not paid (unpaid history state)
  return (
    order.preparationStatus === "prepared" &&
    order.paymentStatus === "pending" &&
    !(order.settled || false)
  );
}
