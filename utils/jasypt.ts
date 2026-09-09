import CryptoJS from 'crypto-js'

export type JasyptAlgorithm =
  | 'PBEWithMD5AndDES'
  | 'PBEWithHMACSHA512AndAES_256'
  | 'PBEWithHMACSHA256AndAES_256'

export type JasyptDigestAlgorithm =
  | 'SHA-256'
  | 'SHA-512'
  | 'MD5'

export interface EncryptionOptions {
  algorithm?: JasyptAlgorithm
  iterations?: number
}

export interface DigestOptions {
  algorithm?: JasyptDigestAlgorithm
  iterations?: number
}

/**
 * ENC(...) 패턴 추출 헬퍼
 * 사용자가 ENC(abc) 형태로 입력했을 때 내부의 순수 암호문만 추출합니다.
 */
export function extractEncValue(input: string): string {
  if (!input) return ''
  const trimmed = input.trim()
  const match = trimmed.match(/^ENC\((.*)\)$/i)
  if (match && match[1]) {
    return match[1].trim()
  }
  return trimmed
}

/**
 * Spring Boot 설정 형식 포맷팅 헬퍼
 */
export function formatAsEnc(ciphertext: string): string {
  if (!ciphertext) return ''
  return `ENC(${ciphertext.trim()})`
}

/**
 * PKCS#5 PBKDF1 MD5 키 및 IV 유도 함수
 * Java SunJCE PBEWithMD5AndDES 표준 사양과 일치합니다.
 */
function derivePBKDF1MD5(password: string, saltWords: CryptoJS.lib.WordArray, iterations: number) {
  const passWords = CryptoJS.enc.Utf8.parse(password)
  const combined = passWords.clone().concat(saltWords)

  let hash = CryptoJS.MD5(combined)
  for (let i = 1; i < iterations; i++) {
    hash = CryptoJS.MD5(hash)
  }

  // 앞 8바이트는 DES 키, 뒤 8바이트는 DES IV
  const keyWords = CryptoJS.lib.WordArray.create(hash.words.slice(0, 2), 8)
  const ivWords = CryptoJS.lib.WordArray.create(hash.words.slice(2, 4), 8)

  return { keyWords, ivWords }
}

/**
 * Jasypt 양방향 암호화 함수
 */
export function encryptJasypt(
  plainText: string,
  password: string,
  options: EncryptionOptions = {}
): string {
  if (!plainText) {
    throw new Error('암호화할 평문을 입력해주세요.')
  }
  if (!password) {
    throw new Error('시크릿 키(비밀번호)를 입력해주세요.')
  }

  const algorithm = options.algorithm || 'PBEWithMD5AndDES'
  const iterations = options.iterations || 1000

  if (algorithm === 'PBEWithMD5AndDES') {
    // 8바이트 솔트 생성
    const saltWords = CryptoJS.lib.WordArray.random(8)
    const { keyWords, ivWords } = derivePBKDF1MD5(password, saltWords, iterations)

    const textWords = CryptoJS.enc.Utf8.parse(plainText)
    const encrypted = CryptoJS.DES.encrypt(textWords, keyWords, {
      iv: ivWords,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    })

    // Base64(salt + ciphertext)
    const resultWords = saltWords.clone().concat(encrypted.ciphertext)
    return CryptoJS.enc.Base64.stringify(resultWords)
  }

  if (algorithm === 'PBEWithHMACSHA512AndAES_256' || algorithm === 'PBEWithHMACSHA256AndAES_256') {
    const isSha512 = algorithm === 'PBEWithHMACSHA512AndAES_256'
    // 16바이트 솔트 및 16바이트 IV 생성
    const saltWords = CryptoJS.lib.WordArray.random(16)
    const ivWords = CryptoJS.lib.WordArray.random(16)

    // PBKDF2로 256비트(32바이트) AES 키 생성
    const keyWords = CryptoJS.PBKDF2(password, saltWords, {
      keySize: 256 / 32,
      iterations: iterations,
      hasher: isSha512 ? CryptoJS.algo.SHA512 : CryptoJS.algo.SHA256
    })

    const textWords = CryptoJS.enc.Utf8.parse(plainText)
    const encrypted = CryptoJS.AES.encrypt(textWords, keyWords, {
      iv: ivWords,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    })

    // Base64(salt + iv + ciphertext)
    const resultWords = saltWords.clone().concat(ivWords).concat(encrypted.ciphertext)
    return CryptoJS.enc.Base64.stringify(resultWords)
  }

  throw new Error(`지원되지 않는 암호화 알고리즘입니다: ${algorithm}`)
}

