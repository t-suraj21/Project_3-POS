<?php
/**
 * BillingHelper
 *
 * Utility class for generating numeric-only billing numbers
 */
class BillingHelper
{
    /**
     * Generate a numeric-only billing number
     * Format: YYYYMMDDXXXXXX (14 digits total)
     * Example: 20260322000001
     *
     * @param PDO $conn Database connection
     * @param int $shopId Shop ID
     * @return string Numeric billing number
     */
    public static function generateBillNumber(PDO $conn, int $shopId): string
    {
        // Get current date in YYYYMMDD format
        $datePrefix = date('Ymd');

        // Get the count of sales for today for this shop
        $stmt = $conn->prepare("
            SELECT COUNT(*)
            FROM sales
            WHERE shop_id = ?
            AND DATE(created_at) = CURDATE()
        ");
        $stmt->execute([$shopId]);
        $todayCount = (int) $stmt->fetchColumn();

        // Increment for next bill number
        $serialNumber = $todayCount + 1;

        // Pad to 6 digits (supports up to 999,999 bills per day)
        $serialPadded = str_pad($serialNumber, 6, '0', STR_PAD_LEFT);

        // Combine: YYYYMMDD + XXXXXX
        $billNumber = $datePrefix . $serialPadded;

        // Safety check: ensure this bill number doesn't already exist
        // (handles race conditions in concurrent requests)
        $checkStmt = $conn->prepare("SELECT id FROM sales WHERE bill_number = ?");
        $checkStmt->execute([$billNumber]);

        if ($checkStmt->fetch()) {
            // If exists (rare case), try again with next number
            $serialNumber++;
            $serialPadded = str_pad($serialNumber, 6, '0', STR_PAD_LEFT);
            $billNumber = $datePrefix . $serialPadded;
        }

        return $billNumber;
    }
}
?>
