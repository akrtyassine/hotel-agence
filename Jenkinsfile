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
                        npm ci
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

                powershell '''
                    Start-Sleep -Seconds 15
                '''
            }
        }

        stage('Health Check') {
            steps {
                powershell '''
                    try {
                        Invoke-WebRequest http://localhost:8082 -UseBasicParsing -TimeoutSec 10
                        Write-Host "Backend OK"
                    }
                    catch {
                        Write-Host "Backend indisponible"
                        exit 1
                    }

                    try {
                        Invoke-WebRequest http://localhost:4000 -UseBasicParsing -TimeoutSec 10
                        Write-Host "Frontend OK"
                    }
                    catch {
                        Write-Host "Frontend indisponible"
                        exit 1
                    }
                '''
            }
        }

        stage('Reports') {
            steps {
                bat '''
                    docker --version
                    git --version
                '''
            }
        }
    }

    post {

        success {
            echo '✅ Pipeline exécuté avec succès'
        }

        failure {
            echo '❌ Pipeline échoué'
        }

        always {
            bat '''
                docker compose down
            '''
        }

        cleanup {
            deleteDir()
        }
    }
}