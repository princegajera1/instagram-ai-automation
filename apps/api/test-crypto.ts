import { encrypt, decrypt } from './src/common/utils/crypto.util';

// Set up environment variable for testing
process.env.TOKEN_ENCRYPTION_KEY = 'test_encryption_key_32_bytes_long_minimum';

function runTest() {
  const secretToken = 'EAACEdEose0cBA...mock_long_lived_token...';
  
  console.log('Original token:', secretToken);
  
  const encrypted = encrypt(secretToken);
  console.log('Encrypted token:', encrypted);
  
  const decrypted = decrypt(encrypted);
  console.log('Decrypted token:', decrypted);
  
  if (decrypted !== secretToken) {
    throw new Error('Test failed: Decrypted token does not match original token');
  }
  
  console.log('Crypto test passed successfully! 🚀');
}

try {
  runTest();
  process.exit(0);
} catch (error) {
  console.error('Crypto test failed:', error);
  process.exit(1);
}
