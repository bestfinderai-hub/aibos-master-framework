/**
 * Call Engine
 * Orchestrates Vapi call handling + analysis
 */

class CallEngine {
  constructor(analysisEngine) {
    this.analysis = analysisEngine;
    this.activeCall = null;
    this.callHistory = [];
  }

  async handleInboundCall(callData) {
    const call = {
      id: callData.id,
      type: 'inbound',
      caller: callData.caller,
      timestamp: new Date(),
      transcript: '',
      segments: [],
      status: 'active'
    };
    this.activeCall = call;
    return call;
  }

  async handleOutboundCall(leadData) {
    const call = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'outbound',
      lead: leadData,
      timestamp: new Date(),
      transcript: '',
      segments: [],
      status: 'dialing'
    };
    this.activeCall = call;
    return call;
  }

  async processSegment(segment, speaker = 'agent') {
    if (!this.activeCall) throw new Error('No active call');

    const analyzed = await this.analysis.analyzeSegment(segment);

    this.activeCall.segments.push({
      timestamp: new Date(),
      text: segment,
      speaker,
      sentiment: analyzed.sentiment,
      intent: analyzed.intent,
      objections: analyzed.objections
    });

    this.activeCall.transcript += segment + ' ';
    return analyzed;
  }

  async endCall() {
    if (!this.activeCall) throw new Error('No active call');

    const finalAnalysis = await this.analysis.analyzeFullCall(
      this.activeCall.transcript,
      this.activeCall.segments
    );

    this.activeCall.status = 'completed';
    this.activeCall.analysis = finalAnalysis;
    this.activeCall.duration = Math.round((new Date() - this.activeCall.timestamp) / 1000);

    this.callHistory.push(this.activeCall);
    const call = this.activeCall;
    this.activeCall = null;

    return call;
  }

  getCallHistory(limit = 50) {
    return this.callHistory.slice(-limit);
  }

  getCall(callId) {
    return this.callHistory.find(c => c.id === callId) || this.activeCall;
  }
}

module.exports = CallEngine;
