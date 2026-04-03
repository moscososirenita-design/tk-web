// sanitizeOutboundURL 过滤不安全外链，仅允许 http(s) 与站内相对路径。
export function sanitizeOutboundURL(raw: string | null | undefined): string {
  // 先转字符串并裁掉空白，统一所有调用方的空值处理逻辑。
  const value = String(raw || '').trim();
  if (!value) return '';
  // 双斜杠协议相对地址容易被绕过域名校验，这里直接拒绝。
  if (value.startsWith('//')) return '';
  // 站内相对路径直接放行。
  if (value.startsWith('/')) return value;
  // 非 http(s) 绝对地址一律拒绝，例如 javascript:、ftp:。
  if (!/^https?:\/\//i.test(value)) return '';
  try {
    const parsed = new URL(value);
    // 即便正则命中，也再用 URL 对象做一次协议白名单确认。
    if (!['http:', 'https:'].includes(parsed.protocol.toLowerCase())) return '';
    return parsed.toString();
  } catch {
    return '';
  }
}

// sanitizeImageURL 图片地址过滤：允许 http(s)、data 图片与站内相对路径。
export function sanitizeImageURL(raw: string | null | undefined): string {
  const value = String(raw || '').trim();
  if (!value) return '';
  if (value.startsWith('/')) return value;
  // data:image 用于本地占位图/裁剪预览等场景，因此单独允许。
  if (/^data:image\//i.test(value)) return value;
  if (!/^https?:\/\//i.test(value)) return '';
  try {
    const parsed = new URL(value);
    if (!['http:', 'https:'].includes(parsed.protocol.toLowerCase())) return '';
    return parsed.toString();
  } catch {
    return '';
  }
}
