export interface Voucher {
  id: number;
  code: string;
  discountType: "FREE" | "FIXED" | "PERCENT";
  discountValue: number;
  minOrderValue?: number;
}