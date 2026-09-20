/** What the page says before it can work.
 *
 *  The same rule as the contact form and the checkout: a missing
 *  configuration is stated plainly, to whoever is looking, rather than
 *  faked, hidden behind a spinner, or defaulted to letting everybody in.
 *
 *  Written for whoever is setting it up rather than for the shop owner,
 *  because until both of these exist she has no reason to be on this page.
 */
export function StockNotReady({
  database,
  passphrase,
}: {
  database: boolean;
  passphrase: boolean;
}) {
  return (
    <main id="main" className="st-gate">
      <div className="st-gate-box">
        <p className="st-gate-eyebrow">B Boutique</p>
        <h1 className="st-gate-h">Not set up yet</h1>
        <p className="st-gate-p">
          The stock list needs two things in the Vercel project before it can
          run. Neither is set, so nothing here is available &mdash; and nobody
          is being let in by default.
        </p>

        <ul className="st-gate-list">
          <li className={database ? "is-on" : ""}>
            <b>A database connection</b>
            <span>
              {database
                ? "Found."
                : "Not found. Add Neon Postgres to the project — it injects DATABASE_URL."}
            </span>
          </li>
          <li className={passphrase ? "is-on" : ""}>
            <b>STOCK_PASSPHRASE</b>
            <span>
              {passphrase
                ? "Set."
                : "Not set. Eight characters or more, in the project's environment variables. This is the passcode the shop uses."}
            </span>
          </li>
        </ul>

        <p className="st-gate-note">
          Both are read at request time, so setting them and redeploying is all
          that is needed. The stock tables create themselves on the first
          visit after that.
        </p>
      </div>
    </main>
  );
}
