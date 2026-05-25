/**
 * Rate limiter simples com janela deslizante em memória.
 *
 * Para produção multi-instância, substitua o Map por Upstash Redis
 * ou similar. Para uso em instância única, este módulo é suficiente.
 */

interface RateLimitEntry {
  timestamps: number[]
}

// Map global: chave → histórico de timestamps das requisições
const store = new Map<string, RateLimitEntry>()

interface RateLimitOptions {
  /** Número máximo de requisições permitidas na janela */
  limit: number
  /** Tamanho da janela em milissegundos */
  windowMs: number
}

interface RateLimitResult {
  success: boolean
  /** Número de requisições restantes na janela atual */
  remaining: number
  /** Timestamp (ms) quando a janela reseta para este key */
  resetAt: number
}

/**
 * Verifica se a chave ainda tem quota disponível.
 *
 * @param key     - Identificador único (ex: userId ou `${userId}:route`)
 * @param options - Configuração de limite e janela de tempo
 */
export function checkRateLimit(key: string, options: RateLimitOptions): RateLimitResult {
  const now = Date.now()
  const windowStart = now - options.windowMs

  const entry = store.get(key) ?? { timestamps: [] }

  // Remove timestamps fora da janela atual
  entry.timestamps = entry.timestamps.filter(t => t > windowStart)

  const remaining = Math.max(0, options.limit - entry.timestamps.length)
  const resetAt   = entry.timestamps[0]
    ? entry.timestamps[0] + options.windowMs
    : now + options.windowMs

  if (entry.timestamps.length >= options.limit) {
    store.set(key, entry)
    return { success: false, remaining: 0, resetAt }
  }

  // Registra a requisição atual
  entry.timestamps.push(now)
  store.set(key, entry)

  return { success: true, remaining: remaining - 1, resetAt }
}

/** Limites padrão para rotas de IA */
export const AI_RATE_LIMIT: RateLimitOptions = {
  limit:    10,        // 10 requisições
  windowMs: 60 * 1000, // por minuto
}
