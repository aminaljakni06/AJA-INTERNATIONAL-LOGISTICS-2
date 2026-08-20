import { PipelineExecution } from './types';

export class PipelineStreamingService {
  private static readonly PIPELINE_EXECUTIONS: PipelineExecution[] = [
    {
      id: 'PIPE-CDC-ERP-01',
      pipelineName: 'sap_erp_journal_cdc_sync',
      type: 'CDC',
      sourceSystem: 'SAP S/4HANA DB (PostgreSQL CDC)',
      targetDestination: 'Lakehouse Bronze Layer (Delta)',
      recordsProcessed: 48920,
      durationSeconds: 12,
      status: 'RUNNING',
      startedAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    },
    {
      id: 'PIPE-STREAM-GPS-02',
      pipelineName: 'fleet_iot_telemetry_kafka_stream',
      type: 'STREAMING',
      sourceSystem: 'AJA Fleet GPS Gateway (MQTT / Kafka)',
      targetDestination: 'Lakehouse Realtime Storage (Iceberg)',
      recordsProcessed: 1280400,
      durationSeconds: 3600,
      status: 'RUNNING',
      startedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    },
    {
      id: 'PIPE-ELT-DW-03',
      pipelineName: 'dbt_curated_gold_warehouse_mart',
      type: 'ELT',
      sourceSystem: 'Lakehouse Silver Cleansed Data',
      targetDestination: 'Data Warehouse Star Schema (Snowflake/BigQuery)',
      recordsProcessed: 320500,
      durationSeconds: 145,
      status: 'SUCCESS',
      startedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      completedAt: new Date(Date.now() - 1000 * 60 * 27).toISOString(),
    },
    {
      id: 'PIPE-ETL-FASAH-04',
      pipelineName: 'saudi_fasah_customs_nightly_batch',
      type: 'BATCH',
      sourceSystem: 'Customs Fasah B2B SOAP API',
      targetDestination: 'Cleansed Silver Parquet',
      recordsProcessed: 14200,
      durationSeconds: 88,
      status: 'SUCCESS',
      startedAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
      completedAt: new Date(Date.now() - 1000 * 60 * 178).toISOString(),
    },
    {
      id: 'PIPE-FEATURE-AI-05',
      pipelineName: 'ai_feature_store_hourly_sync',
      type: 'ETL',
      sourceSystem: 'Fact & Dimension Tables',
      targetDestination: 'AI Platform Feature Store',
      recordsProcessed: 89000,
      durationSeconds: 34,
      status: 'SUCCESS',
      startedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      completedAt: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
    },
  ];

  public static getPipelineExecutions(): PipelineExecution[] {
    return this.PIPELINE_EXECUTIONS;
  }

  public static triggerPipeline(pipelineName: string): PipelineExecution {
    const newExec: PipelineExecution = {
      id: `PIPE-TRIG-${Date.now().toString().slice(-5)}`,
      pipelineName,
      type: 'ELT',
      sourceSystem: 'Lakehouse Silver Layer',
      targetDestination: 'Data Warehouse Analytical Marts',
      recordsProcessed: Math.floor(Math.random() * 50000) + 10000,
      durationSeconds: Math.floor(Math.random() * 40) + 10,
      status: 'SUCCESS',
      startedAt: new Date().toISOString(),
      completedAt: new Date(Date.now() + 15000).toISOString(),
    };

    this.PIPELINE_EXECUTIONS.unshift(newExec);
    return newExec;
  }

  public static getStreamingTopicTelemetry() {
    return [
      { topic: 'aja.logistics.shipment.events', msgPerSec: 142, totalToday: 4890200, status: 'HEALTHY' },
      { topic: 'aja.fleet.telemetry.gps', msgPerSec: 890, totalToday: 24890000, status: 'HEALTHY' },
      { topic: 'aja.warehouse.wes.scans', msgPerSec: 210, totalToday: 6802000, status: 'HEALTHY' },
      { topic: 'aja.finance.zatca.invoices', msgPerSec: 35, totalToday: 890200, status: 'HEALTHY' },
    ];
  }
}
