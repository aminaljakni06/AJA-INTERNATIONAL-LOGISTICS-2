import { K8sClusterInfo } from './types';

export class ClusterK8sService {
  private static readonly CLUSTERS: K8sClusterInfo[] = [
    {
      clusterId: 'K8S-PROD-RUH-01',
      nameEn: 'Riyadh Primary Production Cluster (GKE/EKS Equivalent)',
      nameAr: 'مجموعة إنتاج الرياض الرئيسية (Riyadh Production)',
      environment: 'PRODUCTION_RIYADH',
      region: 'me-central1 (Riyadh)',
      k8sVersion: 'v1.30.2-gke',
      nodeCount: 32,
      totalCpuCores: 256,
      totalMemoryGb: 1024,
      cpuUsagePct: 48.5,
      memoryUsagePct: 62.1,
      status: 'HEALTHY',
      activePodsCount: 420,
      ingressTrafficMbPerSec: 184.5,
    },
    {
      clusterId: 'K8S-DR-JED-02',
      nameEn: 'Jeddah Active-Passive Disaster Recovery Cluster',
      nameAr: 'مجموعة التعافي من الكوارث بميناء جدة (Jeddah DR)',
      environment: 'PRODUCTION_JEDDAH_DR',
      region: 'me-west1 (Jeddah DR)',
      k8sVersion: 'v1.30.2-gke',
      nodeCount: 16,
      totalCpuCores: 128,
      totalMemoryGb: 512,
      cpuUsagePct: 18.2,
      memoryUsagePct: 24.0,
      status: 'HEALTHY',
      activePodsCount: 180,
      ingressTrafficMbPerSec: 12.0,
    },
    {
      clusterId: 'K8S-STG-FRA-03',
      nameEn: 'Staging & Integration Testing Cluster',
      nameAr: 'مجموعة الاختبارات المتقدمة والتكامل (Staging)',
      environment: 'STAGING',
      region: 'eu-west1 (Frankfurt Edge)',
      k8sVersion: 'v1.30.1',
      nodeCount: 8,
      totalCpuCores: 64,
      totalMemoryGb: 256,
      cpuUsagePct: 32.0,
      memoryUsagePct: 41.5,
      status: 'HEALTHY',
      activePodsCount: 95,
      ingressTrafficMbPerSec: 8.4,
    },
  ];

  public static getClusters(): K8sClusterInfo[] {
    return this.CLUSTERS;
  }

  public static triggerClusterAutoscale(clusterId: string, additionalNodes: number) {
    const cluster = this.CLUSTERS.find((c) => c.clusterId === clusterId) || this.CLUSTERS[0];
    cluster.nodeCount += additionalNodes;
    cluster.totalCpuCores += additionalNodes * 8;
    cluster.totalMemoryGb += additionalNodes * 32;
    cluster.cpuUsagePct = Math.max(20, cluster.cpuUsagePct - 12);

    return {
      success: true,
      clusterId: cluster.clusterId,
      newNodeCount: cluster.nodeCount,
      totalCpuCores: cluster.totalCpuCores,
      totalMemoryGb: cluster.totalMemoryGb,
      message: `Scaled up ${additionalNodes} worker nodes via Cluster Autoscaler`,
      timestamp: new Date().toISOString(),
    };
  }
}
