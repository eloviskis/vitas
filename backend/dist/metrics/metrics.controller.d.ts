import { MetricsService } from './metrics.service';
export declare class MetricsController {
    private metricsService;
    constructor(metricsService: MetricsService);
    getDashboardMetrics(): Promise<import("./metrics.service").DashboardMetrics>;
}
