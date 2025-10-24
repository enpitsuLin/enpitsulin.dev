import type { TestModel } from './model'

export abstract class TestService {
  static async hi({ name }: TestModel.hiBody) {
    return {
      message: `Hello, ${name}`,
    }
  }
}
