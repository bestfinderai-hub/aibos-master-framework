/**
 * Continuous Learning Engine
 * Improves predictions and recommendations through iterative learning
 */

class LearningEngine {
  constructor() {
    this.models = new Map(); // modelId -> model
    this.predictions = []; // historical predictions
    this.feedback = []; // user feedback for corrections
    this.learningCycles = [];
    this.performanceMetrics = {};
  }

  // ============================================================================
  // MODEL MANAGEMENT
  // ============================================================================

  registerModel(modelId, type, initialParameters) {
    const model = {
      id: modelId,
      type,
      parameters: initialParameters,
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1,
      accuracy: 0.5, // initial guess
      trainingDataCount: 0,
      predictions: [],
      feedback: [],
      learningRate: 0.1,
      confidence: 0.5
    };

    this.models.set(modelId, model);
    return model;
  }

  updateModelVersion(modelId, newParameters) {
    const model = this.models.get(modelId);
    if (!model) throw new Error(`Model ${modelId} not found`);

    model.version++;
    model.parameters = newParameters;
    model.updatedAt = new Date();

    return model;
  }

  getModel(modelId) {
    return this.models.get(modelId);
  }

  // ============================================================================
  // PREDICTION & FEEDBACK
  // ============================================================================

  recordPrediction(modelId, input, prediction, confidence = 0.7) {
    const model = this.models.get(modelId);
    if (!model) throw new Error(`Model ${modelId} not found`);

    const predictionRecord = {
      id: this.generateId('pred'),
      modelId,
      timestamp: new Date(),
      input,
      prediction,
      confidence,
      actual: null,
      feedback: null,
      error: null,
      status: 'pending'
    };

    this.predictions.push(predictionRecord);
    model.predictions.push(predictionRecord);

    return predictionRecord;
  }

  provideFeedback(predictionId, actual, feedback = null) {
    const prediction = this.predictions.find(p => p.id === predictionId);
    if (!prediction) throw new Error(`Prediction ${predictionId} not found`);

    prediction.actual = actual;
    prediction.feedback = feedback;
    prediction.status = 'evaluated';

    // Calculate error
    if (typeof prediction.prediction === 'number' && typeof actual === 'number') {
      prediction.error = Math.abs(prediction.prediction - actual);
    } else if (typeof prediction.prediction === 'string') {
      prediction.error = prediction.prediction === actual ? 0 : 1;
    }

    this.feedback.push({
      predictionId,
      actual,
      feedback,
      timestamp: new Date()
    });

    // Update model feedback
    const model = this.models.get(prediction.modelId);
    if (model) {
      model.feedback.push({ predictionId, actual, feedback });
    }

    return prediction;
  }

  // ============================================================================
  // LEARNING & MODEL IMPROVEMENT
  // ============================================================================

  runLearningCycle(modelId, batchSize = 100) {
    const model = this.models.get(modelId);
    if (!model) throw new Error(`Model ${modelId} not found`);

    // Collect evaluated predictions
    const evaluatedPredictions = model.predictions.filter(p => p.status === 'evaluated');

    if (evaluatedPredictions.length < 10) {
      return {
        status: 'insufficient_data',
        message: `Need at least 10 evaluated predictions, have ${evaluatedPredictions.length}`
      };
    }

    // Calculate accuracy
    const accuracy = this.calculateAccuracy(evaluatedPredictions);
    const previousAccuracy = model.accuracy;

    // Update model parameters based on feedback
    const newParameters = this.updateParameters(model, evaluatedPredictions);

    // Create learning cycle record
    const cycle = {
      id: this.generateId('cycle'),
      modelId,
      timestamp: new Date(),
      evaluatedCount: evaluatedPredictions.length,
      previousAccuracy,
      newAccuracy: accuracy,
      accuracyImprovement: accuracy - previousAccuracy,
      learningRate: model.learningRate,
      parameterUpdates: this.detectParameterChanges(model.parameters, newParameters)
    };

    this.learningCycles.push(cycle);
    model.accuracy = accuracy;
    model.trainingDataCount += evaluatedPredictions.length;
    model.parameters = newParameters;

    // Adaptive learning rate
    if (cycle.accuracyImprovement > 0.05) {
      model.learningRate = Math.min(model.learningRate * 1.1, 0.5); // Increase if improving
    } else if (cycle.accuracyImprovement < -0.02) {
      model.learningRate = Math.max(model.learningRate * 0.9, 0.01); // Decrease if degrading
    }

    return cycle;
  }

  calculateAccuracy(predictions) {
    if (predictions.length === 0) return 0;

    let correct = 0;
    let totalError = 0;

    for (const pred of predictions) {
      if (pred.error === 0) {
        correct++;
      } else if (typeof pred.error === 'number') {
        totalError += Math.min(pred.error, 1); // normalize to 0-1 range
      }
    }

    // Accuracy = (correct predictions + inverse of error for numeric) / total
    const accuracyScore = (correct + (predictions.length - correct - totalError)) / predictions.length;
    return Math.max(0, Math.min(accuracyScore, 1));
  }

