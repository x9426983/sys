// @/api/schedule.js
import request from '@/utils/request'

/**
 * 计算产线调度结果
 * @param {number} lineId 产线ID
 * @returns {Promise} 调度结果
 */
export function calculateSchedule(params) {
    // 处理不同类型的输入参数
    const data = typeof params === 'object' ? params : { lineId: params };
    
    return request({
      url: '/schedule/calculate',
      method: 'post',
      data: data
    })
  }
/**
 * 获取调度结果
 * @param {string} resultId 结果ID
 * @returns {Promise} 调度结果
 */
export function getScheduleResult(resultId) {
  return request({
    url: `/schedule/result/${resultId}`,
    method: 'get'
  })
}
  /**
   * 测试图片访问
   * @param {String} imageFileName 图片文件名
   */
export function testImageAccess(imageFileName) {
    return request({
        url: `/schedule/test/image/${imageFileName}`,
        method: 'get'
    })
}