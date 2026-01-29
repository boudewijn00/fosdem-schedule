import type { HttpContext } from '@adonisjs/core/http'

interface FosdemEvent {
  id: string
  title: string
  type: string
  date: string
  start: string
  duration: string
  room: string
  track: string
  url: string
  abstract: string
  persons: string[]
}

export default class HomeController {
  async index({ view }: HttpContext) {
    const events = await this.fetchFosdemEvents()
    const tracks = [...new Set(events.map((e) => e.track))].sort()
    return view.render('pages/home', { events, tracks })
  }

  private async fetchFosdemEvents(): Promise<FosdemEvent[]> {
    try {
      const response = await fetch('https://fosdem.org/2026/schedule/xml')
      const xml = await response.text()
      return this.parseEvents(xml)
    } catch (error) {
      console.error('Failed to fetch FOSDEM schedule:', error)
      return []
    }
  }

  private parseEvents(xml: string): FosdemEvent[] {
    const events: FosdemEvent[] = []
    const eventRegex = /<event[^>]*id="(\d+)"[^>]*>([\s\S]*?)<\/event>/g
    let match

    while ((match = eventRegex.exec(xml)) !== null) {
      const id = match[1]
      const eventXml = match[2]

      const type = this.extractTag(eventXml, 'type')

      if (type !== 'devroom') {
        continue
      }

      const title = this.extractTag(eventXml, 'title')
      const date = this.extractTag(eventXml, 'date')
      const start = this.extractTag(eventXml, 'start')
      const duration = this.extractTag(eventXml, 'duration')
      const room = this.extractTag(eventXml, 'room')
      const track = this.extractTag(eventXml, 'track')
      const url = this.extractTag(eventXml, 'url')
      const abstract = this.decodeHtmlEntities(this.extractTag(eventXml, 'abstract'))
      const persons = this.extractPersons(eventXml)

      events.push({
        id,
        title,
        type,
        date,
        start,
        duration,
        room,
        track,
        url,
        abstract,
        persons,
      })
    }

    return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }

  private extractTag(xml: string, tagName: string): string {
    const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`)
    const match = xml.match(regex)
    return match ? match[1].trim() : ''
  }

  private extractPersons(xml: string): string[] {
    const persons: string[] = []
    const personRegex = /<person[^>]*>([^<]+)<\/person>/g
    let match

    while ((match = personRegex.exec(xml)) !== null) {
      persons.push(match[1].trim())
    }

    return persons
  }

  private decodeHtmlEntities(text: string): string {
    return text
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/<[^>]*>/g, '') // Strip HTML tags for clean display
  }
}
