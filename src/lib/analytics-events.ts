export const ANALYTICS_EVENTS = [
  "page_view",
  "tool_open",
  "tool_start",
  "tool_success",
  "tool_error",
  "file_selected",
  "file_download",
  "copy_result",
  "share_click",
  "language_change",
  "search_submit",
  "zero_result_search",
  "related_tool_click",
  "affiliate_click",
] as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENTS)[number];
