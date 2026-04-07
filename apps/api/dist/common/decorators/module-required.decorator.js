"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModuleRequired = exports.MODULE_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.MODULE_KEY = 'module';
const ModuleRequired = (module) => (0, common_1.SetMetadata)(exports.MODULE_KEY, module);
exports.ModuleRequired = ModuleRequired;
//# sourceMappingURL=module-required.decorator.js.map