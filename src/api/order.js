import request from '@/utils/request'
export function getOrderPage(params) {
  return request({
    url: '/order/restaurant/page',
    method: 'get',
    params: params
  })
}
export function addOrder(params) {
  return request({
    url: '/order/restaurant',
    method: 'post',
    data: params
  })
}
export function removeOrder(params) {
  return request({
    url: '/order/restaurant/' + params,
    method: 'delete'
  })
}
export function editOrder(params) {
  return request({
    url: '/order/restaurant',
    method: 'put',
    params: params
  })
}
export function settlement(id) {
  return request({
    url: '/order/restaurant/settlement',
    method: 'put',
    params: {
      id
    }
  })
}
export function haspay(id) {
  return request({
    url: '/order/restaurant/haspay',
    method: 'put',
    params: {
      id
    }
  })
}
export function getOrderDetailPage(params) {
  return request({
    url: '/order/detail/page',
    method: 'get',
    params: params
  })
}
export function addOrderDetail(params) {
  return request({
    url: '/order/detail',
    method: 'post',
    params: params
  })
}
export function removeOrderDetail(params) {
  return request({
    url: '/order/detail/' + params,
    method: 'delete'
  })
}
export function batchRemoveDetails(params) {
  return request({
    url: '/order/detail/ids',
    method: 'delete',
    params: params
  })
}
export function editOrderDetail(params) {
  return request({
    url: '/order/detail',
    method: 'put',
    params: params
  })
}
export function getOrderReport(restaurantId) {
  return request({
    url: '/order/restaurant/report/order',
    method: 'get',
    params: {
      restaurantId
    }
  })
}
export function getOrderExpend(restaurantId) {
  return request({
    url: '/order/restaurant/report/expend',
    method: 'get',
    params: {
      restaurantId
    }
  })
}
export function getOrderPayType(restaurantId) {
  return request({
    url: '/order/restaurant/report/paytype',
    method: 'get',
    params: {
      restaurantId
    }
  })
}
export function getFoodReportNode(restaurantId) {
  return request({
    url: '/order/detail/report/food',
    method: 'get',
    params: {
      restaurantId
    }
  })
}