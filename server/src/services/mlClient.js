const axios = require('axios');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';

/**
 * Communicates with the Python FastAPI ML Service
 */
class MLClient {
  /**
   * Predict Category & Department using TF-IDF + Classifier
   */
  static async predictCategory(text) {
    try {
      const response = await axios.post(`${ML_SERVICE_URL}/predict-category`, {
        text: text
      }, { timeout: 3500 });

      return response.data;
    } catch (error) {
      console.warn(`[ML Service Warning] Category prediction fallback: ${error.message}`);
      // Explainable heuristic fallback if Python service is temporarily unreachable
      return this.heuristicCategoryPredict(text);
    }
  }

  /**
   * Detect duplicate complaints using text similarity + geospatial distance
   */
  static async detectDuplicates(description, coordinates, candidates) {
    try {
      const response = await axios.post(`${ML_SERVICE_URL}/detect-duplicates`, {
        description: description,
        coordinates: coordinates,
        candidates: candidates
      }, { timeout: 4000 });

      return response.data;
    } catch (error) {
      console.warn(`[ML Service Warning] Duplicate detection fallback: ${error.message}`);
      return {
        is_duplicate: false,
        duplicate_of_id: null,
        similarity_score: 0,
        distance_meters: null,
        explanation: 'ML service offline; manual duplicate review recommended.'
      };
    }
  }

  /**
   * Calculate Priority Score
   */
  static async calculatePriority(payload) {
    try {
      const response = await axios.post(`${ML_SERVICE_URL}/priority-score`, payload, {
        timeout: 3500
      });
      return response.data;
    } catch (error) {
      console.warn(`[ML Service Warning] Priority scoring fallback: ${error.message}`);
      return this.heuristicPriority(payload);
    }
  }

  /**
   * Transparent Rule-Based Fallback for Category Prediction
   */
  static heuristicCategoryPredict(text) {
    const lower = text.toLowerCase();
    if (lower.includes('pothole') || lower.includes('road') || lower.includes('crater') || lower.includes('asphalt') || lower.includes('tar')) {
      return {
        category: 'Potholes & Damaged Roads',
        confidence: 0.85,
        suggested_department: 'Roads & Infrastructure',
        is_fallback: true
      };
    }
    if (lower.includes('garbage') || lower.includes('trash') || lower.includes('waste') || lower.includes('dump') || lower.includes('dustbin') || lower.includes('smell')) {
      return {
        category: 'Garbage Accumulation & Sanitation',
        confidence: 0.88,
        suggested_department: 'Sanitation & Solid Waste',
        is_fallback: true
      };
    }
    if (lower.includes('drain') || lower.includes('drainage') || lower.includes('clog') || lower.includes('sewage') || lower.includes('waterlog') || lower.includes('manhole')) {
      return {
        category: 'Blocked Drainage & Waterlogging',
        confidence: 0.86,
        suggested_department: 'Drainage & Sewerage',
        is_fallback: true
      };
    }
    if (lower.includes('light') || lower.includes('lamp') || lower.includes('dark') || lower.includes('pole') || lower.includes('wire') || lower.includes('bulb')) {
      return {
        category: 'Broken Streetlights & Electrical',
        confidence: 0.87,
        suggested_department: 'Electrical & Street Lighting',
        is_fallback: true
      };
    }
    if (lower.includes('leak') || lower.includes('pipe') || lower.includes('pipeline') || lower.includes('supply') || lower.includes('burst')) {
      return {
        category: 'Water Leakage & Pipeline Issues',
        confidence: 0.89,
        suggested_department: 'Water Supply & Sewerage',
        is_fallback: true
      };
    }
    if (lower.includes('footpath') || lower.includes('sidewalk') || lower.includes('pavement') || lower.includes('bench') || lower.includes('railing')) {
      return {
        category: 'Damaged Footpaths & Public Infrastructure',
        confidence: 0.82,
        suggested_department: 'Public Works & Infrastructure',
        is_fallback: true
      };
    }
    return {
      category: 'Other Civic Grievances',
      confidence: 0.50,
      suggested_department: 'Municipal Administration',
      is_fallback: true
    };
  }

  /**
   * Transparent Rule-Based Fallback for Priority
   */
  static heuristicPriority(payload) {
    const text = (payload.description || '').toLowerCase();
    let score = 50;
    let reasons = [];

    // Critical severity indicators
    if (text.includes('accident') || text.includes('hazard') || text.includes('spark') || text.includes('live wire') || text.includes('open manhole') || text.includes('flood') || text.includes('hospital') || text.includes('school')) {
      score += 35;
      reasons.push('High-risk public safety or emergency keywords detected');
    }

    // Category base weight
    if (['Broken Streetlights & Electrical', 'Blocked Drainage & Waterlogging'].includes(payload.category)) {
      score += 10;
      reasons.push('Category involves active infrastructure or electrical hazard');
    }

    // Repeat reports weight
    if (payload.report_count && payload.report_count > 1) {
      score += Math.min(20, payload.report_count * 5);
      reasons.push(`Reported by multiple citizens (${payload.report_count} reports)`);
    }

    let priority = 'Medium';
    if (score >= 70) priority = 'High';
    else if (score <= 40) priority = 'Low';

    return {
      priority: priority,
      score: Math.min(100, score),
      explanation: reasons.length ? reasons.join('. ') : 'Standard municipal priority evaluation based on category and description.',
      is_fallback: true
    };
  }
}

module.exports = MLClient;
