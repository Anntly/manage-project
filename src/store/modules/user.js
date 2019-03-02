import {
  login,
  logout,
  getInfo,
  relogin
} from '@/api/login'
import {
  getToken,
  setToken,
  removeToken,
  getReToken,
  removeReToken,
  setRememberMe
} from '@/utils/auth'

const user = {
  state: {
    token: getToken(),
    reToken: getReToken(),
    name: '',
    avatar: '',
    roles: []

  },

  mutations: {
    SET_TOKEN: (state, token) => {
      state.token = token
    },
    SET_RETOKEN: (state, reToken) => {
      state.reToken = reToken
    },
    SET_NAME: (state, name) => {
      state.name = name
    },
    SET_AVATAR: (state, avatar) => {
      state.avatar = avatar
    },
    SET_ROLES: (state, roles) => {
      state.roles = roles
    }

  },

  actions: {
    // 登录
    Login({
      commit
    }, userInfo) {
      const username = userInfo.username.trim()
      return new Promise((resolve, reject) => {
        login(username, userInfo.password).then(response => {
          const data = response
          setToken(data.token)
          commit('SET_TOKEN', data.token)
          commit('SET_RETOKEN', data.reToken)
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 刷新token
    ReLogin({
      commit,
      state
    }, reToken) {
      return new Promise((resolve, reject) => {
        relogin(reToken).then(response => {
          const data = response
          setToken(data.accessToken)
          commit('SET_TOKEN', data.accessToken)
          commit('SET_RETOKEN', data.refresh_token)
          localStorage.setItem('JWT_TOKEN', data.jwt_token) // 将jwt存入localStorage
          resolve(data)
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 获取用户信息
    GetInfo({
      commit,
      state
    }) {
      return new Promise((resolve, reject) => {
        getInfo(state.token).then(response => {
          localStorage.setItem('JWT_TOKEN', response)
          const userString = decodeURIComponent(escape(window.atob(response.split('.')[1])))
          const user = JSON.parse(userString)
          if (user.roles && user.roles.length > 0) { // 验证返回的roles是否是一个非空数组
            commit('SET_ROLES', user.roles)
          } else {
            reject('getInfo: roles must be a non-null array !')
          }
          commit('SET_NAME', user.user_name)
          commit('SET_AVATAR', user.avatar)
          resolve(user.roles)
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 登出
    LogOut({
      commit,
      state
    }) {
      return new Promise((resolve, reject) => {
        console.log('执行退出')
        logout(state.token, state.reToken).then(() => {
          commit('SET_TOKEN', '')
          commit('SET_ROLES', [])
          setRememberMe(false)
          removeToken()
          removeReToken()
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },

    // 前端 登出
    FedLogOut({
      commit
    }) {
      return new Promise(resolve => {
        commit('SET_TOKEN', '')
        commit('SET_RETOKEN', '')
        commit('SET_ROLES', [])
        setRememberMe(false)
        removeToken()
        removeReToken()
        resolve()
      })
    },
    // 动态修改权限
    ChangeRoles({
      commit
    }, role) {
      return new Promise(resolve => {
        commit('SET_TOKEN', role)
        setToken(role)
        getInfo(role).then(response => {
          const data = response
          commit('SET_ROLES', data.roles)
          commit('SET_NAME', data.name)
          commit('SET_AVATAR', data.avatar)
          resolve()
        })
      })
    }
  }
}

export default user