/**
 * Jasypt 양방향 복호화 함수
 */
export function decryptJasypt(
  encryptedText: string,
  password: string,
  options: EncryptionOptions = {}
): string {
  const pureEncrypted = extractEncValue(encryptedText)
  if (!pureEncrypted) {
    throw new Error('복호화할 암호문을 입력해주세요.')
  }
  if (!password) {
    throw new Error('시크릿 키(비밀번호)를 입력해주세요.')
  }

  const algorithm = options.algorithm || 'PBEWithMD5AndDES'
  const iterations = options.iterations || 1000

  let rawBytes: CryptoJS.lib.WordArray
  try {
    rawBytes = CryptoJS.enc.Base64.parse(pureEncrypted)
  } catch (err) {
    throw new Error('올바른 Base64 포맷의 암호문이 아닙니다.')
  }

  const rawHex = CryptoJS.enc.Hex.stringify(rawBytes)

  if (algorithm === 'PBEWithMD5AndDES') {
    // 최소 8바이트 솔트 + 8바이트 블록 이상이어야 함 (16바이트 = 32 hex)
    if (rawHex.length < 32) {
      throw new Error('암호문의 길이가 유효하지 않습니다.')
    }

    const saltHex = rawHex.substring(0, 16)
    const cipherHex = rawHex.substring(16)

    const saltWords = CryptoJS.enc.Hex.parse(saltHex)
    const cipherWords = CryptoJS.enc.Hex.parse(cipherHex)

    const { keyWords, ivWords } = derivePBKDF1MD5(password, saltWords, iterations)

    const cipherParams = CryptoJS.lib.CipherParams.create({
      ciphertext: cipherWords
    })

    try {
      const decrypted = CryptoJS.DES.decrypt(cipherParams, keyWords, {
        iv: ivWords,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      })
      const result = decrypted.toString(CryptoJS.enc.Utf8)
      if (!result) {
        throw new Error('복호화 결과가 비어있거나 비밀키가 올바르지 않습니다.')
      }
      return result
    } catch (e: any) {
      throw new Error('복호화에 실패했습니다. 시크릿 키 또는 알고리즘이 올바른지 확인해주세요.')
    }
  }

  if (algorithm === 'PBEWithHMACSHA512AndAES_256' || algorithm === 'PBEWithHMACSHA256AndAES_256') {
    const isSha512 = algorithm === 'PBEWithHMACSHA512AndAES_256'
    // 최소 16바이트 솔트 + 16바이트 IV + 16바이트 블록 이상 (48바이트 = 96 hex)
    if (rawHex.length < 96) {
      throw new Error('AES-256 암호문 길이가 유효하지 않습니다. (솔트 및 IV 누락)')
    }

    const saltHex = rawHex.substring(0, 32)
    const ivHex = rawHex.substring(32, 64)
    const cipherHex = rawHex.substring(64)

    const saltWords = CryptoJS.enc.Hex.parse(saltHex)
    const ivWords = CryptoJS.enc.Hex.parse(ivHex)
    const cipherWords = CryptoJS.enc.Hex.parse(cipherHex)

    const keyWords = CryptoJS.PBKDF2(password, saltWords, {
      keySize: 256 / 32,
      iterations: iterations,
      hasher: isSha512 ? CryptoJS.algo.SHA512 : CryptoJS.algo.SHA256
    })

    const cipherParams = CryptoJS.lib.CipherParams.create({
      ciphertext: cipherWords
    })

    try {
      const decrypted = CryptoJS.AES.decrypt(cipherParams, keyWords, {
        iv: ivWords,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      })
      const result = decrypted.toString(CryptoJS.enc.Utf8)
      if (!result) {
        throw new Error('복호화 결과가 비어있거나 비밀키가 올바르지 않습니다.')
      }
      return result
    } catch (e: any) {
      throw new Error('복호화에 실패했습니다. 시크릿 키 또는 알고리즘이 올바른지 확인해주세요.')
    }
  }

  throw new Error(`지원되지 않는 복호화 알고리즘입니다: ${algorithm}`)
}