  updateParameters(model, feedback) {
    const newParams = { ...model.parameters };

    // Group feedback by type
    const byType = {};
    for (const pred of feedback) {
      const type = pred.input.type || 'default';
      if (!byType[type]) byType[type] = [];
      byType[type].push(pred);
    }

    // Update parameters based on feedback
    for (const [type, preds] of Object.entries(byType)) {
      const accuracy = this.calculateAccuracy(preds);
      const adjustment = (accuracy - 0.5) * model.learningRate; // -0.05 to +0.05 range

      if (!newParams[type]) newParams[type] = 0.5;
      newParams[type] = Math.max(0, Math.min(newParams[type] + adjustment, 1));
    }

    return newParams;
  }

  detectParameterChanges(oldParams, newParams) {
    const changes = [];

    for (const key of Object.keys(newParams)) {
      const oldValue = oldParams[key] || 0;
      const newValue = newParams[key];
      const change = newValue - oldValue;

      if (Math.abs(change) > 0.01) {
        changes.push({
          parameter: key,
          oldValue,
          newValue,
          change,
          changePercent: (change / (oldValue || 0.5)) * 100
        });
      }
    }

    return changes;
  }

  // ============================================================================
  // RECOMMENDATION EFFECTIVENESS
  // ============================================================================

  recordRecommendation(recommendationId, recommendation, type) {
    return {
      id: recommendationId,
      recommendation,
      type,
      timestamp: new Date(),
      adopted: null,
      adoptedAt: null,
      outcome: null,
      roi: null,
      status: 'pending'
    };
  }

  recordRecommendationOutcome(recommendationId, adopted, outcome, roi = null) {
    return {
      recommendationId,
      adopted,
      adoptedAt: adopted ? new Date() : null,
      outcome,
      roi,
      evaluatedAt: new Date(),
      impact: this.calculateRecommendationImpact(outcome)
    };
  }

  calculateRecommendationImpact(outcome) {
    if (!outcome) return 'unknown';

    if (typeof outcome === 'number') {
      if (outcome > 0.2) return 'high_positive';
      if (outcome > 0.05) return 'positive';
      if (outcome < -0.2) return 'high_negative';
      if (outcome < -0.05) return 'negative';
      return 'neutral';
    }

    return outcome.toLowerCase();
  }

  getRecommendationEffectiveness(type = null) {
    const recommendations = this.feedback.filter(f => !type || f.type === type);

    if (recommendations.length === 0) {
      return { adoptionRate: 0, effectiveness: 0, count: 0 };
    }

    const adopted = recommendations.filter(r => r.adopted).length;
    const effectiveRecs = recommendations.filter(r => r.roi && r.roi > 0).length;

    return {
      count: recommendations.length,
      adoptedCount: adopted,
      adoptionRate: adopted / recommendations.length,
      effectiveCount: effectiveRecs,
      effectivenessRate: effectiveRecs / recommendations.length,
      averageROI: recommendations.reduce((sum, r) => sum + (r.roi || 0), 0) / recommendations.length
    };
  }

  // ============================================================================
  // PATTERN RECOGNITION
  // ============================================================================

  identifyPatterns(field, minSupport = 0.1) {
    const fieldPredictions = this.predictions.filter(p => p.input && p.input[field]);

    if (fieldPredictions.length < 20) {
      return { patterns: [], message: 'Insufficient data for pattern identification' };
    }

    const patterns = [];
    const values = {};

    // Count occurrences
    for (const pred of fieldPredictions) {
      const value = pred.input[field];
      if (!values[value]) values[value] = [];
      values[value].push(pred);
    }

    // Identify patterns with support threshold
    const minCount = Math.max(10, Math.ceil(fieldPredictions.length * minSupport));

    for (const [value, preds] of Object.entries(values)) {
      if (preds.length >= minCount) {
        const accuracy = this.calculateAccuracy(preds.filter(p => p.status === 'evaluated'));
        const avgConfidence = preds.reduce((sum, p) => sum + p.confidence, 0) / preds.length;

        patterns.push({
          value,
          support: preds.length / fieldPredictions.length,
          accuracy,
          avgConfidence,
          count: preds.length
        });
      }
    }

    return {
      field,
      patterns: patterns.sort((a, b) => b.accuracy - a.accuracy),
      totalPredictions: fieldPredictions.length
    };
  }

