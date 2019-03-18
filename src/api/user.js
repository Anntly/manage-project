import request from '@/utils/request'
export function getRolePage(params) {
  return request({
    url: '/user/role/page',
    method: 'get',
    params: params
  })
}
export function getPermissionNodes(id) {
  return request({
    url: '/user/role/permission',
    method: 'get',
    params: {
      id
    }
  })
}
export function addRole(params) {
  return request({
    url: '/user/role',
    method: 'post',
    data: params
  })
}
export function editRole(params) {
  return request({
    url: '/user/role',
    method: 'put',
    data: params
  })
}
export function removetRole(params) {
  return request({
    url: '/user/role/' + params,
    method: 'delete'
  })
}
export function changePass(params) {
  return request({
    url: '/user/changepass',
    method: 'put',
    data: params
  })
}

export function checkUser(params) {
  return request({
    url: '/user/checkuser',
    method: 'get',
    params: params
  })
}

export function getUserInfo(params) {
  return request({
    url: '/user/userinfo',
    method: 'get',
    params: params
  })
}

export function changeUserInfo(params) {
  return request({
    url: '/user/changeinfo',
    method: 'put',
    data: params
  })
}

export function getUserPage(params) {
  return request({
    url: '/user/manage/page',
    method: 'get',
    params: params
  })
}
export function getRoleNodes(userId) {
  return request({
    url: '/user/role/userId',
    method: 'get',
    params: {
      userId
    }
  })
}
export function addUser(params) {
  return request({
    url: '/user/manage',
    method: 'post',
    data: params
  })
}
export function editUser(params) {
  return request({
    url: '/user/manage',
    method: 'put',
    data: params
  })
}
export function removetUser(params) {
  return request({
    url: '/user/manage/' + params,
    method: 'delete'
  })
}