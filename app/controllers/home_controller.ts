import type { HttpContext } from '@adonisjs/core/http'
import cache from '@adonisjs/cache/services/main'

interface Person {
  name: string
  bio: string
}

interface FosdemEvent {
  id: string
  title: string
  type: string
  date: string
  start: string
  duration: string
  end: string
  room: string
  track: string
  url: string
  abstract: string
  persons: Person[]
}

export default class HomeController {
  async index({ view }: HttpContext) {
    const events = await this.fetchFosdemEvents()
    const tracks = [...new Set(events.map((e) => e.track))].sort()
    const dates = [...new Set(events.map((e) => e.date.split('T')[0]))].sort()
    return view.render('pages/home', { events, tracks, dates })
  }

  private async fetchFosdemEvents(): Promise<FosdemEvent[]> {
    return cache.getOrSet({
      key: 'fosdem-events',
      ttl: '1h',
      factory: async () => {
        console.log('Fetching fresh FOSDEM schedule')
        const response = await fetch('https://fosdem.org/2026/schedule/xml')
        const xml = await response.text()
        return this.parseEvents(xml)
      },
    })
  }

  private parseEvents(xml: string): FosdemEvent[] {
    const personsMap = this.parsePersonsDirectory(xml)
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
      const end = this.calculateEndTime(start, duration)
      const room = this.extractTag(eventXml, 'room')
      const track = this.extractTag(eventXml, 'track')
      const url = this.extractTag(eventXml, 'url')
      const abstract = this.decodeHtmlEntities(this.extractTag(eventXml, 'abstract'))
      const persons = this.extractEventPersons(eventXml, personsMap)

      events.push({
        id,
        title,
        type,
        date,
        start,
        duration,
        end,
        room,
        track,
        url,
        abstract,
        persons,
      })
    }

    return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }

  private parsePersonsDirectory(xml: string): Map<string, Person> {
    const personsMap = new Map<string, Person>()
    const topLevelPersonsMatch = xml.match(/<schedule>[\s\S]*?<persons>([\s\S]*?)<\/persons>/)

    if (!topLevelPersonsMatch) {
      return personsMap
    }

    const personsXml = topLevelPersonsMatch[1]
    const personRegex = /<person\s+id="(\d+)">([\s\S]*?)<\/person>/g
    let match

    while ((match = personRegex.exec(personsXml)) !== null) {
      const id = match[1]
      const personXml = match[2]
      const name = this.extractTag(personXml, 'name')
      const bio = this.decodeHtmlEntities(this.extractTag(personXml, 'biography'))
      personsMap.set(id, { name, bio })
    }

    return personsMap
  }

  private extractTag(xml: string, tagName: string): string {
    const regex = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`)
    const match = xml.match(regex)
    return match ? match[1].trim() : ''
  }

  private extractEventPersons(eventXml: string, personsMap: Map<string, Person>): Person[] {
    const persons: Person[] = []
    const personRegex = /<person\s+id="(\d+)">[^<]*<\/person>/g
    let match

    while ((match = personRegex.exec(eventXml)) !== null) {
      const personId = match[1]
      const person = personsMap.get(personId)
      if (person) {
        persons.push(person)
      }
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

  private calculateEndTime(start: string, duration: string): string {
    const [startHours, startMinutes] = start.split(':').map(Number)
    const [durationHours, durationMinutes] = duration.split(':').map(Number)

    let endMinutes = startMinutes + durationMinutes
    let endHours = startHours + durationHours + Math.floor(endMinutes / 60)
    endMinutes = endMinutes % 60

    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`
  }
}