  identifyCorrelations(field1, field2, minCorrelation = 0.6) {
    const correlationPairs = [];

    for (const pred of this.predictions) {
      if (pred.input && pred.input[field1] && pred.input[field2] && pred.status === 'evaluated') {
        correlationPairs.push({
          value1: pred.input[field1],
          value2: pred.input[field2],
          outcome: pred.error === 0 ? 1 : 0
        });
      }
    }

    if (correlationPairs.length < 20) {
      return { correlations: [], message: 'Insufficient data for correlation analysis' };
    }

    const correlations = [];
    const groups = {};

    for (const pair of correlationPairs) {
      const key = `${pair.value1}:${pair.value2}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(pair.outcome);
    }

    for (const [key, outcomes] of Object.entries(groups)) {
      const successRate = outcomes.filter(o => o === 1).length / outcomes.length;
      if (successRate > minCorrelation) {
        const [val1, val2] = key.split(':');
        correlations.push({
          value1: val1,
          value2: val2,
          correlation: successRate,
          support: outcomes.length
        });
      }
    }

    return {
      field1,
      field2,
      correlations: correlations.sort((a, b) => b.correlation - a.correlation),
      totalPairs: correlationPairs.length
    };
  }

  // ============================================================================
  // LEARNING ANALYTICS
  // ============================================================================

  getPerformanceSummary() {
    const evaluatedPreds = this.predictions.filter(p => p.status === 'evaluated');

    return {
      totalPredictions: this.predictions.length,
      evaluatedPredictions: evaluatedPreds.length,
      pendingPredictions: this.predictions.filter(p => p.status === 'pending').length,
      models: this.models.size,
      learningCycles: this.learningCycles.length,
      averageAccuracy: Array.from(this.models.values()).reduce((sum, m) => sum + m.accuracy, 0) / Math.max(1, this.models.size),
      totalFeedback: this.feedback.length,
      feedbackRate: evaluatedPreds.length / Math.max(1, this.predictions.length)
    };
  }

  getModelPerformance(modelId) {
    const model = this.models.get(modelId);
    if (!model) return null;

    const modelPredictions = model.predictions.filter(p => p.status === 'evaluated');
    const accuracy = this.calculateAccuracy(modelPredictions);

    return {
      modelId,
      type: model.type,
      version: model.version,
      accuracy,
      trainingDataCount: model.trainingDataCount,
      predictions: model.predictions.length,
      confidence: model.confidence,
      learningRate: model.learningRate,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt,
      cycles: this.learningCycles.filter(c => c.modelId === modelId).length
    };
  }

  getLearningCycleHistory(modelId, limit = 10) {
    return this.learningCycles
      .filter(c => c.modelId === modelId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  // ============================================================================
  // RECOMMENDATIONS BASED ON LEARNING
  // ============================================================================

  suggestModelImprovements(modelId) {
    const model = this.models.get(modelId);
    if (!model) return [];

    const suggestions = [];

    // Suggestion 1: Collect more data
    if (model.trainingDataCount < 100) {
      suggestions.push({
        priority: 'high',
        type: 'data_collection',
        description: 'Collect more training data for better accuracy',
        targetCount: 100,
        currentCount: model.trainingDataCount,
        recommendation: `Collect ${100 - model.trainingDataCount} more feedback samples`
      });
    }

    // Suggestion 2: Parameter tuning
    const cycles = this.learningCycles.filter(c => c.modelId === modelId);
    if (cycles.length > 3) {
      const recentCycles = cycles.slice(0, 3);
      const avgImprovement = recentCycles.reduce((sum, c) => sum + c.accuracyImprovement, 0) / 3;

      if (avgImprovement < 0.01) {
        suggestions.push({
          priority: 'medium',
          type: 'parameter_tuning',
          description: 'Model improvement has plateaued',
          recommendation: 'Consider adjusting hyperparameters or collecting different data types',
          averageRecentImprovement: avgImprovement
        });
      }
    }

    // Suggestion 3: Model type change
    if (model.accuracy < 0.65) {
      suggestions.push({
        priority: 'high',
        type: 'model_change',
        description: 'Consider using a different model type',
        currentAccuracy: model.accuracy,
        targetAccuracy: 0.8,
        recommendation: 'Experiment with ensemble methods or more complex models'
      });
    }

    return suggestions;
  }

  // ============================================================================
  // UTILITY
  // ============================================================================

  generateId(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  exportLearningData() {
    return {
      models: Array.from(this.models.values()),
      predictions: this.predictions,
      feedback: this.feedback,
      learningCycles: this.learningCycles,
      summary: this.getPerformanceSummary()
    };
  }

  importLearningData(data) {
    this.models.clear();
    this.predictions = [];
    this.feedback = [];
    this.learningCycles = [];

    if (data.models) {
      for (const model of data.models) {
        this.models.set(model.id, model);
      }
    }

    if (data.predictions) this.predictions = data.predictions;
    if (data.feedback) this.feedback = data.feedback;
    if (data.learningCycles) this.learningCycles = data.learningCycles;

    return this.getPerformanceSummary();
  }
}

module.exports = LearningEngine;
