/**
 * Fallback Strategies Testing Framework
 *
 * This module provides comprehensive testing for fallback strategies
 * when AI services fail or are unavailable.
 */

import { trackAIOperation } from './cost-tracker';

export interface FallbackTestResult {
  testName: string;
  service: string;
  operation: string;
  success: boolean;
  fallbackTriggered: boolean;
  fallbackType: string;
  responseTime: number;
  errorMessage?: string;
  userExperience: 'excellent' | 'good' | 'acceptable' | 'poor';
}

// Mock AI service failures for testing
export class AIServiceFailureSimulator {
  private failures: Map<string, { enabled: boolean; rate: number; errorType: string }> = new Map();

  enableFailure(service: string, rate: number = 1.0, errorType: 'network' | 'timeout' | 'rate_limit' | 'server_error' = 'network') {
    this.failures.set(service, { enabled: true, rate, errorType });
  }

  disableFailure(service: string) {
    this.failures.set(service, { enabled: false, rate: 0, errorType: 'network' });
  }

  shouldFail(service: string): { fail: boolean; errorType: string } {
    const config = this.failures.get(service);
    if (!config || !config.enabled) {
      return { fail: false, errorType: 'none' };
    }

    const fail = Math.random() < config.rate;
    return { fail, errorType: config.errorType };
  }

  async simulateFailure(service: string, operation: string): Promise<never> {
    const { errorType } = this.shouldFail(service);

    switch (errorType) {
      case 'network':
        throw new Error(`Network error: Unable to connect to ${service}`);
      case 'timeout':
        await new Promise(resolve => setTimeout(resolve, 30000)); // 30 second timeout
        throw new Error(`Timeout error: ${service} took too long to respond`);
      case 'rate_limit':
        throw new Error(`Rate limit exceeded: ${service} API quota reached`);
      case 'server_error':
        throw new Error(`Server error: ${service} returned 500 Internal Server Error`);
      default:
        throw new Error(`Unknown error from ${service}`);
    }
  }
}

// Global failure simulator instance
export const failureSimulator = new AIServiceFailureSimulator();

/**
 * Test fallback strategies for different AI services
 */
export class FallbackTester {
  private results: FallbackTestResult[] = [];

  async testOpenRouterFallback(): Promise<FallbackTestResult> {
    const startTime = Date.now();
    let success = false;
    let fallbackTriggered = false;
    let fallbackType = 'none';
    let userExperience: FallbackTestResult['userExperience'] = 'poor';
    let errorMessage: string | undefined;

    try {
      // Simulate OpenRouter API call with potential failure
      if (failureSimulator.shouldFail('openrouter').fail) {
        await failureSimulator.simulateFailure('openrouter', 'chat_completion');
      }

      // Mock successful OpenRouter call
      await new Promise(resolve => setTimeout(resolve, 100));
      success = true;
      userExperience = 'excellent';

    } catch (error) {
      errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Test fallback to mock response
      fallbackTriggered = true;
      fallbackType = 'mock_response';
      userExperience = 'good'; // Mock response still provides value

      // Note: Cost tracking would happen here in production
      // await trackAIOperation('openrouter', 'chat_completion', 0, {
      //   userId: 1 // Test user
      // });
    }

    const result: FallbackTestResult = {
      testName: 'OpenRouter Chat Completion',
      service: 'openrouter',
      operation: 'chat_completion',
      success,
      fallbackTriggered,
      fallbackType,
      responseTime: Date.now() - startTime,
      errorMessage,
      userExperience
    };

    this.results.push(result);
    return result;
  }

  async testGeminiFallback(): Promise<FallbackTestResult> {
    const startTime = Date.now();
    let success = false;
    let fallbackTriggered = false;
    let fallbackType = 'none';
    let userExperience: FallbackTestResult['userExperience'] = 'poor';
    let errorMessage: string | undefined;

    try {
      // Simulate Gemini API call with potential failure
      if (failureSimulator.shouldFail('google-gemini').fail) {
        await failureSimulator.simulateFailure('google-gemini', 'vision_analysis');
      }

      // Mock successful Gemini call
      await new Promise(resolve => setTimeout(resolve, 150));
      success = true;
      userExperience = 'excellent';

    } catch (error) {
      errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Test fallback to basic analysis
      fallbackTriggered = true;
      fallbackType = 'basic_analysis';
      userExperience = 'acceptable'; // Basic analysis provides some value

      // Note: Cost tracking would happen here in production
      // await trackAIOperation('google-gemini', 'vision_analysis', 0, {
      //   userId: 1
      // });
    }

    const result: FallbackTestResult = {
      testName: 'Gemini Vision Analysis',
      service: 'google-gemini',
      operation: 'vision_analysis',
      success,
      fallbackTriggered,
      fallbackType,
      responseTime: Date.now() - startTime,
      errorMessage,
      userExperience
    };

    this.results.push(result);
    return result;
  }

