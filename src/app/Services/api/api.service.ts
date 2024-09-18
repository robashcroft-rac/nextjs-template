import { AuthService } from "../auth/auth.service";
import { getAppInsights } from "../insights/insights.service";

export class ApiService {
  constructor(authService: AuthService) {
    this.authService = authService;
    this.appInsights = getAppInsights();
  }
  private authService: AuthService;
  private appInsights;

  public async get(apiUrl: string, id: number = 0) {
    const key = `${process.env.NEXT_PUBLIC_API_KEY}`;
    let url = apiUrl;
    if (id > 0) {
      url = `${url}/${id}`;
    }
    this.appInsights.trackEvent({
      name: "Initiating get data",
      properties: { apiUrl: apiUrl },
    });

    return this.addRequestHeaders().then((requestHeaders) => {
      return fetch(url, {
        method: "GET",
        headers: requestHeaders,
      })
        .then((res) => {
          this.appInsights.trackEvent({
            name: "Get data response",
            properties: {
              apiUrl: apiUrl,
              status: res.status,
              statusText: res.statusText,
            },
          });
          return res.json();
        })
        .then((data) => {
          console.log(data);
          return data;
        })
        .catch((error) => {
          this.appInsights.trackException({
            exception: error,
            properties: { apiUrl: apiUrl },
          });
          this.handleError(error);
        });
    });
  }

  public async post(apiUrl: string, id: number, data: any) {
    const key = `${process.env.NEXT_PUBLIC_API_KEY}`;
    //const requestHeaders = this.addRequestHeaders();

    let url = apiUrl;
    if (id > 0) {
      url = `${url}/${id}`;
    }
    this.appInsights.trackEvent({
      name: "Initiating post data",
      properties: { apiUrl: apiUrl },
    });

    return this.addRequestHeaders().then((requestHeaders) => {
      return fetch(url, {
        method: "POST",
        headers: requestHeaders,
        body: JSON.stringify(data),
      })
        .then((res) => {
          this.appInsights.trackEvent({
            name: "Post data response",
            properties: {
              apiUrl: apiUrl,
              status: res.status,
              statusText: res.statusText,
            },
          });
          return res.json();
        })
        .then((data) => {
          console.log(data);
          return data;
        })
        .catch((error) => {
          this.appInsights.trackException({
            exception: error,
            properties: { apiUrl: apiUrl },
          });
          this.handleError(error);
        });
    });
  }

  private handleError(err: any) {
    this.appInsights.trackException({ exception: err });
    // in a real world app, we may send the server to some remote logging infrastructure
    // instead of just logging it to the console
    //add telemetry here
    let errorMessage = "";
    if (err.error instanceof Error) {
      // A client-side or network error occurred. Handle it accordingly.
      errorMessage = `An error occurred: ${err.error.message}`;
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      errorMessage = `Server returned code: ${err.status}, error message is: ${err.message}`;
    }

    console.log(errorMessage);
  }

  private async addRequestHeaders(): Promise<Headers> {
    const requirsAuth = `${process.env.NEXT_PUBLIC_HAS_AUTH}`.toLowerCase();
    const key = `${process.env.NEXT_PUBLIC_API_KEY}`;
    const requestHeaders: HeadersInit = new Headers();
    if (key && key !== "") {
      const headerName = "ocp-apim-subscription-key";
      requestHeaders.set(headerName, key);
    }
    requestHeaders.set("Content-Type", "application/json");

    if (requirsAuth === "true") {
      return this.authService.getToken().then((token) => {
        if (token !== null) {
          console.log("Adding the token to the request headers");
          requestHeaders.set("Authorization", `Bearer ${token}`);
        } else {
          console.log("resolvedToken is null or undefined so has not been set");
        }
        return Promise.resolve(requestHeaders);
      });
    } else {
      return Promise.resolve(requestHeaders);
    }
  }
}
