import request from '@/utils/request'

/**
 * 获取订单列表（分页）
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function getOrderList(params) {
  return request({
    url: '/order',
    method: 'get',
    params
  })
}

/**
 * 获取订单详情
 * @param {Number|String} orderId - 订单ID
 * @returns {Promise}
 */
export function getOrderDetail(orderId) {
  return request({
    url: `/order/${orderId}`,
    method: 'get'
  })
}

/**
 * 获取所有订单
 * @returns {Promise}
 */
export function getAllOrders() {
  return request({
    url: '/order/all',
    method: 'get'
  })
}

/**
 * 添加订单
 * @param {Object} data - 订单数据
 * @returns {Promise}
 */
export function addOrder(data) {
  return request({
    url: '/order/add',
    method: 'post',
    data
  })
}

/**
 * 更新订单
 * @param {Object} data - 订单数据
 * @returns {Promise}
 */
export function updateOrder(data) {
  return request({
    url: '/order/update',
    method: 'put',
    data
  })
}

/**
 * 删除订单
 * @param {Number} orderId - 订单ID
 * @param {Number} proId - 产品ID
 * @returns {Promise}
 */
export function deleteOrder(orderId, proId) {
  return request({
    url: '/order/delete',
    method: 'delete',
    params: {orderId,proId}
  })
}

export function fetchOrders(query) {
  return request({
    url: '/order/list',
    method: 'get',
    params: {
      pageNum: query.page || 1,
      pageSize: query.pageSize || 100
    }
  })
}

export function fetchOrderById(id) {
  return request({
    url: `/order/${id}`,
    method: 'get'
  })
}
