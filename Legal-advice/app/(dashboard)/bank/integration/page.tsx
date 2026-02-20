'use client';

import { useState } from 'react';
import { Copy, Eye, EyeOff, RefreshCw, Check, AlertCircle, Code, Webhook, Zap } from 'lucide-react';

export default function IntegrationSettingsPage() {
  const [showApiKey, setShowApiKey] = useState(false);
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);
  const [environment, setEnvironment] = useState<'sandbox' | 'production'>('production');

  const apiKey = 'pk_live_51KxYz8Hd...mNqP2Wx1K00abCD1234';
  const webhookSecret = 'whsec_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6';

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add toast notification here
  };

  return (
    <div className="flex flex-col flex-1 p-8 gap-6 max-w-[1400px] mx-auto w-full">
      {/* Header */}
      <div>
        <h1 className="text-[#111827] text-3xl font-extrabold mb-2">Integration Settings</h1>
        <p className="text-gray-600">
          Configure API keys, webhooks, and automated submission settings for seamless integration.
        </p>
      </div>

      {/* Status Banner */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-5 flex items-center gap-3">
        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
          <Check className="w-5 h-5 text-green-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 mb-1">Integration Active</h3>
          <p className="text-sm text-gray-700">
            Your API integration is configured and receiving requests. Last sync: 2 minutes ago.
          </p>
        </div>
        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
          LIVE
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* API Authentication */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Code className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">API Authentication</h2>
                  <p className="text-sm text-gray-600">Manage your API credentials</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* API Key */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">API Key</label>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      value={apiKey}
                      className="w-full rounded-lg border border-gray-300 bg-gray-50 text-gray-900 px-4 py-3 pr-12 text-sm font-mono focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none"
                      readOnly
                    />
                    <button
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showApiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <button
                    onClick={() => copyToClipboard(apiKey)}
                    className="px-4 py-3 border border-gray-200 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button className="px-4 py-3 border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-medium transition-colors">
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Use this API key to authenticate your requests to the Legal Portal API
                </p>
              </div>

              {/* Environment Toggle */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Environment
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setEnvironment('sandbox')}
                    className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                      environment === 'sandbox'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Sandbox (Testing)
                  </button>
                  <button
                    onClick={() => setEnvironment('production')}
                    className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                      environment === 'production'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Production (Live)
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Webhooks */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Webhook className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Webhook Configuration</h2>
                  <p className="text-sm text-gray-600">Receive real-time event notifications</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Webhook URL */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Webhook Endpoint URL
                </label>
                <input
                  type="url"
                  defaultValue="https://api.yourbank.com/webhooks/legal-opinions"
                  className="w-full rounded-lg border border-gray-300 bg-white text-gray-900 px-4 py-3 text-sm font-mono focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none"
                />
                <p className="text-xs text-gray-500 mt-2">
                  We'll send POST requests to this URL when events occur
                </p>
              </div>

              {/* Webhook Secret */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Webhook Signing Secret
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <input
                      type={showWebhookSecret ? 'text' : 'password'}
                      value={webhookSecret}
                      className="w-full rounded-lg border border-gray-300 bg-gray-50 text-gray-900 px-4 py-3 pr-12 text-sm font-mono focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none"
                      readOnly
                    />
                    <button
                      onClick={() => setShowWebhookSecret(!showWebhookSecret)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showWebhookSecret ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  <button
                    onClick={() => copyToClipboard(webhookSecret)}
                    className="px-4 py-3 border border-gray-200 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Use this secret to verify webhook signatures
                </p>
              </div>

              {/* Events to Subscribe */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Events to Subscribe
                </label>
                <div className="space-y-2">
                  {[
                    { id: 'opinion.submitted', label: 'Opinion Submitted', enabled: true },
                    { id: 'opinion.completed', label: 'Opinion Completed', enabled: true },
                    {
                      id: 'clarification.requested',
                      label: 'Clarification Requested',
                      enabled: true,
                    },
                    { id: 'status.updated', label: 'Status Updated', enabled: false },
                  ].map((event) => (
                    <label
                      key={event.id}
                      className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <input
                        type="checkbox"
                        defaultChecked={event.enabled}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm">{event.label}</p>
                        <p className="text-xs text-gray-500 font-mono">{event.id}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Test Webhook */}
              <div className="pt-4 border-t border-gray-200">
                <button className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                  Send Test Event
                </button>
              </div>
            </div>
          </div>

          {/* Automated Submission */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Automated Submission</h2>
                  <p className="text-sm text-gray-600">Configure automation rules</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-3">
              {[
                {
                  title: 'Enable Automated Submissions',
                  description:
                    'Automatically submit requests via API when loan applications are received',
                  enabled: true,
                },
                {
                  title: 'Auto-assign to Preferred Firms',
                  description: 'Automatically assign cases to top-rated firms based on location',
                  enabled: true,
                },
                {
                  title: 'Auto-download Completed Opinions',
                  description: 'Automatically download and archive opinions when delivered',
                  enabled: false,
                },
              ].map((setting, idx) => (
                <label
                  key={idx}
                  className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <input
                    type="checkbox"
                    defaultChecked={setting.enabled}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                  />
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">{setting.title}</p>
                    <p className="text-sm text-gray-600">{setting.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* API Documentation */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">📚</span>
            </div>
            <h3 className="font-bold text-gray-900 mb-2">API Documentation</h3>
            <p className="text-sm text-gray-600 mb-4">
              Learn how to integrate Legal Portal with your existing systems using our comprehensive
              API documentation.
            </p>
            <a
              href="#"
              className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:underline"
            >
              View API Docs →
            </a>
          </div>

          {/* Integration Stats */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-4">Integration Stats</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-600 mb-1">API Calls (Last 30 days)</p>
                <p className="text-2xl font-bold text-gray-900">2,847</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Webhook Events Sent</p>
                <p className="text-2xl font-bold text-gray-900">1,234</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Success Rate</p>
                <p className="text-2xl font-bold text-green-600">99.8%</p>
              </div>
            </div>
          </div>

          {/* Support */}
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl p-6 text-white">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">💬</span>
            </div>
            <h3 className="font-bold mb-2">Need Help?</h3>
            <p className="text-sm text-blue-100 mb-4">
              Our integration team is here to help with any questions or issues.
            </p>
            <button className="w-full px-4 py-2.5 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors">
              Contact Support
            </button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-3 pt-4">
        <button className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors">
          Reset to Defaults
        </button>
        <button className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors">
          Save Settings
        </button>
      </div>
    </div>
  );
}
