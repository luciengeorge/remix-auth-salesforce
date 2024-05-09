# SalesforceStrategy

The Salesforce strategy is used to authenticate users against a Salesforce account. It extends the OAuth2Strategy.

## Supported runtimes

| Runtime    | Has Support |
| ---------- | ----------- |
| Node.js    | ✅          |
| Cloudflare | ✅          |

## Usage

### Create a Salesforce Connected App

Follow the steps on [the Salesforce documentation](https://help.salesforce.com/s/articleView?id=sf.connected_app_client_credentials_setup.htm&type=5) to create a connected app and get a client ID, client secret.

### Create the strategy instance

```tsx
// app/utils/auth.server.ts
import { Authenticator } from "remix-auth";
import { SalesforceStrategy } from "remix-auth-salesforce";

// Create an instance of the authenticator, pass a generic with what your
// strategies will return and will be stored in the session
export const authenticator = new Authenticator<User>(sessionStorage);

let salesforceStrategy = new SalesforceStrategy(
  {
    callbackURL: "https://example.com/auth/salesforce/callback",
    clientID: "YOUR_SALESFORCE_CLIENT_ID",
    clientSecret: "YOUR_SALESFORCE_CLIENT_SECRET",
  },
  async ({ accessToken, refreshToken, extraParams, profile }) => {
    // Implement your logic to find or create a user
  }
);

authenticator.use(salesforceStrategy);
```

### Setup your routes

```tsx
// app/routes/login.tsx
export default function Login() {
  return (
    <Form action="/auth/salesforce" method="post">
      <button>Login with Salesforce</button>
    </Form>
  );
}
```

```tsx
// app/routes/auth/salesforce.tsx
import type { ActionArgs } from "@remix-run/node";

import { authenticator } from "~/utils/auth.server";

export let loader = () => redirect("/login");

export let action = ({ request }: ActionArgs) => {
  return authenticator.authenticate("salesforce", request);
};
```

```tsx
// app/routes/auth/salesforce/callback.tsx
import type { LoaderArgs } from "@remix-run/node";

import { authenticator } from "~/utils/auth.server";

export let loader = ({ request }: LoaderArgs) => {
  return authenticator.authenticate("salesforce", request, {
    successRedirect: "/dashboard",
    failureRedirect: "/login",
  });
};
```

```tsx
// app/routes/auth/logout.ts
import type { ActionArgs } from "@remix-run/node";

import { redirect } from "@remix-run/node";

import { destroySession, getSession } from "~/utils/auth.server";

export const action = async ({ request }: ActionArgs) => {
  const session = await getSession(request.headers.get("Cookie"));
  const logoutURL = new URL(process.env.SALESFORCE_LOGOUT_URL)

  logoutURL.searchParams.set("client_id", process.env.SALESFORCE_CLIENT_ID);
  logoutURL.searchParams.set("returnTo", process.env.SALESFORCE_RETURN_TO_URL);

  return redirect(logoutURL.toString(), {
    headers: {
      "Set-Cookie": await destroySession(session),
    },
  });
};
```

## Advanced Usage

### Link directly to signup

```tsx
// app/routes/register.tsx
export default function Register() {
  return (
    <Form action="/auth/salesforce?display=mobile" method="post">
      <button>Register with Salesforce</button>
    </Form>
  );
}

// https://help.salesforce.com/s/articleView?id=sf.remoteaccess_oauth_tokens_scopes.htm&type=5
```
