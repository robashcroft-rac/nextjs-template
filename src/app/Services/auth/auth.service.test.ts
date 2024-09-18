// auth.service.test.tsx
import { AuthService } from "./auth.service";

const mockAuthTokenValue = "New Token";
const mockRefreshTokenValue = "Refreshed Token";

describe("AuthService", () => {
  let authService: AuthService;
  let mockAuthResponseData = getMocAuthData();
  let mockRefreshResponseData = getMocRefreshData();
  let mockCachedToken = "cached token";
  let resourceId = "652640C0-803B-4F3D-8763-71B76B587A93";
  process.env.NEXT_PUBLIC_API_RESOURCE_ID =
    "652640C0-803B-4F3D-8763-71B76B587A93";
  process.env.NEXT_PUBLIC_APP_URL = "https://unknowntesthost.com.au";
  process.env.NEXT_PUBLIC_APPINSIGHTS_INSTRUMENTATIONKEY = "1234";
  process.env.NEXT_PUBLIC_APPINSIGHTS_CONNECTIONSTRING = "tests";

  beforeEach(() => {
    authService = new AuthService();

    //make sure the session storage previously used is all cleared before each test, we will set this up for each test
    window.sessionStorage.clear();
  });

  test("should return token when resource is not cached", async () => {
    //session should be cleared so there should be no values here mock the fetch call
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockAuthResponseData),
        ok: true,
        status: 200,
        statusText: "OK",
        headers: new Headers(),
        redirected: false,
        type: "basic",
        url: "",
        clone: jest.fn(),
        body: null,
        bodyUsed: false,
        arrayBuffer: jest.fn(),
        blob: jest.fn(),
        formData: jest.fn(),
        text: jest.fn(),
      } as Response),
    );

    console.log(`start get token test`);

    let token: string | null = null;
    await authService.getToken()?.then((atoken) => {
      console.log(`access token value  = ${atoken}`);
      token = atoken;
    });
    console.log(`token = ${token}`);
    let userInfo = authService.userinfo();
    console.log(`name = ${userInfo?.name}`);
    console.log(`email = ${userInfo?.email}`);
    console.log(`userId = ${userInfo?.userId}`);
    console.log(`givenName = ${userInfo?.givenName}`);
    console.log(`surname = ${userInfo?.surname}`);
    console.log(`roles = ${userInfo?.roles}`);
    expect(token).toBe(mockAuthTokenValue);
  });

  test("should return cached token when resource is cached and token is valid", async () => {
    //steps here are
    // 1 get a new token so it is added to the cash - this is to make sure the use claims value is populated
    // 2 edit the values in session storage to simulate a cached token
    // 3 refetch the token here to get the cached token value and confirm it is correct

    //step 1
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockAuthResponseData),
        ok: true,
        status: 200,
        statusText: "OK",
        headers: new Headers(),
        redirected: false,
        type: "basic",
        url: "",
        clone: jest.fn(),
        body: null,
        bodyUsed: false,
        arrayBuffer: jest.fn(),
        blob: jest.fn(),
        formData: jest.fn(),
        text: jest.fn(),
      } as Response),
    );

    let tokenNew: string | null = null;
    await authService.getToken()?.then((atoken) => {
      console.log(`access token value -1  = ${atoken}`);
      tokenNew = atoken;
    });
    expect(tokenNew).toBe(mockAuthTokenValue);

    //step 2
    const tokenKey =
      authService.CONSTANTS.STORAGE.ACCESS_TOKEN_KEY + resourceId;
    const expirationKey =
      authService.CONSTANTS.STORAGE.EXPIRATION_KEY + resourceId;

    window.sessionStorage.setItem(tokenKey, mockCachedToken);

    //step 3
    let token: string | null = null;
    await authService.getToken()?.then((atoken) => {
      console.log(`access token value - 2 = ${atoken}`);
      token = atoken;
    });
    console.log(`token = ${token}`);
    console.log(authService.userinfo());
    expect(token).toBe(mockCachedToken);
  });

  test("should return new token when resource is cached but token is expired or withing span", async () => {
    //Similar to the previous test but here we are specifically testing the expiry is outside the offset limits (5 minutes) within expiry

    //steps here are
    // 1 get a new token so it is added to the cash - this is to make sure the use claims value is populated
    // 2 edit the values in session storage to simulate a cached token expiry within the offset
    // 3 moc new global.fetch for refreshed token
    // 4 refetch the token here to get the refreshed token value and confirm it is correct

    //step 1
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockAuthResponseData),
        ok: true,
        status: 200,
        statusText: "OK",
        headers: new Headers(),
        redirected: false,
        type: "basic",
        url: "",
        clone: jest.fn(),
        body: null,
        bodyUsed: false,
        arrayBuffer: jest.fn(),
        blob: jest.fn(),
        formData: jest.fn(),
        text: jest.fn(),
      } as Response),
    );

    let tokenNew: string | null = null;
    await authService.getToken()?.then((atoken) => {
      console.log(`access token calue  = ${atoken}`);
      tokenNew = atoken;
    }); //just to get the token
    expect(tokenNew).toBe(mockAuthTokenValue);

    //step 2
    const tokenKey =
      authService.CONSTANTS.STORAGE.ACCESS_TOKEN_KEY + resourceId;
    const expirationKey =
      authService.CONSTANTS.STORAGE.EXPIRATION_KEY + resourceId;
    //set the exparation to timespan within 300 s (5 minutes) offset
    let expiration = new Date().getTime() + 200 * 1000; //200 seconds * 1000 for milliseconds

    window.sessionStorage.setItem(tokenKey, mockCachedToken);
    window.sessionStorage.setItem(expirationKey, expiration.toString());

    //step 3
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(mockRefreshResponseData),
        ok: true,
        status: 200,
        statusText: "OK",
        headers: new Headers(),
        redirected: false,
        type: "basic",
        url: "",
        clone: jest.fn(),
        body: null,
        bodyUsed: false,
        arrayBuffer: jest.fn(),
        blob: jest.fn(),
        formData: jest.fn(),
        text: jest.fn(),
      } as Response),
    );
    //step 4
    let token: string | null = null;
    await authService.getToken()?.then((atoken) => {
      console.log(`access token calue  = ${atoken}`);
      token = atoken;
    });
    expect(token).toBe(mockRefreshTokenValue);
  });

  test("should handle error when an exception occurs", async () => {
    const mockError = new Error("Fetch failed");
    global.fetch = jest.fn(() => Promise.reject(mockError));
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    let logMessage = `auth.service.ts -> error message is: ${mockError.message}`;
    let token = await authService.getToken();
    expect(consoleSpy).toHaveBeenLastCalledWith(logMessage);
    expect(token).toBeUndefined();
    consoleSpy.mockRestore();
  });
});

