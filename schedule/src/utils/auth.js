/*import Cookies from 'js-cookie'

const TokenKey = 'vue_admin_template_token'

export function getToken() {
  return Cookies.get(TokenKey)
}

export function setToken(token) {
  return Cookies.set(TokenKey, token)
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}
*/

const TokenKey = 'Admin-Token'

export function getToken() {
  return localStorage.getItem(TokenKey) || sessionStorage.getItem(TokenKey)
}

export function setToken(token) {
  localStorage.setItem(TokenKey, token)
  return token
}

export function removeToken() {
  localStorage.removeItem(TokenKey)
  sessionStorage.removeItem(TokenKey)
}
