import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/oa/user/login',
    method: 'post',
    data
  })
}

export function getInfo() {
  // Get token directly from localStorage or sessionStorage
  const storedToken = localStorage.getItem('Admin-Token') || sessionStorage.getItem('Admin-Token')
  
  return request({
    url: '/oa/user/info',
    method: 'get',
    params: { token: storedToken }
  })
}

export function logout() {
  return request({
    url: '/oa/user/logout',
    method: 'post'
  })
}