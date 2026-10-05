/**
 * Workflow Logger & Error Handler
 * Tracks all workflow steps, errors, and sends notifications
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
require('dotenv').config();

const CONTACT_EMAIL = process.env.CONTACT_EMAIL || 'alfarabusalihu@gmail.com';
const WORKFLOW_LOG_DIR = path.join(__dirname, '../../logs');
const MAX_LOGS_TO_KEEP = 10; // Keep only the 10 most recent logs

// Ensure logs directory exists
if (!fs.existsSync(WORKFLOW_LOG_DIR)) {
  fs.mkdirSync(WORKFLOW_LOG_DIR, { recursive: true });
}

// Clean up old logs on initialization
function cleanupOldLogs() {
  try {
    const files = fs.readdirSync(WORKFLOW_LOG_DIR)
      .filter(f => f.startsWith('workflow-') && f.endsWith('.json'))
      .map(f => ({
        name: f,
        path: path.join(WORKFLOW_LOG_DIR, f),
        time: fs.statSync(path.join(WORKFLOW_LOG_DIR, f)).mtime.getTime(),
      }))
      .sort((a, b) => b.time - a.time); // Sort newest first

    // Delete files beyond MAX_LOGS_TO_KEEP
    if (files.length > MAX_LOGS_TO_KEEP) {
      files.slice(MAX_LOGS_TO_KEEP).forEach(file => {
        fs.unlinkSync(file.path);
        console.log(`🗑️  Cleaned up old log: ${file.name}`);
      });
    }
  } catch (err) {
    console.warn('⚠️  Failed to cleanup old logs:', err.message);
  }
}

// Run cleanup
cleanupOldLogs();

class WorkflowLogger {
  constructor(workflowType = 'sync') {
    this.workflowType = workflowType; // 'sync' or 'manual'
    this.startTime = new Date();
    this.steps = [];
    this.errors = [];
    this.warnings = [];
    this.metadata = {
      nodeVersion: process.version,
      platform: process.platform,
      timestamp: this.startTime.toISOString(),
      workflowType,
    };
  }

  /**
   * Log a successful step
   */
  logStep(stepName, details = {}, duration = 0) {
    const step = {
      name: stepName,
      status: 'success',
      timestamp: new Date().toISOString(),
      duration, // milliseconds
      details,
    };
    this.steps.push(step);
    console.log(`✅ ${stepName}${duration ? ` (${duration}ms)` : ''}`);
  }

  /**
   * Log a warning (non-critical issue)
   */
  logWarning(stepName, message, details = {}) {
    const warning = {
      stepName,
      message,
      timestamp: new Date().toISOString(),
      details,
    };
    this.warnings.push(warning);
    console.warn(`⚠️  WARNING: ${stepName} - ${message}`);
  }

  /**
   * Log an error (critical issue)
   */
  logError(stepName, error, details = {}) {
    const errorLog = {
      stepName,
      message: error.message || String(error),
      stack: error.stack || '',
      timestamp: new Date().toISOString(),
      details,
      code: error.code || 'UNKNOWN_ERROR',
    };
    this.errors.push(errorLog);
    console.error(`❌ ERROR: ${stepName} - ${error.message}`);
  }

  /**
   * Generate final report
   */
  generateReport() {
    const endTime = new Date();
    const totalDuration = endTime - this.startTime;

    const report = {
      metadata: {
        ...this.metadata,
        endTime: endTime.toISOString(),
        totalDurationMs: totalDuration,
        totalDurationSeconds: (totalDuration / 1000).toFixed(2),
      },
      summary: {
        totalSteps: this.steps.length,
        successfulSteps: this.steps.filter(s => s.status === 'success').length,
        warnings: this.warnings.length,
        errors: this.errors.length,
        status: this.errors.length === 0 ? 'SUCCESS' : 'FAILED',
      },
      steps: this.steps,
      warnings: this.warnings,
      errors: this.errors,
    };

    return report;
  }

  /**
   * Save report to file
   */
  saveReport() {
    const report = this.generateReport();
    const filename = `workflow-${this.workflowType}-${Date.now()}.json`;
    const filepath = path.join(WORKFLOW_LOG_DIR, filename);

    fs.writeFileSync(filepath, JSON.stringify(report, null, 2));
    console.log(`\n📝 Report saved: ${filename}`);

    return { filepath, filename, report };
  }

  /**
   * Send email notification
   */
  async sendEmailNotification() {
    if (!CONTACT_EMAIL) {
      console.warn('⚠️  CONTACT_EMAIL not configured - skipping email');
      return;
    }

    const report = this.generateReport();
    const status = report.summary.status;
    const subject = `${status === 'SUCCESS' ? '✅' : '❌'} Portfolio Sync ${status} - ${new Date().toLocaleDateString()}`;

    const body = this.buildEmailBody(report);

    try {
      // Use internal contact API to send email
      const emailData = {
        name: 'Portfolio Workflow',
        email: CONTACT_EMAIL,
        message: `AUTOMATED WORKFLOW REPORT\n\n${body}`,
      };

      await fetch('https://restless-haze-portfolio.vercel.app/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailData),
      });

      console.log(`📧 Email notification sent to ${CONTACT_EMAIL}`);
    } catch (err) {
      console.error('❌ Failed to send email:', err.message);
    }
  }

  /**
   * Build email body from report
   */
  buildEmailBody(report) {
    const lines = [];

    lines.push(`WORKFLOW STATUS: ${report.summary.status}`);
    lines.push(`Duration: ${report.metadata.totalDurationSeconds}s`);
    lines.push(`Timestamp: ${report.metadata.startTime}`);
    lines.push('');

    lines.push('SUMMARY:');
    lines.push(`  Total Steps: ${report.summary.totalSteps}`);
    lines.push(`  Successful: ${report.summary.successfulSteps}`);
    lines.push(`  Warnings: ${report.summary.warnings}`);
    lines.push(`  Errors: ${report.summary.errors}`);
    lines.push('');

    if (report.steps.length > 0) {
      lines.push('STEPS:');
      report.steps.forEach((step, i) => {
        lines.push(`  ${i + 1}. ${step.name} - ${step.duration}ms`);
      });
      lines.push('');
    }

    if (report.warnings.length > 0) {
      lines.push('WARNINGS:');
      report.warnings.forEach((w) => {
        lines.push(`  ⚠️  ${w.stepName}: ${w.message}`);
        if (Object.keys(w.details).length > 0) {
          lines.push(`      Details: ${JSON.stringify(w.details)}`);
        }
      });
      lines.push('');
    }

    if (report.errors.length > 0) {
      lines.push('ERRORS:');
      report.errors.forEach((e) => {
        lines.push(`  ❌ ${e.stepName} (${e.code}): ${e.message}`);
        if (e.details && Object.keys(e.details).length > 0) {
          lines.push(`      Details: ${JSON.stringify(e.details)}`);
        }
      });
      lines.push('');
    }

    lines.push('FULL REPORT JSON:');
    lines.push(JSON.stringify(report, null, 2));

    return lines.join('\n');
  }

  /**
   * Load previous successful report
   */
  static loadLastSuccessfulReport() {
    try {
      const files = fs.readdirSync(WORKFLOW_LOG_DIR)
        .filter(f => f.startsWith('workflow-') && f.endsWith('.json'))
        .sort()
        .reverse();

      for (const file of files) {
        const filepath = path.join(WORKFLOW_LOG_DIR, file);
        const content = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
        if (content.summary.status === 'SUCCESS') {
          return {
            file,
            filepath,
            report: content,
            loadedAt: new Date().toISOString(),
          };
        }
      }
      return null;
    } catch (err) {
      console.error('Failed to load last successful report:', err.message);
      return null;
    }
  }

  /**
   * Load last report (success or failure)
   */
  static loadLastReport() {
    try {
      const files = fs.readdirSync(WORKFLOW_LOG_DIR)
        .filter(f => f.startsWith('workflow-') && f.endsWith('.json'))
        .sort()
        .reverse();

      if (files.length === 0) return null;

      const filepath = path.join(WORKFLOW_LOG_DIR, files[0]);
      const content = JSON.parse(fs.readFileSync(filepath, 'utf-8'));

      return {
        file: files[0],
        filepath,
        report: content,
        loadedAt: new Date().toISOString(),
      };
    } catch (err) {
      console.error('Failed to load last report:', err.message);
      return null;
    }
  }

  /**
   * Get all reports
   */
  static getAllReports() {
    try {
      const files = fs.readdirSync(WORKFLOW_LOG_DIR)
        .filter(f => f.startsWith('workflow-') && f.endsWith('.json'))
        .sort()
        .reverse();

      return files.map(file => {
        const filepath = path.join(WORKFLOW_LOG_DIR, file);
        const content = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
        return {
          file,
          status: content.summary.status,
          timestamp: content.metadata.startTime,
          duration: content.metadata.totalDurationSeconds,
        };
      });
    } catch (err) {
      console.error('Failed to load reports:', err.message);
      return [];
    }
  }
}

module.exports = WorkflowLogger;
