import { defineEventHandler, fromWebHandler } from 'h3'
import { auth } from '~~/lib/auth'

export default defineEventHandler(fromWebHandler(auth.handler))
