import dotenv from 'dotenv';
dotenv.config();

import path from 'path';
import fs from 'fs';
import batchOps from '../utils/batch-operations';
import { Tables } from '../types/database.types';
import logger from '../utils/logger';

// Sample data
const sampleData = [
  {
    customer_name: 'Alex Johnson',
    rating: 5,
    comments: 'Excellent service! The customer support was incredibly helpful.',
    source: 'email',
    device_info: { browser: 'Chrome', os: 'Windows', device: 'Desktop' },
    is_anonymous: false
  },
  {
    customer_name: 'Sarah Williams',
    rating: 4,
    comments: 'Good product, but delivery was a bit slow.',
    source: 'website',
    device_info: { browser: 'Firefox', os: 'macOS', device: 'Desktop' },
    is_anonymous: false
  },
  {
    customer_name: 'Anonymous User',
    rating: 3,
    comments: 'Average experience. Could use some improvements.',
    source: 'mobile_app',
    device_info: { browser: 'Safari', os: 'iOS', device: 'Mobile' },
    is_anonymous: true
  },
  {
    customer_name: 'Michael Brown',
    rating: 5,
    comments: 'Very satisfied with my purchase.',
    source: 'website',
    device_info: { browser: 'Edge', os: 'Windows', device: 'Desktop' },
    is_anonymous: false
  },
  {
    customer_name: 'Emily Davis',
    rating: 2,
    comments: 'Product did not meet expectations.',
    source: 'email',
    device_info: { browser: 'Chrome', os: 'Android', device: 'Mobile' },
    is_anonymous: false
  }
];

// Function to create sample CSV file
function createSampleCsvFile(): string {
  const csvFilePath = path.join(__dirname, '../../sample_feedback.csv');
  
  const headers = [
    'customer_name',
    'rating',
    'comments',
    'source',
    'device_info',
    'is_anonymous'
  ];
  
  // Create CSV content
  const rows = [
    headers.join(','),
    ...sampleData.map(item => {
      return [
        `"${item.customer_name}"`,
        item.rating,
        `"${item.comments}"`,
        `"${item.source}"`,
        `"${JSON.stringify(item.device_info)}"`,
        item.is_anonymous
      ].join(',');
    })
  ];
  
  // Write to file
  fs.writeFileSync(csvFilePath, rows.join('\n'));
  logger.info(`Created sample CSV file at ${csvFilePath}`);
  
  return csvFilePath;
}

// Main function to import sample data
async function importSampleData() {
  try {
    logger.info('Creating and importing sample feedback data...');
    
    // Create sample CSV file
    const csvFilePath = createSampleCsvFile();
    
    // Import using direct batch insert
    const directResult = await batchOps.batchInsert(
      Tables.CUSTOMER_FEEDBACK,
      sampleData
    );
    
    logger.info(`Directly inserted ${directResult.success} feedback records`);
    
    // Import from CSV file
    const csvResult = await batchOps.importFromCsv(
      Tables.CUSTOMER_FEEDBACK,
      csvFilePath,
      {
        transform: (record) => ({
          ...record,
          rating: parseInt(record.rating),
          device_info: JSON.parse(record.device_info),
          is_anonymous: record.is_anonymous === 'true'
        })
      }
    );
    
    logger.info(`Imported ${csvResult.count} feedback records from CSV`);
    
    // Export current data to CSV
    const exportPath = path.join(__dirname, '../../exported_feedback.csv');
    const exportResult = await batchOps.exportTableToCsv(
      Tables.CUSTOMER_FEEDBACK,
      exportPath
    );
    
    if (exportResult.success) {
      logger.info(`Exported ${exportResult.count} feedback records to ${exportPath}`);
    }
    
    logger.info('Sample data import completed');
  } catch (error) {
    logger.error('Error importing sample data:', error);
    process.exit(1);
  }
}

// Run the import
importSampleData()
  .then(() => process.exit(0))
  .catch(err => {
    logger.error('Unhandled error:', err);
    process.exit(1);
  });