import { PERMISSIONS, entryPointUriPath } from './src/constants';

/**
 * @type {import('@commercetools-frontend/application-config').ConfigOptionsForCustomApplication}
 */
const config = {
    name: 'paydockapp',
    entryPointUriPath: 'paydock-app',
    cloudIdentifier: 'gcp-eu',
    env: {
        development: {
            initialProjectKey: 'paydockecomm',
        },
        production: {
            applicationId: 'clu8i7yq100513h7d0duarye1',
            url: 'https://jsp-test-six.vercel.app',
        },
    },
    clientId: 'kjQW8-nXHq4CfKVdFzEjUl6c',
    clientSecret: 'Z1B_FP71UbE8xwcdAy_Q5FR7ztHSZZRJ',
    projectKey: 'paydockecomm',
    region: 'europe-west1',
    notificationUrl: 'https://notification.paydock-commercetools-app.jetsoftpro.dev',
    oAuthScopes: {
        view: ['view_products'],
        manage: ['manage_products'],
    },
    icon: '${path:@commercetools-frontend/assets/application-icons/rocket.svg}',
    mainMenuLink: {
        defaultLabel: 'Paydock Settings',
        uriPath: 'settings',
        labelAllLocales: [],
        permissions: ['ViewProducts'],
    },
    submenuLinks: [
        {
            uriPath: 'settings',
            defaultLabel: 'Live connection',
            labelAllLocales: [],
            permissions: ['ViewProducts'],
        },
    ],
    headers: {
        csp: {
            'connect-src': ['\'self\'', 'https://api.europe-west1.gcp.commercetools.com https://auth.europe-west1.gcp.commercetools.com/oauth/token https://auth.europe-west1.gcp.commercetools.com https://mc-api.europe-west1.gcp.commercetools.com/graphql https://jsp-test-six.vercel.app/ https://mc-api.europe-west1.gcp.commercetools.com https://api.paydock-commercetool-app.jetsoftpro.dev http://localhost:3003 http://localhost:3001 https://api-sandbox.paydock.com https://api.paydock.com'],
            'script-src': ['\'self\'', '\'unsafe-inline\'', '\'unsafe-eval\'', 'https://api.europe-west1.gcp.commercetools.com https://auth.europe-west1.gcp.commercetools.com/oauth/token https://auth.europe-west1.gcp.commercetools.com  https://mc-api.europe-west1.gcp.commercetools.com/graphql https://mc-api.europe-west1.gcp.commercetools.com  https://api.paydock-commercetool-app.jetsoftpro.dev https://jsp-test-six.vercel.app http://localhost:3001 http://localhost:3003 https://api-sandbox.paydock.com https://api.paydock.com'],
            'style-src': ['\'self\'', '\'unsafe-inline\'', 'https://fonts.googleapis.com'],
            'img-src': ['\'self\'', 'data:', 'https:'],
            'font-src': ['\'self\'', 'https://fonts.gstatic.com'],
            'frame-src': ['\'self\'', 'https://api.europe-west1.gcp.commercetools.com https://auth.europe-west1.gcp.commercetools.com/oauth/token https://auth.europe-west1.gcp.commercetools.com  https://jsp-test-six.vercel.app http://localhost:3003 http://localhost:3001 https://api-sandbox.paydock.com https://api.paydock.com'],
        },
    },
};

export default config;
