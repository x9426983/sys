// @/api/lineEquipment.js
import request from '@/utils/request'

// Assign equipment to line
export function assignEquipmentToLine(data) {
  return request({
    url: '/line/equipment/assign',
    method: 'post',
    data: {
      lineId: data.lineId,
      equipmentId: data.equipmentId,
      quantity: data.quantity
    }
  })
}

// Remove equipment from line
export function removeEquipmentFromLine(data) {
  return request({
    url: '/line/equipment/remove',
    method: 'post',
    data: {
      lineId: data.lineId,
      equipmentId: data.equipmentId
    }
  })
}