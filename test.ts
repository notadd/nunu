interface identity<T> {
    get<T>(key: T): T;
}

class Identity<T = string> implements identity<T> {
    get<T>(key: T): T {
        throw new Error("Method not implemented.");
    }
}