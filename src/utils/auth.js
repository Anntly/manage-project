import Cookies from 'js-cookie'

const TokenKey = 'uid'
const ReTokenKey = 'reid'
const RememberMe = 'remm'

export function getToken() {
  return Cookies.get(TokenKey)
}

export function setToken(token) {
  return Cookies.set(TokenKey, token)
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}

export function getReToken() {
  return Cookies.get(ReTokenKey)
}

export function setReToken(reToken) {
  return Cookies.set(ReTokenKey, reToken)
}

export function removeReToken() {
  return Cookies.remove(ReTokenKey)
}

export function setRememberMe(isRemember) {
  return Cookies.set(RememberMe, true)
}

export function setNotRememberMe(isRemember) {
  return Cookies.set(RememberMe, false)
}

export function getRememberMe() {
  return Cookies.get(RememberMe)
}
