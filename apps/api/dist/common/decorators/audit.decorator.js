"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Audit = exports.AUDIT_META = void 0;
const common_1 = require("@nestjs/common");
exports.AUDIT_META = 'audit_meta';
const Audit = (meta) => (0, common_1.SetMetadata)(exports.AUDIT_META, meta);
exports.Audit = Audit;
//# sourceMappingURL=audit.decorator.js.map