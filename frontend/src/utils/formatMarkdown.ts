/**
 * AI 응답 텍스트의 마크다운 형식을 HTML로 변환합니다.
 *
 * 지원하는 변환:
 * - # 헤딩 (h1-h6)
 * - **bold**, __bold__
 * - *italic*, _italic_
 * - ~~strikethrough~~
 * - `inline code`
 * - ```code block```
 * - [link](url)
 * - ![image](url)
 * - > blockquote
 * - - 또는 * 또는 + 순서 없는 리스트
 * - 1. 순서 있는 리스트
 * - [ ] 또는 [x] 체크박스
 * - --- 수평선
 * - | 표 | 형식 |
 *
 * @param text - 변환할 텍스트
 * @returns HTML 형식으로 변환된 텍스트
 */
export function formatMarkdown(text: string): string {
  if (!text) return '';

  let result = text;

  // 전처리: 번호 리스트 패턴 앞에 줄바꿈 추가 (1. 2. 3. 등)
  // "... 내용 1. 항목" → "... 내용\n1. 항목"
  result = result.replace(/([^\n])\s+(\d+)\.\s+/g, '$1\n$2. ');

  // 전처리: 글머리 기호 리스트 패턴 앞에 줄바꿈 추가 (- * + 등)
  // "... 내용 - 항목" → "... 내용\n- 항목"
  result = result.replace(/([^\n])\s+([-*+])\s+(?=[^\s])/g, '$1\n$2 ');

  // 코드 블록을 먼저 처리하고 플레이스홀더로 대체 (다른 변환에 영향받지 않도록)
  const codeBlocks: string[] = [];
  result = result.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) => {
    const index = codeBlocks.length;
    const escapedCode = escapeHtml(code.trim());
    const langClass = lang ? ` data-lang="${lang}"` : '';
    codeBlocks.push(`<pre class="markdown-code-block"${langClass}><code>${escapedCode}</code></pre>`);
    return `\x00CODE_BLOCK_${index}\x00`;
  });

  // 인라인 코드도 먼저 처리
  const inlineCodes: string[] = [];
  result = result.replace(/`([^`\n]+)`/g, (_, code) => {
    const index = inlineCodes.length;
    inlineCodes.push(`<span class="code-badge">${escapeHtml(code)}</span>`);
    return `\x00INLINE_CODE_${index}\x00`;
  });

  // 줄 단위로 처리
  const lines = result.split('\n');
  const processedLines: string[] = [];
  let inList = false;
  let listType: 'ul' | 'ol' | null = null;
  let inBlockquote = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // 수평선: --- 또는 *** 또는 ___
    if (/^(\*{3,}|-{3,}|_{3,})$/.test(line.trim())) {
      closeList();
      closeBlockquote();
      processedLines.push('<hr class="markdown-hr" />');
      continue;
    }

    // 헤딩: # ~ ######
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      closeList();
      closeBlockquote();
      const level = headingMatch[1].length;
      const content = processInline(headingMatch[2]);
      processedLines.push(`<h${level} class="markdown-h${level}">${content}</h${level}>`);
      continue;
    }

    // 블록 인용: >
    const blockquoteMatch = line.match(/^>\s?(.*)$/);
    if (blockquoteMatch) {
      closeList();
      if (!inBlockquote) {
        processedLines.push('<blockquote class="markdown-blockquote">');
        inBlockquote = true;
      }
      processedLines.push(processInline(blockquoteMatch[1]));
      continue;
    } else if (inBlockquote) {
      closeBlockquote();
    }

    // 체크박스 리스트: - [ ] 또는 - [x]
    const checkboxMatch = line.match(/^[\s]*[-*+]\s+\[([ xX])\]\s+(.+)$/);
    if (checkboxMatch) {
      closeBlockquote();
      if (!inList || listType !== 'ul') {
        closeList();
        processedLines.push('<ul class="markdown-list markdown-checklist">');
        inList = true;
        listType = 'ul';
      }
      const checked = checkboxMatch[1].toLowerCase() === 'x';
      const content = processInline(checkboxMatch[2]);
      const checkboxHtml = `<input type="checkbox" class="markdown-checkbox" ${checked ? 'checked' : ''} disabled />`;
      processedLines.push(`<li class="markdown-checkbox-item">${checkboxHtml} ${content}</li>`);
      continue;
    }

    // 순서 없는 리스트: - 또는 * 또는 +
    const ulMatch = line.match(/^[\s]*[-*+]\s+(.+)$/);
    if (ulMatch) {
      closeBlockquote();
      if (!inList || listType !== 'ul') {
        closeList();
        processedLines.push('<ul class="markdown-list">');
        inList = true;
        listType = 'ul';
      }
      processedLines.push(`<li>${processInline(ulMatch[1])}</li>`);
      continue;
    }

    // 순서 있는 리스트: 1. 또는 1)
    const olMatch = line.match(/^[\s]*(\d+)[.)]\s+(.+)$/);
    if (olMatch) {
      closeBlockquote();
      if (!inList || listType !== 'ol') {
        closeList();
        processedLines.push('<ol class="markdown-list markdown-ol">');
        inList = true;
        listType = 'ol';
      }
      processedLines.push(`<li>${processInline(olMatch[2])}</li>`);
      continue;
    }

    // 리스트가 아닌 줄이면 리스트 종료
    if (inList && line.trim() !== '') {
      closeList();
    }

    // 마크다운 테이블 감지
    if (line.includes('|') && line.trim().startsWith('|')) {
      closeList();
      closeBlockquote();
      const tableLines: string[] = [line];
      // 다음 줄들이 테이블 행인지 확인
      while (i + 1 < lines.length && lines[i + 1].includes('|') && lines[i + 1].trim().startsWith('|')) {
        i++;
        tableLines.push(lines[i]);
      }
      const tableHtml = convertTableLines(tableLines);
      if (tableHtml) {
        processedLines.push(tableHtml);
      } else {
        // 테이블이 아니면 일반 텍스트로 처리
        tableLines.forEach(tl => processedLines.push(`<p>${processInline(tl)}</p>`));
      }
      continue;
    }

    // 빈 줄
    if (line.trim() === '') {
      closeList();
      processedLines.push('');
      continue;
    }

    // 일반 텍스트
    processedLines.push(`<p>${processInline(line)}</p>`);
  }

  // 마지막에 열린 태그 닫기
  closeList();
  closeBlockquote();

  result = processedLines.join('\n');

  // 코드 블록 플레이스홀더 복원
  codeBlocks.forEach((block, index) => {
    result = result.replace(`\x00CODE_BLOCK_${index}\x00`, block);
  });

  // 인라인 코드 플레이스홀더 복원
  inlineCodes.forEach((code, index) => {
    result = result.replace(`\x00INLINE_CODE_${index}\x00`, code);
  });

  // 연속된 빈 <p> 태그 정리
  result = result.replace(/<p><\/p>\n?/g, '');
  result = result.replace(/\n{3,}/g, '\n\n');

  return result;

  function closeList() {
    if (inList) {
      processedLines.push(listType === 'ol' ? '</ol>' : '</ul>');
      inList = false;
      listType = null;
    }
  }

  function closeBlockquote() {
    if (inBlockquote) {
      processedLines.push('</blockquote>');
      inBlockquote = false;
    }
  }
}

/**
 * 인라인 마크다운 요소를 HTML로 변환합니다.
 */
function processInline(text: string): string {
  let result = text;

  // 이미지: ![alt](url)
  result = result.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="markdown-image" />');

  // 링크: [text](url)
  result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="markdown-link" target="_blank" rel="noopener noreferrer">$1</a>');

  // 취소선: ~~text~~
  result = result.replace(/~~(.+?)~~/g, '<del>$1</del>');

  // Bold: **text** 또는 __text__
  result = result.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  result = result.replace(/__(.+?)__/g, '<strong>$1</strong>');

  // Italic: *text* 또는 _text_ (단어 경계 주의)
  result = result.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  result = result.replace(/(?<![a-zA-Z0-9])_([^_]+)_(?![a-zA-Z0-9])/g, '<em>$1</em>');

  return result;
}

/**
 * 마크다운 테이블 줄들을 HTML 테이블로 변환합니다.
 */
function convertTableLines(lines: string[]): string | null {
  if (lines.length < 2) return null;

  // 구분선 행 찾기
  const isSeparatorRow = (row: string): boolean => {
    if (!row.trim().startsWith('|') || !row.trim().endsWith('|')) return false;
    const cells = row.split('|').slice(1, -1);
    return cells.length > 0 && cells.every(cell => /^[\s:-]+$/.test(cell) && cell.includes('-'));
  };

  const sepIdx = lines.findIndex(isSeparatorRow);
  if (sepIdx === -1 || sepIdx === 0) return null;

  const parseRow = (row: string): string[] => {
    return row.split('|').slice(1, -1).map(cell => cell.trim());
  };

  // 정렬 정보 추출
  const sepCells = parseRow(lines[sepIdx]);
  const alignments = sepCells.map(cell => {
    if (cell.startsWith(':') && cell.endsWith(':')) return 'center';
    if (cell.endsWith(':')) return 'right';
    return 'left';
  });

  const headerRows = lines.slice(0, sepIdx);
  const bodyRows = lines.slice(sepIdx + 1);

  let html = '<table class="markdown-table">';

  // 헤더
  html += '<thead>';
  headerRows.forEach(row => {
    const cells = parseRow(row);
    html += '<tr>';
    cells.forEach((cell, idx) => {
      const align = alignments[idx] || 'left';
      html += `<th style="text-align: ${align}">${processInline(cell)}</th>`;
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
      cells.forEach((cell, idx) => {
        const align = alignments[idx] || 'left';
        html += `<td style="text-align: ${align}">${processInline(cell)}</td>`;
      });
      html += '</tr>';
    });
    html += '</tbody>';
  }

  html += '</table>';

  return html;
}

/**
 * HTML 특수문자를 이스케이프합니다.
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
