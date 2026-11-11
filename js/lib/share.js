// Encode a program into a URL fragment so it can be shared as a link.
// "z" prefix = deflate-compressed, "p" = plain. Works without any server.

function toB64Url(bytes) {
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromB64Url(str) {
  const b = atob(str.replace(/-/g, '+').replace(/_/g, '/'));
  const out = new Uint8Array(b.length);
  for (let i = 0; i < b.length; i++) out[i] = b.charCodeAt(i);
  return out;
}

export async function encodeShare(code) {
  const bytes = new TextEncoder().encode(code);
  if (typeof CompressionStream !== 'undefined') {
    try {
      const stream = new Blob([bytes]).stream().pipeThrough(new CompressionStream('deflate-raw'));
      return 'z' + toB64Url(new Uint8Array(await new Response(stream).arrayBuffer()));
    } catch {}
  }
  return 'p' + toB64Url(bytes);
}

export async function decodeShare(token) {
  const kind = token[0];
  const bytes = fromB64Url(token.slice(1));
  if (kind === 'p') return new TextDecoder().decode(bytes);
  if (kind === 'z') {
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
    return new TextDecoder().decode(await new Response(stream).arrayBuffer());
  }
  throw new Error('This share link is not valid.');
}
