import request from '@/utils/request'
export function getCouponsData(params) {
  return request({
    url: '/coupons/restaurant/page',
    method: 'get',
    params: params
  })
}
export function addCoupon(params) {
  return request({
    url: '/coupons/restaurant',
    method: 'post',
    params: params
  })
}
export function editCoupon(params) {
  return request({
    url: '/coupons/restaurant',
    method: 'put',
    params: params
  })
}
export function changeStatus(params) {
  return request({
    url: '/coupons/restaurant/status/' + params,
    method: 'put'
  })
}
export function removeCoupon(params) {
  return request({
    url: '/coupons/restaurant/' + params,
    method: 'delete'
  })
}
export function batchRemoveCoupons(params) {
  return request({
    url: '/coupons/restaurant/ids',
    method: 'delete',
    params: params
  })
}
