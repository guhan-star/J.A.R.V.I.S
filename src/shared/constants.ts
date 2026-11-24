/**
 * IPC Channel Names
 */
export const IPC_CHANNELS = {
  WINDOW_MINIMIZE: 'jarvis:window:minimize',
  WINDOW_MAXIMIZE: 'jarvis:window:maximize',
  WINDOW_CLOSE: 'jarvis:window:close',
  WINDOW_IS_MAXIMIZED: 'jarvis:window:is-maximized',
  
  TELEMETRY_GET: 'jarvis:telemetry:get',
  TELEMETRY_STREAM: 'jarvis:telemetry:stream',
  
  CHAT_SEND: 'jarvis:chat:send',
  CHAT_CLEAR: 'jarvis:chat:clear',
  CHAT_GET_HISTORY: 'jarvis:chat:get-history',
  DIAGNOSTIC_RUN: 'jarvis:diagnostic:run',
  APP_INFO: 'jarvis:app:info',

  AI_STATUS: 'jarvis:ai:status',
  AI_SET_CONFIG: 'jarvis:ai:set-config',
  AI_SET_KEY: 'jarvis:ai:set-key',
  AI_DELETE_KEY: 'jarvis:ai:delete-key',
  AI_TEST_PROVIDER: 'jarvis:ai:test-provider',
} as const;
