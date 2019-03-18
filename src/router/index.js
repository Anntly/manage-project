import Vue from 'vue'
import Router from 'vue-router'

// const _import = require('./_import_' + process.env.NODE_ENV)
// in development-env not use lazy-loading, because lazy-loading too many pages will cause webpack hot update too slow. so only in production use lazy-loading;
// detail: https://panjiachen.github.io/vue-element-admin-site/#/lazy-loading

Vue.use(Router)

/* Layout */
import Layout from '../views/layout/Layout'

/**
* hidden: true                   if `hidden:true` will not show in the sidebar(default is false)
* alwaysShow: true               if set true, will always show the root menu, whatever its child routes length
*                                if not set alwaysShow, only more than one route under the children
*                                it will becomes nested mode, otherwise not show the root menu
* redirect: noredirect           if `redirect:noredirect` will no redirct in the breadcrumb
* name:'router-name'             the name is used by <keep-alive> (must set!!!)
* meta : {
    title: 'title'               the name show in submenu and breadcrumb (recommend set)
    icon: 'svg-name'             the icon show in the sidebar,
  }
**/
export const constantRouterMap = [
  // {
  //   path: '/',
  //   component: Layout,
  //   redirect: '/login',
  //   name: 'login',
  //   hidden: true
  // },
  {
    path: '',
    component: Layout,
    redirect: '/dashboard/dashboard'
  },
  {
    path: '/login',
    component: () => import('@/views/login'),
    name: '登录NxAdmin',
    hidden: true
  },
  {
    path: '/404',
    component: () => import('@/views/errorPage/404'),
    hidden: true
  },
  {
    path: '/401',
    component: () => import('@/views/errorPage/401'),
    hidden: true
  },
  // 报表
  {
    path: '/dashboard',
    component: Layout,
    meta: { title: 'dashboard', icon: 'dashboard' },
    children: [
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('@/views/dashboard/dashboard'),
        meta: { title: 'dashboard', icon: 'dashboard' }
      }
    ]
  },
  // 菜品管理(基础菜品)
  {
    path: '/dish',
    component: Layout,
    redirect: '/dish/dish-manage',
    name: 'dish',
    meta: {
      title: 'Dish',
      icon: 'caipin'
    },
    children: [{
      path: 'dish-manage',
      component: () => import('@/views/dish/dish-manage'),
      name: 'DishManage',
      meta: {
        title: 'DishManage',
        icon: 'manage'
      }
    },
    {
      path: 'category-manage',
      component: () => import('@/views/dish/category-manage'),
      name: 'CategoryManage',
      meta: {
        title: 'CategoryManage',
        icon: 'fenlei'
      }
    }
    ]
  },
  // 餐厅管理(餐厅管理 菜单管理 菜单菜品管理)
  {
    path: '/shop',
    component: Layout,
    redirect: '/shop/restaurant-manage',
    name: 'shop',
    meta: {
      title: 'Shop',
      icon: 'canting_1'
    },
    children: [{
      path: 'restaurant-manage',
      component: () => import('@/views/shop/restaurant-manage'),
      name: 'RestaurantManage',
      meta: {
        title: 'RestaurantManage',
        icon: 'canting'
      }
    },
    {
      path: 'menu-manage',
      component: () => import('@/views/shop/menu-manage'),
      name: 'MenuManage',
      meta: {
        title: 'MenuManage',
        icon: 'navicon-ctgl'
      }
    },
    {
      path: 'menu-cat-manage',
      component: () => import('@/views/shop/menu-cat-manage'),
      name: 'MenuCatManage',
      meta: {
        title: 'MenuCatManage',
        icon: 'fenlei'
      },
      hidden: true
    },
    {
      path: 'menu-food-manage',
      component: () => import('@/views/shop/menu-food-manage'),
      name: 'MenuFoodManage',
      meta: {
        title: 'MenuFoodManage',
        icon: 'navicon-cprkd'
      },
      hidden: true
    },
    {
      path: 'room-manage',
      component: () => import('@/views/shop/room-manage'),
      name: 'RoomManage',
      meta: {
        title: 'RoomManage',
        icon: 'fangjian'
      },
      hidden: true
    },
    {
      path: 'desk-manage',
      component: () => import('@/views/shop/desk-manage'),
      name: 'DeskManage',
      meta: {
        title: 'DeskManage',
        icon: 'fanzhuo'
      },
      hidden: true
    }

    ]
  },
  // 员工相关
  {
    path: '/employee',
    component: Layout,
    redirect: '/employee/employee-manage',
    children: [{
      path: 'employee-manage',
      name: 'employee',
      component: () => import('@/views/employee/employee-manage'),
      meta: { title: 'EmployeeManage', icon: 'yuangong' }
    }]
  },
  // 优惠券相关
  {
    path: '/coupon',
    component: Layout,
    redirect: '/coupon/coupon-manage',
    children: [{
      path: 'coupon-manage',
      name: 'coupon',
      component: () => import('@/views/coupon/coupon-manage'),
      meta: { title: 'CouponManage', icon: 'youhuiquan' }
    }]
  },
  // 订单相关
  {
    path: '/order',
    component: Layout,
    redirect: '/order/order-manage',
    name: 'order',
    meta: {
      title: 'order',
      icon: 'dingdan'
    },
    children: [{
      path: 'order-manage',
      name: 'OrderManage',
      component: () => import('@/views/order/order-manage'),
      meta: { title: 'OrderManage', icon: 'dingdan' }
    },
    {
      path: 'order-detail',
      name: 'OrderDetail',
      component: () => import('@/views/order/order-detail'),
      meta: { title: 'OrderDetail', icon: 'dingdan' },
      hidden: true
    },
    {
      path: 'place-order',
      name: 'PlaceOrder',
      component: () => import('@/views/order/place-order'),
      meta: { title: 'PlaceOrder', icon: 'xiadan' }
    }]
  },
  // 报表相关
  {
    path: '/charts',
    component: Layout,
    redirect: '/charts/order-report',
    name: 'report',
    meta: {
      title: 'report',
      icon: 'report'
    },
    children: [{
      path: 'order-report',
      name: 'OrderReport',
      component: () => import('@/views/charts/order-report'),
      meta: { title: 'OrderReport', icon: 'report' }
    },
    {
      path: 'dish-report',
      name: 'DishReport',
      component: () => import('@/views/charts/dish-report'),
      meta: { title: 'DishReport', icon: 'report' }
    }]
  },
  // 用户相关
  {
    path: '/user',
    component: Layout,
    redirect: '/user/admin-manage',
    name: 'User',
    meta: {
      title: 'User',
      icon: 'user'
    },
    children: [{
      path: 'admin-manage',
      name: 'AdminManage',
      component: () => import('@/views/user/admin-manage'),
      meta: { title: 'AdminManage', icon: 'admin' },
      hidden: true
    },
    {
      path: 'user-manage',
      name: 'UserManage',
      component: () => import('@/views/user/user-manage'),
      meta: { title: 'UserManage', icon: 'user' }
    },
    {
      path: 'user-info',
      name: 'UserInfo',
      component: () => import('@/views/user/user-info'),
      meta: { title: 'UserInfo', icon: 'userInfo' },
      hidden: true
    },
    {
      path: 'role-permission',
      name: 'RolePermission',
      component: () => import('@/views/user/role-permission'),
      meta: { title: 'RolePermission', icon: 'role' }
    },
    {
      path: 'change-pass',
      name: 'ChangePass',
      component: () => import('@/views/user/change-pass'),
      meta: { title: 'ChangePass', icon: 'pass' },
      hidden: true
    }]
  },
  // 锁屏
  {
    path: '/lock',
    hidden: true,
    name: '锁屏页',
    component: () => import('@/views/common/lock')
  }
]

export default new Router({
  // mode: 'history', //后端支持可开
  scrollBehavior: () => ({
    y: 0
  }),
  routes: constantRouterMap
})
export const asyncRouterMap = [
  {
    path: '/error',
    component: Layout,
    redirect: 'noredirect',
    name: 'errorPages',
    hidden: true,
    meta: {
      title: 'errorPages',
      icon: '404'
    },
    children: [{
      path: '401',
      component: () => import('@/views/errorPage/401'),
      name: 'page401',
      meta: {
        title: 'page401',
        noCache: true
      }
    },
    {
      path: '404',
      component: () => import('@/views/errorPage/404'),
      name: 'page404',
      meta: {
        title: 'page404',
        noCache: true
      }
    }
    ]
  },
  {
    path: '*',
    redirect: '/404',
    hidden: true
  }
]
