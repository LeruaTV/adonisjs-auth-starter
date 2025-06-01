export class TokenUtil {
  static numeric(length: number = 6): string {
    let result = ''
    for (let i = 0; i < length; i++) {
      result += Math.floor(Math.random() * 10).toString()
    }
    return result
  }

  static alphanumeric(length: number = 6): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    return result
  }
}
