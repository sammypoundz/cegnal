import { parseAmount } from "./server/paystack.js";

const samples = ["$50", "10$", "₦5,000", "₦15,000", "$30", "Free", "₦0", ""];
for (const s of samples) {
  console.log(JSON.stringify(s), "->", JSON.stringify(parseAmount(s)));
}
