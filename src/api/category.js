import request from '@/utils/request'
export function getCategoriesPage() {
  return request({
    url: '/dish/category',
    method: 'get'
  })
}
export function getCas() {
  return request({
    url: '/dish/category/cas',
    method: 'get'
  })
}
export function getNodes() {
  return request({
    url: '/dish/category/nodes',
    method: 'get'
  })
}
export function getIds(params) {
  return request({
    url: '/dish/category/ids/' + params,
    method: 'get'
  })
}
export function editCategory(params) {
  return request({
    url: '/dish/category',
    method: 'put',
    params: params
  })
}
export function addCategory(params) {
  return request({
    url: '/dish/category',
    method: 'post',
    params: params
  })
}
export function delCategory(params) {
  return request({
    url: '/dish/category',
    method: 'delete',
    params: params
  })
}
