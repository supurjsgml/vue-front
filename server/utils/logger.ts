export interface LogItem {
  timestamp: Date;
  timestampNs: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  message: string;
  source: 'server' | 'client';
  extra?: Record<string, any>;
}

class CentralLogger {
  private queue: LogItem[] = [];
  private readonly batchSize = 50;
  private readonly flushIntervalMs = 1000;
  private readonly maxQueueSize = 2048;
  private timer: NodeJS.Timeout | null = null;
  private isFlushing = false;

  constructor() {
    this.timer = setInterval(() => {
      this.flush();
    }, this.flushIntervalMs);

    if (this.timer && typeof this.timer.unref === 'function') {
      this.timer.unref();
    }
  }

  private getReplica(): string {
    return process.env.CONTAINER_APP_REPLICA_NAME || process.env.HOSTNAME || 'unknown';
  }

  public enqueue(level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG', message: string, source: 'server' | 'client' = 'server', extra?: Record<string, any>) {
    const now = new Date();
    // 나노초 타임스탬프 계산
    const timestampNs = (BigInt(now.getTime()) * BigInt(1000000)).toString();

    if (this.queue.length >= this.maxQueueSize) {
      this.queue.shift();
    }

    this.queue.push({
      timestamp: now,
      timestampNs,
      level,
      message,
      source,
      extra
    });

    if (this.queue.length >= this.batchSize) {
      this.flush();
    }
  }

  private async flush() {
    if (this.isFlushing || this.queue.length === 0) {
      return;
    }

    this.isFlushing = true;
    const batch = this.queue.splice(0, this.batchSize);

    try {
      const config = useRuntimeConfig();
      await Promise.allSettled([
        this.sendToLoki(batch, config),
        this.sendToAxiom(batch, config)
      ]);
    } catch (err: any) {
      console.warn('[Logger] 로그 전송 중 예외 발생:', err?.message || err);
    } finally {
      this.isFlushing = false;
    }
  }

  private async sendToLoki(batch: LogItem[], config: any) {
    const { lokiUrl, lokiUser, lokiToken } = config;
    if (!lokiUrl || !lokiUser || !lokiToken) {
      return;
    }

    const replica = this.getReplica();
    const streamsMap = new Map<string, { stream: Record<string, string>; values: [string, string][] }>();

    for (const item of batch) {
      const key = `${item.level}_${item.source}`;
      if (!streamsMap.has(key)) {
        streamsMap.set(key, {
          stream: {
            app: 'vue-front',
            replica,
            level: item.level,
            source: item.source
          },
          values: []
        });
      }

      const formatted = `[${item.source.toUpperCase()}] ${item.level} - ${item.message}${item.extra ? ' ' + JSON.stringify(item.extra) : ''}`;
      streamsMap.get(key)!.values.push([item.timestampNs, formatted]);
    }

    const payload = {
      streams: Array.from(streamsMap.values())
    };

    const authHeader = 'Basic ' + Buffer.from(`${lokiUser}:${lokiToken}`).toString('base64');

    const res = await fetch(lokiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.warn(`[Logger] Loki 전송 실패 status=${res.status}: ${text}`);
    }
  }

  private async sendToAxiom(batch: LogItem[], config: any) {
    const { axiomApiUrl, axiomDataset, axiomToken } = config;
    if (!axiomApiUrl || !axiomDataset || !axiomToken) {
      return;
    }

    const replica = this.getReplica();
    const fullUrl = axiomApiUrl.endsWith('/')
      ? `${axiomApiUrl}${axiomDataset}/ingest`
      : `${axiomApiUrl}/${axiomDataset}/ingest`;

    const payload = batch.map((item) => ({
      _time: item.timestamp.toISOString(),
      app: 'vue-front',
      replica,
      level: item.level,
      source: item.source,
      message: item.message,
      ...(item.extra || {})
    }));

    const res = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${axiomToken}`
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.warn(`[Logger] Axiom 전송 실패 status=${res.status}: ${text}`);
    }
  }
}

const loggerInstance = new CentralLogger();

export const logInfo = (message: string, extra?: Record<string, any>) => {
  loggerInstance.enqueue('INFO', message, 'server', extra);
};

export const logWarn = (message: string, extra?: Record<string, any>) => {
  loggerInstance.enqueue('WARN', message, 'server', extra);
};

export const logError = (message: string, extra?: Record<string, any>) => {
  loggerInstance.enqueue('ERROR', message, 'server', extra);
};

export const logClientError = (data: Record<string, any>) => {
  const message = data.message || 'Unknown Client Error';
  loggerInstance.enqueue('ERROR', message, 'client', data);
};
