/** Class-name joiner.
 *
 *  The vendored components in `components/ui/` are written against shadcn's
 *  `cn`, which is clsx wrapped in tailwind-merge. This project is not a shadcn
 *  project and pulls in neither: the class strings here are all authored in
 *  this repository rather than merged from user props, so there is no
 *  conflicting-utility problem for tailwind-merge to solve and nothing for
 *  clsx's object/array syntax to express that a template literal cannot.
 *
 *  If a future component genuinely needs conditional objects or last-class-wins
 *  merging, install clsx + tailwind-merge then and swap the body — the call
 *  sites do not change. */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
