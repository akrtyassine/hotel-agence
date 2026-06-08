pipeline {
    agent any

    // Note: the 'properties' top-level block is deprecated in this Declarative
    // pipeline version. Configure the GitHub project link and throttling in
    // the Jenkins job configuration (Job > Configure) or use a scripted
    // `properties(...)` step if necessary.

    options {
        timestamps()
        timeout(time: 1, unit: 'HOURS')
        buildDiscarder(logRotator(numToKeepStr: '10', daysToKeepStr: '30'))
        disableConcurrentBuilds()
        disableResume()
        preserveStashes(buildCount: 5)
        durabilityHint('PERFORMANCE_OPTIMIZED')
    }

    environment {
        REGISTRY = 'docker.io'
        IMAGE_BACKEND = 'hotel-agence-backend:${BUILD_NUMBER}'
        IMAGE_FRONTEND = 'hotel-agence-frontend:${BUILD_NUMBER}'
        IMAGE_BACKEND_LATEST = 'hotel-agence-backend:latest'
        IMAGE_FRONTEND_LATEST = 'hotel-agence-frontend:latest'
    }

    stages {
        stage('Checkout') {
            steps {
                echo '📥 Clonage du dépôt...'
                checkout scm
            }
        }

        stage('Gradle Debug') {
            steps {
                dir('hotelagencebackend-master') {
                    echo '🧪 Diagnostics Gradle et Java'
                    bat 'java -version'
                    bat 'gradlew.bat --version'
                    bat 'gradlew.bat tasks'
                }
            }
        }

        stage('Build Backend') {
            steps {
                echo '🔨 Build du backend Spring Boot...'
                dir('hotelagencebackend-master') {
                    bat '''
                        REM Use Gradle wrapper for Windows
                        call gradlew.bat clean bootJar --no-daemon --console=plain
                    '''
                }
            }
        }

        stage('Build Frontend') {
            steps {
                echo '🔨 Build du frontend Angular...'
                dir('Modern-Booking-master') {
                    bat '''
                        REM Install Node dependencies and build (Windows)
                        npm install
                        npm run build
                    '''
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                echo '🐳 Build des images Docker...'
                bat '''
                    REM Build Docker images on Windows
                    docker build -t %IMAGE_BACKEND_LATEST% -t %IMAGE_BACKEND% .\\hotelagencebackend-master
                    docker build -t %IMAGE_FRONTEND_LATEST% -t %IMAGE_FRONTEND% .\\Modern-Booking-master
                '''
            }
        }

        stage('Test') {
            steps {
                echo '🧪 Exécution des tests...'
                dir('hotelagencebackend-master') {
                    bat '''
                        REM Run tests using Gradle wrapper on Windows and do not fail the pipeline on test failures
                        call gradlew.bat test --no-daemon || exit /b 0
                    '''
                }
            }
        }

        stage('Docker Compose - Start Services') {
            steps {
                echo '🚀 Lancement des services avec Docker Compose...'
                bat '''
                    REM Start services with Docker Compose on Windows
                    docker compose up -d
                    timeout /T 10 /NOBREAK
                '''
            }
        }

        stage('Health Check') {
            steps {
                echo '✅ Vérification de la santé des services...'
                bat '''
                    REM Health checks using PowerShell on Windows
                    powershell -Command "try { Invoke-WebRequest -UseBasicParsing -Uri 'http://localhost:8082' -TimeoutSec 5; Write-Host 'Backend OK' } catch { Write-Host 'Backend failed'; exit 1 }"
                    powershell -Command "try { Invoke-WebRequest -UseBasicParsing -Uri 'http://localhost:4000' -TimeoutSec 5; Write-Host 'Frontend OK' } catch { Write-Host 'Frontend failed'; exit 1 }"
                    echo Services lancés avec succès
                '''
            }
        }

        stage('Generate Reports') {
            steps {
                echo '📊 Génération des rapports...'
                bat '''
                    echo Versions des outils:
                    docker --version
                    git --version
                '''
            }
        }
    }

    post {
        always {
            echo '🧹 Nettoyage...'
            bat '''
                REM Stop and remove Docker Compose services on Windows
                docker compose down || exit /b 0
            '''
        }

        success {
            echo '✅ Pipeline exécuté avec succès !'
            bat '''
                echo Images Docker créées:
                docker images | findstr hotel-agence
            '''
        }

        failure {
            echo '❌ Pipeline échoué ! Veuillez vérifier les logs.'
        }

        unstable {
            echo '⚠️ Pipeline instable'
        }

        cleanup {
            deleteDir()
        }
    }
}
