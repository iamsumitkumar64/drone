import { UserRoleEnum } from "./user-role.enum"

export interface User {
  uid: string
  email: string
  username: string
  role: UserRoleEnum
}

export interface UserState {
  user: User | null
  loading: boolean
  error: string | null
  status: "pending" | "succeed" | "rejected"
}