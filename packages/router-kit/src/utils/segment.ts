export type SubSegment = string | TreePathParam

export interface TreePathParam {
  paramName: string
  modifier: string
  optional: boolean
  repeatable: boolean
  isSplat: boolean
  parser: string | null
}

/**
 * To escape regex characters in the path segment.
 * @internal
 */
const REGEX_CHARS_RE = /[.+*?^${}()[\]/\\]/g

/**
 * Escapes regex characters in a string to be used in a regex pattern.
 * @param str - The string to escape.
 *
 * @internal
 */
export function escapeRegex(str: string): string {
  return str.replace(REGEX_CHARS_RE, '\\$&')
}

// eslint-disable-next-line no-restricted-syntax
const enum ParseSegmentState {
  static,
  paramOptional, // within [[]] or []
  param, // within []
  paramParser, // [param=type]
  modifier, // after the ]
}

const IS_VARIABLE_CHAR_RE = /\w/

/**
 * Parses a segment into the route path segment and the extracted params.
 *
 * @param segment - segment to parse without the extension
 * @returns - the pathSegment and the params
 */
export function parseSegment(
  segment: string,
): [string, TreePathParam[], SubSegment[]] {
  let buffer = ''
  let paramParserBuffer = ''
  let state: ParseSegmentState = ParseSegmentState.static
  const params: TreePathParam[] = []
  let pathSegment = ''
  const subSegments: SubSegment[] = []
  let currentTreeRouteParam: TreePathParam = createEmptyRouteParam()

  // position in segment
  let pos = 0
  // current char
  let c: string

  function consumeBuffer() {
    if (state === ParseSegmentState.static) {
      // add the buffer to the path segment as is
      pathSegment += buffer
      subSegments.push(buffer)
    }
    else if (state === ParseSegmentState.modifier) {
      currentTreeRouteParam.paramName = buffer
      currentTreeRouteParam.parser = paramParserBuffer || null
      currentTreeRouteParam.modifier = currentTreeRouteParam.optional
        ? currentTreeRouteParam.repeatable
          ? '*'
          : '?'
        : currentTreeRouteParam.repeatable
          ? '+'
          : ''

      // reset the buffers
      buffer = ''
      paramParserBuffer = ''

      pathSegment += `:${currentTreeRouteParam.paramName}${
        currentTreeRouteParam.isSplat
          ? '(.*)'
          : pos < segment.length - 1 // Only append () if necessary
            && IS_VARIABLE_CHAR_RE.test(segment[pos + 1]!)
            ? '()'
            : '' // allow routes like /[id]_suffix to make suffix static and not part of the param
      }${currentTreeRouteParam.modifier}`
      params.push(currentTreeRouteParam)
      subSegments.push(currentTreeRouteParam)
      currentTreeRouteParam = createEmptyRouteParam()
    }
    buffer = ''
  }

  for (pos = 0; pos < segment.length; pos++) {
    c = segment[pos]!

    if (state === ParseSegmentState.static) {
      if (c === '[') {
        // avoid adding the leading empty string for segments that start with a param
        if (buffer) {
          consumeBuffer()
        }
        // check if it's an optional param or not
        state = ParseSegmentState.paramOptional
      }
      else {
        // append the char to the buffer or transform into a slash
        buffer += c === '.' ? '/' : c
      }
    }
    else if (state === ParseSegmentState.paramOptional) {
      if (c === '[') {
        currentTreeRouteParam.optional = true
      }
      else if (c === '.') {
        currentTreeRouteParam.isSplat = true
        pos += 2 // skip the other 2 dots
      }
      else {
        // keep it for the param
        buffer += c
      }
      state = ParseSegmentState.param
    }
    else if (state === ParseSegmentState.param) {
      if (c === ']') {
        if (currentTreeRouteParam.optional) {
          // skip the next ]
          pos++
        }
        state = ParseSegmentState.modifier
      }
      else if (c === '.') {
        currentTreeRouteParam.isSplat = true
        pos += 2 // skip the other 2 dots
      }
      else if (c === '=') {
        state = ParseSegmentState.paramParser
        paramParserBuffer = ''
      }
      else {
        buffer += c
      }
    }
    else if (state === ParseSegmentState.modifier) {
      if (c === '+') {
        currentTreeRouteParam.repeatable = true
      }
      else {
        // parse this character again
        pos--
      }
      consumeBuffer()
      // start again
      state = ParseSegmentState.static
    }
    else if (state === ParseSegmentState.paramParser) {
      if (c === ']') {
        if (currentTreeRouteParam.optional) {
          // skip the next ]
          pos++
        }
        state = ParseSegmentState.modifier
      }
      else {
        paramParserBuffer += c
      }
    }
  }

  if (
    state === ParseSegmentState.param
    || state === ParseSegmentState.paramOptional
    || state === ParseSegmentState.paramParser
  ) {
    throw new Error(`Invalid segment: "${segment}"`)
  }

  if (buffer) {
    consumeBuffer()
  }

  return [pathSegment, params, subSegments]
}

/**
 * Helper function to create an empty route param used by the parser.
 *
 * @returns an empty route param
 */
function createEmptyRouteParam(): TreePathParam {
  return {
    paramName: '',
    parser: null,
    modifier: '',
    optional: false,
    repeatable: false,
    isSplat: false,
  }
}
