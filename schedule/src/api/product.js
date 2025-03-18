import request from '@/utils/request'

/**
 * 获取产品列表（分页）
 * @param {Object} params - 查询参数
 * @returns {Promise}
 */
export function getProductList(params) {
  return request({
    url: '/sys/product/list',
    method: 'get',
    params
  })
}

/**
 * 获取产品详情（包含任务和设备）
 * @param {String|Number} productId - 产品ID
 * @returns {Promise}
 */
export function getProductDetail(productId) {
  return request({
    url: `/sys/product/${productId}`,
    method: 'get'
  })
}

/**
 * 添加产品（包含任务和设备）
 * @param {Object} data - 产品数据
 * @returns {Promise}
 */
export function addProduct(data) {
  return request({
    url: '/sys/product',
    method: 'post',
    data
  })
}

/**
 * 更新产品（包含任务和设备）
 * @param {Object} data - 产品数据
 * @returns {Promise}
 */
export function updateProduct(data) {
  return request({
    url: '/sys/product',
    method: 'put',
    data
  })
}

/**
 * 删除产品
 * @param {String|Number} productId - 产品ID
 * @returns {Promise}
 */
export function deleteProduct(productId) {
  return request({
    url: `/sys/product/${productId}`,
    method: 'delete'
  })
}