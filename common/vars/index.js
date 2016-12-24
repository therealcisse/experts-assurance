export const isServer                         = process.env._ENV !== 'client';
export const HOME_TITLE                       = process.env.HOME_TITLE;
export const APP_NAME                         = process.env.APP_NAME;
export const INACTIVITY_TIMEOUT               = 10 * 60 * 1000; // 10 minutes

export const GRAPHQL_ENDPOINT                 = process.env.GRAPHQL_ENDPOINT;
export const APOLLO_QUERY_BATCH_INTERVAL      = process.env.APOLLO_QUERY_BATCH_INTERVAL;

export const RECAPCHA_JS_URL                  = process.env.RECAPCHA_JS_URL;
export const RECAPCHA_SITE_KEY                = process.env.RECAPCHA_SITE_KEY;

export const APPLICATION_ID                   = process.env.APPLICATION_ID;
export const JAVASCRIPT_KEY                   = process.env.JAVASCRIPT_KEY;
export const MASTER_KEY                       = process.env.MASTER_KEY;
export const SERVER_URL                       = process.env.SERVER_URL;

export const BASENAME                         = process.env.BASENAME;

export const PASSWORD_MIN_LENGTH              = process.env.PASSWORD_MIN_LENGTH;

export const PATH_LOGIN                       = process.env.PATH_LOGIN;
export const PATH_SIGNUP                      = process.env.PATH_SIGNUP;
export const PATH_PASSWORD_RESET              = process.env.PATH_PASSWORD_RESET;
export const PATH_CHOOSE_PASSWORD             = process.env.PATH_CHOOSE_PASSWORD;
export const PATH_EMAIL_VERIFICATION_SUCCESS  = process.env.PATH_EMAIL_VERIFICATION_SUCCESS;
export const PATH_PASSWORD_RESET_SUCCESS      = process.env.PATH_PASSWORD_RESET_SUCCESS;
export const PATH_INVALID_LINK                = process.env.PATH_INVALID_LINK;
