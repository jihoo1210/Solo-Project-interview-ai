# AWS EC2 SSH 원격 접속 가이드

## 개요

Elastic Beanstalk으로 배포된 EC2 인스턴스에 SSH로 접속하여 서버 상태 확인, 로그 조회, 디버깅 등의 작업을 수행하는 방법을 정리합니다.

---

## 1. 사전 준비 사항

### 1.1. EC2 키 페어 확인

Elastic Beanstalk 환경에 키 페어가 설정되어 있어야 SSH 접속이 가능합니다.

**확인 방법:**
1. AWS Console 접속
2. Elastic Beanstalk → 환경 선택
3. 구성(Configuration) → 보안(Security) 클릭
4. "EC2 키 페어" 항목 확인

**키 페어가 없는 경우:**
1. EC2 → 키 페어 → 키 페어 생성
2. `.pem` 파일 다운로드 (한 번만 다운로드 가능!)
3. Elastic Beanstalk 환경 구성에서 키 페어 연결

### 1.2. 보안 그룹 SSH 포트 확인

EC2 보안 그룹에서 SSH(22번 포트)가 열려 있어야 합니다.

**확인 방법:**
1. EC2 → 인스턴스 → 해당 인스턴스 선택
2. 보안 탭 → 보안 그룹 클릭
3. 인바운드 규칙에서 `포트 22, TCP` 확인
4. 없으면 "인바운드 규칙 편집" → SSH 규칙 추가

```
유형: SSH
프로토콜: TCP
포트 범위: 22
소스: 내 IP (또는 0.0.0.0/0 - 보안상 비권장)
```

### 1.3. EC2 퍼블릭 IP 확인

**확인 방법:**
1. AWS Console → EC2 → 인스턴스
2. Elastic Beanstalk 환경의 EC2 인스턴스 선택
3. "퍼블릭 IPv4 주소" 복사

---

## 2. SSH Config 설정 (Windows)

매번 긴 SSH 명령어를 입력하지 않고, 별칭으로 간편하게 접속하기 위해 SSH Config를 설정합니다.

### 2.1. .ssh 폴더 확인/생성

```powershell
# 폴더 확인
dir $HOME\.ssh

# 없으면 생성
mkdir $HOME\.ssh
```

### 2.2. 키 파일 복사

다운로드한 `.pem` 파일을 `.ssh` 폴더로 복사합니다.

```powershell
# 예시
copy C:\Users\<사용자명>\Downloads\your-key.pem C:\Users\<사용자명>\.ssh\
```

### 2.3. 키 파일 권한 설정

Windows에서 SSH 키 파일은 본인만 읽을 수 있어야 합니다.

```powershell
# 권한 설정 (PowerShell 관리자 권한으로 실행)
icacls "C:\Users\<사용자명>\.ssh\your-key.pem" /inheritance:r /grant:r "%USERNAME%:R"
```

### 2.4. config 파일 생성/편집

```powershell
# 메모장으로 config 파일 열기 (없으면 새로 생성)
notepad $HOME\.ssh\config
```

**config 파일 내용:**

```
# InterBit 프로덕션 서버
Host interbit-prod
    HostName <EC2-퍼블릭-IP-주소>
    User ec2-user
    IdentityFile C:\Users\<사용자명>\.ssh\your-key.pem

# 예시
Host interbit-prod
    HostName 3.38.123.45
    User ec2-user
    IdentityFile C:\Users\jihoo1210\.ssh\interbit-key.pem
```

**설정 항목 설명:**
| 항목 | 설명 |
|------|------|
| `Host` | 접속 시 사용할 별칭 |
| `HostName` | EC2 퍼블릭 IP 또는 DNS |
| `User` | SSH 사용자명 (Amazon Linux는 `ec2-user`) |
| `IdentityFile` | 키 파일 절대 경로 |

---

## 3. SSH 접속 방법

### 3.1. 터미널에서 접속

```bash
# config 설정 후
ssh interbit-prod

# 또는 직접 명령어
ssh -i ~/.ssh/your-key.pem ec2-user@<EC2-퍼블릭-IP>
```

### 3.2. VS Code / Cursor에서 접속

1. `Ctrl + Shift + P` 입력
2. "Remote-SSH: Connect to Host..." 선택
3. `interbit-prod` (config에서 설정한 Host명) 선택
4. 새 창이 열리며 원격 서버 연결

**원격 서버 연결 후:**
- 왼쪽 하단에 `SSH: interbit-prod` 표시 확인
- 터미널, 파일 탐색기 모두 원격 서버 기준으로 작동

### 3.3. AWS Session Manager (키 없이 접속)

IAM 권한만 있으면 키 페어 없이 접속 가능합니다.