/**
 * Jasypt 단방향 해시 다이제스트 생성 (StandardStringDigester 규격)
 */
export function digestJasypt(
  plainText: string,
  options: DigestOptions = {}
): string {
  if (!plainText) {
    throw new Error('다이제스트할 텍스트를 입력해주세요.')
  }

  const algorithm = options.algorithm || 'SHA-256'
  const iterations = options.iterations || 1000

  // 16바이트 랜덤 솔트 생성
  const saltWords = CryptoJS.lib.WordArray.random(16)
  const messageWords = CryptoJS.enc.Utf8.parse(plainText)
  const combined = saltWords.clone().concat(messageWords)

  let hasher: (message: CryptoJS.lib.WordArray | string) => CryptoJS.lib.WordArray
  if (algorithm === 'SHA-256') {
    hasher = CryptoJS.SHA256
  } else if (algorithm === 'SHA-512') {
    hasher = CryptoJS.SHA512
  } else if (algorithm === 'MD5') {
    hasher = CryptoJS.MD5
  } else {
    throw new Error(`지원되지 않는 다이제스트 알고리즘입니다: ${algorithm}`)
  }

  let hash = hasher(combined)
  for (let i = 1; i < iterations; i++) {
    hash = hasher(hash)
  }

  // Base64(salt + hash)
  const resultWords = saltWords.clone().concat(hash)
  return CryptoJS.enc.Base64.stringify(resultWords)
}

/**
 * Jasypt 단방향 다이제스트 일치 검증 (StandardStringDigester matches 규격)
 */
export function matchJasypt(
  plainText: string,
  digestText: string,
  options: DigestOptions = {}
): boolean {
  if (!plainText || !digestText) {
    return false
  }

  const algorithm = options.algorithm || 'SHA-256'
  const iterations = options.iterations || 1000

  let rawBytes: CryptoJS.lib.WordArray
  try {
    rawBytes = CryptoJS.enc.Base64.parse(digestText.trim())
  } catch (err) {
    return false
  }

  const rawHex = CryptoJS.enc.Hex.stringify(rawBytes)
  // 솔트 16바이트 = 32 hex
  if (rawHex.length <= 32) {
    return false
  }

  const saltHex = rawHex.substring(0, 32)
  const expectedHashHex = rawHex.substring(32)

  const saltWords = CryptoJS.enc.Hex.parse(saltHex)
  const messageWords = CryptoJS.enc.Utf8.parse(plainText)
  const combined = saltWords.clone().concat(messageWords)

  let hasher: (message: CryptoJS.lib.WordArray | string) => CryptoJS.lib.WordArray
  if (algorithm === 'SHA-256') {
    hasher = CryptoJS.SHA256
  } else if (algorithm === 'SHA-512') {
    hasher = CryptoJS.SHA512
  } else if (algorithm === 'MD5') {
    hasher = CryptoJS.MD5
  } else {
    throw new Error(`지원되지 않는 다이제스트 알고리즘입니다: ${algorithm}`)
  }

  let hash = hasher(combined)
  for (let i = 1; i < iterations; i++) {
    hash = hasher(hash)
  }

  return hash.toString().toLowerCase() === expectedHashHex.toLowerCase()
}
