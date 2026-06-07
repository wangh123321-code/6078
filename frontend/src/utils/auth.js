import Cookies from 'js-cookie'

const TOKEN_KEY = 'cat_pedigree_token'
const USER_KEY = 'cat_pedigree_user'

export function getToken() {
  return Cookies.get(TOKEN_KEY)
}

export function setToken(token) {
  return Cookies.set(TOKEN_KEY, token, { expires: 7 })
}

export function removeToken() {
  Cookies.remove(TOKEN_KEY)
  Cookies.remove(USER_KEY)
}

export function getUser() {
  const userStr = Cookies.get(USER_KEY)
  return userStr ? JSON.parse(userStr) : null
}

export function setUser(user) {
  return Cookies.set(USER_KEY, JSON.stringify(user), { expires: 7 })
}

export function hasRole(role) {
  const user = getUser()
  return user && user.role === role
}

export function isSuperAdmin() {
  return hasRole('SUPER_ADMIN')
}

export function isCatteryAdmin() {
  return hasRole('CATTERY_ADMIN') || hasRole('SUPER_ADMIN')
}
