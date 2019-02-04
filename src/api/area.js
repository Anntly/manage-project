import request from '@/utils/request'
// 本来应该单独做出一个微服务，但是内存不够用
export function getArea(params) {
  return request({
    url: '/area',
    method: 'get',
    params: params
  })
}