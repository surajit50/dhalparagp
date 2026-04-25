import { NextResponse } from 'next/server'
// @ts-ignore
import CryptoJS from 'crypto-js'
import * as https from 'node:https'

// ─── eMudhra emBridge AES Configuration ────────────────────────────────────
// Set EMBRIDGE_AES_KEY (32 chars) and EMBRIDGE_AES_IV (16 chars) in .env.local
// These values are provided by eMudhra when you register / integrate emBridge.
const AES_KEY = process.env.EMBRIDGE_AES_KEY || 'emBridgeKey@12341234567890123456'
const AES_IV  = process.env.EMBRIDGE_AES_IV  || 'emBridgeIV@12345'

const EM_BRIDGE_BASE = 'https://localhost.emudhra.com:26769/DSC'

// Allow self-signed cert from emBridge local service
const emBridgeAgent = new https.Agent({ rejectUnauthorized: false })

/** Encrypts a plain JSON string → Base64 AES-CBC ciphertext */
function aesEncrypt(plainText: string): string {
  const key = CryptoJS.enc.Utf8.parse(AES_KEY)
  const iv  = CryptoJS.enc.Utf8.parse(AES_IV)
  return CryptoJS.AES.encrypt(plainText, key, {
    iv,
    mode:    CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  }).toString()
}

/** Decrypts a Base64 AES-CBC ciphertext → plain string */
function aesDecrypt(cipherText: string): string {
  const key = CryptoJS.enc.Utf8.parse(AES_KEY)
  const iv  = CryptoJS.enc.Utf8.parse(AES_IV)
  return CryptoJS.AES.decrypt(cipherText, key, {
    iv,
    mode:    CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  }).toString(CryptoJS.enc.Utf8)
}

/** Low-level fetch to emBridge using Node.js https agent (bypasses TLS verify) */
async function fetchEmBridge(url: string, body: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const postData = Buffer.from(body, 'utf-8')
    const urlObj = new URL(url)
    const options: https.RequestOptions = {
      hostname: urlObj.hostname,
      port:     urlObj.port || 26769,
      path:     urlObj.pathname,
      method:   'POST',
      agent:    emBridgeAgent,
      headers: {
        'Content-Type':             'application/json',
        'Content-Length':           postData.length,
        'Access-Control-Allow-Origin': '*',
        'X-Requested-With':         'XMLHttpRequest',
        'Cache-Control':            'no-cache',
      },
    }

    const req = https.request(options, (res) => {
      const chunks: Buffer[] = []
      res.on('data', (chunk) => chunks.push(chunk))
      res.on('end', () => {
        const statusCode = res.statusCode ?? 0
        const text = Buffer.concat(chunks).toString('utf-8')
        if (statusCode < 200 || statusCode >= 300) {
          reject(new Error(`emBridge HTTP ${statusCode}: ${text}`))
        } else {
          resolve(text)
        }
      })
    })

    req.on('error', reject)
    req.write(postData)
    req.end()
  })
}

// POST /api/embridge/[action]
// Body: { payload: object }
// Returns: the decrypted emBridge response as JSON
export async function POST(
  req: Request,
  { params }: { params: Promise<{ action: string }> },
) {
  const { action } = await params
  const allowedActions = ['ListToken', 'ListCertificate', 'PKCSBulkSign']

  if (!allowedActions.includes(action)) {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  }

  try {
    const body = await req.json()
    const payloadStr = JSON.stringify(body.payload ?? body)

    // 1. Encrypt the payload
    const encryptedPayload = aesEncrypt(payloadStr)

    // 2. Call emBridge with the encrypted payload
    const encryptedResponse = await fetchEmBridge(
      `${EM_BRIDGE_BASE}/${action}`,
      encryptedPayload,
    )

    // 3. Decrypt the response
    let decryptedResponse: string
    try {
      decryptedResponse = aesDecrypt(encryptedResponse)
      // Fallback: if decrypted result is empty, maybe response was plain JSON
      if (!decryptedResponse) decryptedResponse = encryptedResponse
    } catch {
      decryptedResponse = encryptedResponse
    }

    let parsed: unknown
    try {
      parsed = JSON.parse(decryptedResponse)
    } catch {
      return NextResponse.json(
        { error: 'Failed to parse emBridge response', raw: decryptedResponse },
        { status: 500 },
      )
    }

    return NextResponse.json(parsed)
  } catch (err) {
    console.error(`[emBridge proxy] ${action} error:`, err)
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : 'emBridge proxy error',
        detail: `Could not connect to emBridge. Ensure: (1) emBridge service is running, (2) DSC token is inserted, (3) EMBRIDGE_AES_KEY / EMBRIDGE_AES_IV are set correctly in .env.local`,
      },
      { status: 502 },
    )
  }
}
