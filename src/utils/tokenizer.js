const KEYWORDS = {
  javascript: [
    'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while',
    'class', 'constructor', 'new', 'this', 'extends', 'async', 'await', 'try',
    'catch', 'throw', 'import', 'export', 'default', 'from', 'of', 'in',
    'typeof', 'static', 'get', 'set', 'yield', 'break', 'continue', 'switch',
    'case', 'null', 'undefined', 'true', 'false',
  ],
  php: [
    'function', 'return', 'if', 'else', 'foreach', 'as', 'for', 'while',
    'class', 'public', 'private', 'protected', 'static', 'new', 'this',
    'extends', 'implements', 'interface', 'abstract', 'trait', 'use', 'try',
    'catch', 'throw', 'echo', 'print', 'array', 'true', 'false', 'null',
    'const', 'enum', 'case', 'readonly', 'fn',
  ],
  sql: [
    'SELECT', 'FROM', 'WHERE', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'ON', 'GROUP',
    'BY', 'ORDER', 'HAVING', 'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET',
    'DELETE', 'CREATE', 'TABLE', 'ALTER', 'DROP', 'VIEW', 'TRIGGER',
    'PROCEDURE', 'BEGIN', 'END', 'TRANSACTION', 'COMMIT', 'AS', 'AND', 'OR',
    'NOT', 'NULL', 'DEFAULT', 'PRIMARY', 'KEY', 'FOREIGN', 'REFERENCES',
    'INDEX', 'DISTINCT', 'COUNT', 'SUM', 'AVG', 'MAX', 'MIN', 'CASE', 'WHEN',
    'THEN', 'ELSE', 'LIMIT', 'BETWEEN', 'IN', 'EXISTS', 'PARTITION', 'OVER',
    'WITH', 'INTERVAL', 'NOW', 'COALESCE',
  ],
}

export function tokenize(text, language) {
  const keywords = new Set(KEYWORDS[language] || [])
  const types = new Array(text.length).fill('default')

  function mark(start, end, type) {
    for (let i = start; i < end; i++) types[i] = type
  }

  // 1. strings first — so keywords/numbers *inside* a string never get overridden
  const stringRegex = /'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"|`(?:\\.|[^`\\])*`/g
  let m
  while ((m = stringRegex.exec(text))) {
    mark(m.index, m.index + m[0].length, 'string')
  }

  // 2. numbers
  const numberRegex = /\b\d+(\.\d+)?\b/g
  while ((m = numberRegex.exec(text))) {
    if (types[m.index] === 'default') mark(m.index, m.index + m[0].length, 'number')
  }

  // 3. keywords
  const wordRegex = /[A-Za-z_$][A-Za-z0-9_$]*/g
  while ((m = wordRegex.exec(text))) {
    const word = language === 'sql' ? m[0].toUpperCase() : m[0]
    if (types[m.index] === 'default' && keywords.has(word)) {
      mark(m.index, m.index + m[0].length, 'keyword')
    }
  }

  return types
}