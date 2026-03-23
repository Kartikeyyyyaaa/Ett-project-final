# Kafka vs NATS

Compose ships **NATS** for a lightweight jetstream-friendly path. For Kafka-sized replay and lake ingestion, add Strimzi or managed Kafka, and bridge edge topics using a small forwarder service. The edge gateway can publish pod events to either bus — extend `services/edge-gateway` with your client of choice.
