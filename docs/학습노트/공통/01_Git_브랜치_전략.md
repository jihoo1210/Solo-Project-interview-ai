# Git 브랜치 전략

> 작성일: 2024-12-12
> 관련 Phase: Phase 1

---

## 1. 주요 Git 브랜치 전략 비교

### 1.1 Git Flow (전통적, 대규모 팀)

```
main ─────────────────────────────────────────────
       ↑                              ↑
hotfix ┘                              │
                                      │
develop ──────┬───────┬───────────────┤
              │       │               │
feature/auth ─┘       │               │
feature/interview ────┘               │
                                      │
release/1.0 ──────────────────────────┘
```

**구조:**
- `main`: 배포된 안정 버전만
- `develop`: 개발 통합 브랜치
- `feature/*`: 기능 개발
- `release/*`: 배포 준비
- `hotfix/*`: 긴급 버그 수정

**장점:** 체계적, 버전 관리 명확
**단점:** 복잡함, 1인 개발에는 과함

---

### 1.2 GitHub Flow (단순, 추천)

```
main ─────┬─────┬─────┬─────────────
          │     │     │
feature/a ┘     │     │
feature/b ──────┘     │
bugfix/c ─────────────┘
```

**구조:**
- `main`: 항상 배포 가능한 상태
- `feature/*`, `bugfix/*`: 작업 브랜치 → PR → main 병합

**장점:** 단순함, CI/CD 친화적
**단점:** 복잡한 릴리스 관리에는 부적합

---

### 1.3 main + dev 전략 (본 프로젝트 채택)

```
main (배포용) ──────────────────────────┬────────
                                        ↑
dev (개발 통합) ────┬─────┬─────────────┤
                    │     │             │
feature/phase2-auth ┘     │             │
feature/phase3-interview ─┘             │
                                        │
                              (Phase 완료 시 merge)
```

**장점:** 이해하기 쉬움, 안정/개발 분리 명확
**핵심:** dev에 직접 커밋하지 않고 feature 브랜치 사용

---

## 2. 브랜치 규칙

| 브랜치 | 용도 | 직접 커밋 |
|--------|------|-----------|
| `main` | 배포된 버전 | X (dev에서 merge만) |
| `dev` | 개발 통합 | X (feature에서 merge) |
| `feature/*` | 기능 개발 | O |
| `hotfix/*` | 긴급 수정 | O → main에 직접 merge |

---

## 3. 실제 워크플로우

### 3.1 Phase 2 작업 시작

```bash
git checkout dev
git checkout -b feature/phase2-auth
# 작업...
```

### 3.2 기능 완료 후

```bash
git checkout dev
git merge feature/phase2-auth
git branch -d feature/phase2-auth  # 선택: 브랜치 삭제
```

### 3.3 Phase 완료 & 배포 시

```bash
git checkout main
git merge dev
git tag v1.0.0  # 버전 태그
git push origin main --tags
```

---

## 4. 커밋 메시지 컨벤션

```
feat: 새 기능 추가
fix: 버그 수정
docs: 문서 변경
refactor: 리팩토링
test: 테스트 추가
chore: 빌드, 설정 변경
```

**예시:**
```
feat: Phase 2 회원가입 API 구현
fix: JWT 토큰 만료 검증 버그 수정
docs: Phase 1 구현서 작성
```

---

## 5. 참고 자료

- [Git Flow 원문](https://nvie.com/posts/a-successful-git-branching-model/)
- [GitHub Flow 가이드](https://guides.github.com/introduction/flow/)
