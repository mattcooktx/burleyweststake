import { parse } from 'yaml'
import yamlText from '../content/site.yaml?raw'

export type ResourceIcon = 'calendar' | 'book' | 'video' | 'layers' | 'briefcase' | 'map-pin'

export interface Site {
  brand: { pre: string; name: string; short_name: string }
  description: string
  social: { facebook: string; instagram: string }
  office: { address_line_1: string; address_line_2: string; email: string }
  presidency: Array<{ name: string; role: string }>
  wards: Array<{ name: string; url: string }>
  resources: Array<{ name: string; description: string; url: string; icon: ResourceIcon }>
}

export const site: Site = parse(yamlText) as Site
