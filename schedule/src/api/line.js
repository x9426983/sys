// @/api/line.js
import request from '@/utils/request'

// 获取产线列表
export function fetchProductionLines() {
  return request({
    url: '/line/list',
    method: 'get'
  })
}

// 创建产线
export function createProductionLine(data) {
  return request({
    url: '/line/add',
    method: 'post',
    data
  })
}

// 更新产线
export function updateProductionLine(data) {
  return request({
    url: '/line/update',
    method: 'put',
    data
  })
}

// 删除产线
export function deleteProductionLine(lineId) {
  return request({
    url: `/line/delete/${lineId}`,
    method: 'delete'
  })
}

// 获取产线详情
export function getProductionLineDetail(lineId) {
  return request({
    url: `/line/detail/${lineId}`,
    method: 'get'
  })
}