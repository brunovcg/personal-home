import { GetBRLResponse } from './Currency.service.types';

export class CurrencyService {
  private static brlPromise: Promise<GetBRLResponse> | null = null;

  static getBRLPromise() {
    if (!this.brlPromise) {
      this.brlPromise = fetch(
        `https://v6.exchangerate-api.com/v6/8e3078c3120cc192982a79b3/latest/BRL`,
      ).then((res) => res.json());
    }
    return this.brlPromise as Promise<GetBRLResponse>;
  }
}
