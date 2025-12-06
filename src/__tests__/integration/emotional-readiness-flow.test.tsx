/**
 * Integration Tests for Emotional Readiness Assessment Flow
 *
 * This test suite validates the complete user journey from starting an assessment
 * to receiving results, ensuring all components work together correctly.
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EmotionalReadinessQuestionnaire } from '@/components/emotional-readiness/emotional-readiness-questionnaire'

// Mock the useUser hook
const mockUser = {
  id: 26,
  name: 'Test User',
  email: 'test@example.com',
  subscriptionType: 'premium' as const
}

jest.mock('@/providers/user-provider', () => ({
  useUser: () => ({
    user: mockUser
  })
}))

// Mock fetch for API calls
const mockFetch = jest.fn()
global.fetch = mockFetch

describe('Emotional Readiness Assessment Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    // Mock successful API responses
    mockFetch.mockImplementation((url: string, options?: any) => {
      if (url.includes('/api/emotionele-readiness/questions')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            questions: {
              rows: [
                {
                  id: 1,
                  question_type: 'statement',
                  question_text: 'Ik voel me emotioneel stabiel in mijn dagelijks leven',
                  category: 'emotionele_stabiliteit'
                },
                {
                  id: 2,
                  question_type: 'statement',
                  question_text: 'Ik heb duidelijke grenzen in mijn relaties',
                  category: 'grenzen_zelfzorg'
                }
              ]
            }
          })
        })
      }

      if (url.includes('/api/emotionele-readiness') && options?.method === 'POST') {
        const body = JSON.parse(options.body)

        if (body.action === 'start') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              success: true,
              assessmentId: 123
            })
          })
        }

        if (body.action === 'submit') {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              success: true,
              result: {
                id: 1,
                readiness_score: 85,
                readiness_level: 'klaar_om_te_daten',
                ai_conclusie: 'Je bent goed voorbereid voor dating!'
              },
              scores: {
                overallScore: 85,
                readinessLevel: 'klaar_om_te_daten'
              },
              aiAnalysis: {
                conclusie: 'Test conclusie',
                analyse: 'Test analyse'
              }
            })
          })
        }
      }

      return Promise.reject(new Error('Unknown API call'))
    })
  })

  it('completes full assessment flow successfully', async () => {
    const mockOnComplete = jest.fn()
    const user = userEvent.setup()

    render(<EmotionalReadinessQuestionnaire onComplete={mockOnComplete} onBack={() => {}} />)

    // Wait for questions to load
    await waitFor(() => {
      expect(screen.getByText('Voorbereiding')).toBeInTheDocument()
    })

    // Fill in micro-intake
    const relatieSelect = screen.getByRole('combobox')
    await user.click(relatieSelect)
    await user.click(screen.getByText('Minder dan 6 maanden geleden'))

    const herstelRadio = screen.getByLabelText('3')
    await user.click(herstelRadio)

    const stressRadio = screen.getByLabelText('3')
    await user.click(stressRadio)

    // Start questions
    const startButton = screen.getByText('Start Vragen')
    await user.click(startButton)

    // Wait for first question
    await waitFor(() => {
      expect(screen.getByText('Ik voel me emotioneel stabiel in mijn dagelijks leven')).toBeInTheDocument()
    })

    // Answer first question
    const firstAnswer = screen.getAllByLabelText('Eens')[0]
    await user.click(firstAnswer)

    // Answer second question
    const secondAnswer = screen.getAllByLabelText('Eens')[1]
    await user.click(secondAnswer)

    // Submit assessment
    const submitButton = screen.getByText('Resultaten')
    await user.click(submitButton)

    // Verify completion callback was called with expected data
    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          result: expect.objectContaining({
            readiness_score: 85,
            readiness_level: 'klaar_om_te_daten'
          }),
          scores: expect.objectContaining({
            overallScore: 85,
            readinessLevel: 'klaar_om_te_daten'
          })
        })
      )
    })
  })

  it('handles API errors gracefully', async () => {
    const mockOnComplete = jest.fn()
    const user = userEvent.setup()

    // Mock API failure
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    render(<EmotionalReadinessQuestionnaire onComplete={mockOnComplete} onBack={() => {}} />)

    // Wait for questions to load
    await waitFor(() => {
      expect(screen.getByText('Voorbereiding')).toBeInTheDocument()
    })

    // Fill in micro-intake and start
    const relatieSelect = screen.getByRole('combobox')
    await user.click(relatieSelect)
    await user.click(screen.getByText('Minder dan 6 maanden geleden'))

    const herstelRadio = screen.getByLabelText('3')
    await user.click(herstelRadio)

    const stressRadio = screen.getByLabelText('3')
    await user.click(stressRadio)

    const startButton = screen.getByText('Start Vragen')
    await user.click(startButton)

    // Should handle error gracefully (component should not crash)
    await waitFor(() => {
      // Component should still be rendered
      expect(screen.getByText('Voorbereiding')).toBeInTheDocument()
    })

    // onComplete should not be called
    expect(mockOnComplete).not.toHaveBeenCalled()
  })

  it('validates required fields before proceeding', async () => {
    const user = userEvent.setup()

    render(<EmotionalReadinessQuestionnaire onComplete={() => {}} onBack={() => {}} />)

    // Wait for questions to load
    await waitFor(() => {
      expect(screen.getByText('Voorbereiding')).toBeInTheDocument()
    })

    // Try to start without filling required fields
    const startButton = screen.getByText('Start Vragen')
    expect(startButton).toBeDisabled()

    // Fill in required relatie field
    const relatieSelect = screen.getByRole('combobox')
    await user.click(relatieSelect)
    await user.click(screen.getByText('Minder dan 6 maanden geleden'))

    // Button should still be disabled (needs all required fields)
    expect(startButton).toBeDisabled()

    // Fill in remaining required fields
    const herstelRadio = screen.getByLabelText('3')
    await user.click(herstelRadio)

    const stressRadio = screen.getByLabelText('3')
    await user.click(stressRadio)

    // Now button should be enabled
    expect(startButton).not.toBeDisabled()
  })

  it('allows navigation between questions', async () => {
    const user = userEvent.setup()

    render(<EmotionalReadinessQuestionnaire onComplete={() => {}} onBack={() => {}} />)

    // Fill micro-intake and start
    await waitFor(() => {
      expect(screen.getByText('Voorbereiding')).toBeInTheDocument()
    })

    const relatieSelect = screen.getByRole('combobox')
    await user.click(relatieSelect)
    await user.click(screen.getByText('Minder dan 6 maanden geleden'))

    const herstelRadio = screen.getByLabelText('3')
    await user.click(herstelRadio)

    const stressRadio = screen.getByLabelText('3')
    await user.click(stressRadio)

    const startButton = screen.getByText('Start Vragen')
    await user.click(startButton)

    // Wait for first question
    await waitFor(() => {
      expect(screen.getByText('Ik voel me emotioneel stabiel in mijn dagelijks leven')).toBeInTheDocument()
    })

    // Previous button should be disabled on first question
    const prevButton = screen.getByText('Vorige')
    expect(prevButton).toBeDisabled()

    // Answer first question and go to second
    const firstAnswer = screen.getAllByLabelText('Eens')[0]
    await user.click(firstAnswer)

    const nextButton = screen.getByText('Volgende')
    await user.click(nextButton)

    // Should be on second question now
    await waitFor(() => {
      expect(screen.getByText('Ik heb duidelijke grenzen in mijn relaties')).toBeInTheDocument()
    })

    // Previous button should now be enabled
    expect(prevButton).not.toBeDisabled()

    // Go back to first question
    await user.click(prevButton)

    // Should be back on first question
    await waitFor(() => {
      expect(screen.getByText('Ik voel me emotioneel stabiel in mijn dagelijks leven')).toBeInTheDocument()
    })
  })

  it('prevents submission without answering all questions', async () => {
    const user = userEvent.setup()

    render(<EmotionalReadinessQuestionnaire onComplete={() => {}} onBack={() => {}} />)

    // Fill micro-intake and start
    await waitFor(() => {
      expect(screen.getByText('Voorbereiding')).toBeInTheDocument()
    })

    const relatieSelect = screen.getByRole('combobox')
    await user.click(relatieSelect)
    await user.click(screen.getByText('Minder dan 6 maanden geleden'))

    const herstelRadio = screen.getByLabelText('3')
    await user.click(herstelRadio)

    const stressRadio = screen.getByLabelText('3')
    await user.click(stressRadio)

    const startButton = screen.getByText('Start Vragen')
    await user.click(startButton)

    // Wait for first question
    await waitFor(() => {
      expect(screen.getByText('Ik voel me emotioneel stabiel in mijn dagelijks leven')).toBeInTheDocument()
    })

    // Try to submit without answering questions
    const submitButton = screen.getByText('Resultaten')
    expect(submitButton).toBeDisabled()

    // Answer first question
    const firstAnswer = screen.getAllByLabelText('Eens')[0]
    await user.click(firstAnswer)

    // Still disabled (need to answer all questions)
    expect(submitButton).toBeDisabled()

    // Answer second question
    const nextButton = screen.getByText('Volgende')
    await user.click(nextButton)

    await waitFor(() => {
      expect(screen.getByText('Ik heb duidelijke grenzen in mijn relaties')).toBeInTheDocument()
    })

    const secondAnswer = screen.getAllByLabelText('Eens')[1]
    await user.click(secondAnswer)

    // Now submit button should be enabled
    expect(submitButton).not.toBeDisabled()
  })
})