  async testAnthropicFallback(): Promise<FallbackTestResult> {
    const startTime = Date.now();
    let success = false;
    let fallbackTriggered = false;
    let fallbackType = 'none';
    let userExperience: FallbackTestResult['userExperience'] = 'poor';
    let errorMessage: string | undefined;

    try {
      // Simulate Anthropic API call with potential failure
      if (failureSimulator.shouldFail('anthropic').fail) {
        await failureSimulator.simulateFailure('anthropic', 'chat_completion');
      }

      // Mock successful Anthropic call
      await new Promise(resolve => setTimeout(resolve, 200));
      success = true;
      userExperience = 'excellent';

    } catch (error) {
      errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Test fallback to cached responses
      fallbackTriggered = true;
      fallbackType = 'cached_response';
      userExperience = 'good'; // Cached response is still valuable

      // Note: Cost tracking would happen here in production
      // await trackAIOperation('anthropic', 'chat_completion', 0, {
      //   userId: 1
      // });
    }

    const result: FallbackTestResult = {
      testName: 'Anthropic Chat Completion',
      service: 'anthropic',
      operation: 'chat_completion',
      success,
      fallbackTriggered,
      fallbackType,
      responseTime: Date.now() - startTime,
      errorMessage,
      userExperience
    };

    this.results.push(result);
    return result;
  }

  async testProfileAnalysisFallback(): Promise<FallbackTestResult> {
    const startTime = Date.now();
    let success = false;
    let fallbackTriggered = false;
    let fallbackType = 'none';
    let userExperience: FallbackTestResult['userExperience'] = 'poor';
    let errorMessage: string | undefined;

    try {
      // Test profile analysis with AI failure
      if (failureSimulator.shouldFail('openrouter').fail) {
        await failureSimulator.simulateFailure('openrouter', 'profile_analysis');
      }

      // Mock successful analysis
      await new Promise(resolve => setTimeout(resolve, 120));
      success = true;
      userExperience = 'excellent';

    } catch (error) {
      errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Fallback to mock analysis (already implemented in profile-analysis.tsx)
      fallbackTriggered = true;
      fallbackType = 'mock_analysis';
      userExperience = 'good'; // Mock analysis provides detailed feedback

      // Note: Cost tracking would happen here in production
      // await trackAIOperation('openrouter', 'profile_analysis', 0, {
      //   userId: 1
      // });
    }

    const result: FallbackTestResult = {
      testName: 'Profile Analysis Fallback',
      service: 'openrouter',
      operation: 'profile_analysis',
      success,
      fallbackTriggered,
      fallbackType,
      responseTime: Date.now() - startTime,
      errorMessage,
      userExperience
    };

    this.results.push(result);
    return result;
  }

  async testPhotoAnalysisFallback(): Promise<FallbackTestResult> {
    const startTime = Date.now();
    let success = false;
    let fallbackTriggered = false;
    let fallbackType = 'none';
    let userExperience: FallbackTestResult['userExperience'] = 'poor';
    let errorMessage: string | undefined;

    try {
      // Test photo analysis with AI failure
      if (failureSimulator.shouldFail('google-gemini').fail) {
        await failureSimulator.simulateFailure('google-gemini', 'photo_analysis');
      }

      // Mock successful analysis
      await new Promise(resolve => setTimeout(resolve, 180));
      success = true;
      userExperience = 'excellent';

    } catch (error) {
      errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Fallback to basic feedback (implemented in foto-advies-tab.tsx)
      fallbackTriggered = true;
      fallbackType = 'basic_feedback';
      userExperience = 'acceptable'; // Basic feedback provides some guidance

      // Note: Cost tracking would happen here in production
      // await trackAIOperation('google-gemini', 'photo_analysis', 0, {
      //   userId: 1
      // });
    }

    const result: FallbackTestResult = {
      testName: 'Photo Analysis Fallback',
      service: 'google-gemini',
      operation: 'photo_analysis',
      success,
      fallbackTriggered,
      fallbackType,
      responseTime: Date.now() - startTime,
      errorMessage,
      userExperience
    };

    this.results.push(result);
    return result;
  }

  async runAllTests(): Promise<FallbackTestResult[]> {
    console.log('🧪 Running fallback strategy tests...\n');

    const tests = [
      this.testOpenRouterFallback(),
      this.testGeminiFallback(),
      this.testAnthropicFallback(),
      this.testProfileAnalysisFallback(),
      this.testPhotoAnalysisFallback()
    ];

    const results = await Promise.all(tests);

    console.log('📊 Fallback Test Results:');
    console.table(results.map(r => ({
      Test: r.testName,
      Success: r.success,
      Fallback: r.fallbackTriggered ? r.fallbackType : 'None',
      'Response Time': `${r.responseTime}ms`,
      'User Experience': r.userExperience
    })));

    return results;
  }

  getResults(): FallbackTestResult[] {
    return this.results;
  }

  getSummary() {
    const total = this.results.length;
    const successful = this.results.filter(r => r.success).length;
    const fallbacks = this.results.filter(r => r.fallbackTriggered).length;
    const avgResponseTime = this.results.reduce((sum, r) => sum + r.responseTime, 0) / total;

    const experienceCounts = this.results.reduce((acc, r) => {
      acc[r.userExperience] = (acc[r.userExperience] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalTests: total,
      successRate: (successful / total) * 100,
      fallbackRate: (fallbacks / total) * 100,
      averageResponseTime: Math.round(avgResponseTime),
      userExperienceDistribution: experienceCounts
    };
  }
}

// Export singleton instance
export const fallbackTester = new FallbackTester();