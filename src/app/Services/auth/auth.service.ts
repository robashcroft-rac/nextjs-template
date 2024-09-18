import { iuser } from "./iuser.interface";
import { getAppInsights } from "../insights/insights.service";

export class AuthService {
  CONSTANTS = {
    ACCESS_TOKEN: "access_token",
    EXPIRES_IN: "expires_in",
    ID_TOKEN: "id_token",
    ERROR_DESCRIPTION: "error_description",
    SESSION_STATE: "session_state",
    ERROR: "error",
    STORAGE: {
      TOKEN_KEYS: "adal.token.keys",
      ACCESS_TOKEN_KEY: "adal.access.token.key",
      EXPIRATION_KEY: "adal.expiration.key",
      STATE_LOGIN: "adal.state.login",
      STATE_RENEW: "adal.state.renew",
      NONCE_IDTOKEN: "adal.nonce.idtoken",
      SESSION_STATE: "adal.session.state",
      USERNAME: "adal.username",
      IDTOKEN: "adal.idtoken",
      ERROR: "adal.error",
      ERROR_DESCRIPTION: "adal.error.description",
      LOGIN_REQUEST: "adal.login.request",
      LOGIN_ERROR: "adal.login.error",
      RENEW_STATUS: "adal.token.renew.status",
      ANGULAR_LOGIN_REQUEST: "adal.angular.login.request",
    },
    RESOURCE_DELIMETER: "|",
    CACHE_DELIMETER: "||",
    LOADFRAME_TIMEOUT: 6000,
    TOKEN_RENEW_STATUS_CANCELED: "Canceled",
    TOKEN_RENEW_STATUS_COMPLETED: "Completed",
    TOKEN_RENEW_STATUS_IN_PROGRESS: "In Progress",
    LOGGING_LEVEL: {
      ERROR: 0,
      WARN: 1,
      INFO: 2,
      VERBOSE: 3,
    },
    LEVEL_STRING_MAP: {
      0: "ERROR:",
      1: "WARNING:",
      2: "INFO:",
      3: "VERBOSE:",
    },
  };
  constructor() {
    this.appInsights = getAppInsights();
  }

  private appInsights;
  private userClaims: iuser | null = null;

  public userinfo(): iuser | null {
    return this.userClaims;
  }

  public async getToken(): Promise<string | null> {
    try {
      let resource = process.env.NEXT_PUBLIC_API_RESOURCE_ID ?? "";
      if (this.isCachedTokenValid(resource)) {
        console.log("token is valid");
        let token = this.getItem(
          this.CONSTANTS.STORAGE.ACCESS_TOKEN_KEY + resource,
        );
        return await Promise.resolve(token);
      }

      if (this.hasCachedToken(resource)) {
        console.log("token is not valid but exists - refresh");
        return this.refreshCachedToken(resource);
      }

      console.log("token does not exist - get new token");
      return this.getAuthToken(resource);
    } catch (error) {
      this.handleError(error);
      return Promise.resolve(null);
    }
  }

  private hasCachedToken(resource: string): boolean {
    if (this.userinfo === null) {
      return false;
    }

    let token = this.getItem(
      this.CONSTANTS.STORAGE.ACCESS_TOKEN_KEY + resource,
    );
    if (token === null || token === "") {
      return false;
    }

    return true;
  }

  private isCachedTokenValid(resource: string): boolean {
    if (this.hasCachedToken(resource)) {
      let offsetString = process.env.NEXT_PUBLIC_EXPIRY_OFFSET || "300";
      let offset = parseInt(offsetString);
      let expiry = this.getItem(
        this.CONSTANTS.STORAGE.EXPIRATION_KEY + resource,
      );

      if (
        expiry &&
        parseInt(expiry, 10) > new Date().getTime() + offset * 1000
      ) {
        return true;
      }
    }
    return false;
  }

