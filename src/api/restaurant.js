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
export function getRoomListPage(params) {
  return request({
    url: '/shop/room/page',
    method: 'get',
    params: params
  })
}
export function editRoom(params) {
  return request({
    url: '/shop/room',
    method: 'put',
    params: params
  })
}
export function addRoom(params) {
  return request({
    url: '/shop/room',
    method: 'post',
    params: params
  })
}
export function removeRoom(params) {
  return request({
    url: '/shop/room/' + params,
    method: 'delete'
  })
}
export function batchRemoveRoom(params) {
  return request({
    url: '/shop/room/ids',
    method: 'delete',
    params: params
  })
}

export function getDeskListPage(params) {
  return request({
    url: '/shop/desk/page',
    method: 'get',
    params: params
  })
}
export function getDeskNodes(restaurantId) {
  return request({
    url: '/shop/desk/nodes',
    method: 'get',
    params: {
      restaurantId
    }
  })
}
export function editDesk(params) {
  return request({
    url: '/shop/desk',
    method: 'put',
    params: params
  })
}
export function addDesk(params) {
  return request({
    url: '/shop/desk',
    method: 'post',
    params: params
  })
}
export function removeDesk(params) {
  return request({
    url: '/shop/desk/' + params,
    method: 'delete'
  })
}
export function batchRemoveDesk(params) {
  return request({
    url: '/shop/desk/ids',
    method: 'delete',
    params: params
  })
}
