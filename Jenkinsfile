pipeline {
    agent any

    options {
        timestamps()
        timeout(time: 1, unit: 'HOURS')
        buildDiscarder(logRotator(numToKeepStr: '10'))
        disableConcurrentBuilds()
        disableResume()
    }

    environment {
        IMAGE_BACKEND = "hotel-agence-backend:${BUILD_NUMBER}"
        IMAGE_FRONTEND = "hotel-agence-frontend:${BUILD_NUMBER}"
        IMAGE_BACKEND_LATEST = "hotel-agence-backend:latest"
        IMAGE_FRONTEND_LATEST = "hotel-agence-frontend:latest"
    }

    stages {

        stage('Checkout') {
            steps {
                echo '📥 Clonage du dépôt'
                checkout scm
            }
        }

        stage('Build Backend') {
            steps {
                dir('hotelagencebackend-master') {
                    bat '''
                        call gradlew.bat clean bootJar --no-daemon
                    '''
                }
            }
        }

        stage('Build Frontend') {
            steps {
                dir('Modern-Booking-master') {
                    bat '''
                        npm install
                        npm run build
                    '''
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                bat '''
                    docker build -t %IMAGE_BACKEND% -t %IMAGE_BACKEND_LATEST% hotelagencebackend-master
                    docker build -t %IMAGE_FRONTEND% -t %IMAGE_FRONTEND_LATEST% Modern-Booking-master
                '''
            }
        }

        stage('Tests') {
            steps {
                dir('hotelagencebackend-master') {
                    bat '''
                        call gradlew.bat test --no-daemon
                    '''
                }
            }
        }

        stage('Start Services') {
            steps {
                bat '''
                    docker compose down
                    docker compose up -d
                '''
            }
        }

        stage('Wait For Startup') {
            steps {
                powershell '''
                    Write-Host "Attente du démarrage des services..."
                    Start-Sleep -Seconds 45
                '''
            }
        }

        stage('Health Check') {
            steps {
                powershell '''
                    Write-Host "=== Containers ==="
                    docker ps

                    Write-Host "=== Backend Check ==="

                    try {
                        Invoke-WebRequest -Uri "http://localhost:8082" -UseBasicParsing -TimeoutSec 15
                        Write-Host "✅ Backend OK"
                    }
                    catch {
                        Write-Host "❌ Backend indisponible"
                        docker logs pipelinescriptfromscm-backend-1
                        exit 1
                    }

                    Write-Host "=== Frontend Check ==="

                    try {
                        Invoke-WebRequest -Uri "http://localhost:4000" -UseBasicParsing -TimeoutSec 15
                        Write-Host "✅ Frontend OK"
                    }
                    catch {
                        Write-Host "❌ Frontend indisponible"
                        docker logs pipelinescriptfromscm-frontend-1
                        exit 1
                    }
                '''
            }
        }

        stage('Reports') {
            steps {
                bat '''
                    echo ===== Versions =====
                    java -version
                    docker --version
                    git --version
                    node --version
                    npm --version
                '''
            }
        }
    }

    post {

        success {
            echo '✅ Pipeline exécuté avec succès !'

            bat '''
                echo ===== Images Docker =====
                docker images | findstr hotel-agence
            '''
        }

        failure {
            echo '❌ Pipeline échoué !'

            bat '''
                echo ===== Containers =====
                docker ps -a

                echo ===== Backend Logs =====
                docker logs pipelinescriptfromscm-backend-1

                echo ===== Frontend Logs =====
                docker logs pipelinescriptfromscm-frontend-1
            '''
        }

        always {
            echo '🧹 Nettoyage Docker'

            bat '''
                docker compose down
            '''
        }

        cleanup {
            deleteDir()
        }
    }
}