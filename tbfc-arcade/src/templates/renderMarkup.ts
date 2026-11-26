/** Substitute trusted markup/data already prepared by a screen controller.
 * Values are not HTML-escaped; never pass untrusted user input to this helper.
 * A callback keeps $&, $1 and other replacement tokens literal in values.
 */
export function renderMarkup(template: string, values: Record<string, unknown>): string {
  return template.replace(/\n$/, '').replace(/\{\{([\w$]+)\}\}/g, (_, key: string) => {
    if (!Object.hasOwn(values, key)) throw new Error(`Missing template value: ${key}`);
    return String(values[key]);
  });
}
