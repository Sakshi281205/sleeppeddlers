// Simple integration test script
// Run this in the browser console to test the integration

console.log('🧪 Testing Medical Imaging System Integration...');

// Test 1: Check if case service is working
try {
  console.log('✅ Case Service:', typeof window.caseService !== 'undefined' ? 'Available' : 'Not Available');
} catch (error) {
  console.error('❌ Case Service Error:', error);
}

// Test 2: Check if notification service is working
try {
  console.log('✅ Notification Service:', typeof window.notificationService !== 'undefined' ? 'Available' : 'Not Available');
} catch (error) {
  console.error('❌ Notification Service Error:', error);
}

// Test 3: Check localStorage
try {
  const cases = localStorage.getItem('medical_cases');
  const notifications = localStorage.getItem('medical_notifications');
  console.log('✅ Local Storage:', {
    cases: cases ? 'Stored' : 'Empty',
    notifications: notifications ? 'Stored' : 'Empty'
  });
} catch (error) {
  console.error('❌ Local Storage Error:', error);
}

// Test 4: Check API configuration
try {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'https://h8r6q6qsu0.execute-api.us-east-1.amazonaws.com/prod';
  const apiKey = process.env.NEXT_PUBLIC_API_KEY || 'hackathon-demo-key-2025-xyz';
  console.log('✅ API Configuration:', {
    base: apiBase,
    key: apiKey ? 'Set' : 'Not Set'
  });
} catch (error) {
  console.error('❌ API Configuration Error:', error);
}

console.log('🎉 Integration test completed!');
