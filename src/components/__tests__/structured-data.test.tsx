import { render } from '@testing-library/react'
import { StructuredData } from '../structured-data'

describe('StructuredData', () => {
  it('renders organization structured data by default', () => {
    render(<StructuredData />)

    // Check if structured data scripts are rendered
    const scripts = document.querySelectorAll('script[type="application/ld+json"]')
    expect(scripts.length).toBeGreaterThan(0)

    // Parse the first script to check organization data
    const organizationData = JSON.parse(scripts[0].textContent || '{}')
    expect(organizationData['@type']).toBe('Organization')
    expect(organizationData.name).toBe('DatingAssistent')
  })

  it('renders course structured data when type is course', () => {
    const courseData = {
      title: 'Test Course',
      description: 'A test course',
      skills: ['communication', 'dating']
    }

    render(<StructuredData type="course" data={courseData} />)

    const scripts = document.querySelectorAll('script[type="application/ld+json"]')
    const courseScript = Array.from(scripts).find(script => {
      const data = JSON.parse(script.textContent || '{}')
      return data['@type'] === 'Course'
    })

    expect(courseScript).toBeTruthy()
    const courseDataParsed = JSON.parse(courseScript?.textContent || '{}')
    expect(courseDataParsed.name).toBe('Test Course')
  })

  it('renders breadcrumb structured data when breadcrumbs are provided', () => {
    const breadcrumbs = [
      { name: 'Home', url: 'https://datingassistent.nl' },
      { name: 'Courses', url: 'https://datingassistent.nl/courses' }
    ]

    render(<StructuredData breadcrumbs={breadcrumbs} />)

    const scripts = document.querySelectorAll('script[type="application/ld+json"]')
    const breadcrumbScript = Array.from(scripts).find(script => {
      const data = JSON.parse(script.textContent || '{}')
      return data['@type'] === 'BreadcrumbList'
    })

    expect(breadcrumbScript).toBeTruthy()
    const breadcrumbData = JSON.parse(breadcrumbScript?.textContent || '{}')
    expect(breadcrumbData.itemListElement).toHaveLength(2)
    expect(breadcrumbData.itemListElement[0].name).toBe('Home')
  })

  it('renders FAQ structured data when type is faq', () => {
    const faqData = {
      faqs: [
        {
          question: 'How does it work?',
          answer: 'It works by using AI to help you find dates.'
        }
      ]
    }

    render(<StructuredData type="faq" data={faqData} />)

    const scripts = document.querySelectorAll('script[type="application/ld+json"]')
    const faqScript = Array.from(scripts).find(script => {
      const data = JSON.parse(script.textContent || '{}')
      return data['@type'] === 'FAQPage'
    })

    expect(faqScript).toBeTruthy()
    const faqDataParsed = JSON.parse(faqScript?.textContent || '{}')
    expect(faqDataParsed.mainEntity).toHaveLength(1)
    expect(faqDataParsed.mainEntity[0].name).toBe('How does it work?')
  })
})