1. AWS Console → EC2 → 인스턴스 선택
2. "연결" 버튼 클릭
3. "Session Manager" 탭 선택
4. "연결" 클릭

---

## 4. 자주 사용하는 서버 명령어

### 4.1. 서버 상태 확인

```bash
# 디스크 사용량
df -h

# 메모리 사용량
free -m

# CPU 사용량 (실시간)
top

# 프로세스 확인
ps aux | grep java
```

### 4.2. 로그 확인

```bash
# Elastic Beanstalk 애플리케이션 로그 경로
cd /var/log/

# 최근 로그 확인
sudo tail -f /var/log/web.stdout.log

# 에러 로그 확인
sudo tail -100 /var/log/web.stderr.log

# Spring Boot 애플리케이션 로그
sudo tail -f /var/log/tomcat/localhost.*.log
```

### 4.3. 환경변수 확인

```bash
# 모든 환경변수
printenv

# 특정 환경변수
echo $SPRING_PROFILES_ACTIVE
echo $DB_HOST
```

### 4.4. Java 프로세스 확인

```bash
# Java 프로세스 확인
ps aux | grep java

# 메모리 사용량 상세
jmap -heap <PID>

# 스레드 덤프
jstack <PID>
```

### 4.5. 네트워크 확인

```bash
# 포트 사용 확인
sudo netstat -tlnp

# 특정 포트 확인
sudo netstat -tlnp | grep 8080

# 외부 연결 테스트
curl -I https://api.example.com
```

---

## 5. 트러블슈팅

### 5.1. "Bad owner or permissions on config" 오류

**원인:** Windows에서 SSH config 파일 권한이 올바르지 않음

**해결:**
```powershell
# PowerShell 관리자 권한으로 실행

# 1. config 파일 권한 재설정
icacls "C:\Users\<사용자명>\.ssh\config" /inheritance:r /grant:r "%USERNAME%:F"

# 2. .ssh 폴더 전체 권한 설정
icacls "C:\Users\<사용자명>\.ssh" /inheritance:r /grant:r "%USERNAME%:F"

# 3. 또는 GUI로 설정
# - 파일 우클릭 → 속성 → 보안 탭
# - 고급 → 상속 사용 안 함 → "명시적 권한으로 변환"
# - 본인 계정만 남기고 다른 권한 제거
```

### 5.2. "Permission denied (publickey)" 오류

**원인:** 키 파일 권한 문제 또는 잘못된 키 파일

**해결:**
```powershell
# Windows에서 권한 재설정
icacls "C:\Users\<사용자명>\.ssh\your-key.pem" /inheritance:r /grant:r "%USERNAME%:R"
```

### 5.3. "Connection timed out" 오류

**원인:** 보안 그룹에서 SSH 포트가 열려있지 않음

**해결:**
1. EC2 → 보안 그룹 → 인바운드 규칙 편집
2. SSH (포트 22) 규칙 추가

### 5.4. "Host key verification failed" 오류

**원인:** EC2 인스턴스가 교체되어 호스트 키가 변경됨

**해결:**
```bash
# known_hosts에서 해당 호스트 제거
ssh-keygen -R <EC2-IP-주소>
```

### 5.5. Elastic Beanstalk 인스턴스 IP가 자주 변경되는 경우

**해결 방법:**
1. **Elastic IP 할당** (비용 발생)
   - EC2 → 탄력적 IP → 새 주소 할당 → 인스턴스에 연결

2. **DNS 사용**
   - EC2 퍼블릭 DNS 사용 (예: `ec2-3-38-123-45.ap-northeast-2.compute.amazonaws.com`)
   - IP보다 안정적이나 인스턴스 교체 시 변경됨

3. **EB CLI 사용**
   ```bash
   # EB CLI 설치
   pip install awsebcli

   # SSH 접속 (자동으로 IP 찾아서 연결)
   eb ssh
   ```

---

## 6. 보안 권장사항

### 6.1. SSH 포트 접근 제한

- 보안 그룹에서 `0.0.0.0/0` 대신 **본인 IP만 허용**
- AWS Console → EC2 → 보안 그룹 → 인바운드 규칙 수정

### 6.2. 키 파일 관리

- `.pem` 파일은 **절대 Git에 커밋하지 않기**
- `.gitignore`에 `*.pem` 추가
- 키 파일은 안전한 곳에 백업

### 6.3. 접속 기록 확인

```bash
# SSH 접속 기록 확인
sudo cat /var/log/secure | grep sshd

# 현재 접속 중인 사용자
who
```

---

## 참고 자료

- [AWS EC2 SSH 연결 가이드](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/AccessingInstancesLinux.html)
- [Elastic Beanstalk SSH 접속](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb3-ssh.html)
- [VS Code Remote SSH 가이드](https://code.visualstudio.com/docs/remote/ssh)
