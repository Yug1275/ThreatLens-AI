/**
 * aiService.js — Frontend AI API Service
 * Phase 9 AI Intelligence Engine
 */
import api from '../utils/axios';

const AI_BASE = '/api/v1/ai';

const aiService = {
  /**
   * Re-run AI enrichment on an existing investigation.
   * @param {string} investigationId
   * @param {{ force?: boolean }} options
   * @returns {Promise<{ status: string, investigation_id: string, ai_analysis: object }>}
   */
  enrichInvestigation: (investigationId, options = {}) =>
    api.post(`${AI_BASE}/enrich/${investigationId}`, options).then(r => r.data),

  /**
   * Correlate IOCs across multiple investigations.
   * @param {string[]} investigationIds
   * @returns {Promise<{ status: string, correlation: object }>}
   */
  correlateIOCs: (investigationIds) =>
    api.post(`${AI_BASE}/correlate`, { investigation_ids: investigationIds }).then(r => r.data),

  /**
   * Generate an executive report from selected investigations.
   * @param {string[]} investigationIds
   * @returns {Promise<{ status: string, report: object }>}
   */
  generateReport: (investigationIds) =>
    api.post(`${AI_BASE}/executive-report`, { investigation_ids: investigationIds }).then(r => r.data),

  /**
   * Check AI service health and configuration.
   * @returns {Promise<object>}
   */
  getStatus: () =>
    api.get(`${AI_BASE}/status`).then(r => r.data),
};

export default aiService;
