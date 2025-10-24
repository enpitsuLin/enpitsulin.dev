import { defineEventHandler } from 'h3'
// @ts-expect-error: no types
import { toXML } from 'jstoxml'

export default defineEventHandler(async (_event) => {
  const feed = toXML(
    {
      _name: 'rss',
      _attrs: {
        version: '2.0',
      },
      _content: {
        channel: [
          {
            title: 'RSS Example',
          },
          {
            description: 'Description',
          },
          {
            link: 'google.com',
          },
          {
            lastBuildDate: () => new Date(),
          },
          {
            pubDate: () => new Date(),
          },
          {
            language: 'en',
          },
          {
            item: {
              title: 'Item title',
              link: 'Item link',
              description: 'Item Description',
              pubDate: () => new Date(),
            },
          },
          {
            item: {
              title: 'Item2 title',
              link: 'Item2 link',
              description: 'Item2 Description',
              pubDate: () => new Date(),
            },
          },
        ],
      },
    },
    {
      header: true,
      indent: '  ',
    },
  )

  return new Response(feed, {
    headers: {
      'Content-Type': 'application/xml',
    },
  })
})
