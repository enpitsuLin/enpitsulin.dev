import type { ConsolaReporter, LogObject } from 'consola'
import { createConsola, LogLevels } from 'consola/browser'

export class Reporter implements ConsolaReporter {
  log(logObj: LogObject) {
    // eslint-disable-next-line no-console
    console.log(`${logObj.date.toISOString()} ${logObj.type.toUpperCase()} ${logObj.args}`)
  }
}

export const logger = createConsola({
  level: LogLevels.info,
  defaults: {
    level: LogLevels.info,
  },
  reporters: [
    new Reporter(),
  ],
})
