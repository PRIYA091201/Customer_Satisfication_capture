const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Colors for console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m'
};

// Welcome message
console.log(`${colors.blue}
╔═══════════════════════════════════════════════════╗
║                                                   ║
║  Supabase PostgreSQL Database Setup               ║
║                                                   ║
╚═══════════════════════════════════════════════════╝
${colors.reset}`);

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
const hasEnvFile = fs.existsSync(envPath);

const setupEnvFile = () => {
  console.log(`\n${colors.yellow}Setting up environment variables...${colors.reset}`);
  
  rl.question(`${colors.blue}Enter your Supabase URL: ${colors.reset}`, (supabaseUrl) => {
    rl.question(`${colors.blue}Enter your Supabase Anonymous Key: ${colors.reset}`, (supabaseKey) => {
      // Create or update .env file
      const envContent = `# Supabase Configuration
SUPABASE_URL=${supabaseUrl}
SUPABASE_KEY=${supabaseKey}

# Server Configuration
PORT=3000
NODE_ENV=development
LOG_LEVEL=info
`;
      
      fs.writeFileSync(envPath, envContent);
      console.log(`${colors.green}✓ Environment file created successfully!${colors.reset}`);
      
      // Continue with next steps
      installDependencies();
    });
  });
};

const installDependencies = () => {
  console.log(`\n${colors.yellow}Installing dependencies...${colors.reset}`);
  
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log(`${colors.green}✓ Dependencies installed successfully!${colors.reset}`);
    askForDatabaseSetup();
  } catch (error) {
    console.error(`${colors.red}Failed to install dependencies:${colors.reset}`, error);
    process.exit(1);
  }
};

const askForDatabaseSetup = () => {
  rl.question(`\n${colors.blue}Would you like to set up the database schema? (Y/n) ${colors.reset}`, (answer) => {
    if (answer.toLowerCase() !== 'n') {
      setupDatabase();
    } else {
      askForSampleData();
    }
  });
};

const setupDatabase = () => {
  console.log(`\n${colors.yellow}Setting up database schema...${colors.reset}`);
  
  try {
    execSync('npm run db:migrate', { stdio: 'inherit' });
    console.log(`${colors.green}✓ Database schema created successfully!${colors.reset}`);
    askForSampleData();
  } catch (error) {
    console.error(`${colors.red}Failed to set up database schema:${colors.reset}`, error);
    askForSampleData();
  }
};

const askForSampleData = () => {
  rl.question(`\n${colors.blue}Would you like to import sample data? (Y/n) ${colors.reset}`, (answer) => {
    if (answer.toLowerCase() !== 'n') {
      importSampleData();
    } else {
      finishSetup();
    }
  });
};

const importSampleData = () => {
  console.log(`\n${colors.yellow}Importing sample data...${colors.reset}`);
  
  try {
    execSync('npm run db:sample', { stdio: 'inherit' });
    console.log(`${colors.green}✓ Sample data imported successfully!${colors.reset}`);
    finishSetup();
  } catch (error) {
    console.error(`${colors.red}Failed to import sample data:${colors.reset}`, error);
    finishSetup();
  }
};

const finishSetup = () => {
  console.log(`\n${colors.green}╔═══════════════════════════════════════════════════╗`);
  console.log(`║                                                   ║`);
  console.log(`║  Database setup completed successfully!           ║`);
  console.log(`║                                                   ║`);
  console.log(`╚═══════════════════════════════════════════════════╝${colors.reset}`);
  
  console.log(`\n${colors.blue}Next steps:${colors.reset}`);
  console.log(`1. Start the server: ${colors.yellow}npm run dev${colors.reset}`);
  console.log(`2. Access the API: ${colors.yellow}http://localhost:3000/api/feedback${colors.reset}`);
  console.log(`3. Check database connection: ${colors.yellow}http://localhost:3000/health${colors.reset}\n`);
  
  rl.close();
};

// Start the setup process
if (hasEnvFile) {
  rl.question(`${colors.yellow}An existing .env file was found. Do you want to overwrite it? (y/N) ${colors.reset}`, (answer) => {
    if (answer.toLowerCase() === 'y') {
      setupEnvFile();
    } else {
      console.log(`${colors.blue}Using existing .env file.${colors.reset}`);
      installDependencies();
    }
  });
} else {
  setupEnvFile();
}