import request from '@/utils/request'
export function getRestaurantNodes(params) {
  return request({
    url: '/shop/restaurant/res',
    method: 'get',
    params: params
  })
}
export function getMenuPage(params) {
  return request({
    url: '/shop/menu/page',
    method: 'get',
    params: params
  })
}
export function getMenuCategoryPage(params) {
  return request({
    url: '/shop/cat/page',
    method: 'get',
    params: params
  })
}
export function getMenuFoodPage(params) {
  return request({
    url: '/shop/mfood/page',
    method: 'get',
    params: params
  })
}
export function getCatNodes(params) {
  return request({
    url: '/shop/cat/nodes/' + params,
    method: 'get'
  })
}
export function changeStatus(params) {
  return request({
    url: '/shop/mfood/saleable/' + params,
    method: 'put'
  })
}
export function changeRecommendStatus(params) {
  return request({
    url: '/shop/mfood/recommend/' + params,
    method: 'put'
  })
}
export function addMenu(params) {
  return request({
    url: '/shop/menu',
    method: 'post',
    params: params
  })
}
export function addMenuCategory(params) {
  return request({
    url: '/shop/cat',
    method: 'post',
    params: params
  })
}
export function addMenuFood(params) {
  return request({
    url: '/shop/mfood',
    method: 'post',
    params: params
  })
}
export function removeMenu(params) {
  return request({
    url: '/shop/menu/' + params,
    method: 'delete'
  })
}
export function batchRemoveMenu(params) {
  return request({
    url: '/shop/menu/ids',
    method: 'delete',
    params: params
  })
}
export function editMenu(params) {
  return request({
    url: '/shop/menu',
    method: 'put',
    params: params
  })
}
export function editMenuCategory(params) {
  return request({
    url: '/shop/cat',
    method: 'put',
    params: params
  })
}
export function editMenuFood(params) {
  return request({
    url: '/shop/mfood',
    method: 'put',
    params: params
  })
}
export function removeMenuFood(params) {
  return request({
    url: '/shop/mfood/' + params,
    method: 'delete'
  })
}
export function batchRemoveMenuFood(params) {
  return request({
    url: '/shop/mfood/ids',
    method: 'delete',
    params: params
  })
}
export function removeMenuFoodCat(params) {
  return request({
    url: '/shop/cat/' + params,
    method: 'delete'
  })
}
export function batchRemoveMenuFoodCat(params) {
  return request({
    url: '/shop/cat/ids',
    method: 'delete',
    params: params
  })
}