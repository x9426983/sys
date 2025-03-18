// @/api/productionLine.js
import request from '@/utils/request'

// Fetch production lines with pagination
export function fetchProductionLines(query) {
  return request({
    url: '/line/list',
    method: 'get',
    params: {
      pageNum: query.page,
      pageSize: query.limit
    }
  })
}

// Create new production line
export function createProductionLine(data) {
  return request({
    url: '/line/add',
    method: 'post',
    data: {
      lineId: data.lineId,
      lineManager: data.lineManager
    }
  })
}

// Update production line
export function updateProductionLine(data) {
  return request({
    url: `/line/${data.lineId}`,
    method: 'put',
    data: {
      lineId: data.lineId,
      lineManager: data.lineManager
    }
  })
}

// Delete production line
export function deleteProductionLine(lineId) {
  return request({
    url: `/line/${lineId}`,
    method: 'delete'
  })
}

// Fetch orders for a specific line
export function fetchLineOrders(lineId) {
  return request({
    url: `/line/${lineId}/orders`,
    method: 'get'
  })
}

// Fetch equipment for a specific line
export function fetchLineEquipment(lineId) {
  return request({
    url: `/line/${lineId}/equipment`,
    method: 'get'
  })
}