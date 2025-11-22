import { createEntry } from './main'
import '@unocss/reset/tailwind.css'
import 'uno.css'
import './styles/main.css'

createEntry()
  .catch((error: unknown) => {
    console.error('Error while mounting app:', error)
  })
