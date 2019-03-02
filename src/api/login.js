import request from '@/utils/request'

export function login(username, password) {
  return request({
    url: '/user/login',
    method: 'post',
    data: {
      username,
      password
    }
  })
}

export function relogin(refreshToken) {
  return request({
    url: '/user/relogin',
    method: 'post',
    params: { refreshToken }
  })
}

export function getInfo(token) {
  return request({
    url: '/user/info',
    method: 'get',
    params: { token }
  })
}

export function logout(token, refreshToken) {
  console.log('发送的' + token)
  return request({
    url: '/user/seeyou',
    method: 'post',
    params: { token, refreshToken }
  })
}
