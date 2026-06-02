/**
 * layout route 부모가 자식 Route `handle.layoutMeta`로 읽습니다.
 * @typedef {object} LayoutMeta
 * @property {string} [contentClassName]
 * @property {{ label: string, to?: string }[]} [breadcrumbItems]
 */

/**
 * @param {import('react-router-dom').UIMatch[]} matches
 * @returns {LayoutMeta}
 */
export function layoutMetaFromMatches(matches) {
  for (let i = matches.length - 1; i >= 0; i -= 1) {
    const meta = matches[i]?.handle?.layoutMeta
    if (meta && typeof meta === 'object') {
      return /** @type {LayoutMeta} */ (meta)
    }
  }
  return {}
}
