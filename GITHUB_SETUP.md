# 🐙 GitHub Repository Setup Guide

Complete handleiding voor het opzetten van de GitHub repository voor DatingAssistent.

## 📋 Voorbereiding

Je hebt het volgende nodig:
- [ ] GitHub account
- [ ] Git geïnstalleerd op je computer
- [ ] Lokale project directory met alle code

## 🎯 Optie 1: Via GitHub Website (Aanbevolen voor beginners)

### Stap 1: Maak Repository aan

1. Ga naar [GitHub](https://github.com/)
2. Klik op de **"+"** knop rechtsboven
3. Selecteer **"New repository"**

### Stap 2: Repository Configuratie

Vul de volgende details in:

**Repository naam**: `datingassistent` (of een andere naam)

**Description** (optioneel):
```
AI-Powered Dating Coach Platform - Professionele dating coach applicatie met AI-ondersteuning voor profieloptimalisatie, conversatie coaching en persoonlijke dating begeleiding.
```

**Visibility**:
- ⚠️ **Private** (AANBEVOLEN) - Alleen jij kunt de code zien
- ⚪ Public - Iedereen kan de code zien

**Initialize this repository**:
- ❌ **NIET** aanvinken "Add a README file"
- ❌ **NIET** aanvinken ".gitignore" (we hebben er al een)
- ❌ **NIET** "Choose a license"

### Stap 3: Create Repository

Klik op **"Create repository"**

Je ziet nu een pagina met instructies. We gebruiken: **"push an existing repository from the command line"**

### Stap 4: Push Code naar GitHub

Open je terminal/command prompt in de project directory en voer uit:

```bash
# Verander JOUW_USERNAME naar je GitHub gebruikersnaam
git remote add origin https://github.com/JOUW_USERNAME/datingassistent.git

# Push de code naar GitHub
git branch -M master
git push -u origin master
```

Voer je GitHub credentials in wanneer gevraagd.

✅ **Klaar!** Je code staat nu op GitHub.

---

## 🔧 Optie 2: Via GitHub CLI (Voor gevorderden)

### Stap 1: Installeer GitHub CLI

**Windows**:
```bash
winget install --id GitHub.cli
```

**macOS**:
```bash
brew install gh
```

**Linux**:
```bash
# Zie: https://github.com/cli/cli/blob/trunk/docs/install_linux.md
```

### Stap 2: Login bij GitHub

```bash
gh auth login
```

Volg de prompts:
1. Account type: GitHub.com
2. Protocol: HTTPS
3. Authenticate: Login via browser

### Stap 3: Create Repository

```bash
# Maak private repository (aanbevolen)
gh repo create datingassistent --private --source=. --remote=origin

# Of maak public repository
gh repo create datingassistent --public --source=. --remote=origin
```

### Stap 4: Push Code

```bash
git push -u origin master
```

✅ **Klaar!** Je repository is aangemaakt en code is gepushed.

---

## 🔍 Repository Settings Configuratie

### Aanbevolen Instellingen

1. **Ga naar**: Repository > Settings

2. **General**
   - [ ] Disable Wiki (we gebruiken het niet)
   - [ ] Disable Projects (tenzij je het wilt gebruiken)
   - [ ] Enable Issues (voor bug tracking)
   - [ ] Disable Discussions (optioneel)

3. **Branches**
   - Klik "Add branch protection rule"
   - Branch name pattern: `master`
   - Schakel in:
     - [x] Require a pull request before merging
     - [x] Require status checks to pass before merging

4. **Security**
   - Klik "Enable Dependabot alerts"
   - Klik "Enable Dependabot security updates"
   - Review "Code scanning alerts" (optioneel)

5. **Secrets and variables** (voor CI/CD later)
   - Actions > New repository secret
   - Voeg secrets toe die GitHub Actions nodig heeft

---

## 🔒 Security Best Practices

### Wat NIET in GitHub mag:

✅ **Gecontroleerd - Deze bestanden zijn al veilig**:
- `.env.local` - In .gitignore
- `.env` - In .gitignore
- `ADMIN_LOGIN_INFO.md` - Verwijderd uit git
- Database dumps - In .gitignore
- Backup bestanden - In .gitignore

### Controleer voordat je pushed:

```bash
# Check wat je gaat pushen
git status

# Check of gevoelige bestanden worden genegeerd
git check-ignore .env .env.local

# Check de laatste commit
git log -1 --stat
```

### Als je per ongeluk gevoelige data hebt gepushed:

**STOP ONMIDDELLIJK EN DOE:**

1. **Roteer ALLE secrets**:
   - Nieuwe JWT_SECRET genereren
   - Nieuwe database password
   - Nieuwe API keys
   - Nieuwe webhook secrets

2. **Verwijder uit Git history**:
```bash
# GEBRUIK MET VOORZICHTIGHEID!
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch GEVOELIG_BESTAND" \
  --prune-empty --tag-name-filter cat -- --all

git push origin --force --all
```

3. **Contact GitHub Support** om cached content te verwijderen

---

## 📝 Repository Structuur

Je repository ziet er nu zo uit:

```
datingassistent/
├── .github/              # GitHub workflows en configs
├── public/               # Public assets
├── src/                  # Source code
├── scripts/              # Utility scripts
├── .env.example          # Environment variables template
├── .gitignore           # Git ignore rules
├── GITHUB_SETUP.md      # Deze file
├── README.md            # Main documentation
├── VERCEL_DEPLOYMENT.md # Deployment guide
├── package.json         # Dependencies
├── next.config.ts       # Next.js config
├── tailwind.config.ts   # Tailwind config
├── tsconfig.json        # TypeScript config
└── vercel.json          # Vercel config
```

---

## 🔄 Daily Workflow

### Wijzigingen maken en pushen:

```bash
# Check status
git status

# Add bestanden
git add .

# Commit met beschrijvende message
git commit -m "feat: voeg nieuwe feature toe"

# Push naar GitHub
git push
```

### Commit Message Conventies:

```
feat: nieuwe feature
fix: bug fix
docs: documentatie update
style: code formatting
refactor: code refactoring
test: tests toevoegen
chore: build process, dependencies
```

### Branches gebruiken:

```bash
# Maak nieuwe feature branch
git checkout -b feature/nieuwe-functie

# Werk aan je feature...
git add .
git commit -m "feat: nieuwe functie implementatie"

# Push branch naar GitHub
git push -u origin feature/nieuwe-functie

# Maak Pull Request op GitHub
# Merge via GitHub interface
```

---

## 🌐 Vercel Koppelen

Na het pushen naar GitHub:

1. Ga naar [Vercel Dashboard](https://vercel.com/dashboard)
2. Klik "Add New Project"
3. Import je **datingassistent** repository
4. Volg de stappen in **VERCEL_DEPLOYMENT.md**

Vercel zal automatisch deployen bij elke push naar master!

---

## 📊 Repository Onderhoud

### Wekelijks:

```bash
# Check voor security updates
npm audit

# Update dependencies
npm update

# Commit en push updates
git add package-lock.json
git commit -m "chore: update dependencies"
git push
```

### Maandelijks:

- Review open issues
- Check Dependabot alerts
- Review security advisories
- Update README als nodig

---

## 🆘 Troubleshooting

### "Permission denied" error bij push

**Probleem**: Je hebt geen toegang om naar de repository te pushen.

**Oplossing**:
```bash
# Check remote URL
git remote -v

# Update met je username
git remote set-url origin https://github.com/JOUW_USERNAME/datingassistent.git
```

### "Repository not found" error

**Probleem**: Repository bestaat niet of je hebt geen toegang.

**Oplossing**:
1. Check of repository bestaat op GitHub
2. Check spelling van repository naam
3. Check of je ingelogd bent met juiste account

### "Large files" error

**Probleem**: Bestand is te groot (>100MB).

**Oplossing**:
```bash
# Verwijder grote bestanden uit commit
git rm --cached GROOT_BESTAND

# Voeg toe aan .gitignore
echo "GROOT_BESTAND" >> .gitignore

# Commit changes
git add .gitignore
git commit -m "chore: remove large file from git"
```

Voor bestanden >50MB, gebruik Git LFS:
```bash
git lfs install
git lfs track "*.psd"
git add .gitattributes
```

### "Conflicts" bij push

**Probleem**: Remote heeft wijzigingen die je lokaal niet hebt.

**Oplossing**:
```bash
# Pull remote changes
git pull origin master

# Resolve conflicts in je editor
# Dan:
git add .
git commit -m "merge: resolve conflicts"
git push
```

---

## 📚 Handige Git Commands

### Informatie:
```bash
git status                    # Bekijk status
git log --oneline -10        # Laatste 10 commits
git diff                     # Bekijk changes
git branch -a                # Alle branches
```

### Undo changes:
```bash
git restore BESTAND          # Undo unstaged changes
git restore --staged BESTAND # Unstage file
git reset HEAD~1             # Undo laatste commit (keep changes)
git reset --hard HEAD~1      # Undo laatste commit (discard changes)
```

### Remote operaties:
```bash
git remote -v                # Bekijk remotes
git fetch origin            # Download remote changes
git pull origin master      # Download en merge
git push origin master      # Upload changes
```

---

## 🎉 Klaar!

Je GitHub repository is nu opgezet en klaar voor gebruik!

**Volgende stappen**:
1. ✅ Repository is aangemaakt
2. ✅ Code is gepushed naar GitHub
3. ➡️ Ga naar **VERCEL_DEPLOYMENT.md** voor deployment

**Hulpbronnen**:
- [GitHub Docs](https://docs.github.com/)
- [Git Cheat Sheet](https://education.github.com/git-cheat-sheet-education.pdf)
- [GitHub CLI Docs](https://cli.github.com/manual/)

**Support**:
- GitHub Support: support@github.com
- Project Support: support@datingassistent.nl

---

**Setup Date**: [Vul in na setup]
**Repository**: [Vul in: github.com/username/repo]
**Visibility**: [Private/Public]
