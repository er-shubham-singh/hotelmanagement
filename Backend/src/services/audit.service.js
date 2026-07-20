import { AuditLog } from "../models/auditLog.model.js";

// Fire-and-forget by design — an audit-log write failure must never break
// the admin action it's recording.
export const logAudit = (actorId, action, targetType, targetId = null, meta = {}) => {
  AuditLog.create({ actor: actorId, action, targetType, targetId, meta }).catch((error) => {
    // eslint-disable-next-line no-console
    console.error("[audit] Failed to write audit log:", error.message);
  });
};

export default { logAudit };
