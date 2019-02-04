import request from '@/utils/request'
export function getRestaurantListPage(params) {
  return request({
    url: '/shop/restaurant/page',
    method: 'get',
    params: params
  })
}
export function addRestaurant(params) {
  return request({
    url: '/shop/restaurant',
    method: 'post',
    params: params
  })
}
export function removeRestaurant(params) {
  return request({
    url: '/shop/restaurant/' + params,
    method: 'delete'
  })
}
export function batchRestaurant(params) {
  return request({
    url: '/shop/restaurant/ids',
    method: 'delete',
    params: params
  })
}
export function editRestaurant(params) {
  return request({
    url: '/shop/restaurant',
    method: 'put',
    params: params
  })
}

