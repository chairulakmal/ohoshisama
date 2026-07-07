// Display formatting for evaluation results.
//
// The engine computes in IEEE-754 doubles and returns the raw, full-precision
// number — history and any internal use keep that. This formats a number for
// *display* only, rounding to a fixed number of significant figures so that
// binary floating-point artifacts (e.g. 0.1 + 0.2 === 0.30000000000000004)
// don't surface to the user. 12 significant figures sits comfortably below the
// ~15–17 digits where double representation noise begins, while still rendering
// any genuine result faithfully — the same approach handheld and search-engine
// calculators take.
const DISPLAY_PRECISION = 12

export function formatResult(value: number): string {
  // Integers are already exact; format them verbatim. This also avoids
  // toPrecision rounding a large exact integer (e.g. 123456789012345) down to
  // 12 significant figures and corrupting it. Very large integers still fall
  // back to JS's default exponential form, as on a handheld calculator.
  if (Number.isInteger(value)) {
    // String(-0) is "0", which is what we want (no "-0" on screen).
    return String(value)
  }

  // toPrecision collapses the trailing fuzz to 12 significant figures; parseFloat
  // then drops the padding zeros ("0.300000000000" → "0.3") and re-renders the
  // shortest exact decimal. Extreme magnitudes remain in exponential notation.
  return String(parseFloat(value.toPrecision(DISPLAY_PRECISION)))
}
