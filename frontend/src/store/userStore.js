import { create } from 'zustand'
import { setToken, setUser, removeToken, getUser, getToken } from '../utils/auth'
import { login, getCurrentUser } from '../api/auth'

const useUserStore = create((set) => ({
  user: getUser(),
  token: getToken(),
  isLoggedIn: !!getToken(),

  login: async (credentials) => {
    const res = await login(credentials)
    const { token, user } = res.data
    setToken(token)
    setUser(user)
    set({ user, token, isLoggedIn: true })
    return res
  },

  fetchCurrentUser: async () => {
    const res = await getCurrentUser()
    const user = res.data
    setUser(user)
    set({ user })
    return user
  },

  logout: () => {
    removeToken()
    set({ user: null, token: null, isLoggedIn: false })
  },
}))

export default useUserStore
