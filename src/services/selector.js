import { finder } from '@medv/finder/finder.js'

export default function selector(e, { dataAttribute, resolverAttribute, exclude } = {}) {
  let parent = e.target
  while (parent && parent.id != exclude) {
    parent = parent.parentNode
  }
  if (parent && parent.id == exclude) {
    return false
  }

  if (resolverAttribute) {
    const resolver = new Function('element', resolverAttribute)
    const ret = resolver(e.target)
    if (typeof ret == 'string') {
      return ret
    }
  }

  if (dataAttribute && e.target.getAttribute(dataAttribute)) {
    return `[${dataAttribute}="${e.target.getAttribute(dataAttribute)}"]`
  }

  if (e.target.id) {
    return `#${e.target.id}`
  }

  return finder(e.target, {
    seedMinLength: 5,
    optimizedMinLength: e.target.id ? 2 : 10,
    attr: name => name === dataAttribute,
  })
}
