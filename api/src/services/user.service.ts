// src/users/usersService.ts
import { User } from "../interfaces/users.interface";

// A post request should not contain an id.
export type UserCreationParams = Pick<User, "email" | "name" | "phoneNumbers">;

export class UsersService {
  public getAll(): User[] {
    return [
      {
        id: 1,
        email: "test@gmail.com",
        name: "Test User",
        status: "Happy",
        phoneNumbers: ["1234567890"],
      },
    ];
  }

  public get(id: number, name?: string): User {
    return {
      id,
      email: "jane@doe.com",
      name: name ?? "Jane Doe",
      status: "Happy",
      phoneNumbers: [],
    };
  }

  public create(userCreationParams: UserCreationParams): User {
    return {
      id: Math.floor(Math.random() * 10000), // Random
      status: "Happy",
      ...userCreationParams,
    };
  }
}
