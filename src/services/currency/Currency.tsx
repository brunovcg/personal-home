export default abstract class Currency {
  static getBRL() {
    return fetch(
      `https://v6.exchangerate-api.com/v6/8e3078c3120cc192982a79b3/latest/BRL`
    );
  }
}
