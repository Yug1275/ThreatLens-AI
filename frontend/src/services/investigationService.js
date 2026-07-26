/**
 * investigationService.js
 * Centralized service for all Investigation API calls.
 * Uses the shared axios instance (with JWT interceptor) from utils/axios.js.
 */
import api from '../utils/axios';

const BASE = '/api/v1/investigation';

const investigationService = {
  /**
   * Fetch a paginated, optionally-filtered list of investigations.
   * @param {{ page?: number, limit?: number, type?: string, status?: string, search?: string, sort_by?: string, sort_order?: string }} params
   * @returns {Promise<{ items: Investigation[], total: number, page: number, pages: number, limit: number }>}
   */
  getAll: (params = {}) => {
    const query = new URLSearchParams();
    if (params.page)       query.set('page',       params.page);
    if (params.limit)      query.set('limit',      params.limit);
    if (params.type)       query.set('type',       params.type);
    if (params.status)     query.set('status',     params.status);
    if (params.search)     query.set('search',     params.search);
    if (params.sort_by)    query.set('sort_by',    params.sort_by);
    if (params.sort_order) query.set('sort_order', params.sort_order);
    return api.get(`${BASE}/?${query.toString()}`).then(r => r.data);
  },

  /**
   * Fetch a single investigation by ID.
   * @param {string} id
   * @returns {Promise<Investigation>}
   */
  getById: (id) => api.get(`${BASE}/${id}`).then(r => r.data),

  /**
   * Soft-delete an investigation.
   * @param {string} id
   * @returns {Promise<void>}
   */
  deleteInvestigation: (id) => api.delete(`${BASE}/${id}`),

  /**
   * Submit a URL investigation.
   * @param {string} url
   * @returns {Promise<Investigation>}
   */
  submitUrl: (url) => api.post(`${BASE}/url`, { url }).then(r => r.data),

  /**
   * Submit a phone number investigation.
   * @param {string} phoneNumber
   * @returns {Promise<Investigation>}
   */
  submitPhone: (phoneNumber) =>
    api.post(`${BASE}/phone`, { phone_number: phoneNumber }).then(r => r.data),

  /**
   * Submit an email investigation.
   * @param {{ raw_headers?, sender_email?, subject?, body? }} payload
   * @returns {Promise<Investigation>}
   */
  submitEmail: (payload) => api.post(`${BASE}/email`, payload).then(r => r.data),
};

export default investigationService;
