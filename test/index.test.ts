import {createCookieSessionStorage} from '@remix-run/node'
import {SalesforceStrategy, SalesforceStrategyOptions} from '../src'
import fetchMock, {enableFetchMocks} from 'jest-fetch-mock'
import {type AuthenticateOptions} from 'remix-auth'

enableFetchMocks()

const BASE_OPTIONS: AuthenticateOptions = {
  name: 'form',
  sessionKey: 'user',
  sessionErrorKey: 'error',
  sessionStrategyKey: 'strategy',
}
const PROVIDER_NAME = 'salesforce'
const DEFAULT_OPTIONS: SalesforceStrategyOptions = {
  clientID: 'CLIENT_ID',
  clientSecret: 'CLIENT_SECRET',
  callbackURL: 'http://example.com/callback',
}
const REQUEST_URL = 'https://example.app/auth/salesforce'

describe(SalesforceStrategy, () => {
  let verify = jest.fn()
  // You will probably need a sessionStorage to test the strategy.
  let sessionStorage = createCookieSessionStorage({
    cookie: {secrets: ['s3cr3t']},
  })

  beforeEach(() => {
    jest.resetAllMocks()
    fetchMock.resetMocks()
  })

  test('should have the name of the strategy', () => {
    let strategy = new SalesforceStrategy(DEFAULT_OPTIONS, verify)
    expect(strategy.name).toBe(PROVIDER_NAME)
  })

  test('should allow changing the scope', async () => {
    let strategy = new SalesforceStrategy(
      {
        ...DEFAULT_OPTIONS,
        scope: 'profile',
      },
      verify,
    )

    let request = new Request(REQUEST_URL)

    try {
      await strategy.authenticate(request, sessionStorage, BASE_OPTIONS)
    } catch (error) {
      if (!(error instanceof Response)) throw error
      let location = error.headers.get('Location')

      if (!location) throw new Error('No redirect header')

      let redirectUrl = new URL(location)

      expect(redirectUrl.searchParams.get('scope')).toBe('profile')
    }
  })

  test('should have the scope `full refresh_token` as default', async () => {
    let strategy = new SalesforceStrategy(DEFAULT_OPTIONS, verify)

    let request = new Request(REQUEST_URL)

    try {
      await strategy.authenticate(request, sessionStorage, BASE_OPTIONS)
    } catch (error) {
      if (!(error instanceof Response)) throw error
      let location = error.headers.get('Location')

      if (!location) throw new Error('No redirect header')

      let redirectUrl = new URL(location)

      expect(redirectUrl.searchParams.get('scope')).toBe('full refresh_token')
    }
  })

  test('should allow changing the sso_provider', async () => {
    let strategy = new SalesforceStrategy(
      {
        ...DEFAULT_OPTIONS,
        sso_provider: 'SOME_PROVIDER',
      },
      verify,
    )

    let request = new Request(REQUEST_URL)

    try {
      await strategy.authenticate(request, sessionStorage, BASE_OPTIONS)
    } catch (error) {
      if (!(error instanceof Response)) throw error
      let location = error.headers.get('Location')

      if (!location) throw new Error('No redirect header')

      let redirectUrl = new URL(location)

      expect(redirectUrl.searchParams.get('sso_provider')).toBe('SOME_PROVIDER')
    }
  })

  test('should allow changing the immediate', async () => {
    let strategy = new SalesforceStrategy(
      {
        ...DEFAULT_OPTIONS,
        immediate: true,
      },
      verify,
    )

    let request = new Request(REQUEST_URL)

    try {
      await strategy.authenticate(request, sessionStorage, BASE_OPTIONS)
    } catch (error) {
      if (!(error instanceof Response)) throw error
      let location = error.headers.get('Location')

      if (!location) throw new Error('No redirect header')

      let redirectUrl = new URL(location)

      expect(redirectUrl.searchParams.get('immediate')).toBe('true')
    }
  })

  test('should allow changing the code_challenge', async () => {
    let strategy = new SalesforceStrategy(
      {
        ...DEFAULT_OPTIONS,
        code_challenge: 'CODE_CHALLENGE',
      },
      verify,
    )

    let request = new Request(REQUEST_URL)

    try {
      await strategy.authenticate(request, sessionStorage, BASE_OPTIONS)
    } catch (error) {
      if (!(error instanceof Response)) throw error
      let location = error.headers.get('Location')

      if (!location) throw new Error('No redirect header')

      let redirectUrl = new URL(location)

      expect(redirectUrl.searchParams.get('code_challenge')).toBe(
        'CODE_CHALLENGE',
      )
    }
  })

  test('should allow changing the display', async () => {
    let strategy = new SalesforceStrategy(
      {
        ...DEFAULT_OPTIONS,
        display: 'mobile',
      },
      verify,
    )

    let request = new Request(REQUEST_URL)

    try {
      await strategy.authenticate(request, sessionStorage, BASE_OPTIONS)
    } catch (error) {
      if (!(error instanceof Response)) throw error
      let location = error.headers.get('Location')

      if (!location) throw new Error('No redirect header')

      let redirectUrl = new URL(location)

      expect(redirectUrl.searchParams.get('display')).toBe('mobile')
    }
  })

  test('should allow changing the login_hint', async () => {
    let strategy = new SalesforceStrategy(
      {
        ...DEFAULT_OPTIONS,
        login_hint: 'SOME_HINT',
      },
      verify,
    )

    let request = new Request(REQUEST_URL)

    try {
      await strategy.authenticate(request, sessionStorage, BASE_OPTIONS)
    } catch (error) {
      if (!(error instanceof Response)) throw error
      let location = error.headers.get('Location')

      if (!location) throw new Error('No redirect header')

      let redirectUrl = new URL(location)

      expect(redirectUrl.searchParams.get('login_hint')).toBe('SOME_HINT')
    }
  })

  test('should allow changing the nonce', async () => {
    let strategy = new SalesforceStrategy(
      {
        ...DEFAULT_OPTIONS,
        nonce: 'SOME_NONCE',
      },
      verify,
    )

    let request = new Request(REQUEST_URL)

    try {
      await strategy.authenticate(request, sessionStorage, BASE_OPTIONS)
    } catch (error) {
      if (!(error instanceof Response)) throw error
      let location = error.headers.get('Location')

      if (!location) throw new Error('No redirect header')

      let redirectUrl = new URL(location)

      expect(redirectUrl.searchParams.get('nonce')).toBe('SOME_NONCE')
    }
  })

  test('should allow changing the prompt', async () => {
    let strategy = new SalesforceStrategy(
      {
        ...DEFAULT_OPTIONS,
        prompt: 'login',
      },
      verify,
    )

    let request = new Request(REQUEST_URL)

    try {
      await strategy.authenticate(request, sessionStorage, BASE_OPTIONS)
    } catch (error) {
      if (!(error instanceof Response)) throw error
      let location = error.headers.get('Location')

      if (!location) throw new Error('No redirect header')

      let redirectUrl = new URL(location)

      expect(redirectUrl.searchParams.get('prompt')).toBe('login')
    }
  })
})
