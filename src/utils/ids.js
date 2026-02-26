/**
 * Generate unique IDs with a prefix
 * Format: prefix_timestamp_random (e.g., w_1706457600000_a3f)
 */
export function generateId(prefix = 'id') {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 5);
  return `${prefix}_${timestamp}_${random}`;
}
