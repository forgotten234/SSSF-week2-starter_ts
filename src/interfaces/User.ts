import { Document } from "mongoose"

// TODO: user interface
interface User{
    _id: number,
    user_name: string,
    email: string,
    role: "user" | "admin",
    password: string
}

interface PostUser extends Omit<User, '_id' | 'role'> {
  role?: 'user' |'admin';
}

interface UserTest extends Partial<User> {}

interface UserOutput extends Omit<User, "role" | "password"> {}

export {User, UserTest, UserOutput, PostUser}