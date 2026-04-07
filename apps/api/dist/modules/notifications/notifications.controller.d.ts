import { NotificationsService } from './notifications.service';
import { JwtPayload } from '@saas-erp/shared';
export declare class NotificationsController {
    private notificationsService;
    constructor(notificationsService: NotificationsService);
    stream(user: JwtPayload): import("rxjs").Observable<{
        data: string;
    }>;
    test(user: JwtPayload): {
        ok: boolean;
    };
}
