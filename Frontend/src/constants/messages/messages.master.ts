/**
 * MASTER message template.
 *
 * Every feature declares its user-facing copy in its own `<section>.messages.ts`
 * file through `defineMessages`, and `./index.ts` merges them. Nothing else in
 * the app contains message strings.
 *
 *  - `errors`  keyed by the API's machine-readable `code` (e.g. AUTH_INVALID_CREDENTIALS)
 *  - `success` keyed by RTK Query endpoint name (e.g. login, createRole)
 *
 * The feedback middleware looks messages up here, so a new endpoint only needs
 * an entry in its section file to get a toast.
 */
export interface SectionMessages {
  errors: Record<string, string>;
  success: Record<string, string>;
}

export const defineMessages = <const T extends SectionMessages>(messages: T): T =>
  messages;

export const mergeMessages = (sections: SectionMessages[]): SectionMessages => ({
  errors: Object.assign({}, ...sections.map((section) => section.errors)),
  success: Object.assign({}, ...sections.map((section) => section.success)),
});
