/**
 * AI 응답 텍스트의 마크다운 형식을 HTML로 변환합니다.
 *
 * 지원하는 변환:
 * - `code` -> <span class="code-badge">code</span>
 * - **bold** -> <b>bold</b>
 * - *italic* -> <i>italic</i>
 * - | 표 | 형식 | -> <table> 변환
 *
 * @param text - 변환할 텍스트
 * @returns HTML 형식으로 변환된 텍스트
 */
export function formatMarkdown(text: string): string {
  if (!text) return '';

  let result = text;

  // 마크다운 테이블 변환
  result = convertMarkdownTable(result);

  // `code` -> 배지 스타일 (primary-dark 색상)
  result = result.replace(/`([^`]+)`/g, '<span class="code-badge">$1</span>');

  // **bold** -> <b>bold</b> (먼저 처리해야 *italic*과 충돌 방지)
  result = result.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');

  // *italic* -> <i>italic</i>
  result = result.replace(/\*(.+?)\*/g, '<i>$1</i>');

  return result;
}

/**
 * 마크다운 테이블을 HTML 테이블로 변환합니다.
 * 텍스트 중간에 테이블이 있는 경우도 처리합니다.
 */
function convertMarkdownTable(text: string): string {
  // 테이블 패턴: | col | col | ... | 형태가 연속으로 나오는 것
  const tablePattern = /(\|[^|]+)+\|(?:\s*\|[^|]+\|)*/g;

  // 구분선 행인지 확인
  const isSeparatorRow = (row: string): boolean => {
    if (!row.startsWith('|') || !row.endsWith('|')) return false;
    const cells = row.split('|').slice(1, -1);
    return cells.length > 0 && cells.every(cell => /^[\s:-]+$/.test(cell) && cell.includes('-'));
  };

  return text.replace(tablePattern, (match) => {
    // | | 패턴을 줄바꿈으로 변환하여 행 분리
    const normalized = match.replace(/\|\s*\|/g, '|\n|');
    const rows = normalized.split('\n').map(r => r.trim()).filter(r => r);

    // 구분선 찾기
    const sepIdx = rows.findIndex(isSeparatorRow);

    if (sepIdx === -1 || sepIdx === 0 || rows.length < 3) {
      return match;
    }

    const headerRows = rows.slice(0, sepIdx);
    const bodyRows = rows.slice(sepIdx + 1);

    const parseRow = (row: string): string[] => {
      return row.split('|').slice(1, -1).map(cell => cell.trim());
    };

    let html = '<table class="markdown-table">';

    // 헤더
    html += '<thead>';
    headerRows.forEach(row => {
      const cells = parseRow(row);
      html += '<tr>';
      cells.forEach(cell => {
        html += `<th>${cell}</th>`;
      });
      html += '</tr>';
    });
    html += '</thead>';

    // 바디
    if (bodyRows.length > 0) {
      html += '<tbody>';
      bodyRows.forEach(row => {
        const cells = parseRow(row);
        html += '<tr>';
        cells.forEach(cell => {
          html += `<td>${cell}</td>`;
        });
        html += '</tr>';
      });
      html += '</tbody>';
    }

    html += '</table>';

    return html;
  });
}
