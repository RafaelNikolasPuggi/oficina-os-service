export abstract class Entity<T extends string = string> {
  protected readonly _id: T;

  protected constructor(id: T) {
    this._id = id;
  }

  get id(): T {
    return this._id;
  }

  equals(other?: Entity<T>): boolean {
    if (!other || !(other instanceof Entity)) {
      return false;
    }
    return this._id === other._id;
  }
}
