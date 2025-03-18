import request from '@/utils/request'

export function getEquipmentList(params) {
  return request({
    url: '/sys/equipment-info/list',
    method: 'get',
    params
  })
}

export function getEquipmentById(equipmentId) {
  return request({
    url: `/sys/equipment-info/${equipmentId}`,
    method: 'get'
  })
}

export function addEquipment(data) {
  return request({
    url: '/sys/equipment-info/add',
    method: 'post',
    data
  })
}

export function updateEquipment(data) {
  return request({
    url: `/sys/equipment-info/update`,
    method: 'put',
    data
  })
}

export function deleteEquipment(equipmentId) {
  return request({
    url: `/sys/equipment-info/delete/${equipmentId}`,
    method: 'delete'
  })
}

export function fetchEquipment(query) {
  return request({
    url: '/equipment/list',
    method: 'get',
    params: {
      pageNum: query.page || 1,
      pageSize: query.pageSize || 100
    }
  })
}

export function fetchEquipmentById(id) {
  return request({
    url: `/equipment/${id}`,
    method: 'get'
  })
}
