export class HttpClient {
  constructor(private readonly baseURL: string) {}

  async get<T>(url: string, params?: Record<string, any>): Promise<T> {
    const absoluteURL = new URL(this.baseURL + '/' + url);

    if (params) {
      Object.keys(params).forEach((key) => {
        if (params[key] === undefined) return;

        absoluteURL.searchParams.append(key, params[key]);
      });
    }

    const data = await fetch(absoluteURL);

    if (!data.ok) {
      throw new Error(`Cannot fetch: ${absoluteURL}`);
    }

    return data.json();
  }
}
