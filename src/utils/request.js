import router from '../router'
import axios from 'axios'
import {
  Message,
  MessageBox
} from 'element-ui'
import store from '../store'
import {
  getToken,
  getReToken,
  setToken,
  setReToken,
  setRememberMe,
  getRememberMe,
  removeReToken,
  removeToken
} from './auth'

window.isRefreshing = false

// 创建axios实例
const service = axios.create({
  baseURL: process.env.BASE_API, // api的base_url
  timeout: 5000, // 请求超时时间
  withCredentials: true // 请求携带cookie
})
// 定义成功访问的status
// const successCodes = [200, 201, 202, 203, 204, 205, 206, 301, 302, 401, 403]

// request拦截器
service.interceptors.request.use(config => {
  if (store.getters.token) {
    // config.headers['X-Token'] = getToken() // 让每个请求携带自定义token 请根据实际情况自行修改
    if (localStorage.JWT_TOKEN) { // 如果有jwt_token就加在请求头中
      config.headers.Authorization = `Bearer ${localStorage.JWT_TOKEN}`
    }
  }
  return config
}, error => {
  // Do something with request error
  console.log(error) // for debug
  Promise.reject(error)
})

// respone拦截器
service.interceptors.response.use(
  response => {
    /**
     * 返回ResponseEntity 所以判断的是status，不为200就打印出错误信息
     */

    // 50008:非法的token; 50012:其他客户端登录了;  50014:Token 过期了;
    // if (res.code === 50008 || res.code === 50012 || res.code === 50014) {
    //   MessageBox.confirm('你已被登出，可以取消继续留在该页面，或者重新登录', '确定登出', {
    //     confirmButtonText: '重新登录',
    //     cancelButtonText: '取消',
    //     type: 'warning'
    //   }).then(() => {
    //     store.dispatch('FedLogOut').then(() => {
    //       location.reload()// 为了重新实例化vue-router对象 避免bug
    //     })
    //   })
    // }
    // return Promise.reject('error')
    return response.data
    // }
  },
  error => {
    // if (error.response !== null) {
    //   Message({
    //     message: error.response.data.message,
    //     type: 'error',
    //     duration: 5 * 1000
    //   })
    // }
    // Message({
    //   message: error.message,
    //   type: 'error',
    //   duration: 5 * 1000
    // })
    // return Promise.reject(error)
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // 返回 401 如果选择记住我 就刷新token && router.currentRoute.name !== null
          if (router.currentRoute.name !== '登录NxAdmin' && router.currentRoute.name !== null) {
            // && !window.isRefreshing
            if (getRememberMe() && getReToken() != null && !window.isRefreshing) {
              // 刷新token
              console.log('刷新token')
              window.isRefreshing = true
              doRequest(error)
            }
            break
          } else {
            Message({
              message: '您没有操作此功能的权限或者身份已经过期，请重新登录',
              type: 'error',
              duration: 5 * 1000
            })
            localStorage.setItem('JWT_TOKEN', null)
            window.isRefreshing = false
            store.dispatch('FedLogOut').then(() => {
              location.reload() // 为了重新实例化vue-router对象 避免bug
            })
            // router.push({
            //   name: '登录NxAdmin'
            // })          
            break
          }
        case 3000:
          store.dispatch('FedLogOut').then(() => {
            location.reload() // 为了重新实例化vue-router对象 避免bug
          })
          break
        case 3001:
          window.isRefreshing = true
          doRequest(error)
          break
      }
    }
  }

  // return Promise.reject(error) // 返回接口返回的错误信息
)

async function doRequest(error) {
  let res = null
  store.dispatch('ReLogin', getReToken())
  // console.log('取出refresh_token为:' + getReToken())
  const config = error.response.config
  console.log('更新后的token' + getToken())
  // config.headers.Authorization = `Bearer` + data.jwt_token
  config.headers.Authorization = `Bearer ${localStorage.JWT_TOKEN}`
  // 表示已经刷新了
  // 由于 后台修改了cookie
  Message({
    message: '由于身份过期,请重新点击请求',
    type: 'info',
    duration: 5 * 1000
  })

  res = await service.request(config)
  window.isRefreshing = false
  return res
}

export default service
