import { Feed } from 'feed'
import { defineEventHandler } from 'h3'

export default defineEventHandler((_event) => {
  const feed = new Feed({
    title: 'Feed Title',
    description: 'This is my personal feed!',
    id: 'http://example.com/',
    link: 'http://example.com/',
    language: 'en', // optional, used only in RSS 2.0, possible values: http://www.w3.org/TR/REC-html40/struct/dirlang.html#langcodes
    image: 'http://example.com/image.png',
    favicon: 'http://example.com/favicon.ico',
    copyright: 'All rights reserved 2013, John Doe',
    updated: new Date(2013, 6, 14), // optional, default = today
    generator: 'awesome', // optional, default = 'Feed for Node.js'
    feedLinks: {
      json: 'https://example.com/json',
      atom: 'https://example.com/atom',
    },
    author: {
      name: 'John Doe',
      email: 'johndoe@example.com',
      link: 'https://example.com/johndoe',
    },
  })

  feed.addCategory('Technologie')

  feed.addContributor({
    name: 'Johan Cruyff',
    email: 'johancruyff@example.com',
    link: 'https://example.com/johancruyff',
  })
  return new Response(feed.rss2(), {
    headers: {
      'Content-Type': 'application/xml',
    },
  })
})
