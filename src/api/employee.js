import request from '@/utils/request'
export function getEmployeeData(params) {
  return request({
    url: '/shop/employee/page',
    method: 'get',
    params: params
  })
}
export function addEmployee(params) {
  return request({
    url: '/shop/employee',
    method: 'post',
    params: params
  })
}
export function editEmployee(params) {
  return request({
    url: '/shop/employee',
    method: 'put',
    params: params
  })
}
export function getEmployeeListByRid(resturantId) {
  return request({
    url: '/shop/employee/re',
    method: 'get',
    params: {
      resturantId
    }
  })
}
