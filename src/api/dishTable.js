import request from '@/utils/request'
export function getFoodListPage(params) {
  return request({
    url: '/dish/food/page',
    method: 'get',
    params: params
  })
}
export function addFood(params) {
  return request({
    url: '/dish/food',
    method: 'post',
    params: params
  })
}
export function removeFood(params) {
  return request({
    url: '/dish/food/' + params,
    method: 'delete'
  })
}
export function batchRemoveFood(params) {
  return request({
    url: '/dish/food/ids',
    method: 'delete',
    params: params
  })
}
export function editFood(params) {
  return request({
    url: '/dish/food',
    method: 'put',
    params: params
  })
}
export function changeSaleStatus(params) {
  return request({
    url: '/dish/saleable/' + params,
    method: 'put'
  })
}
export function getFoodNodes(params) {
  return request({
    url: '/dish/food/cid/' + params,
    method: 'get'
  })
}
