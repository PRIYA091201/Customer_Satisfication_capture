import config from '../config/config';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private source: string;

  constructor(source: string) {
    this.source = source;
  }

  private log(level: LogLevel, message: string, meta?: any): void {
    // Simple log level filtering
    const logLevels: Record<string, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
    };

    const configuredLevel = config.logLevel as LogLevel;
    
    if (logLevels[level] >= logLevels[configuredLevel]) {
      const timestamp = new Date().toISOString();
      const formattedMeta = meta ? ` ${JSON.stringify(meta)}` : '';
      
      console.log(`[${timestamp}] [${level.toUpperCase()}] [${this.source}] ${message}${formattedMeta}`);
    }
  }

  debug(message: string, meta?: any): void {
    this.log('debug', message, meta);
  }

  info(message: string, meta?: any): void {
    this.log('info', message, meta);
  }

  warn(message: string, meta?: any): void {
    this.log('warn', message, meta);
  }

  error(message: string, meta?: any): void {
    this.log('error', message, meta);
  }
}

export default (source: string): Logger => new Logger(source);