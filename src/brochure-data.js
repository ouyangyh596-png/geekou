import { englishSiteContent } from './content/site-content.js'

export const brochureSeries = Object.fromEntries(
  Object.entries(englishSiteContent.categories).map(([slug, category]) => [
    slug,
    {
      displayName: category.displayName,
      eyebrow: category.eyebrow,
      intro: category.intro,
      series: category.series.map(({ name, description }) => [name, description])
    }
  ])
)
