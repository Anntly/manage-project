import request from '@/utils/request'
export function getRestaurantNodes(params) {
  return request({
    url: '/shop/restaurant/res',
    method: 'get',
    params: params
  })
}
export function getmenus(params) {
  return request({
    url: '/shop/menu/page',
    method: 'get',
    params: params
  })
}
