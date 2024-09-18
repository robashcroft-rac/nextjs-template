import { ApiService } from "./api.service";
import { AuthService } from "../auth/auth.service";

describe("TestCases to verify get work as expected", () => {
  let service: ApiService;
  process.env.NEXT_PUBLIC_APPINSIGHTS_INSTRUMENTATIONKEY = "1234";
  process.env.NEXT_PUBLIC_APPINSIGHTS_CONNECTIONSTRING = "tests";

  //TODO: Make responses real, add error handling etc
  beforeEach(() => {
    console.log("beforeEach");
    let as = new AuthService();
    service = new ApiService(as);
  });

  test("should fetch data successfully with id", () => {
    let dataSuccess = { data: "test data" };
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(dataSuccess),
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

    service.get("https://api.example.com", 1).then((data) => {
      expect(data).toEqual(dataSuccess);
    });
  });

  test("should fetch data successfully without id", async () => {
    let dataSuccess = { data: "test data" };
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(dataSuccess),
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

    service.get("https://api.example.com").then((data) => {
      expect(data).toEqual(dataSuccess);
    });
  });

  test("should handle fetch error", async () => {
    const mockError = new Error("Fetch failed");
    global.fetch = jest.fn(() => Promise.reject(mockError));
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    let logMessage = `Server returned code: undefined, error message is: ${mockError.message}`;
    await service.get("https://api.example.com");

    expect(consoleSpy).toHaveBeenCalledWith(logMessage);

    consoleSpy.mockRestore();
  });
});

describe("TestCases to verify post work as expected", () => {
  let service: ApiService;
  let authService: AuthService;
  beforeEach(() => {
    authService = new AuthService();
    service = new ApiService(authService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test("should post data successfully with id", async () => {
    const dataToPost = { key: "value" };
    const dataSuccess = { data: "response data" };
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(dataSuccess),
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

    const data = await service.post("https://api.example.com", 1, dataToPost);
    expect(data).toEqual(dataSuccess);
    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.example.com/1",
      expect.objectContaining({
        method: "POST",
        headers: expect.any(Headers),
        body: JSON.stringify(dataToPost),
      }),
    );
  });

  test("should post data successfully without id", async () => {
    const dataToPost = { key: "value" };
    const dataSuccess = { data: "response data" };
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(dataSuccess),
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

    const data = await service.post("https://api.example.com", 0, dataToPost);
    expect(data).toEqual(dataSuccess);
    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.example.com",
      expect.objectContaining({
        method: "POST",
        headers: expect.any(Headers),
        body: JSON.stringify(dataToPost),
      }),
    );
  });

  test("should handle error on failed post", async () => {
    const dataToPost = { key: "value" };
    const mockError = new Error("Fetch failed");
    global.fetch = jest.fn(() => Promise.reject(mockError));
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    let logMessage = `Server returned code: undefined, error message is: ${mockError.message}`;
    await service.post("https://api.example.com", 1, dataToPost);

    expect(consoleSpy).toHaveBeenCalledWith(logMessage);
    consoleSpy.mockRestore();
  });
});
