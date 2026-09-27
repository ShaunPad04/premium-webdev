/* The ways to pay, as the brands' own badges (2026-09-27, Brad: a Framer
 * payment-icon set, "only the ones that actually let you use").
 *
 * Only what SumUp's online checkout takes on this account: Visa, Mastercard
 * and American Express (SumUp's UK accepted cards, checked 2026-09-24 and
 * 2026-09-27), plus Apple Pay and Google Pay, which Brad confirmed work on
 * this account (SumUp enables wallets once the profile is verified). No
 * PayPal, Klarna or Maestro: the checkout does not offer them.
 *
 * The files and their licences are in public/img/pay/. */
const MARKS = [
  { file: "visa", name: "Visa" },
  { file: "mastercard", name: "Mastercard" },
  { file: "amex", name: "American Express" },
  { file: "apple-pay", name: "Apple Pay" },
  { file: "google-pay", name: "Google Pay" },
] as const;

export function PaymentMarks({ className }: { className?: string }) {
  return (
    <ul className={className ? `pay-marks ${className}` : "pay-marks"} aria-label="Ways to pay">
      {MARKS.map((m) => (
        <li key={m.file}>
          <img src={`/img/pay/${m.file}.svg`} alt={m.name} width={38} height={24} loading="lazy" decoding="async" />
        </li>
      ))}
    </ul>
  );
}
