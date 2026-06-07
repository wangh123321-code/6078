import request from '../utils/request'

export const createBreeding = (data) => {
  return request({
    url: '/breedings',
    method: 'post',
    data,
  })
}

export const updateBreeding = (id, data) => {
  return request({
    url: `/breedings/${id}`,
    method: 'put',
    data,
  })
}

export const updateBreedingStatus = (id, status) => {
  return request({
    url: `/breedings/${id}/status`,
    method: 'patch',
    params: { status },
  })
}

export const addKitten = (id, kittenCatNo) => {
  return request({
    url: `/breedings/${id}/kittens`,
    method: 'post',
    params: { kittenCatNo },
  })
}

export const getBreeding = (id) => {
  return request({
    url: `/breedings/${id}`,
    method: 'get',
  })
}

export const getBreedings = (params) => {
  return request({
    url: '/breedings',
    method: 'get',
    params,
  })
}

export const getBreedingByCat = (catId) => {
  return request({
    url: `/breedings/cat/${catId}`,
    method: 'get',
  })
}

export const getKittens = (id) => {
  return request({
    url: `/breedings/${id}/kittens`,
    method: 'get',
  })
}
