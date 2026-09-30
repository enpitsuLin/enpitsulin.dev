/**
 * Scrollspy allows you to watch visible headings in a specific page.
 * Useful for table of contents live style updates.
 */
export function useScrollspy() {
  const visibleHeadings = shallowRef<string[]>([])
  const activeHeadings = shallowRef<string[]>([])
  const visibleElements = new Set<Element>()
  let observedHeadings = new Set<Element>()
  let observer: IntersectionObserver | undefined

  function observerCallback(entries: IntersectionObserverEntry[]) {
    for (const entry of entries) {
      if (!observedHeadings.has(entry.target))
        continue

      if (entry.isIntersecting)
        visibleElements.add(entry.target)
      else
        visibleElements.delete(entry.target)
    }

    visibleHeadings.value = [...observedHeadings]
      .filter(heading => visibleElements.has(heading))
      .map(heading => heading.id)

    if (visibleHeadings.value.length)
      activeHeadings.value = [...visibleHeadings.value]
  }

  function updateHeadings(headings: Iterable<Element>) {
    const nextHeadings = new Set([...headings].filter(heading => heading.id))
    const currentHeadings = [...observedHeadings]
    if (nextHeadings.size === observedHeadings.size
      && [...nextHeadings].every((heading, index) => heading === currentHeadings[index])) {
      return
    }

    observer?.disconnect()
    observer?.takeRecords()
    observedHeadings = nextHeadings
    visibleElements.clear()
    visibleHeadings.value = []
    activeHeadings.value = []

    observedHeadings.forEach(heading => observer?.observe(heading))
  }

  onMounted(() => {
    if (typeof IntersectionObserver === 'undefined')
      return

    observer = new IntersectionObserver(observerCallback)
    observedHeadings.forEach(heading => observer?.observe(heading))
  })

  onBeforeUnmount(() => observer?.disconnect())

  return {
    visibleHeadings,
    activeHeadings,
    updateHeadings,
  }
}
