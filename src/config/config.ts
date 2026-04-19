interface Config {
  port: number | string;
  nodeEnv: string;
  logLevel: string;
  supabase: {
    url: string;
    key: string;
  };
}

const config: Config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || 'info',
  supabase: {
    url: process.env.SUPABASE_URL || '',
    key: process.env.SUPABASE_KEY || '',
  },
};

export default config;