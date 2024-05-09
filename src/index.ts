import {type StrategyVerifyCallback} from 'remix-auth'
import {
  OAuth2Strategy,
  type OAuth2Profile,
  type OAuth2StrategyVerifyParams,
} from 'remix-auth-oauth2'

type SalesforceScope =
  | 'einstein_gpt_api'
  | 'pwdless_login_api'
  | 'lightning'
  | 'visualforce'
  | 'cdp_api'
  | 'chatbot_api'
  | 'content'
  | 'custom_permissions'
  | 'sfap_api'
  | 'cdp_calculated_insight_api'
  | 'cdp_identityresolution_api'
  | 'cdp_ingest_api'
  | 'cdp_profile_api'
  | 'pardot_api'
  | 'cdp_query_api'
  | 'cdp_segment_api'
  | 'eclair_api'
  | 'wave_api'
  | 'chatter_api'
  | 'forgot_password'
  | 'user_registration_api'
  | 'interaction_api'
  | 'id'
  | 'profile'
  | 'email'
  | 'address'
  | 'phone'
  | 'openid'
  | 'full'
  | 'api'
  | 'web'
  | 'refresh_token'
  | 'offline_access'

type Display = 'page' | 'popup' | 'touch' | 'mobile'
type Prompt = 'login' | 'consent' | 'select_account'

export const SalesforceStrategyDefaultName = 'salesforce'
export const SalesforceStrategyDefaultScope: SalesforceScope[] = [
  'full',
  'refresh_token',
]
export const SalesforceStrategyScopeSeperator = ' '

export interface SalesforceStrategyOptions {
  clientID: string
  clientSecret: string
  callbackURL: string
  scope?: SalesforceScope[] | string
  sso_provider?: string
  immediate?: boolean
  code_challenge?: string
  display?: Display
  login_hint?: string
  nonce?: string
  prompt?: Prompt
}

interface SalesforceExtraParams extends Record<string, string> {
  signature: string
  scope: string
  instance_url: string
  id: string
  token_type: string
  issued_at: string
}

interface SalesforceProfile extends OAuth2Profile {
  organization_id?: string

  _json?: SalesforceUserInfo
}

interface Urls {
  enterprise?: string
  metadata?: string
  partner?: string
  rest?: string
  sobjects?: string
  search?: string
  query?: string
  recent?: string
  tooling_soap?: string
  tooling_rest?: string
  profile?: string
  custom_domain?: string
}

interface SalesforceUserInfo {
  sub?: string
  user_id?: string
  organization_id?: string
  preferred_username?: string
  nickname?: string
  name?: string
  email?: string
  email_verified?: boolean
  given_name?: string
  family_name?: string
  zoneinfo?: string
  photos?: {
    picture?: string
    thumbnail?: string
  }
  profile?: string
  picture?: string
  address?: {country?: string}
  is_salesforce_integration_user?: boolean
  urls?: Urls
  active?: boolean
  user_type?: string
  language?: string
  locale?: string
  utcOffset?: number
  updated_at?: string
}

export class SalesforceStrategy<User> extends OAuth2Strategy<
  User,
  SalesforceProfile,
  SalesforceExtraParams
> {
  name = 'salesforce'

  scope: string
  private sso_provider: string | undefined
  private state: string | undefined
  private immediate: boolean | undefined
  private code_challenge: string | undefined
  private display: Display | undefined
  private login_hint: string | undefined
  private nonce: string | undefined
  private prompt: Prompt | undefined

  constructor(
    options: SalesforceStrategyOptions,
    verify: StrategyVerifyCallback<
      User,
      OAuth2StrategyVerifyParams<SalesforceProfile, SalesforceExtraParams>
    >,
  ) {
    super(
      {
        authorizationURL:
          'https://login.salesforce.com/services/oauth2/authorize',
        tokenURL: 'https://login.salesforce.com/services/oauth2/token',
        clientID: options.clientID,
        clientSecret: options.clientSecret,
        callbackURL: options.callbackURL,
      },
      verify,
    )

    this.scope = this.getScope(options.scope).join(
      SalesforceStrategyScopeSeperator,
    )
    this.sso_provider = options.sso_provider
    this.immediate = options.immediate
    this.code_challenge = options.code_challenge
    this.display = options.display
    this.login_hint = options.login_hint
    this.nonce = options.nonce
    this.prompt = options.prompt
  }

  private getScope(scope: SalesforceStrategyOptions['scope']) {
    if (!scope) {
      return SalesforceStrategyDefaultScope
    } else if (typeof scope === 'string') {
      return scope.split(SalesforceStrategyScopeSeperator) as SalesforceScope[]
    }

    return scope
  }

  protected authorizationParams(params: URLSearchParams) {
    params.set('scope', this.scope)
    if (this.sso_provider) {
      params.set('sso_provider', this.sso_provider)
    }

    if (this.immediate) {
      params.set('immediate', this.immediate.toString())
    }

    if (this.code_challenge) {
      params.set('code_challenge', this.code_challenge)
    }

    if (this.display) {
      params.set('display', this.display)
    }

    if (this.login_hint) {
      params.set('login_hint', this.login_hint)
    }

    if (this.nonce) {
      params.set('nonce', this.nonce)
    }

    if (this.prompt) {
      params.set('prompt', this.prompt)
    }
    console.log(params)
    return params
  }
  protected async userProfile(
    accessToken: string,
    params: SalesforceExtraParams,
  ): Promise<SalesforceProfile> {
    const response = await fetch(
      `${params.instance_url}/services/oauth2/userinfo`,
      {
        headers: {Authorization: `Bearer ${accessToken}`},
      },
    )
    const data: SalesforceUserInfo = await response.json()
    const profile: SalesforceProfile = {
      provider: 'salesforce',
    }

    profile._json = data
    if (data.sub) {
      profile.id = data.sub
    }

    if (data.organization_id) {
      profile.organization_id = data.organization_id
    }

    if (data.email) {
      profile.emails = [{value: data.email}]
    }

    if (data.given_name || data.family_name) {
      profile.name = {
        familyName: data.family_name,
        givenName: data.given_name,
      }
    }

    if (data.photos && data.photos.thumbnail) {
      profile.photos = [{value: data.photos.thumbnail}]
    } else if (data.photos && data.photos.picture) {
      profile.photos = [{value: data.photos.picture}]
    }
    if (data.nickname) {
      profile.displayName = data.nickname
    }

    return profile
  }
}
