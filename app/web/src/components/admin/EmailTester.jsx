import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { CheckCircle, XCircle, Loader2, Mail, Send, Eye, RefreshCw } from 'lucide-react';

const EmailTester = () => {
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState({});
  const [emailLogs, setEmailLogs] = useState([]);
  const [testEmail, setTestEmail] = useState('test@example.com');
  const [emailType, setEmailType] = useState('verification');

  const emailTypes = [
    { value: 'verification', label: 'Email Verification', description: 'Send verification email to new users' },
    { value: 'password-reset', label: 'Password Reset', description: 'Send password reset link' },
    { value: 'order-confirmation', label: 'Order Confirmation', description: 'Send order confirmation email' },
    { value: 'order-shipped', label: 'Order Shipped', description: 'Send shipping notification' },
    { value: 'order-delivered', label: 'Order Delivered', description: 'Send delivery confirmation' },
    { value: 'low-stock', label: 'Low Stock Alert', description: 'Send low stock notification to admin' },
    { value: 'welcome', label: 'Welcome Email', description: 'Send welcome email to new users' },
    { value: 'newsletter', label: 'Newsletter', description: 'Send newsletter to subscribers' }
  ];

  const testEmailSending = async () => {
    setLoading(true);
    const results = {
      smtp: false,
      verification: false,
      passwordReset: false,
      orderConfirmation: false,
      lowStock: false,
      welcome: false
    };

    try {
      // Test 1: Test SMTP Connection
      console.log('Testing SMTP connection...');
      const smtpResponse = await axios.post('/api/auth/test-email', {
        email: testEmail,
        type: 'test'
      });
      
      if (smtpResponse.data.success) {
        results.smtp = true;
        toast.success('SMTP connection successful');
        addEmailLog('SMTP Test', 'Connection successful', 'success');
      }

      // Test 2: Email Verification
      console.log('Testing email verification...');
      const verificationResponse = await axios.post('/api/auth/test-email', {
        email: testEmail,
        type: 'verification',
        data: {
          name: 'Test User',
          verificationLink: 'https://example.com/verify?token=test123'
        }
      });
      
      if (verificationResponse.data.success) {
        results.verification = true;
        toast.success('Verification email sent successfully');
        addEmailLog('Verification Email', 'Sent to ' + testEmail, 'success');
      }

      // Test 3: Password Reset
      console.log('Testing password reset email...');
      const passwordResetResponse = await axios.post('/api/auth/test-email', {
        email: testEmail,
        type: 'password-reset',
        data: {
          name: 'Test User',
          resetLink: 'https://example.com/reset?token=test123'
        }
      });
      
      if (passwordResetResponse.data.success) {
        results.passwordReset = true;
        toast.success('Password reset email sent successfully');
        addEmailLog('Password Reset', 'Sent to ' + testEmail, 'success');
      }

      // Test 4: Order Confirmation
      console.log('Testing order confirmation email...');
      const orderResponse = await axios.post('/api/auth/test-email', {
        email: testEmail,
        type: 'order-confirmation',
        data: {
          name: 'Test User',
          orderNumber: 'ORD-12345',
          total: 99.99,
          items: [
            { name: 'Test Product', quantity: 1, price: 99.99 }
          ]
        }
      });
      
      if (orderResponse.data.success) {
        results.orderConfirmation = true;
        toast.success('Order confirmation email sent successfully');
        addEmailLog('Order Confirmation', 'Sent to ' + testEmail, 'success');
      }

      // Test 5: Low Stock Alert
      console.log('Testing low stock alert...');
      const lowStockResponse = await axios.post('/api/auth/test-email', {
        email: 'admin@example.com',
        type: 'low-stock',
        data: {
          products: [
            { name: 'Test Product', currentStock: 5, minStock: 10 }
          ]
        }
      });
      
      if (lowStockResponse.data.success) {
        results.lowStock = true;
        toast.success('Low stock alert sent successfully');
        addEmailLog('Low Stock Alert', 'Sent to admin', 'success');
      }

      // Test 6: Welcome Email
      console.log('Testing welcome email...');
      const welcomeResponse = await axios.post('/api/auth/test-email', {
        email: testEmail,
        type: 'welcome',
        data: {
          name: 'Test User'
        }
      });
      
      if (welcomeResponse.data.success) {
        results.welcome = true;
        toast.success('Welcome email sent successfully');
        addEmailLog('Welcome Email', 'Sent to ' + testEmail, 'success');
      }

    } catch (error) {
      console.error('Email test error:', error);
      toast.error(`Email test failed: ${error.response?.data?.message || error.message}`);
      addEmailLog('Error', error.response?.data?.message || error.message, 'error');
    }

    setTestResults(results);
    setLoading(false);
  };

  const sendCustomEmail = async () => {
    if (!testEmail || !emailType) {
      toast.error('Please enter email and select type');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/auth/test-email', {
        email: testEmail,
        type: emailType,
        data: {
          name: 'Test User',
          verificationLink: 'https://example.com/verify?token=test123',
          resetLink: 'https://example.com/reset?token=test123',
          orderNumber: 'ORD-12345',
          total: 99.99
        }
      });
      
      if (response.data.success) {
        toast.success('Email sent successfully');
        addEmailLog(emailType, 'Sent to ' + testEmail, 'success');
      }
    } catch (error) {
      console.error('Send email error:', error);
      toast.error(`Send failed: ${error.response?.data?.message || error.message}`);
      addEmailLog('Error', error.response?.data?.message || error.message, 'error');
    }
    setLoading(false);
  };

  const addEmailLog = (type, message, status) => {
    const log = {
      id: Date.now(),
      type,
      message,
      status,
      timestamp: new Date().toLocaleString()
    };
    setEmailLogs(prev => [log, ...prev.slice(0, 9)]); // Keep last 10 logs
  };

  const clearLogs = () => {
    setEmailLogs([]);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Mail className="w-6 h-6" />
          Email System Tester
        </h2>
        <div className="flex gap-2">
          <button
            onClick={clearLogs}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Clear Logs
          </button>
          <button
            onClick={testEmailSending}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Test All Emails'}
          </button>
        </div>
      </div>

      {/* Test Results */}
      <div className="grid grid-cols-6 gap-4 mb-6">
        {Object.entries(testResults).map(([test, passed]) => (
          <div key={test} className="flex items-center gap-2 p-3 rounded-lg bg-gray-50">
            {passed ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500" />
            )}
            <span className="font-medium capitalize text-sm">{test.replace(/([A-Z])/g, ' $1').trim()}</span>
          </div>
        ))}
      </div>

      {/* Custom Email Sender */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Send Custom Email</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="test@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Type
            </label>
            <select
              value={emailType}
              onChange={(e) => setEmailType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {emailTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={sendCustomEmail}
              disabled={loading || !testEmail || !emailType}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Send Email'}
            </button>
          </div>
        </div>
        <div className="mt-2 text-sm text-gray-600">
          {emailTypes.find(type => type.value === emailType)?.description}
        </div>
      </div>

      {/* Email Types Info */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Available Email Types</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {emailTypes.map(type => (
            <div key={type.value} className="border border-gray-200 rounded-lg p-3">
              <div className="font-medium text-gray-800">{type.label}</div>
              <div className="text-sm text-gray-600 mt-1">{type.description}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Email Logs */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Email Logs</h3>
        {emailLogs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No email logs yet. Send some test emails to see logs here.
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {emailLogs.map(log => (
              <div key={log.id} className={`flex items-center gap-3 p-3 rounded-lg ${
                log.status === 'success' ? 'bg-green-50 border border-green-200' :
                log.status === 'error' ? 'bg-red-50 border border-red-200' :
                'bg-gray-50 border border-gray-200'
              }`}>
                {log.status === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : log.status === 'error' ? (
                  <XCircle className="w-5 h-5 text-red-500" />
                ) : (
                  <Mail className="w-5 h-5 text-gray-500" />
                )}
                <div className="flex-1">
                  <div className="font-medium text-gray-800">{log.type}</div>
                  <div className="text-sm text-gray-600">{log.message}</div>
                </div>
                <div className="text-xs text-gray-500">{log.timestamp}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailTester;
