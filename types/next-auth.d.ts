import type { Role } from '@prisma/client'

declare module 'next-auth' {
  interface Session {
    user: {
      id:          string
      username:    string
      email:       string
      role:        Role
      ejercitoId?: string
    }
  }

  interface User {
    id:          string
    username:    string
    email:       string
    role:        Role
    ejercitoId?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id:          string
    username:    string
    role:        Role
    ejercitoId?: string
  }
}
