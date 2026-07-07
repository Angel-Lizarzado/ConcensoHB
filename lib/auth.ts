import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import type { Role } from '@prisma/client'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        username: { label: 'Usuario',    type: 'text'     },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        console.log('AUTHORIZE CALLED with:', credentials?.username)
        const rawUsername = credentials?.username as string | undefined
        const password = credentials?.password as string | undefined
        const username = rawUsername?.trim()

        if (!username || !password) {
          console.log('Missing username or password')
          return null
        }

        try {
          const user = await prisma.user.findUnique({
            where: { username },
            select: {
              id:         true,
              username:   true,
              password:   true,
              role:       true,
              ejercitoId: true,
            },
          })

          if (!user) {
            console.log('User not found in DB')
            return null
          }

          const passwordValid = await bcrypt.compare(password, user.password)
          if (!passwordValid) {
            console.log('Password invalid')
            return null
          }

          console.log('Authorize SUCCESS for user:', user.username)
          return {
            id:         user.id,
            name:       user.username,
            username:   user.username,
            role:       user.role as Role,
            ejercitoId: user.ejercitoId ?? undefined,
          }
        } catch (e) {
          console.error('AUTHORIZE EXCEPTION:', e)
          return null
        }
      },
    }),
  ],

  session: { strategy: 'jwt' },

    callbacks: {
    jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.id         = user.id as string
        token.username   = user.username as string
        token.role       = user.role as Role
        token.ejercitoId = user.ejercitoId as string | undefined
      }
      return token
    },

    session({ session, token }: { session: any; token: any }) {
      if (token) {
        session.user.id         = token.id as string
        session.user.username   = token.username as string
        session.user.role       = token.role as Role
        session.user.ejercitoId = token.ejercitoId as string | undefined
      }
      return session
    },
  },

  pages: {
    signIn: '/login',
  },

  trustHost: true,
})