function getMocAuthData() {
  let expiryDate = new Date();
  expiryDate.setSeconds(expiryDate.getSeconds() + 3600); //1 hour
  return [
    {
      access_token: `${mockAuthTokenValue}`,
      expires_on: expiryDate.toISOString(),
      id_token: "tokenid",
      provider_name: "aad",
      refresh_token: `${mockRefreshTokenValue}`,
      user_claims: [
        {
          typ: "aud",
          val: "8819E65A-979E-46BA-92F6-6F0441E17247",
        },
        {
          typ: "iss",
          val: "https://sts.windows.net/775C0CC8-7707-4FC5-BDE9-3F5AAE7DE202/",
        },
        {
          typ: "iat",
          val: "1721875605",
        },
        {
          typ: "nbf",
          val: "1721875605",
        },
        {
          typ: "exp",
          val: "1721879505",
        },
        {
          typ: "aio",
          val: "AVQAq/8XAAAAGPTpieJVmuxxrHLz6fSk1LyEN7VAjuXhydp98kFT/s+/fkL5MMDXGS/xR3UPeJNdLx/Jh1LlnIy4jeqUVcCLYfCyObrzJaQ9JKYaMolz+XM=",
        },
        {
          typ: "http://schemas.microsoft.com/claims/authnmethodsreferences",
          val: "pwd",
        },
        {
          typ: "http://schemas.microsoft.com/claims/authnmethodsreferences",
          val: "mfa",
        },
        {
          typ: "c_hash",
          val: "r998cHSuYRgA9AfIzqWPcQ",
        },
        {
          typ: "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname",
          val: "PAColeman",
        },
        {
          typ: "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname",
          val: "Ken",
        },
        {
          typ: "ipaddr",
          val: "106.68.226.128",
        },
        {
          typ: "name",
          val: "Ken PAColeman",
        },
        {
          typ: "nonce",
          val: "b5964dcf6ce34a18a82a7219f647599d_20240725025642",
        },
        {
          typ: "http://schemas.microsoft.com/identity/claims/objectidentifier",
          val: "6274534f-b315-4c9f-9ad9-f3b0d8c0872b",
        },
        {
          typ: "onprem_sid",
          val: "S-1-5-21-3991610743-3828124470-4169945256-3371",
        },
        {
          typ: "rh",
          val: "0.AUEAhPuDL98k1UWRN9pRq7RiUWXZthx30m1Pmy2k8dq84yfsAFU.",
        },
        {
          typ: "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier",
          val: "5X7I0a9_FxoAv-PiiUCZ6Kx02bY7dxmi0SojgMg-gFI",
        },
        {
          typ: "http://schemas.microsoft.com/identity/claims/tenantid",
          val: "2f83fb84-24df-45d5-9137-da51abb46251",
        },
        {
          typ: "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name",
          val: "pacolema0k@ractest.com.au",
        },
        {
          typ: "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/upn",
          val: "pacolema0k@ractest.com.au",
        },
        {
          typ: "uti",
          val: "U08kLtK69EeRc0mK-D5FAA",
        },
        {
          typ: "ver",
          val: "1.0",
        },
      ],
      user_id: "pacolema0k@ractest.com.au",
    },
  ];
}
function getMocRefreshData() {
  let expiryDate = new Date();
  expiryDate.setSeconds(expiryDate.getSeconds() + 3600); //1 hour
  return [
    {
      access_token: `${mockRefreshTokenValue}`,
      expires_on: expiryDate.toISOString(),
      id_token: "tokenid",
      provider_name: "aad",
      refresh_token: `${mockRefreshTokenValue}`,
      user_claims: [
        {
          typ: "aud",
          val: "8819E65A-979E-46BA-92F6-6F0441E17247",
        },
        {
          typ: "iss",
          val: "https://sts.windows.net/775C0CC8-7707-4FC5-BDE9-3F5AAE7DE202/",
        },
        {
          typ: "iat",
          val: "1721875605",
        },
        {
          typ: "nbf",
          val: "1721875605",
        },
        {
          typ: "exp",
          val: "1721879505",
        },
        {
          typ: "aio",
          val: "AVQAq/8XAAAAGPTpieJVmuxxrHLz6fSk1LyEN7VAjuXhydp98kFT/s+/fkL5MMDXGS/xR3UPeJNdLx/Jh1LlnIy4jeqUVcCLYfCyObrzJaQ9JKYaMolz+XM=",
        },
        {
          typ: "http://schemas.microsoft.com/claims/authnmethodsreferences",
          val: "pwd",
        },
        {
          typ: "http://schemas.microsoft.com/claims/authnmethodsreferences",
          val: "mfa",
        },
        {
          typ: "c_hash",
          val: "r998cHSuYRgA9AfIzqWPcQ",
        },
        {
          typ: "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname",
          val: "PAColeman",
        },
        {
          typ: "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname",
          val: "Ken",
        },
        {
          typ: "ipaddr",
          val: "106.68.226.128",
        },
        {
          typ: "name",
          val: "Ken PAColeman",
        },
        {
          typ: "nonce",
          val: "b5964dcf6ce34a18a82a7219f647599d_20240725025642",
        },
        {
          typ: "http://schemas.microsoft.com/identity/claims/objectidentifier",
          val: "6274534f-b315-4c9f-9ad9-f3b0d8c0872b",
        },
        {
          typ: "onprem_sid",
          val: "S-1-5-21-3991610743-3828124470-4169945256-3371",
        },
        {
          typ: "rh",
          val: "0.AUEAhPuDL98k1UWRN9pRq7RiUWXZthx30m1Pmy2k8dq84yfsAFU.",
        },
        {
          typ: "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier",
          val: "5X7I0a9_FxoAv-PiiUCZ6Kx02bY7dxmi0SojgMg-gFI",
        },
        {
          typ: "http://schemas.microsoft.com/identity/claims/tenantid",
          val: "2f83fb84-24df-45d5-9137-da51abb46251",
        },
        {
          typ: "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name",
          val: "pacolema0k@ractest.com.au",
        },
        {
          typ: "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/upn",
          val: "pacolema0k@ractest.com.au",
        },
        {
          typ: "uti",
          val: "U08kLtK69EeRc0mK-D5FAA",
        },
        {
          typ: "ver",
          val: "1.0",
        },
      ],
      user_id: "pacolema0k@ractest.com.au",
    },
  ];
}
