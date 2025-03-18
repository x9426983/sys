// @/api/lineOrders.js
import request from '@/utils/request'

// Assign order to line
export function assignOrderToLine(data) {
  return request({
    url: '/line/order/assign',
    method: 'post',
    data: {
      lineId: data.lineId,
      orderId: data.orderId
    }
  })
}

// Remove order from line
export function removeOrderFromLine(data) {
  return request({
    url: '/line/order/remove',
    method: 'post',
    data: {
      lineId: data.lineId,
      orderId: data.orderId
    }
  })
}