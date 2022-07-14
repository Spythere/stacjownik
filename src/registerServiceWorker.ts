/* eslint-disable no-console */

import { register } from 'register-service-worker'

if (process.env.NODE_ENV === 'production') {
  register(`${process.env.BASE_URL}service-worker.js`, {
    ready () {
      console.log('SW gotowy')
    },
    registered () {
      console.log('SW: zarejestrowano')
    },
    cached () {
      console.log('SW: cached')
    },
    updatefound () {
      console.log('SW: aktualizacja danych')
    },
    updated () {
      console.log('SW: zaktualizowano dane');
    },
    offline () {
      console.log('SW: tryb offline')
    },
    error (error) {
      console.error('SW: wystąpił błąd - ', error)
    }
  })
}