  private async getAuthToken(resource: string): Promise<string | null> {
    console.log("getting auth token");
    let url = `${process.env.NEXT_PUBLIC_APP_URL}/.auth/me`;
    const requestHeaders: HeadersInit = new Headers();
    requestHeaders.set("Content-Type", "application/json");

    this.appInsights.trackEvent({
      name: "Initiating getAuthToken",
      properties: { url: url },
    });

    return fetch(url, {
      method: "GET",
      headers: requestHeaders,
    })
      .then((response) => {
        this.appInsights.trackEvent({
          name: "GetAuthToken response",
          properties: {
            url: url,
            status: response.status,
            statusText: response.statusText,
          },
        });
        return response.json();
      })
      .then((body) => {
        if (body === null) {
          return Promise.resolve(null);
        }

        let authClaims = body[0];
        let accessToken = authClaims.access_token;
        let expiry = new Date(authClaims.expires_on).getTime();

        this.saveItem(
          this.CONSTANTS.STORAGE.ACCESS_TOKEN_KEY + resource,
          accessToken,
        );
        this.saveItem(
          this.CONSTANTS.STORAGE.EXPIRATION_KEY + resource,
          expiry.toString(),
        );
        this.loadUserClaims(authClaims);

        return Promise.resolve(accessToken);
      })
      .catch((error) => {
        console.log(error);
        this.handleError(error);
      });
  }

  private async refreshCachedToken(resource: string): Promise<string | null> {
    return this.refreshToken()
      .then((response: any) => {
        return this.getAuthToken(resource);
      })
      .catch((error) => {
        this.handleError(error);
        return Promise.resolve(null); // Ensure a value is always returned
      });
  }

  private async refreshToken() {
    let url = `${process.env.NEXT_PUBLIC_APP_URL}/.auth/refresh`;
    const requestHeaders: HeadersInit = new Headers();
    requestHeaders.set("Content-Type", "application/json");
    return fetch(url, { method: "GET", headers: requestHeaders });
  }

  private findClaim(
    claims: [{ typ: string; val: string }],
    path: string,
  ): string {
    let val = "";
    let claim = claims.find((obj) => obj.typ === path);

    if (claim) {
      val = claim.val;
    }

    return val;
  }

  private loadUserClaims(authClaims: any) {
    this.userClaims = {
      name: "",
      userId: "",
      email: "",
      givenName: "",
      surname: "",
      roles: "",
    };

    this.userClaims.email = this.findClaim(
      authClaims.user_claims,
      "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress",
    );
    this.userClaims.givenName = this.findClaim(
      authClaims.user_claims,
      "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname",
    );
    this.userClaims.name = this.findClaim(authClaims.user_claims, "name");
    this.userClaims.roles = this.findClaim(authClaims.user_claims, "roles");
    this.userClaims.surname = this.findClaim(
      authClaims.user_claims,
      "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname",
    );
    this.userClaims.userId = authClaims.user_id;
  }

  private saveItem(key: string, obj: string) {
    // Default as session storage
    if (!this.supportsSessionStorage()) {
      console.log("Session storage is not supported");
      return false;
    }

    window.sessionStorage.setItem(key, obj);

    return true;
  }

  private getItem(key: string) {
    // Default as session storage
    if (!this.supportsSessionStorage()) {
      console.log("Session storage is not supported");
      return null;
    }

    return window.sessionStorage.getItem(key);
  }

  private supportsSessionStorage() {
    if (!window.sessionStorage) {
      return false;
    } // Test availability
    window.sessionStorage.setItem("storageTest", "A"); // Try write
    if (window.sessionStorage.getItem("storageTest") !== "A") {
      return false;
    } // Test read/write
    window.sessionStorage.removeItem("storageTest"); // Try delete
    if (window.sessionStorage.getItem("storageTest")) {
      return false;
    } // Test delete
    return true; // Success
  }
  private handleError(err: any) {
    // in a real world app, we may send the server to some remote logging infrastructure
    // instead of just logging it to the console
    this.appInsights.trackException({ exception: err });
    let errorMessage = "";
    if (err.error instanceof Error) {
      // A client-side or network error occurred. Handle it accordingly.
      errorMessage = `An error occurred: ${err.error.message}`;
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      errorMessage = `auth.service.ts -> error message is: ${err.message}`;
    }
    console.log(errorMessage);
  }
}
