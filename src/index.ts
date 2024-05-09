import {type StrategyVerifyCallback} from 'remix-auth'
import {
  OAuth2Strategy,
  type OAuth2Profile,
  type OAuth2StrategyVerifyParams,
} from 'remix-auth-oauth2'

type SalesforceScope =
  | 'cdp_query_api'
  | 'pardot_api'
  | 'cdp_profile_api'
  | 'chatter_api'
  | 'cdp_ingest_api'
  | 'eclair_api'
  | 'wave_api'
  | 'api'
  | 'custom_permissions'
  | 'id'
  | 'profile'
  | 'email'
  | 'address'
  | 'phone'
  | 'lightning'
  | 'content'
  | 'openid'
  | 'full'
  | 'refresh_token'
  | 'offline_access'
  | 'visualforce'
  | 'chatbot_api'
  | 'user_registration_api'
  | 'forgot_password'
  | 'cdp_api'
  | 'sfap_api'
  | 'interaction_api'
type Display = 'page' | 'popup' | 'touch' | 'mobile'
type Prompt = 'login' | 'consent' | 'select_account'

export const SalesforceStrategyDefaultName = 'salesforce'
export const SalesforceStrategyDefaultScope: SalesforceScope = 'full'
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
  sub: string
  user_id: string
  organization_id: string
  preferred_username: string
  nickname: string
  email: string
  email_verified: boolean
  given_name?: string
  family_name?: string
  name: {
    familyName?: string
    givenName?: string
  }
  zoneinfo: string
  photos: Array<{
    value: string
  }>
  profile: string
  picture: string
  address: {country: string}
  is_salesforce_integration_user: boolean
  urls: {
    enterprise: string
    metadata: string
    partner: string
    rest: string
    sobjects: string
    search: string
    query: string
    recent: string
    tooling_soap: string
    tooling_rest: string
    profile: string
    custom_domain: string | undefined
  }
  active: boolean
  user_type: string
  language: string
  locale: string
  utcOffset: number
  updated_at: string
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
      return [SalesforceStrategyDefaultScope]
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
    const data: SalesforceProfile = await response.json()
    const profile: SalesforceProfile = {
      provider: 'salesforce',
      sub: data.sub,
      email: data.email,
      nickname: data.nickname,
      user_id: data.user_id,
      organization_id: data.organization_id,
      preferred_username: data.preferred_username,
      displayName: data.nickname,
      email_verified: data.email_verified,
      zoneinfo: data.zoneinfo,
      profile: data.profile,
      picture: data.picture,
      address: data.address,
      is_salesforce_integration_user: data.is_salesforce_integration_user,
      urls: data.urls,
      active: data.active,
      user_type: data.user_type,
      language: data.language,
      locale: data.locale,
      utcOffset: data.utcOffset,
      updated_at: data.updated_at,
      name: {
        familyName: data.family_name,
        givenName: data.given_name,
      },
      emails: [{value: data.email}],
      photos: data.photos,
    }

    return profile
  }
}
